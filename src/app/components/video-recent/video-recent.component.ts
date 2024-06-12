// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { LoadService, RecentService, SettingsService } from '@app/services';
import { DropdownDirective } from '@app/directives';

// Import UI components.
import { ViButton, ViModal } from '@app/ui';

@Component({
  selector: 'video-recent',
  templateUrl: './video-recent.component.html',
  styleUrl: './video-recent.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DropdownDirective, ViButton, ViModal],
})
export class VideoRecentComponent {
  // Inject app services.
  private load = inject(LoadService);
  public recent = inject(RecentService);
  public settings = inject(SettingsService);

  // Open file from recent files list.
  public async recentFileOpen(recentFile: File | Partial<File>): Promise<void> {
    if (await this.recent.recentFileOpen(recentFile)) {
      this.load.filesLoadInit([recentFile]);
    }
  };
};