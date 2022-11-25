import { Component, HostListener } from '@angular/core';
import { FiltersService } from 'src/app/services/filters.service';
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
    public filters: FiltersService,
    public store: StoreService,
    public utils: UtilsService
  ) { }

  $videoInfo: any;
  $videoSave: any;

  playerInfo: any;
  ngOnInit(): void {
    const $this = this;
    this.playerInfo = {
      playerContainer: null,
      $playerContainer: null,
      playerEdit: null,
      playerResizable: null,
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
    this.playerInfo.playerVideo = document.getElementById('playerVideo');
    // Get crop element and set default position values.
    this.playerInfo.playerCrop = document.querySelector('#playerCrop');
    this.playerInfo.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
    // Create a resizable instance from the crop element.
    this.playerInfo.playerResizable = new Resizable(this.playerInfo.playerCrop, {
      draggable: true, within: 'parent'
    });
  }

  videoFileClose(): void {
    this.store.resetAll();
    this.filters.filterReset();
  }

  videoFileOpen(e: any): void {
    const file = e.target.files && e.target.files[0];
    if (file.type.indexOf('video') > -1) {
      this.store.state.fileInfo.fileExtension = e.target.files[0].path.split('.').pop();
      this.store.state.fileInfo.filePath = 'file://' + e.target.files[0].path;
      this.store.state.fileInfo.fileName = e.target.files[0].name;
      this.store.state.fileInfo.fileType = e.target.files[0].type;
    }
  }

  $videoFileLoaded(): void {
    this.store.state.fileInfo.fileLoaded = true;
  }

  videoFileLoaded(v: any): void {
    const stream = this.store.state.videoInfo.videoStreams[1];
    // Store dimensions from the original video.
    this.store.state.videoInfo.videoWidth = stream.width;
    this.store.state.videoInfo.videoHeight = stream.height;
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
    this.$videoInfo = v;
  }

  videoPlayerMute(): void {
    this.playerInfo.playerVideo.muted = !this.playerInfo.playerVideo.muted;
  }

  videoPlayerPlay(): void {
    if (this.playerInfo.playerVideo.paused || this.playerInfo.playerVideo.ended) {
      this.playerInfo.playerVideo.play();
    } else { this.playerInfo.playerVideo.pause(); }
  }

  videoPlayerStop(): void {
    this.playerInfo.playerVideo.pause();
    this.playerInfo.playerVideo.currentTime = 0;
  }

  videoFilterClear(): void {
    this.filters.filterInfo.filterClear = !this.filters.filterInfo.filterClear;
  }

  videoFilterCrop(): void {
    this.filters.filterInfo.filterCrop = !this.filters.filterInfo.filterCrop;
  }

  videoFilterNoAudio(): void {
    this.filters.filterInfo.filterNoAudio = !this.filters.filterInfo.filterNoAudio;
  }

  videoFilterFlip(v: boolean): void {
    if (v) { this.filters.filterInfo.filterFlipV = !this.filters.filterInfo.filterFlipV; }
    else { this.filters.filterInfo.filterFlipH = !this.filters.filterInfo.filterFlipH; }
    this.videoSetPosition(this.filters.filterInfo.filterRotate);
  }

  videoFilterRotate(c: boolean): void {
    let filterRotate = this.filters.filterInfo.filterRotate;
    if (c) { filterRotate = filterRotate == 270 ? 0 : filterRotate + 90; }
    else { filterRotate = filterRotate == 0 ? 270 : filterRotate - 90; }
    this.videoSetPosition(filterRotate);
  }

  @HostListener('window:resize')
  onResize() { this.videoSetPosition(this.filters.filterInfo.filterRotate); }

  videoSetPosition(rotation: number): void {
    // Reset DOM elements styling.
    this.playerInfo.playerContainer.removeAttribute('style');
    this.playerInfo.$playerContainer.removeAttribute('style');
    this.playerInfo.playerEdit.removeAttribute('style');
    this.playerInfo.playerVideo.removeAttribute('style');
    switch (rotation) {
      case 0: case 180: {
        // Define and set rotation attributes.
        const rotate = rotation == 0 ? null : 'rotate(180deg)';
        this.playerInfo.playerVideo.style.transform = rotate;
        // Check if the video element clips horizontally with the parent container.
        const videoWidth = this.playerInfo.playerVideo.getBoundingClientRect().width;
        if (videoWidth > this.playerInfo.playerEdit.offsetWidth) {
          this.playerInfo.playerContainer.style.width = '100%';
          this.playerInfo.$playerContainer.style.width = '100%';
          this.playerInfo.playerEdit.style.alignItems = 'center';
          this.playerInfo.playerVideo.style.width = '100%';
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
        const rotate = rotation == 90 ? 'rotate(90deg) translateY(-100%)' : 'rotate(270deg) translateX(-100%)';
        this.playerInfo.playerVideo.style.transform = rotate;
        this.playerInfo.playerVideo.style.transformOrigin = 'top left';
        // Setup styling for clipping calculation.
        this.playerInfo.playerContainer.style.width = '100%';
        this.playerInfo.playerContainer.style.height = '100%';
        this.playerInfo.$playerContainer.style.width = '100%';
        this.playerInfo.$playerContainer.style.height = '100%';
        this.playerInfo.playerVideo.style.width = (this.playerInfo.playerEdit.offsetHeight - 2) + 'px';
        this.playerInfo.playerVideo.style.height = 'fit-content';
        // Check if the video element clips horizontally with the parent container.
        const videoWidth = this.playerInfo.playerVideo.getBoundingClientRect().width;
        if (videoWidth > this.playerInfo.playerEdit.offsetWidth) {
          // Fit the video element horizontally on the parent.
          this.playerInfo.playerEdit.style.alignItems = 'center';
          this.playerInfo.playerVideo.style.width = null;
          this.playerInfo.playerVideo.style.height = this.playerInfo.playerContainer.offsetWidth + 'px';
          this.playerInfo.playerContainer.style.height = this.playerInfo.playerVideo.offsetWidth + 'px';
          this.playerInfo.$playerContainer.style.height = this.playerInfo.playerVideo.offsetWidth + 'px';
        } else {
          // Fit the video element vertically on the parent.
          this.playerInfo.playerContainer.style.width = this.playerInfo.playerVideo.offsetHeight + 'px';
          this.playerInfo.$playerContainer.style.width = this.playerInfo.playerVideo.offsetHeight + 'px';
          if (this.playerInfo.playerVideo.offsetHeight == this.playerInfo.playerVideo.offsetWidth) {
            this.playerInfo.playerContainer.style.height = this.playerInfo.playerVideo.offsetWidth + 'px';
            this.playerInfo.$playerContainer.style.height = this.playerInfo.playerVideo.offsetWidth + 'px';
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
    } this.filters.filterInfo.filterRotate = rotation;
    // Update crop tool dimensions on rotate and window resize.
    this.playerInfo.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
    this.playerInfo.playerCrop.style.width = this.playerInfo.playerVideo.getBoundingClientRect().width + 'px';
    this.playerInfo.playerCrop.style.height = this.playerInfo.playerVideo.getBoundingClientRect().height + 'px';
  }
}