import { Component, HostListener, NgZone } from '@angular/core';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';

// @ts-ignore
import Resizable from 'resizable';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})

export class VideoPlayerComponent {

  constructor(
    private ipc: IpcService,
    public store: StoreService,
    private zone: NgZone
  ) { }

  playerContainer: any;
  playerCrop: any;
  playerEdit: any;
  playerProgress: any;
  playerVideo: any;
  playerResizable: any;

  ngAfterContentInit(): void {
    this.playerContainer = document.getElementById('playerContainer');
    this.playerEdit = document.getElementById('playerEdit');
    this.playerProgress = document.getElementById('playerProgress');
    this.playerVideo = document.getElementById('playerVideo');
    // Get crop element and set default position values.
    this.playerCrop = document.querySelector('#playerCrop');
    this.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
    // Create a resizable instance from the crop element.
    this.playerResizable = new Resizable(this.playerCrop, {
      draggable: true, within: 'parent'
    });
  }

  playerFileClose(): void {
    this.store.resetAll();
    this.filterActive.filterCrop = false;
  }

  playerFileOpen(e: any): void {
    const file = e.target.files && e.target.files[0];
    if (file.type.indexOf('video') > -1) {
      this.store.state.fileInfo.filePath = 'file://' + e.target.files[0].path;
      this.store.state.fileInfo.fileName = e.target.files[0].name;
      this.store.state.fileInfo.fileType = e.target.files[0].type;
      this.store.state.fileInfo.fileLoaded = true;
    }
  }

  fileSave: any = {
    fileErrorText: null,
    fileErrorView: false,
    fileSaving: false,
    fileSaved: false,
  };

  $playerFileSave(): void {
    this.fileSave = {
      fileErrorText: null,
      fileErrorView: false,
      fileSaving: false,
      fileSaved: false,
    };
  }

  playerFileError(): void {
    this.fileSave.fileErrorView = !this.fileSave.fileErrorView;
  }

  async playerFileSave(): Promise<void> {
    // Define video filters to apply.
    let filters: string[] = [];
    if (this.filterActive.filterRotate) { filters.push(this.filterRotate()); }
    if (this.filterActive.filterCrop) { filters.push(this.filterCrop()); }
    let filter = filters.length > 0 ? '-filter:v' : '-c:v copy';
    // Define paths and commands.
    const input: string = this.store.state.fileInfo.filePath;
    const output: string = input.replace(/(\.[\w\d_-]+)$/i, '_out$1');
    const command: string = `ffmpeg -v error -y -i "${input}" ${filter} ${filters.length > 0 ? `"${filters.join(',')}"` : ''} -c:a copy "${output}"`;
    // Execute command and listen for a response.
    this.fileSave.fileSaving = true;
    this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
    this.ipc.once('exec', (e: any, r: string) => {
      this.zone.run(() => {
        this.fileSave.fileSaved = true;
        this.fileSave.fileSaving = false;
        if (r) { this.fileSave.fileErrorText = r; }
      });
    });
  }

  playerLoadedMetadata(d: any): void {
    this.playerProgress.setAttribute('max', this.playerVideo.duration.toString());
    // Store dimensions from the original video.
    this.store.state.videoInfo.videoWidth = d.srcElement.videoWidth;
    this.store.state.videoInfo.videoHeight = d.srcElement.videoHeight;
    // Reset filters and setup positioning of the video container.
    this.filterActive = {
      filterCrop: false,
      filterRotate: 0
    }; this.setPosition(0);
  }

  playerMute(): void {
    this.playerVideo.muted = !this.playerVideo.muted;
  }

  playerPlayPause(): void {
    if (this.playerVideo.paused || this.playerVideo.ended) {
      this.playerVideo.play();
    } else { this.playerVideo.pause(); }
  }

  playerProgressChange(e: any): void {
    const rect = this.playerProgress.getBoundingClientRect();
    const pos = (e.pageX - rect.left) / this.playerProgress.offsetWidth;
    this.playerVideo.currentTime = pos * this.playerVideo.duration;
  }

  playerProgressUpdate(): void {
    this.playerProgress.value = this.playerVideo.currentTime;
  }

  playerStop(): void {
    this.playerVideo.pause();
    this.playerVideo.currentTime = 0;
    this.playerProgress.value = 0;
  }

  filterActive = {
    filterCrop: false,
    filterRotate: 0
  };

  $filterCrop(): void {
    this.filterActive.filterCrop = !this.filterActive.filterCrop;
  }

  filterCrop(): string {
    const videoHeight = this.store.state.videoInfo.videoHeight;
    const videoWidth = this.store.state.videoInfo.videoWidth;
    // Calculate real absolute position values to fit the original video dimensions.
    const re = /translate3d\((?<x>.*?)px, (?<y>.*?)px/;
    const res: any = re.exec(this.playerCrop.style.transform);
    const x = Math.round(res.groups.x * videoWidth / this.playerVideo.offsetWidth);
    const y = Math.round(res.groups.y * videoHeight / this.playerVideo.offsetHeight);
    // Calculate real absolute size values to fit the original video dimensions.
    let h, w;
    if (videoWidth > videoHeight) {
      h = Math.round(videoWidth / this.playerVideo.getBoundingClientRect().height * this.playerCrop.getBoundingClientRect().height);
      w = Math.round(videoHeight / this.playerVideo.getBoundingClientRect().width * this.playerCrop.getBoundingClientRect().width);
      if (this.playerVideo.getBoundingClientRect().width > this.playerVideo.getBoundingClientRect().height) {
        w = Math.round(videoWidth / this.playerVideo.getBoundingClientRect().width * this.playerCrop.getBoundingClientRect().width);
        h = Math.round(videoHeight / this.playerVideo.getBoundingClientRect().height * this.playerCrop.getBoundingClientRect().height);
      }
    } else {
      w = Math.round(videoWidth / this.playerVideo.getBoundingClientRect().width * this.playerCrop.getBoundingClientRect().width);
      h = Math.round(videoHeight / this.playerVideo.getBoundingClientRect().height * this.playerCrop.getBoundingClientRect().height);
      if (this.playerVideo.getBoundingClientRect().width > this.playerVideo.getBoundingClientRect().height) {
        h = Math.round(videoWidth / this.playerVideo.getBoundingClientRect().height * this.playerCrop.getBoundingClientRect().height);
        w = Math.round(videoHeight / this.playerVideo.getBoundingClientRect().width * this.playerCrop.getBoundingClientRect().width);
      }
    }
    // Return built parameter.
    return `crop=${w}:${h}:${x}:${y}`;
  }

  $filterRotate(c: boolean): void {
    let filterRotate = this.filterActive.filterRotate;
    if (c) { filterRotate = filterRotate == 270 ? 0 : filterRotate + 90; }
    else { filterRotate = filterRotate == 0 ? 270 : filterRotate - 90; }
    this.setPosition(filterRotate);
  }

  filterRotate(): string {
    switch (this.filterActive.filterRotate) {
      case 90: { return 'transpose=1'; }
      case 180: { return 'transpose=2,transpose=2'; }
      case 270: { return 'transpose=2'; }
      default: { return ''; }
    }
  }

  @HostListener('window:resize')
  onResize() { this.setPosition(this.filterActive.filterRotate); }

  setPosition(rotation: number): void {
    // Reset DOM elements styling.
    this.playerContainer.removeAttribute('style');
    this.playerEdit.removeAttribute('style');
    this.playerVideo.removeAttribute('style');
    switch (rotation) {
      case 0: case 180: {
        // Define and set rotation attributes.
        const rotate = rotation == 0 ? null : 'rotate(180deg)';
        this.playerVideo.style.transform = rotate;
        // Check if the video element clips horizontally with the parent container.
        const videoWidth = this.playerVideo.getBoundingClientRect().width;
        if (videoWidth > this.playerEdit.offsetWidth) {
          this.playerContainer.style.width = '100%';
          this.playerEdit.style.alignItems = 'center';
          this.playerVideo.style.width = '100%';
        } else { this.playerContainer.style.height = '100%'; } break;
      }
      case 90: case 270: {
        // Define and set rotation attributes.
        const rotate = rotation == 90 ? 'rotate(90deg) translateY(-100%)' : 'rotate(270deg) translateX(-100%)';
        this.playerVideo.style.transform = rotate;
        this.playerVideo.style.transformOrigin = 'top left';
        // Setup styling for clipping calculation.
        this.playerContainer.style.width = '100%';
        this.playerContainer.style.height = '100%';
        this.playerVideo.style.width = (this.playerEdit.offsetHeight - 2) + 'px';
        this.playerVideo.style.height = 'fit-content';
        // Check if the video element clips horizontally with the parent container.
        const videoWidth = this.playerVideo.getBoundingClientRect().width;
        if (videoWidth > this.playerEdit.offsetWidth) {
          // Fit the video element horizontally on the parent.
          this.playerEdit.style.alignItems = 'center';
          this.playerVideo.style.width = null;
          this.playerVideo.style.height = this.playerContainer.offsetWidth + 'px';
          this.playerContainer.style.height = this.playerVideo.offsetWidth + 'px';
        } else {
          // Fit the video element vertically on the parent.
          this.playerContainer.style.width = this.playerVideo.offsetHeight + 'px';
          if (this.playerVideo.offsetHeight == this.playerVideo.offsetWidth) {
            this.playerContainer.style.height = this.playerVideo.offsetWidth + 'px';
            this.playerEdit.style.alignItems = 'center';
          }
        } break;
      }
    } this.filterActive.filterRotate = rotation;
    // Update crop tool dimensions on rotate and window resize.
    this.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
    this.playerCrop.style.width = this.playerVideo.getBoundingClientRect().width + 'px';
    this.playerCrop.style.height = this.playerVideo.getBoundingClientRect().height + 'px';
  }
}