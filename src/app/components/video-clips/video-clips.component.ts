// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { SegmentsService, StoreService } from '@app/services';
import { RenderedDirective, TooltipDirective } from '@app/directives';
import { DurationPipe, NumberInputPipe } from '@app/pipes';

@Component({
  selector: 'video-clips',
  templateUrl: './video-clips.component.html',
  styleUrl: './video-clips.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, TranslateModule,
    RenderedDirective, TooltipDirective,
    DurationPipe, NumberInputPipe,
  ],
})
export class VideoClipsComponent {
  // Inject app services.
  public segments = inject(SegmentsService);
  public store = inject(StoreService);
};