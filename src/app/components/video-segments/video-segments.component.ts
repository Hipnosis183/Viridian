// Import Angular elements.
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { LoadService, SegmentsService, StoreService } from '@app/services';
import { DropdownDirective } from '@app/directives';
import { DurationPipe, FrameRatePipe, FileSizePipe } from '@app/pipes';

// Import UI components.
import { ViButton } from '@app/ui';

@Component({
  selector: 'video-segments',
  templateUrl: './video-segments.component.html',
  styleUrl: './video-segments.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule, DecimalPipe,
    DropdownDirective, DurationPipe, FrameRatePipe, FileSizePipe, ViButton,
  ],
})
export class VideoSegmentsComponent {
  // Inject app services.
  public load = inject(LoadService);
  public segments = inject(SegmentsService);
  public store = inject(StoreService);

  // Remove currently selected video file from the list.
  public fileRemove(fileIndex?: number): void {
    // Close entire set of files if only one is currently open.
    if (this.store.storeFiles().length == 1) {
      this.load.filesClose();
    } else { this.segments.fileRemove(fileIndex); }
  };
};