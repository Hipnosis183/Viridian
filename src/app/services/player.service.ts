// Import Angular elements.
import { inject, Injectable } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { CropCoordinate, HTMLTarget, PlayerFlip } from '@app/models/general';
import { FiltersService, StoreService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  // Inject app services.
  private filters = inject(FiltersService);
  private store = inject(StoreService);

  // Define video player state.
  public playerContents: any = null;
  public playerCrop: any = null;
  public playerEdit: any = null;
  public playerResizable: any = null;
  public playerVideo: any = null;

  // Toggle player playback state.
  public playerPlayback(): void {
    const playerVideo: HTMLVideoElement = this.store.storePlayer.playerVideo()[this.store.storeIndex()];
    // Resume video playback.
    if (playerVideo.paused || playerVideo.ended) { playerVideo.play(); }
    // Pause video playback.
    else { playerVideo.pause(); }
  };

  // Stop/reset player playback state.
  public playerStop(): void {
    this.store.storePlayer.playerVideo()[this.store.storeIndex()].pause();
    this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = 0;
  };

  // Set player volume level state.
  public playerVolume(playerVolume: number): void {
    this.store.storePlayer.playerVideo()[this.store.storeIndex()].volume = playerVolume;
  };

  // Toggle player muted state.
  public playerMute(): void {
    this.store.storePlayer.playerVideo()[this.store.storeIndex()].muted = !this.store.storePlayer.playerVideo()[this.store.storeIndex()].muted;
  };

  // Update player time by single frames.
  public playerFrameAdvance(frameNext: boolean): void {
    // Get video state information.
    const currentTime: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime;
    const totalDuration: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration;
    // Calculate time value for previous/next frame.
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    const frameTime: number = (Math.round(currentTime * frameRate) + (frameNext ? 1 : -1)) / frameRate;
    let currentTime$: number = frameTime;
    switch (true) {
      case (frameTime < 0): { currentTime$ = 0; break; }
      case (frameTime > totalDuration): { currentTime$ = totalDuration; break; }
    }
    // Update current time with new frame value.
    this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = currentTime$;
  };

  // Toggle video crop filter state.
  public playerFilterCrop(): void {
    this.filters.filterCrop.update((v) => !v);
  };

  // Update video flip filter state.
  public playerFilterFlip(flipVertical: boolean): void {
    // Manage flipping axis.
    if (flipVertical) {
      this.filters.filterFlipV.update((v) => !v);
    } else {
      this.filters.filterFlipH.update((v) => !v);
    }
    // Update video player state.
    this.playerUpdate(this.filters.filterRotate(), flipVertical ? 'vertical' : 'horizontal');
  };

  // Update video rotate filter state.
  public playerFilterRotate(rotateClockwise: boolean): void {
    // Set rotation angle for repositioning in the player.
    if (rotateClockwise) {
      this.playerUpdate(this.filters.filterRotate() == 270 ? 0 : this.filters.filterRotate() + 90);
    } else {
      this.playerUpdate(this.filters.filterRotate() == 0 ? 270 : this.filters.filterRotate() - 90);
    }
  };

  // Update crop resizable coordinates/state.
  public playerUpdateCrop(cropCoordinate: CropCoordinate, cropTarget: HTMLTarget): void {
    // Get video player dimension values.
    const videoWidth: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].getBoundingClientRect().width;
    const videoHeight: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].getBoundingClientRect().height;
    // Update selected coordinate.
    switch (cropCoordinate) {
      case 'x': {
        // Control maximum X position input value.
        const cropWidth: number = this.store.storePlayer.playerWidth() - this.filters.filterCropW();
        if (+cropTarget.value > cropWidth) {
          cropTarget.value = cropWidth.toString();
          this.filters.filterCropX.set(cropWidth);
        }
        // Update X position value.
        const cropPosX: number = videoWidth * +cropTarget.value / this.store.storePlayer.playerWidth();
        const cropPosY: string = /translate3d\((?<x>.*?)px, (?<y>.*?)px/.exec(this.store.storePlayer.playerCrop.style.transform)!.groups!.y;
        this.store.storePlayer.playerCrop.style.transform = `translate3d(${cropPosX}px, ${cropPosY}px, 0px)`; break;
      }
      case 'y': {
        // Control maximum Y position input value.
        const cropHeight: number = this.store.storePlayer.playerHeight() - this.filters.filterCropH();
        if (+cropTarget.value > cropHeight) {
          cropTarget.value = cropHeight.toString();
          this.filters.filterCropY.set(cropHeight);
        }
        // Update Y position value.
        const cropPosY: number = videoHeight * +cropTarget.value / this.store.storePlayer.playerHeight();
        const cropPosX: string = /translate3d\((?<x>.*?)px, (?<y>.*?)px/.exec(this.store.storePlayer.playerCrop.style.transform)!.groups!.x;
        this.store.storePlayer.playerCrop.style.transform = `translate3d(${cropPosX}px, ${cropPosY}px, 0px)`; break;
      }
      case 'w': {
        // Control maximum width input value.
        if (+cropTarget.value > this.store.storePlayer.playerWidth()) {
          cropTarget.value = this.store.storePlayer.playerWidth().toString();
          this.filters.filterCropW.set(this.store.storePlayer.playerWidth());
        }
        // Update width value.
        const cropWidth: number = videoWidth * +cropTarget.value / this.store.storePlayer.playerWidth();
        this.store.storePlayer.playerCrop.style.width = cropWidth + 'px';
        // Update X value if new width overflows the original.
        const cropPosX: number = this.filters.filterCropX() + +cropTarget.value;
        if (cropPosX > this.store.storePlayer.playerWidth()) {
          this.filters.filterCropX.set(this.store.storePlayer.playerWidth() - +cropTarget.value);
          this.playerUpdateCrop('x', { value: this.filters.filterCropX().toString() });
        } break;
      }
      case 'h': {
        // Control maximum height input value.
        if (+cropTarget.value > this.store.storePlayer.playerHeight()) {
          cropTarget.value = this.store.storePlayer.playerHeight().toString();
          this.filters.filterCropH.set(this.store.storePlayer.playerHeight());
        }
        // Update height value.
        const cropHeight: number = videoHeight * +cropTarget.value / this.store.storePlayer.playerHeight();
        this.store.storePlayer.playerCrop.style.height = cropHeight + 'px';
        // Update Y value if new height overflows the original.
        const cropPosY: number = this.filters.filterCropY() + +cropTarget.value;
        if (cropPosY > this.store.storePlayer.playerHeight()) {
          this.filters.filterCropY.set(this.store.storePlayer.playerHeight() - +cropTarget.value);
          this.playerUpdateCrop('y', { value: this.filters.filterCropY().toString() });
        } break;
      }
    }
    // Update tooltip positioning.
    if (this.store.storePlayer.playerCrop._tippy.popperInstance) {
      this.store.storePlayer.playerCrop._tippy.popperInstance.update();
    }
  };

  // Update player state.
  public playerUpdate(playerRotation: number, playerFlip?: PlayerFlip): void {
    // Get number of open videos.
    const playerLength: number = this.store.storePlayer.playerVideo().length;
    const playerVideo: HTMLVideoElement = this.store.storePlayer.playerVideo()[this.store.storeIndex()];
    // Reset style of DOM elements.
    this.playerContents.removeAttribute('style');
    this.playerCrop.removeAttribute('style');
    this.playerVideo.removeAttribute('style');
    this.playerEdit.removeAttribute('style');
    for (let i = 0; i < playerLength; i++) {
      this.store.storePlayer.playerVideo()[i].removeAttribute('style');
    }
    // Update DOM elements on rotation.
    switch (playerRotation) {
      case 0: case 180: {
        // Define and set rotation attributes.
        const playerRotate: string = playerRotation == 0 ? '' : 'rotate(180deg)';
        for (let i = 0; i < playerLength; i++) {
          this.store.storePlayer.playerVideo()[i].style.transform = playerRotate;
        }
        // Check if video element clips horizontally with parent container.
        if (playerVideo.getBoundingClientRect().width > this.playerEdit.offsetWidth) {
          this.playerContents.style.width = '100%';
          this.playerCrop.style.width = this.playerContents.style.width;
          this.playerVideo.style.width = '100%';
          this.playerEdit.style.alignItems = 'center';
          for (let i = 0; i < playerLength; i++) {
            this.store.storePlayer.playerVideo()[i].style.width = '100%';
          }
        } else {
          this.playerContents.style.height = '100%';
          this.playerCrop.style.height = this.playerContents.style.height;
          this.playerVideo.style.height = '100%';
        }
        // Set scale attributes for flipping/mirroring.
        if (this.filters.filterFlipH()) { this.playerVideo.style.transform += 'scaleX(-1)'; }
        if (this.filters.filterFlipV()) { this.playerVideo.style.transform += 'scaleY(-1)'; }
        break;
      }
      case 90: case 270: {
        // Define and set rotation attributes.
        const playerRotate: string = playerRotation == 90 ? 'rotate(90deg) translateY(-100%)' : 'rotate(270deg) translateX(-100%)';
        for (let i = 0; i < playerLength; i++) {
          this.store.storePlayer.playerVideo()[i].style.transform = playerRotate;
          this.store.storePlayer.playerVideo()[i].style.transformOrigin = 'top left';
        }
        // Setup styling for clipping calculation.
        this.playerContents.style.width = '100%';
        this.playerContents.style.height = '100%';
        this.playerCrop.style.width = this.playerContents.style.width;
        this.playerCrop.style.height = this.playerContents.style.height;
        this.playerVideo.style.width = '100%';
        this.playerVideo.style.height = '100%';
        for (let i = 0; i < playerLength; i++) {
          this.store.storePlayer.playerVideo()[i].style.height = 'fit-content';
          this.store.storePlayer.playerVideo()[i].style.width = (this.playerEdit.offsetHeight - 2) + 'px';
        }
        // Check if video element clips horizontally with parent container.
        if (playerVideo.getBoundingClientRect().width > this.playerEdit.offsetWidth) {
          // Fit video element horizontally on parent.
          this.playerEdit.style.alignItems = 'center';
          for (let i = 0; i < playerLength; i++) {
            this.store.storePlayer.playerVideo()[i].style.width = '';
            this.store.storePlayer.playerVideo()[i].style.height = this.playerContents.offsetWidth + 'px';
          }
          this.playerContents.style.height = playerVideo.offsetWidth + 'px';
          this.playerCrop.style.height = this.playerContents.style.height;
          this.playerVideo.style.height = playerVideo.offsetWidth + 'px';
        } else {
          // Fit video element vertically on parent.
          this.playerContents.style.width = playerVideo.offsetHeight + 'px';
          this.playerCrop.style.width = this.playerContents.style.width;
          this.playerVideo.style.width = playerVideo.offsetHeight + 'px';
          if (playerVideo.offsetHeight == playerVideo.offsetWidth) {
            this.playerContents.style.height = playerVideo.offsetWidth + 'px';
            this.playerCrop.style.height = this.playerContents.style.height;
            this.playerVideo.style.height = playerVideo.offsetWidth + 'px';
            this.playerEdit.style.alignItems = 'center';
          }
        }
        // Set scale attributes for flipping/mirroring.
        if (this.filters.filterFlipH()) { this.playerVideo.style.transform += 'scaleY(-1)'; }
        if (this.filters.filterFlipV()) { this.playerVideo.style.transform += 'scaleX(-1)'; }
        break;
      }
    }
    // Get values for crop update on resize/rotation.
    const filterCropW: number = +this.filters.filterCropW();
    const filterCropH: number = +this.filters.filterCropH();
    const filterCropX: number = +this.filters.filterCropX();
    const filterCropY: number = +this.filters.filterCropY();
    const filterRotate: number = this.filters.filterRotate();
    // Update rotation filter state.
    this.filters.filterRotate.set(playerRotation);
    // Update crop tool dimensions on resize.
    if (filterRotate == playerRotation) {
      this.playerUpdateCrop('w', { value: this.filters.filterCropW().toString() });
      this.playerUpdateCrop('h', { value: this.filters.filterCropH().toString() });
      this.playerUpdateCrop('x', { value: this.filters.filterCropX().toString() });
      this.playerUpdateCrop('y', { value: this.filters.filterCropY().toString() });
    }
    // Disable crop tool correction if file has rotation metadata.
    if (this.filters.filterRotateNumber() != playerRotation) {
      this.store.storePlayer.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
      this.store.storePlayer.playerCrop.style.width = playerVideo.getBoundingClientRect().width + 'px';
      this.store.storePlayer.playerCrop.style.height = playerVideo.getBoundingClientRect().height + 'px';
    }
    // Update crop filter state.
    this.filters.filtersInit();
    this.filters.filterCropText();
    if (this.filters.filterRotateNumber() != playerRotation) { return; }
    // Update crop tool dimensions on rotate.
    if (filterRotate != playerRotation) {
      const videoHeight: number = this.store.storeVideos()[0].videoHeight;
      const videoWidth: number = this.store.storeVideos()[0].videoWidth;
      // Swap dimensions of the crop filter.
      this.filters.filterCropW.set(filterCropH);
      this.filters.filterCropH.set(filterCropW);
      switch (playerRotation) {
        case 0: {
          if (filterRotate == 270) {
            this.filters.filterCropY.set(filterCropX);
            this.filters.filterCropX.set(videoWidth - (filterCropY + filterCropH));
          } else {
            this.filters.filterCropX.set(filterCropY);
            this.filters.filterCropY.set(videoHeight - (filterCropX + filterCropW));
          } break;
        }
        case 90: {
          if (filterRotate == 0) {
            this.filters.filterCropY.set(filterCropX);
            this.filters.filterCropX.set(videoHeight - (filterCropY + filterCropH));
          } else {
            this.filters.filterCropX.set(filterCropY);
            this.filters.filterCropY.set(videoWidth - (filterCropX + filterCropW));
          } break;
        }
        case 180: {
          if (filterRotate == 90) {
            this.filters.filterCropY.set(filterCropX);
            this.filters.filterCropX.set(videoWidth - (filterCropY + filterCropH));
          } else {
            this.filters.filterCropX.set(filterCropY);
            this.filters.filterCropY.set(videoHeight - (filterCropX + filterCropW));
          } break;
        }
        case 270: {
          if (filterRotate == 180) {
            this.filters.filterCropY.set(filterCropX);
            this.filters.filterCropX.set(videoHeight - (filterCropY + filterCropH));
          } else {
            this.filters.filterCropX.set(filterCropY);
            this.filters.filterCropY.set(videoWidth - (filterCropX + filterCropW));
          } break;
        }
      }
      // Update crop tool with corrected values.
      this.playerUpdateCrop('w', { value: this.filters.filterCropW().toString() });
      this.playerUpdateCrop('h', { value: this.filters.filterCropH().toString() });
      this.playerUpdateCrop('x', { value: this.filters.filterCropX().toString() });
      this.playerUpdateCrop('y', { value: this.filters.filterCropY().toString() });
    }
    // Update crop tool dimensions on flip.
    if (playerFlip) {
      switch (playerFlip) {
        case 'horizontal': {
          const videoWidth: number = this.store.storeVideos()[0].videoWidth;
          if (playerRotation == 0 || playerRotation == 180) {
            this.filters.filterCropX.set(videoWidth - (filterCropX + filterCropW));
          } else {
            this.filters.filterCropY.set(videoWidth - (filterCropY + filterCropH));
          } break;
        }
        case 'vertical': {
          const videoHeight: number = this.store.storeVideos()[0].videoHeight;
          if (playerRotation == 0 || playerRotation == 180) {
            this.filters.filterCropY.set(videoHeight - (filterCropY + filterCropH));
          } else {
            this.filters.filterCropX.set(videoHeight - (filterCropX + filterCropW));
          } break;
        }
      }
      // Update crop tool with corrected values.
      this.playerUpdateCrop('x', { value: this.filters.filterCropX().toString() });
      this.playerUpdateCrop('y', { value: this.filters.filterCropY().toString() });
    }
  };
};