import { Injectable } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Injectable({ providedIn: 'root' })

export class FiltersService {

  constructor(public store: StoreService) { }

  filterInfo = {
    filterAlgorithm: '',
    filterClear: false,
    filterCrop: false,
    filterFlipH: false,
    filterFlipV: false,
    filterHeight: 0,
    filterNoAudio: false,
    filterRotate: 0,
    filterRotation: 0,
    filterWidth: 0
  };

  filterReset(): void {
    this.filterInfo = {
      filterAlgorithm: '',
      filterClear: false,
      filterCrop: false,
      filterFlipH: false,
      filterFlipV: false,
      filterHeight: 0,
      filterNoAudio: false,
      filterRotate: 0,
      filterRotation: 0,
      filterWidth: 0
    };
  }

  filterInit(): void {
    // Get rotation filter value.
    const r = this.$filterRotate();
    if (this.filterInfo.filterCrop) {
      // Get necessary values from store.
      const playerCrop = this.store.state.playerInfo.playerCrop;
      const playerVideo = this.store.state.playerInfo.playerVideo;
      const videoHeight = this.store.state.videoInfo.videoHeight;
      const videoWidth = this.store.state.videoInfo.videoWidth;
      // Calculate coordinates to fix aspect ratio using original video dimensions.
      let aspectRatio = videoWidth / videoHeight;
      let $videoHeight, $videoWidth, cropHeight, cropWidth;
      if (r == 90 || r == 270) {
        $videoWidth = playerVideo.getBoundingClientRect().width;
        $videoHeight = $videoWidth * aspectRatio;
        cropWidth = playerCrop.getBoundingClientRect().width;
        cropHeight = $videoHeight * playerCrop.getBoundingClientRect().height / playerVideo.getBoundingClientRect().height;
      } else {
        $videoHeight = playerVideo.getBoundingClientRect().height;
        $videoWidth = $videoHeight * aspectRatio;
        cropHeight = playerCrop.getBoundingClientRect().height;
        cropWidth = $videoWidth * playerCrop.getBoundingClientRect().width / playerVideo.getBoundingClientRect().width;
      }
      // Calculate real absolute size values to fit the original video dimensions.
      if (videoWidth > videoHeight) {
        this.store.state.filterInfo.filterHeight = Math.round(videoWidth / $videoHeight * cropHeight);
        this.store.state.filterInfo.filterWidth = Math.round(videoHeight / $videoWidth * cropWidth);
        if ($videoWidth > $videoHeight) {
          this.store.state.filterInfo.filterWidth = Math.round(videoWidth / $videoWidth * cropWidth);
          this.store.state.filterInfo.filterHeight = Math.round(videoHeight / $videoHeight * cropHeight);
        }
      } else {
        this.store.state.filterInfo.filterWidth = Math.round(videoWidth / $videoWidth * cropWidth);
        this.store.state.filterInfo.filterHeight = Math.round(videoHeight / $videoHeight * cropHeight);
        if ($videoWidth > $videoHeight) {
          this.store.state.filterInfo.filterHeight = Math.round(videoWidth / $videoHeight * cropHeight);
          this.store.state.filterInfo.filterWidth = Math.round(videoHeight / $videoWidth * cropWidth);
        }
      }
    } else {
      // Swap dimensions for the scaler filter.
      if (r == 90 || r == 270) {
        this.store.state.filterInfo.filterWidth = this.store.state.videoInfo.videoHeight;
        this.store.state.filterInfo.filterHeight = this.store.state.videoInfo.videoWidth;
      } else {
        this.store.state.filterInfo.filterWidth = this.store.state.videoInfo.videoWidth;
        this.store.state.filterInfo.filterHeight = this.store.state.videoInfo.videoHeight;
      }
    }
    // Get dimension values from the store.
    this.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
    this.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
  }

  filterCrop(): string {
    // Get necessary values from store.
    const playerCrop = this.store.state.playerInfo.playerCrop;
    const playerVideo = this.store.state.playerInfo.playerVideo;
    const videoHeight = this.store.state.videoInfo.videoHeight;
    const videoWidth = this.store.state.videoInfo.videoWidth;
    // Calculate real absolute position values to fit the original video dimensions.
    const r = this.$filterRotate();
    const re = /translate3d\((?<x>.*?)px, (?<y>.*?)px/;
    const res: any = re.exec(playerCrop.style.transform);
    const x = Math.round(res.groups.x * (r == 90 || r == 270 ? videoHeight : videoWidth) / playerVideo.getBoundingClientRect().width);
    const y = Math.round(res.groups.y * (r == 90 || r == 270 ? videoWidth : videoHeight) / playerVideo.getBoundingClientRect().height);
    // Return built parameter.
    return `crop=${this.store.state.filterInfo.filterWidth}:${this.store.state.filterInfo.filterHeight}:${x}:${y}`;
  }

  filterFlip(): string {
    let filters: any = [];
    if (this.filterInfo.filterFlipH) { filters.push('hflip'); }
    if (this.filterInfo.filterFlipV) { filters.push('vflip'); }
    return filters.join();
  }

  $filterRotate(): number {
    // filterRotation: Metadata rotation.
    // filterRotate: Rotation tool rotation.
    switch (this.filterInfo.filterRotation) {
      case 90: {
        switch (this.filterInfo.filterRotate) {
          case 90: { return 0; }
          case 180: { return 90; }
          case 270: { return 180; }
          default: { return 270; }
        }
      }
      case 180: {
        switch (this.filterInfo.filterRotate) {
          case 90: { return 270; }
          case 180: { return 0; }
          case 270: { return 90; }
          default: { return 180; }
        }
      }
      case 270: {
        switch (this.filterInfo.filterRotate) {
          case 90: { return 180; }
          case 180: { return 270; }
          case 270: { return 0; }
          default: { return 90; }
        }
      }
      default: {
        switch (this.filterInfo.filterRotate) {
          case 90: { return 90; }
          case 180: { return 180; }
          case 270: { return 270; }
          default: { return 0; }
        }
      }
    }
  }

  filterRotate(): string {
    switch (this.$filterRotate()) {
      case 90: { return 'transpose=1'; }
      case 180: { return 'transpose=2,transpose=2'; }
      case 270: { return 'transpose=2'; }
      default: { return ''; }
    }
  }

  filterScaler(): string {
    if (this.filterInfo.filterWidth == this.store.state.filterInfo.filterWidth &&
      this.filterInfo.filterHeight == this.store.state.filterInfo.filterHeight) { return ''; }
    return `scale=${this.filterInfo.filterWidth}:${this.filterInfo.filterHeight}:flags=${this.filterInfo.filterAlgorithm}`;
  }
}
