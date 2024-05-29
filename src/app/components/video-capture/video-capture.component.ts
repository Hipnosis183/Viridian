// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { CaptureService } from '@app/services';

// Import UI components.
import { ViButton, ViGroupbox, ViInput, ViModal } from '@app/ui';

@Component({
  selector: 'video-capture',
  templateUrl: './video-capture.component.html',
  styleUrl: './video-capture.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    ViButton, ViGroupbox, ViInput, ViModal,
  ],
})
export class VideoCaptureComponent {
  // Inject app services.
  public capture = inject(CaptureService);
};