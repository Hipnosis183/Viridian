// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { VideoDownloadComponent } from '@app/components';
import { DownloadService, IpcService, SettingsService, StoreService } from '@app/services';
import { TooltipDirective } from '@app/directives';

// Import UI components.
import { ViButton, ViCheckbox, ViInput, ViModal, ViOption, ViSelect } from '@app/ui';

@Component({
  selector: 'video-settings',
  templateUrl: './video-settings.component.html',
  styleUrl: './video-settings.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    VideoDownloadComponent, TooltipDirective,
    ViButton, ViCheckbox, ViInput, ViModal, ViOption, ViSelect,
  ],
})
export class VideoSettingsComponent {
  // Inject app services.
  public download = inject(DownloadService);
  public ipc = inject(IpcService);
  public settings = inject(SettingsService);
  public store = inject(StoreService);

  // Open external link in default system browser.
  public linkOpen(linkUrl: string): void {
    this.ipc.invoke('link-open', linkUrl);
  };
};