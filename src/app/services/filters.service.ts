import { Injectable } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Injectable({ providedIn: 'root' })

export class FiltersService {

  constructor(public store: StoreService) { }

  filterInfo = {
    filterCrop: false,
    filterRotate: 0
  };

  filterReset(): void {
    this.filterInfo = {
      filterCrop: false,
      filterRotate: 0
    };
  }

  filterCrop(): string {
    // Get necessary values from store.
    const playerCrop = this.store.state.playerInfo.playerCrop;
    const playerVideo = this.store.state.playerInfo.playerVideo;
    const videoHeight = this.store.state.videoInfo.videoHeight;
    const videoWidth = this.store.state.videoInfo.videoWidth;
    // Calculate real absolute position values to fit the original video dimensions.
    const re = /translate3d\((?<x>.*?)px, (?<y>.*?)px/;
    const res: any = re.exec(playerCrop.style.transform);
    const x = Math.round(res.groups.x * videoWidth / playerVideo.offsetWidth);
    const y = Math.round(res.groups.y * videoHeight / playerVideo.offsetHeight);
    // Calculate real absolute size values to fit the original video dimensions.
    let h, w;
    if (videoWidth > videoHeight) {
      h = Math.round(videoWidth / playerVideo.getBoundingClientRect().height * playerCrop.getBoundingClientRect().height);
      w = Math.round(videoHeight / playerVideo.getBoundingClientRect().width * playerCrop.getBoundingClientRect().width);
      if (playerVideo.getBoundingClientRect().width > playerVideo.getBoundingClientRect().height) {
        w = Math.round(videoWidth / playerVideo.getBoundingClientRect().width * playerCrop.getBoundingClientRect().width);
        h = Math.round(videoHeight / playerVideo.getBoundingClientRect().height * playerCrop.getBoundingClientRect().height);
      }
    } else {
      w = Math.round(videoWidth / playerVideo.getBoundingClientRect().width * playerCrop.getBoundingClientRect().width);
      h = Math.round(videoHeight / playerVideo.getBoundingClientRect().height * playerCrop.getBoundingClientRect().height);
      if (playerVideo.getBoundingClientRect().width > playerVideo.getBoundingClientRect().height) {
        h = Math.round(videoWidth / playerVideo.getBoundingClientRect().height * playerCrop.getBoundingClientRect().height);
        w = Math.round(videoHeight / playerVideo.getBoundingClientRect().width * playerCrop.getBoundingClientRect().width);
      }
    }
    // Return built parameter.
    return `crop=${w}:${h}:${x}:${y}`;
  }

  filterRotate(): string {
    switch (this.filterInfo.filterRotate) {
      case 90: { return 'transpose=1'; }
      case 180: { return 'transpose=2,transpose=2'; }
      case 270: { return 'transpose=2'; }
      default: { return ''; }
    }
  }
}
