import { Component, NgZone } from '@angular/core';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';
import { UtilsService } from 'src/app/services/utils.service';

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
    public utils: UtilsService,
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
    if (this.filters.filterRotate()) { filters.push(this.filters.filterRotate()); }
    if (this.filters.filterInfo.filterCrop) { filters.push(this.filters.filterCrop()); }
    let filter = filters.length > 0 ? '-filter:v' : '-c:v copy';
    // Define metadata modifications.
    const metadata = this.videoSaveMetadata();
    // Define paths and commands.
    const input: string = this.store.state.fileInfo.filePath;
    const output: string = input.replace(/(\.[\w\d_-]+)$/i, '_out$1');
    const command: string = `ffmpeg -v error -y -noautorotate -i "${input}" ${filter} ${filters.length > 0 ? `"${filters.join(',')}"` : ''} ${metadata} -c:a copy "${output}"`;
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

  videoSaveMetadata(): string {
    if (!this.filters.filterInfo.filterClear) { return ''; }
    // Remove general metadata, rotation and encoder tags.
    let metadata = '-map_metadata -1 -metadata:s:v rotate="" -fflags +bitexact';
    const stream = this.store.state.videoInfo.videoStreams[1];
    // Correct aspect ratio if metadata exists, since it can't be removed.
    if (this.utils.findValueInKey(stream, 'aspect_ratio').length > 0) {
      const rotation = this.filters.filterInfo.filterRotate;
      metadata += rotation == 90 || rotation == 270
        ? ` -aspect ${stream.height}:${stream.width}`
        : ` -aspect ${stream.width}:${stream.height}`;
    } return metadata;
  }
}
