// Import Angular elements.
import { inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { VideoStream } from '@app/models/ffmpeg';
import { IpcService, SettingsService, StoreService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class CaptureService {
  // Inject app services.
  private ipc = inject(IpcService);
  private settings = inject(SettingsService);
  private store = inject(StoreService);

  // Define video capture state.
  public captureOpen = signal<boolean>(false);
  public captureOutput = signal<string>('');

  // Capture video frame at a given time.
  public async captureFrame(): Promise<void> {
    // Get video stream information.
    const videoStream: VideoStream = this.store.storeVideos()[this.store.storeIndex()].videoStreams[1];
    // Get numeric representation of video frame rate.
    const frameRate: number = new Function(`return ${videoStream.r_frame_rate}`)();
    // Get time in frames and fix it for select filter.
    const frameTime: number = Math.round(this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime * frameRate);
    const frameTime$: number = frameTime > 0 ? frameTime - 1 : frameTime;
    // Capture frame to output image file.
    const frameCommand: string = `ffmpeg -v error -y -ss ${frameTime$ / frameRate} -i "${this.store.storeFiles()[this.store.storeIndex()].filePath}" -map 0:v -vframes 1 "${this.captureOutput()}"`;
    await this.ipc.invoke('process-exec', this.settings.options.ffmpeg.filesPath() + frameCommand, null);
    // Close frame capture dialog.
    this.captureUpdateOpen();
  };

  // Update capture open state.
  public captureUpdateOpen(): void {
    // Set default capture output path.
    if (!this.captureOpen()) {
      this.captureOutput.set(this.store.storeFiles()[this.store.storeIndex()].filePath.replace(/(\.[\w\d_-]+)$/i, '_out.png'));
    }
    // Toggle frame capture dialog.
    this.captureOpen.update((v) => !v);
  };

  // Update capture output path state.
  public async captureUpdateOutput(): Promise<void> {
    // Select output path for frame capture image file.
    const filesOptions = { defaultPath: this.captureOutput() };
    const filesPath: string | undefined = await this.ipc.invoke('dialog-save', filesOptions);
    if (filesPath) { this.captureOutput.set(filesPath); }
  };
};