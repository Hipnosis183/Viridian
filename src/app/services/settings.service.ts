// Import Angular elements.
import { inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { SettingsCategories, SettingsOptions, SettingsThemes } from '@app/models/settings';
import { IpcService, StoreService } from '@app/services';

// Import themes list.
import { Themes } from 'src/assets/lists';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  // Inject app services.
  private ipc = inject(IpcService);
  private store = inject(StoreService);

  // Define video settings state.
  public settingsIndex = signal<SettingsCategories>('GENERAL');
  public settingsOpen = signal<boolean>(false);
  public settingsThemes = Themes;
  public settingsVersion = signal<string>('');

  // Define settings options.
  public options: SettingsOptions = {
    ffmpeg: {
      filesPath: signal<string>(localStorage.getItem('ffmpeg.filesPath') || process.cwd() + '/ffmpeg/'),
      commandsSave: signal<boolean>(JSON.parse(localStorage.getItem('ffmpeg.commandsSave') || 'true')),
    },
    general: {
      appTheme: signal<SettingsThemes>((localStorage.getItem('general.appTheme') as SettingsThemes) ?? 'dark'),
      createThumbs: signal<boolean>(JSON.parse(localStorage.getItem('general.createThumbs') || 'false')),
      recentFiles: signal<boolean>(JSON.parse(localStorage.getItem('general.recentFiles') || 'true')),
      keyFrames: signal<boolean>(JSON.parse(localStorage.getItem('general.keyFrames') || 'true')),
    },
  };

  // Restore settings state.
  public settingsRestore(): void {
    localStorage.clear();
    this.options.ffmpeg.filesPath.set(process.cwd() + '/ffmpeg/');
    this.options.ffmpeg.commandsSave.set(true);
    this.options.general.recentFiles.set(true);
    this.options.general.createThumbs.set(false);
    this.options.general.keyFrames.set(true);
    this.settingsUpdateVersion();
  };

  // Update settings options in local storage.
  public settingsUpdate(optionKey: string, optionValue: string): void {
    localStorage.setItem(`${optionKey}.${optionValue}` , this.options[optionKey][optionValue]());
  };

  // Update settings index state.
  public settingsUpdateIndex(settingsIndex: SettingsCategories): void {
    this.settingsIndex.set(settingsIndex);
  };

  // Update settings open state.
  public settingsUpdateOpen(): void {
    // Reset settings index and open dialog.
    this.settingsIndex.set('GENERAL');
    this.settingsOpen.update((v) => !v);
    if (this.settingsOpen()) { this.settingsUpdateVersion(); }
  };

  // Update settings files path state.
  public async settingsUpdatePath(): Promise<void> {
    // Select FFmpeg directory dialog.
    const filesOptions = { defaultPath: this.options.ffmpeg.filesPath(), properties: ['openDirectory'] };
    const filesPath: string | undefined = await this.ipc.invoke('dialog-open', filesOptions);
    // Update FFmpeg directory and version.
    if (filesPath) {
      this.options.ffmpeg.filesPath.set(filesPath + '/');
      this.settingsUpdate('ffmpeg', 'filesPath');
      this.settingsUpdateVersion();
    }
  };

  // Update app theme state.
  public settingsUpdateTheme(): void {
    this.settingsUpdate('general', 'appTheme');
    document.body.dataset.theme = this.options.general.appTheme();
  };

  // Update settings version state.
  public async settingsUpdateVersion(): Promise<void> {
    // Define downloaded FFmpeg file paths.
    const fileName: string = process.platform == 'linux' ? 'ffmpeg' : 'ffmpeg.exe';
    const filePath: string = `${this.options.ffmpeg.filesPath()}${fileName}`;
    // Clear FFmpeg version if FFmpeg directory doesn't exist.
    const fileExists: boolean = await this.ipc.invoke('file-exists', filePath);
    if (!fileExists) { this.settingsVersion.set(''); return; }
    // Get FFmpeg version.
    const fileVersion: string | null = await this.ipc.invoke('process-exec', `${filePath} -version`, null);
    this.settingsVersion.set(fileVersion?.match(/(?<=ffmpeg version )([^_\s]+)/g)![0] ?? '');
  };

  // Remove cached temporary files.
  public async settingsClearCache(): Promise<void> {
    if (!this.store.storeFiles().length) {
      await this.ipc.invoke('dir-delete', process.cwd() + '/temp/');
    }
  };
};