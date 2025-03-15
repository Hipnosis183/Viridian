// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { HotkeysService, LoadService, StoreService } from '@app/services';

// Import UI components.
import { ViButton, ViModal } from '@app/ui';

@Component({
  selector: 'video-message',
  templateUrl: './video-message.component.html',
  styleUrl: './video-message.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    ViButton, ViModal,
  ],
})
export class VideoMessageComponent {
  // Inject app services.
  public hotkeys = inject(HotkeysService);
  public load = inject(LoadService);
  public store = inject(StoreService);
};