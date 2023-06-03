import { Component, NgZone } from '@angular/core';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'video-settings',
  templateUrl: './video-settings.component.html',
  styleUrls: ['./video-settings.component.css']
})

export class VideoSettingsComponent {

  constructor(
    private ipc: IpcService,
    public store: StoreService,
    private zone: NgZone
  ) { }

  videoSettings: boolean = false;
  $videoSettings(): void {
    this.settingIndex = 0;
    this.videoSettings = !this.videoSettings;
  }

  settingIndex: number = 0;
  $settingIndex(i: number) {
    this.settingIndex = i;
  }

  settingUpdate(s: string, o: string): void {
    localStorage.setItem(`${s}.${o}` , this.store.state.settings[s][o]);
  }

  settingPath(s: string, o: string): void {
    this.ipc.send('dialog-open', { defaultPath: this.store.state.settings[s][o], properties: ['openDirectory'] });
    this.ipc.once('dialog-open', (err: any, r: string) => {
      this.zone.run(() => { if (r) { this.store.state.settings[s][o] = r + '/'; this.settingUpdate(s, o); }});
    });
  }
}
