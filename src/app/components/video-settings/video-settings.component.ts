import { Component } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'video-settings',
  templateUrl: './video-settings.component.html',
  styleUrls: ['./video-settings.component.css']
})

export class VideoSettingsComponent {

  constructor(public store: StoreService) { }

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
}
