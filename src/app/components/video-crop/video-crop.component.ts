// Import Angular elements.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Import components, services, directives, pipes, types and interfaces.
import { DelayService, FiltersService, PlayerService, StoreService } from '@app/services';
import { TooltipDirective } from '@app/directives';

// @ts-ignore
// Import Resizable.
import Resizable from 'resizable';

@Component({
  selector: 'video-crop',
  templateUrl: './video-crop.component.html',
  styleUrl: './video-crop.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TooltipDirective],
})
export class VideoCropComponent {
  // Inject app services.
  private delay = inject(DelayService);
  public filters = inject(FiltersService);
  public player = inject(PlayerService);
  public store = inject(StoreService);

  // Define lifecycle hooks.
  public ngAfterContentInit(): void { this.cropInit(); };

  // Initialize crop tool state.
  private cropInit(): void {
    // Get crop element and set default position values.
    this.store.storePlayer.playerCrop = document.querySelector('#cropResizeable');
    this.store.storePlayer.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
    // Create a resizable instance from the crop element.
    this.player.playerResizable = new Resizable(this.store.storePlayer.playerCrop, {
      draggable: true, handles: 's, se, e, ne, n, nw, w, sw', within: 'parent',
    });
    // Update crop element state on resize event.
    this.player.playerResizable.on('resize', () => {
      // Update crop state.
      this.cropResize();
      // Update tooltip positioning.
      if (this.store.storePlayer.playerCrop._tippy.popperInstance) {
        this.store.storePlayer.playerCrop._tippy.popperInstance.update();
      }
    });
    // Update crop element state on drag event.
    this.player.playerResizable.draggable.on('drag', () => {
      // Update crop state.
      this.cropDrag();
      // Update tooltip positioning.
      if (this.store.storePlayer.playerCrop._tippy.popperInstance) {
        this.store.storePlayer.playerCrop._tippy.popperInstance.update();
      }
    });
  };

  // Update crop state on drag/resize.
  private cropResize = this.delay.throttle(() => this.cropUpdate(true), 10);
  private cropDrag = this.delay.throttle(() => this.cropUpdate(), 10);
  private cropUpdate(cropReset?: boolean): void {
    // Update crop filter state.
    if (cropReset) { this.filters.filtersInit(); }
    this.filters.filterCropText();
    // Fix precision problems.
    const filterCropX: number = this.store.storePlayer.playerWidth() - this.filters.filterCropW();
    const filterCropY: number = this.store.storePlayer.playerHeight() - this.filters.filterCropH();
    if (this.filters.filterCropX() > filterCropX) {
      this.filters.filterCropX.set(filterCropX);
    }
    if (this.filters.filterCropY() > filterCropY) {
      this.filters.filterCropY.set(filterCropY);
    }
    if (this.filters.filterCropW() > this.store.storePlayer.playerWidth()) {
      this.filters.filterCropW.set(this.store.storePlayer.playerWidth());
    }
    if (this.filters.filterCropH() > this.store.storePlayer.playerHeight()) {
      this.filters.filterCropH.set(this.store.storePlayer.playerHeight());
    }
  };
};