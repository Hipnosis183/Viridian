import { Injectable } from '@angular/core';
import store from 'src/app/app.store';

@Injectable({ providedIn: 'root' })

export class StoreService {

  i: number = store.playerInfo.playerIndex;
  state: any = store;

  resetSettings(): void {
    localStorage.clear();
    this.state.settings = {
      ffmpeg: {
        filesPath: process.cwd() + '/ffmpeg/',
        saveCommands: true,
      },
      general: {
        createThumbs: false,
      }
    };
  }

  resetAll(): void {
    this.resetFileInfo();
    this.resetFilterInfo();
    this.resetPlayerInfo();
    this.resetVideoInfo();
    this.i = 0;
  }

  resetFileInfo(): void {
    this.state.fileInfo = [];
  }

  resetFilterInfo(): void {
    this.state.filterInfo = {
      filterConcat: [],
      filterHeight: 0,
      filterWidth: 0,
      filterX: 0,
      filterY: 0,
    };
  }

  resetPlayerInfo(): void {
    this.state.playerInfo = {
      playerCrop: this.state.playerInfo.playerCrop,
      playerIndex: 0,
      playerLoaded: null,
      playerLoading: null,
      playerVideo: [],
      playerHeight: 0,
      playerWidth: 0,
    };
  }

  resetVideoInfo(): void {
    this.state.videoInfo = [];
  }
}
