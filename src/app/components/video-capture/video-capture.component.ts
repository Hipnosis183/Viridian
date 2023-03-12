import { Component, Input, NgZone } from '@angular/core';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'video-capture',
  templateUrl: './video-capture.component.html',
  styleUrls: ['./video-capture.component.css']
})

export class VideoCaptureComponent {

  constructor(
    public filters: FiltersService,
    private ipc: IpcService,
    public store: StoreService,
    public utils: UtilsService,
    private zone: NgZone
  ) { }

  @Input() currentTime = 0;

  videoCapture: any = {
    videoCapture: false,
    videoOutput: ''
  };

  $videoCapture(): void {
    if (!this.videoCapture.videoCapture) {
      this.videoCapture.videoOutput = (this.store.state.fileInfo[this.store.i].filePath.replace(/(\.[\w\d_-]+)$/i, '_out.png')).slice(7);
    } this.videoCapture.videoCapture = !this.videoCapture.videoCapture;
  }

  videoCaptureDirectory(): void {
    // Select output path for frame capture image file.
    this.ipc.send('dialog-save', { defaultPath: this.videoCapture.videoOutput });
    this.ipc.once('dialog-save', (err: any, r: string) => {
      this.zone.run(() => { if (r) { this.videoCapture.videoOutput = r; } });
    });
  }

  videoCaptureFrame(): void {
    const stream = this.store.state.videoInfo[this.store.i].videoStreams[1];
    // Get numeric representation of video frame rate.
    const frameRate: number = new Function(`return ${stream.r_frame_rate}`)();
    // Get current time in frames.
    let frameTime: number = Math.round(this.currentTime * frameRate);
    // Accomodate frame time for select filter.
    frameTime = frameTime > 0 ? frameTime - 1 : frameTime;
    // Capture current frame to output image file.
    const command: string = `ffmpeg -v error -y -i "${this.store.state.fileInfo[this.store.i].filePath}" -vf "select=eq(n\\,${frameTime})" -vframes 1 -qmin 1 -q:v 1 "${this.videoCapture.videoOutput}"`;
    this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
    this.ipc.once('exec', (err: any, r: string) => { this.zone.run(() => { this.$videoCapture(); }); });
  }
}
