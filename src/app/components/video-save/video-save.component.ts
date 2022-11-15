import { Component, NgZone } from '@angular/core';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'video-save',
  templateUrl: './video-save.component.html',
  styleUrls: ['./video-save.component.css']
})

export class VideoSaveComponent {

  constructor(
    private filters: FiltersService,
    private ipc: IpcService,
    public store: StoreService,
    private zone: NgZone
  ) { }

  videoSave: any = {
    videoErrorText: null,
    videoErrorView: false,
    videoSaving: false,
    videoSaved: false,
  };

  videoSaveOk(): void {
    this.videoSave = {
      videoErrorText: null,
      videoErrorView: false,
      videoSaving: false,
      videoSaved: false,
    };
  }

  videoSaveError(): void {
    this.videoSave.videoErrorView = !this.videoSave.videoErrorView;
  }

  async videoSaveFile(): Promise<void> {
    // Define video filters to apply.
    let filters: string[] = [];
    if (this.filters.filterInfo.filterRotate) { filters.push(this.filters.filterRotate()); }
    if (this.filters.filterInfo.filterCrop) { filters.push(this.filters.filterCrop()); }
    let filter = filters.length > 0 ? '-filter:v' : '-c:v copy';
    // Define paths and commands.
    const input: string = this.store.state.fileInfo.filePath;
    const output: string = input.replace(/(\.[\w\d_-]+)$/i, '_out$1');
    const command: string = `ffmpeg -v error -y -i "${input}" ${filter} ${filters.length > 0 ? `"${filters.join(',')}"` : ''} -c:a copy "${output}"`;
    // Execute command and listen for a response.
    this.videoSave.videoSaving = true;
    this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
    this.ipc.once('exec', (e: any, r: string) => {
      this.zone.run(() => {
        this.videoSave.videoSaved = true;
        this.videoSave.videoSaving = false;
        if (r) { this.videoSave.videoErrorText = r; }
      });
    });
  }
}
