import { Injectable } from '@angular/core';
import store from 'src/app/app.store';

@Injectable({ providedIn: 'root' })

export class StoreService {

  state: any = store;

  resetAll(): void {
    this.resetFileInfo();
    this.resetVideoInfo();
  }

  resetFileInfo(): void {
    this.state.fileInfo = {
      fileLoaded: false,
      fileName: null,
      filePath: null,
      fileType: null,
    };
  }

  resetVideoInfo(): void {
    this.state.videoInfo = {
      videoHeight: null,
      videoStreams: null,
      videoStreamsText: [],
      videoWidth: null,
    };
  }
}
