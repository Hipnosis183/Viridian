// Import Angular elements.
import { inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { IpcService, SettingsService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  // Inject app services.
  private ipc = inject(IpcService);
  private settings = inject(SettingsService);

  // Define video download state.
  public downloadDownload = signal<boolean>(false);
  public downloadDownloading = signal<number>(0);
  public downloadMissing = signal<boolean>(false);

  // Reset download state.
  public downloadReset(): void {
    this.downloadDownloading.set(0);
    this.downloadDownload.set(false);
    this.downloadMissing.set(false);
  };

  // Start FFmpeg download.
  public async downloadStart(): Promise<void> {
    // Define system platform and file names.
    const filePlatform: string = process.platform == 'linux' ? 'linux' : 'windows';
    const fileName: string = `ffmpeg-${filePlatform}.zip`;
    const filePath: string = `${this.settings.options.ffmpeg.filesPath()}${fileName}`;
    const fileUrl: string = `https://github.com/Hipnosis183/Viridian-FFmpeg/releases/latest/download/ffmpeg-${filePlatform}.zip`;
    // Create FFmpeg directory in case it doesn't exists.
    this.downloadDownloading.set(1);
    await this.ipc.invoke('dir-create', this.settings.options.ffmpeg.filesPath());
    // Download FFmpeg packed binaries.
    await this.ipc.invoke('file-download', filePath, fileUrl);
    // Unpack downloaded FFmpeg binaries.
    this.downloadDownloading.set(2);
    await this.ipc.invoke('file-unpack', filePath, this.settings.options.ffmpeg.filesPath());
    // Reset download state.
    this.downloadReset();
    // Update FFmpeg version.
    this.settings.settingsUpdateVersion();
  };

  // Update download download state.
  public downloadUpdateDownload(): void {
    this.downloadDownload.update((v) => !v);
  };

  // Update download missing state.
  public downloadUpdateMissing(settingsOpen?: boolean): void {
    this.downloadMissing.update((v) => !v);
    // Open settings dialog.
    if (settingsOpen) { this.settings.settingsUpdateOpen(); }
  };
};