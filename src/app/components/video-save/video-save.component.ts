// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { FiltersService, SaveService, StoreService } from '@app/services';

// Import UI components.
import { ViButton, ViGroupbox, ViInput, ViLoading, ViModal, ViOption, ViOptionGroup, ViSelect, ViTextarea } from '@app/ui';

@Component({
  selector: 'video-save',
  templateUrl: './video-save.component.html',
  styleUrl: './video-save.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    ViButton, ViGroupbox, ViInput, ViLoading, ViModal, ViOption, ViOptionGroup, ViSelect, ViTextarea,
  ],
})
export class VideoSaveComponent {
  // Inject app services.
  public filters = inject(FiltersService);
  public save = inject(SaveService);
  public store = inject(StoreService);
};