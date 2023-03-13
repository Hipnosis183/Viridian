import { ChangeDetectorRef, Component, HostListener, NgZone } from '@angular/core';
import { DelayService } from 'src/app/services/delay.service';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';
import { UtilsService } from 'src/app/services/utils.service';

// @ts-ignore
import Resizable from 'resizable';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})

export class VideoPlayerComponent {

  constructor(
    private change: ChangeDetectorRef,
    private delay: DelayService,
    public filters: FiltersService,
    private ipc: IpcService,
    public store: StoreService,
    public utils: UtilsService,
    private zone: NgZone
  ) { }

  $videoInfo: any;
  $videoSave: any;
  $videoSegments: any;

  playerInfo: any;
  ngOnInit(): void {
    const $this = this;
    this.playerInfo = {
      playerContainer: null,
      $playerContainer: null,
      playerEdit: null,
      playerResizable: null,
      // Original values on store to be shareable with services.
      get playerCrop() { return $this.store.state.playerInfo.playerCrop },
      set playerCrop(v) { $this.store.state.playerInfo.playerCrop = v },
      get playerVideo() { return $this.store.state.playerInfo.playerVideo },
      set playerVideo(v) { $this.store.state.playerInfo.playerVideo = v },
    };
  }

  ngAfterContentInit(): void {
    // Get video player elements from the DOM.
    this.playerInfo.playerContainer = document.getElementById('playerContainer');
    this.playerInfo.$playerContainer = document.getElementById('$playerContainer');
    this.playerInfo.playerEdit = document.getElementById('playerEdit');
    // Get crop element and set default position values.
    this.playerInfo.playerCrop = document.querySelector('#playerCrop');
    this.playerInfo.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
    // Create a resizable instance from the crop element.
    this.playerInfo.playerResizable = new Resizable(this.playerInfo.playerCrop, {
      draggable: true, within: 'parent'
    });
    // Update crop element state on resize event.
    this.playerInfo.playerResizable.on('resize', () => { this.$cropOnResize();
    // Update tooltip positioning.
    if (this.playerInfo.playerCrop._tippy.popperInstance) {
      this.playerInfo.playerCrop._tippy.popperInstance.update();
    }});
    // Update crop element state on drag event.
    this.playerInfo.playerResizable.draggable.on('drag', () => { this.$cropOnDrag();
    // Update tooltip positioning.
    if (this.playerInfo.playerCrop._tippy.popperInstance) {
      this.playerInfo.playerCrop._tippy.popperInstance.update();
    }});
  }

  $cropOnResize = this.delay.throttle(() => this.cropOnResize(), 10);
  cropOnResize(): void {
    // Update crop filter values.
    this.filters.filterInit();
    this.filters.filterCrop();
    // Fix precision problems.
    const x = this.store.state.playerInfo.playerWidth - this.store.state.filterInfo.filterWidth;
    const y = this.store.state.playerInfo.playerHeight - this.store.state.filterInfo.filterHeight;
    if (this.store.state.filterInfo.filterX > x) { this.store.state.filterInfo.filterX = x; }
    if (this.store.state.filterInfo.filterY > y) { this.store.state.filterInfo.filterY = y; }
    if (this.store.state.filterInfo.filterWidth > this.store.state.playerInfo.playerWidth) {
      this.store.state.filterInfo.filterWidth = this.store.state.playerInfo.playerWidth; }
    if (this.store.state.filterInfo.filterHeight > this.store.state.playerInfo.playerHeight) {
      this.store.state.filterInfo.filterHeight = this.store.state.playerInfo.playerHeight; }
  }

  $cropOnDrag = this.delay.throttle(() => this.cropOnDrag(), 10);
  cropOnDrag(): void {
    // Update crop filter values.
    this.filters.filterCrop();
    // Fix precision problems.
    const x = this.store.state.playerInfo.playerWidth - this.store.state.filterInfo.filterWidth;
    const y = this.store.state.playerInfo.playerHeight - this.store.state.filterInfo.filterHeight;
    if (this.store.state.filterInfo.filterX > x) { this.store.state.filterInfo.filterX = x; }
    if (this.store.state.filterInfo.filterY > y) { this.store.state.filterInfo.filterY = y; }
    if (this.store.state.filterInfo.filterWidth > this.store.state.playerInfo.playerWidth) {
      this.store.state.filterInfo.filterWidth = this.store.state.playerInfo.playerWidth; }
    if (this.store.state.filterInfo.filterHeight > this.store.state.playerInfo.playerHeight) {
      this.store.state.filterInfo.filterHeight = this.store.state.playerInfo.playerHeight; }
  }

  videoFileOpen: any[] = [];
  videoFileOpenT: number = 0;
  $videoFileOpen(e: any): void {
    this.videoFileOpenT = Object.values(e.target.files).length;
    this.videoFileOpen = Object.values(e.target.files).slice(1);
    this.videoFileLoad(e.target.files[0]);
  }

  videoFileCompatible: boolean = false;
  videoFileIncompatible: boolean = false;
  videoFileCompatibility(): void {
    this.videoFileCompatible = false;
    this.videoFileIncompatible = false;
  }

  videoFileLoad(e: any): void {
    // Check if open file is a valid video file.
    if (e.type.indexOf('video') > -1) {
      this.store.state.playerInfo.playerLoaded = false;
      // Get video file metadata.
      const input: string = 'file://' + e.path;
      const command: string = `ffprobe -v error -show_format -show_entries streams -of json -i "${input}"`;
      this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
      this.ipc.once('exec', (err: any, r: string) => {
        this.zone.run(() => {
          // Get general format and streams/tracks information.
          const videos = this.store.state.videoInfo.length;
          const stream = this.store.state.videoInfo[0]?.videoStreams[1];
          let streams = [JSON.parse(r).format];
          streams = streams.concat(JSON.parse(r).streams);
          // Add file if the width and height are the same as the default video.
          if (videos == 0 || ((stream.height == streams[1].height) && (stream.width == streams[1].width))) {
            // Define concat mode to use (demuxer/filter) depending on the codec and timebase.
            if (videos > 0 && ((stream.codec_name != streams[1].codec_name) || (stream.time_base != streams[1].time_base))) {
              this.store.state.filterInfo.filterConcat.push(input);
              this.videoFileCompatible = true;
            } // Define temporal file paths.
            const clip: string = this.store.state.filePaths.temp + e.name.replace(/(\.[\w\d_-]+)$/i, '_clip.txt');
            const concat: string = this.store.state.filePaths.temp + e.name.replace(/(\.[\w\d_-]+)$/i, '_concat.txt');
            const concatClip: string = this.store.state.filePaths.temp + e.name.replace(/(\.[\w\d_-]+)$/i, '_concat_clip.txt');
            const thumb: string = this.store.state.filePaths.temp + e.name.replace(/(\.[\w\d_-]+)$/i, '_thumb.jpg');
            // Generate video thumbnail.
            const command: string = `ffmpeg -v error -y -i "file://${e.path}" -vf "select=eq(n\\,0),scale=200:-1" -vframes 1 -qmin 1 -q:v 1 "${thumb}"`;
            this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
            this.ipc.once('exec', (err: any, r: string) => {
              this.zone.run(() => {
                // Load video file information into store.
                const fileInfo: any = {
                  fileColor: 0,
                  fileClip: 'file://' + clip,
                  fileClips: [],
                  fileConcat: 'file://' + concat,
                  fileConcatClip: 'file://' + concatClip,
                  fileExtension: e.path.split('.').pop(),
                  fileIndex: -1,
                  fileName: e.name,
                  filePath: 'file://' + e.path,
                  fileThumb: 'file://' + thumb,
                  fileType: e.type
                }; this.store.state.fileInfo.push(fileInfo);
                const videoInfo: any = {
                  videoFrameRate: null,
                  videoHeight: null,
                  videoKeyFrames: [],
                  videoStreams: null,
                  videoStreamsText: [],
                  videoWidth: null
                }; this.store.state.videoInfo.push(videoInfo);
                this.store.state.playerInfo.playerLoading = true;
                // Update concatenation text file.
                this.$videoSegments.videoFileConcat();
              });
            });
          } else { this.videoFileIncompatible = true;
            if (this.videoFileOpen.length == 0) {
              // Set opened files as fully loaded.
              this.store.state.playerInfo.playerLoaded = true;
              this.store.state.playerInfo.playerLoading = false;
            }
          }
        });
      });
    }
  }

  videoFileClose(): void {
    this.store.resetAll();
    this.filters.filterReset();
    this.$videoSegments.$videoSegments(false);
    this.$videoSave = null;
  }

  $videoFileLoaded(e: any): void {
    // Add video file to list.
    this.playerInfo.playerVideo.push(e.target);
    // Update video index with newly opened file.
    this.store.i = this.playerInfo.playerVideo.length - 1;
    // Load video information.
    this.$videoInfo.videoStreamLoad();
  }

  videoFileLoaded(): void {
    const stream = this.store.state.videoInfo[this.store.i].videoStreams[1];
    // Store dimensions from the original video.
    this.store.state.videoInfo[this.store.i].videoWidth = stream.width;
    this.store.state.videoInfo[this.store.i].videoHeight = stream.height;
    this.store.state.filterInfo.filterWidth = stream.width;
    this.store.state.filterInfo.filterHeight = stream.height;
    this.store.state.playerInfo.playerWidth = stream.width;
    this.store.state.playerInfo.playerHeight = stream.height;
    // Normalize video rotation display if rotate metadata is present.
    const rotated = this.utils.findValueByKey(stream, 'rotation');
    // Older rotation API is measured CW, newer (display matrix) is CCW.
    let rotation: number = 0;
    switch (rotated) {
      case 90: case -270: { rotation = 90; break; }
      case 270: case -90: { rotation = 270; break; }
      case 180: case -180: { rotation = 180; break; }
    } this.filters.filterInfo.filterRotation = rotation;
    // Reset and setup positioning of the video container.
    this.videoSetPosition(rotation);
    // Create default clip segment.
    this.$videoSegments.videoClipAdd();
    // Open split/merge panel if multiple files are open.
    if (this.store.state.fileInfo.length > 1) {
      setTimeout(() => { this.$videoSegments.videoSegments = true; });
    } // Load remaining files if there are any.
    if (this.videoFileOpen.length > 0) {
      this.videoFileLoad(this.videoFileOpen.shift());
    } else { // Set opened files as fully loaded.
      this.store.state.playerInfo.playerLoaded = true;
      this.store.state.playerInfo.playerLoading = false;
    }
  }

  videoPlayerFrame(v: number): void {
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const currentTime: number = this.playerInfo.playerVideo[this.store.i].currentTime;
    const duration: number = this.playerInfo.playerVideo[this.store.i].duration;
    // Calculate time value for previous/next frame.
    const frameTime: any = (Math.round(currentTime * frameRate) + (v ? 1 : -1)) / frameRate;
    // Update current time with new frame value.
    if (frameTime < 0) { this.playerInfo.playerVideo[this.store.i].currentTime =  0; }
    else if (frameTime > duration) { this.playerInfo.playerVideo[this.store.i].currentTime =  duration; }
    else { this.playerInfo.playerVideo[this.store.i].currentTime = frameTime; }
  }

  videoPlayerMute(): void {
    this.playerInfo.playerVideo[this.store.i].muted = !this.playerInfo.playerVideo[this.store.i].muted;
  }

  videoPlayerPlay(): void {
    if (this.playerInfo.playerVideo[this.store.i].paused || this.playerInfo.playerVideo[this.store.i].ended) {
      this.playerInfo.playerVideo[this.store.i].play();
    } else { this.playerInfo.playerVideo[this.store.i].pause(); }
  }

  videoPlayerStop(): void {
    this.playerInfo.playerVideo[this.store.i].pause();
    this.playerInfo.playerVideo[this.store.i].currentTime = 0;
  }

  videoPlayerVolume(v: number): void {
    this.playerInfo.playerVideo[this.store.i].volume = v;
  }

  videoFilterCrop(): void {
    this.filters.filterInfo.filterCrop = !this.filters.filterInfo.filterCrop;
  }

  videoFilterFlip(v: boolean): void {
    if (v) { this.filters.filterInfo.filterFlipV = !this.filters.filterInfo.filterFlipV; }
    else { this.filters.filterInfo.filterFlipH = !this.filters.filterInfo.filterFlipH; }
    this.videoSetPosition(this.filters.filterInfo.filterRotate);
  }

  videoFilterRotate(c: boolean): void {
    // Set rotation angle for repositioning in the player.
    let filterRotate = this.filters.filterInfo.filterRotate;
    if (c) { filterRotate = filterRotate == 270 ? 0 : filterRotate + 90; }
    else { filterRotate = filterRotate == 0 ? 270 : filterRotate - 90; }
    this.videoSetPosition(filterRotate);
  }

  @HostListener('window:resize')
  onResize() { if (this.store.state.fileInfo[0]) { this.videoSetPosition(this.filters.filterInfo.filterRotate);
    if (this.$videoSegments.videoSegments) { this.$videoSegments.videoClipUpdate(true); }}}

  videoSetCoordinates(v: string, e: any): void {
    // Get dimension values of video player.
    const videoWidth = this.playerInfo.playerVideo[this.store.i].getBoundingClientRect().width;
    const videoHeight = this.playerInfo.playerVideo[this.store.i].getBoundingClientRect().height;
    // Update selected coordinate.
    switch (v) {
      case 'x': { // Control maximum X position input value.
        const w = this.store.state.playerInfo.playerWidth - this.store.state.filterInfo.filterWidth;
        if (parseInt(e.target.value) > w) { this.change.detectChanges();
          e.target.value = w; this.store.state.filterInfo.filterX = w; }
        // Update X position value.
        const x: number = videoWidth * e.target.value / this.store.state.playerInfo.playerWidth;
        const y: any = /translate3d\((?<x>.*?)px, (?<y>.*?)px/.exec(this.playerInfo.playerCrop.style.transform);
        this.playerInfo.playerCrop.style.transform = `translate3d(${x}px, ${y.groups.y}px, 0px)`; break;
      }
      case 'y': { // Control maximum Y position input value.
        const h = this.store.state.playerInfo.playerHeight - this.store.state.filterInfo.filterHeight;
        if (parseInt(e.target.value) > h) { this.change.detectChanges();
          e.target.value = h; this.store.state.filterInfo.filterY = h; }
        // Update Y position value.
        const y: number = videoHeight * e.target.value / this.store.state.playerInfo.playerHeight;
        const x: any = /translate3d\((?<x>.*?)px, (?<y>.*?)px/.exec(this.playerInfo.playerCrop.style.transform);
        this.playerInfo.playerCrop.style.transform = `translate3d(${x.groups.x}px, ${y}px, 0px)`; break;
      }
      case 'w': { // Control maximum width input value.
        if (e.target.value > this.store.state.playerInfo.playerWidth) {
          this.change.detectChanges(); e.target.value = this.store.state.playerInfo.playerWidth;
          this.store.state.filterInfo.filterWidth = this.store.state.playerInfo.playerWidth; }
        // Update width value.
        const w: number = videoWidth * e.target.value / this.store.state.playerInfo.playerWidth;
        this.playerInfo.playerCrop.style.width =  w + 'px';
        // Update X value if new width overflows the original.
        const x = this.store.state.filterInfo.filterX + parseInt(e.target.value);
        if (x > this.store.state.playerInfo.playerWidth) {
          this.store.state.filterInfo.filterX = this.store.state.playerInfo.playerWidth - e.target.value;
          this.videoSetCoordinates('x', { target: { value: this.store.state.filterInfo.filterX }});
        } break;
      }
      case 'h': { // Control maximum height input value.
        if (e.target.value > this.store.state.playerInfo.playerHeight) {
          this.change.detectChanges(); e.target.value = this.store.state.playerInfo.playerHeight;
          this.store.state.filterInfo.filterHeight = this.store.state.playerInfo.playerHeight; }
        // Update height value.
        const h: number = videoHeight * e.target.value / this.store.state.playerInfo.playerHeight;
        this.playerInfo.playerCrop.style.height =  h + 'px';
        // Update Y value if new height overflows the original.
        const y = this.store.state.filterInfo.filterY + parseInt(e.target.value);
        if (y > this.store.state.playerInfo.playerHeight) {
          this.store.state.filterInfo.filterY = this.store.state.playerInfo.playerHeight - e.target.value;
          this.videoSetCoordinates('y', { target: { value: this.store.state.filterInfo.filterY }});
        } break;
      }
    } // Update tooltip positioning.
    if (this.playerInfo.playerCrop._tippy.popperInstance)  {
      this.playerInfo.playerCrop._tippy.popperInstance.update();
    }
  }

  videoSetPosition(r: number): void {
    // Set number of videos opened for style updates.
    const k = this.playerInfo.playerVideo.length;
    // Reset DOM elements styling.
    this.playerInfo.playerContainer.removeAttribute('style');
    this.playerInfo.$playerContainer.removeAttribute('style');
    this.playerInfo.playerEdit.removeAttribute('style');
    for (let i = 0; i < k; i++) { this.playerInfo.playerVideo[i].removeAttribute('style'); }
    switch (r) {
      case 0: case 180: {
        // Define and set rotation attributes.
        const rotate = r == 0 ? null : 'rotate(180deg)';
        for (let i = 0; i < k; i++) { this.playerInfo.playerVideo[i].style.transform = rotate; }
        // Check if the video element clips horizontally with the parent container.
        const videoWidth = this.playerInfo.playerVideo[this.store.i].getBoundingClientRect().width;
        if (videoWidth > this.playerInfo.playerEdit.offsetWidth) {
          this.playerInfo.playerContainer.style.width = '100%';
          this.playerInfo.$playerContainer.style.width = '100%';
          this.playerInfo.playerEdit.style.alignItems = 'center';
          for (let i = 0; i < k; i++) { this.playerInfo.playerVideo[i].style.width = '100%'; }
        } else {
          this.playerInfo.playerContainer.style.height = '100%';
          this.playerInfo.$playerContainer.style.height = '100%';
        }
        // Set scale attributes for flipping/mirroring.
        if (this.filters.filterInfo.filterFlipH) {
          this.playerInfo.$playerContainer.style.transform += 'scaleX(-1)';
        } if (this.filters.filterInfo.filterFlipV) {
          this.playerInfo.$playerContainer.style.transform += 'scaleY(-1)';
        } break;
      }
      case 90: case 270: {
        // Define and set rotation attributes.
        const rotate = r == 90 ? 'rotate(90deg) translateY(-100%)' : 'rotate(270deg) translateX(-100%)';
        for (let i = 0; i < k; i++) { this.playerInfo.playerVideo[i].style.transform = rotate;
          this.playerInfo.playerVideo[i].style.transformOrigin = 'top left'; }
        // Setup styling for clipping calculation.
        this.playerInfo.playerContainer.style.width = '100%';
        this.playerInfo.playerContainer.style.height = '100%';
        this.playerInfo.$playerContainer.style.width = '100%';
        this.playerInfo.$playerContainer.style.height = '100%';
        for (let i = 0; i < k; i++) { this.playerInfo.playerVideo[i].style.height = 'fit-content';
          this.playerInfo.playerVideo[i].style.width = (this.playerInfo.playerEdit.offsetHeight - 2) + 'px'; }
        // Check if the video element clips horizontally with the parent container.
        const videoWidth = this.playerInfo.playerVideo[this.store.i].getBoundingClientRect().width;
        if (videoWidth > this.playerInfo.playerEdit.offsetWidth) {
          // Fit the video element horizontally on the parent.
          this.playerInfo.playerEdit.style.alignItems = 'center';
          for (let i = 0; i < k; i++) { this.playerInfo.playerVideo[i].style.width = null;
            this.playerInfo.playerVideo[i].style.height = this.playerInfo.playerContainer.offsetWidth + 'px'; }
          this.playerInfo.playerContainer.style.height = this.playerInfo.playerVideo[this.store.i].offsetWidth + 'px';
          this.playerInfo.$playerContainer.style.height = this.playerInfo.playerVideo[this.store.i].offsetWidth + 'px';
        } else {
          // Fit the video element vertically on the parent.
          this.playerInfo.playerContainer.style.width = this.playerInfo.playerVideo[this.store.i].offsetHeight + 'px';
          this.playerInfo.$playerContainer.style.width = this.playerInfo.playerVideo[this.store.i].offsetHeight + 'px';
          if (this.playerInfo.playerVideo[this.store.i].offsetHeight == this.playerInfo.playerVideo[this.store.i].offsetWidth) {
            this.playerInfo.playerContainer.style.height = this.playerInfo.playerVideo[this.store.i].offsetWidth + 'px';
            this.playerInfo.$playerContainer.style.height = this.playerInfo.playerVideo[this.store.i].offsetWidth + 'px';
            this.playerInfo.playerEdit.style.alignItems = 'center';
          }
        }
        // Set scale attributes for flipping/mirroring.
        if (this.filters.filterInfo.filterFlipH) {
          this.playerInfo.$playerContainer.style.transform += 'scaleY(-1)';
        } if (this.filters.filterInfo.filterFlipV) {
          this.playerInfo.$playerContainer.style.transform += 'scaleX(-1)';
        } break;
      }
    } this.filters.filterInfo.filterRotate = r;
    // Update crop tool dimensions on rotate and window resize.
    this.playerInfo.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
    this.playerInfo.playerCrop.style.width = this.playerInfo.playerVideo[this.store.i].getBoundingClientRect().width + 'px';
    this.playerInfo.playerCrop.style.height = this.playerInfo.playerVideo[this.store.i].getBoundingClientRect().height + 'px';
    // Update crop filter values.
    this.filters.filterInit();
    this.filters.filterCrop();
  }
}
