// Import Angular elements.
import { LowerCasePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { InfoService, StoreService } from '@app/services';
import { RenderedDirective } from '@app/directives';
import { DurationPipe, FileSizePipe, FrameRatePipe } from '@app/pipes';

// Import UI components.
import { ViModal } from '@app/ui';

@Component({
  selector: 'video-info',
  templateUrl: './video-info.component.html',
  styleUrl: './video-info.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule, LowerCasePipe, TitleCasePipe,
    RenderedDirective, DurationPipe, FileSizePipe, FrameRatePipe,
    ViModal,
  ],
})
export class VideoInfoComponent {
  // Inject app services.
  public info = inject(InfoService);
  public store = inject(StoreService);
};