// Import Angular elements.
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { VideoCaptureComponent, VideoClipsComponent, VideoCropComponent, VideoDownloadComponent, VideoInfoComponent, VideoRecentComponent, VideoSaveComponent, VideoSegmentsComponent, VideoSettingsComponent } from '@app/components';
import { CaptureService, FiltersService, InfoService, LoadService, PlayerService, RecentService, SaveService, SegmentsService, SettingsService, StoreService } from '@app/services';
import { DropdownDirective, RenderedDirective, TooltipDirective } from '@app/directives';
import { DurationPipe, NumberInputPipe } from '@app/pipes';

// Import UI components.
import { ViButton, ViInput, ViLoading, ViModal, ViProgress, ViSlider } from '@app/ui';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, TranslateModule, DecimalPipe,
    VideoCaptureComponent, VideoClipsComponent, VideoCropComponent, VideoDownloadComponent, VideoInfoComponent, VideoRecentComponent, VideoSaveComponent, VideoSegmentsComponent, VideoSettingsComponent,
    DropdownDirective, RenderedDirective, TooltipDirective,
    DurationPipe, NumberInputPipe,
    ViButton, ViInput, ViLoading, ViModal, ViProgress, ViSlider,
  ],
  host: {
    '(dragover)': 'onDragOver($event)',
    '(drop)': 'onDrop($event)',
    '(window:resize)': 'onResize()',
  },
})
export class VideoPlayerComponent {
  // Inject app services.
  public capture = inject(CaptureService);
  public filters = inject(FiltersService);
  public info = inject(InfoService);
  public load = inject(LoadService);
  public player = inject(PlayerService);
  public recent = inject(RecentService);
  public save = inject(SaveService);
  public segments = inject(SegmentsService);
  public settings = inject(SettingsService);
  public store = inject(StoreService);

  // Define host event functions.
  public onDragOver(e: DragEvent): void { e.preventDefault(); };
  public onDrop(e: DragEvent): void { this.playerUpdateDrop(e); };
  public onResize(): void { this.playerUpdateResize(); };

  // Define lifecycle hooks.
  public ngAfterContentInit(): void { this.playerInit(); };

  // Initialize player state.
  private playerInit(): void {
    // Get video player elements from the DOM.
    this.player.playerContents = document.querySelector('#playerContents');
    this.player.playerCrop = document.querySelector('#playerCrop');
    this.player.playerVideo = document.querySelector('#playerVideo');
    this.player.playerEdit = document.querySelector('#playerEdit');
  };

  // Update player state on files drop.
  private playerUpdateDrop(e: DragEvent): void {
    e.preventDefault(); e.stopPropagation();
    // Disallow adding files if any dialog is open.
    if ((!this.load.filesLoadState() || this.load.filesLoadState() == 'loaded') && !this.load.fileCompat().length) {
      // Hosts don't support signals yet, so can't check for opened dialogs.
      //&& !this.info.infoOpen() && !this.save.saveOpen() && !this.capture.captureOpen()) {
      this.load.filesLoadInit(e.dataTransfer!.files);
    }
  };

  // Update player state on window resize.
  private playerUpdateResize(): void {
    if (this.store.storeFiles()[0]) {
      // Update player state.
      this.player.playerUpdate(this.filters.filterRotate());
      // Update clips state.
      if (this.segments.segmentsOpen()) {
        this.segments.clipUpdate(true);
      }
    }
  };
};