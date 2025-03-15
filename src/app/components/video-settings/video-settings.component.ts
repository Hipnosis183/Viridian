// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { VideoDownloadComponent } from '@app/components';
import { TooltipDirective } from '@app/directives';
import { HotkeysPipe } from '@app/pipes';
import { DownloadService, HotkeysService, IpcService, SettingsService, StoreService } from '@app/services';

// Import UI components.
import { ViButton, ViCheckbox, ViKeys, ViInput, ViModal, ViOption, ViSelect } from '@app/ui';

@Component({
  selector: 'video-settings',
  templateUrl: './video-settings.component.html',
  styleUrl: './video-settings.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    VideoDownloadComponent, TooltipDirective, HotkeysPipe,
    ViButton, ViCheckbox, ViKeys, ViInput, ViModal, ViOption, ViSelect,
  ],
})
export class VideoSettingsComponent {
  // Inject app services.
  public download = inject(DownloadService);
  public hotkeys = inject(HotkeysService);
  public ipc = inject(IpcService);
  public settings = inject(SettingsService);
  public store = inject(StoreService);

  // Open external link in default system browser.
  public linkOpen(linkUrl: string): void {
    this.ipc.invoke('link-open', linkUrl);
  };
};