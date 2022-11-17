import { Injectable } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Injectable({ providedIn: 'root' })

export class FiltersService {

  constructor(public store: StoreService) { }

  filterInfo = {
    filterClear: false,
    filterCrop: false,
    filterNoAudio: false,
    filterRotate: 0,
    filterRotation: 0
  };

  filterReset(): void {
    this.filterInfo = {
      filterClear: false,
      filterCrop: false,
      filterNoAudio: false,
      filterRotate: 0,
      filterRotation: 0
    };
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
    let h, w;
    if (videoWidth > videoHeight) {
      h = Math.round(videoWidth / $videoHeight * cropHeight);
      w = Math.round(videoHeight / $videoWidth * cropWidth);
      if ($videoWidth > $videoHeight) {
        w = Math.round(videoWidth / $videoWidth * cropWidth);
        h = Math.round(videoHeight / $videoHeight * cropHeight);
      }
    } else {
      w = Math.round(videoWidth / $videoWidth * cropWidth);
      h = Math.round(videoHeight / $videoHeight * cropHeight);
      if ($videoWidth > $videoHeight) {
        h = Math.round(videoWidth / $videoHeight * cropHeight);
        w = Math.round(videoHeight / $videoWidth * cropWidth);
      }
    }
    // Return built parameter.
    return `crop=${w}:${h}:${x}:${y}`;
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
}
