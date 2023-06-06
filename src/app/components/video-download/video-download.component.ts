import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'video-download',
  templateUrl: './video-download.component.html',
  styleUrls: ['./video-download.component.css']
})

export class VideoDownloadComponent {

  constructor(
    private ipc: IpcService,
    public store: StoreService,
    private zone: NgZone
  ) { }

  @Output() finished = new EventEmitter;
  @Output() loaded = new EventEmitter;
  @Output() settings = new EventEmitter;
  ngOnInit(): void { this.loaded.emit(); }

  videoMissing: boolean = false;
  $videoMissing(e?: boolean): void {
    this.videoMissing = !this.videoMissing;
    if (e) { this.settings.emit(); }
  }
  videoDownload: boolean = false;
  $videoDownload(): void {
    this.videoDownload = !this.videoDownload;
  }
  videoDownloading: number = 0;
  videoDownloaded(): void {
    this.videoDownloading = 0;
    this.videoDownload = false;
    this.videoMissing = false;
  }

  videoStart(): void {
    this.videoDownloading = 1;
    // Define system platform and file names.
    const platform = process.platform == 'linux' ? 'linux' : 'windows';
    const fileName = `ffmpeg-${platform}.zip`;
    const filePath = `${this.store.state.settings.ffmpeg.filesPath}${fileName}`;
    const fileUrl = `https://github.com/Hipnosis183/Viridian-FFmpeg/releases/latest/download/ffmpeg-${platform}.zip`;
    // Create FFmpeg directory in case it doesn't exists.
    this.ipc.send('mkdir', this.store.state.settings.ffmpeg.filesPath);
    this.ipc.once('mkdir', () => {
      // Download FFmpeg packed binaries.
      this.ipc.send('download', filePath, fileUrl);
      this.ipc.once('download', () => {
        this.zone.run(() => { this.videoDownloading = 2;
          // Unpack downloaded FFmpeg binaries.
          this.ipc.send('unzip', filePath, this.store.state.settings.ffmpeg.filesPath);
          this.ipc.once('unzip', () => {
            this.zone.run(() => { this.videoDownloaded(); this.finished.emit(); });
          });
        });
      });
    });
  }
}
