// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { DownloadService, SettingsService } from '@app/services';

// Import UI components.
import { ViButton, ViLoading, ViModal } from '@app/ui';

@Component({
  selector: 'video-download',
  templateUrl: './video-download.component.html',
  styleUrl: './video-download.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    ViButton, ViLoading, ViModal,
  ],
})
export class VideoDownloadComponent {
  // Inject app services.
  public download = inject(DownloadService);
  public settings = inject(SettingsService);
};