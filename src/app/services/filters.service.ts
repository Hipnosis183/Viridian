// Import Angular elements.
import { inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { StoreService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  // Inject app services.
  private store = inject(StoreService);

  // Define filters state.
  public filterAlgorithm = signal<string>('');
  public filterClear = signal<boolean>(false);
  public filterConcat = signal<string[]>([]);
  public filterCrop = signal<boolean>(false);
  public filterCropH = signal<number>(0);
  public filterCropW = signal<number>(0);
  public filterCropX = signal<number>(0);
  public filterCropY = signal<number>(0);
  public filterFlipH = signal<boolean>(false);
  public filterFlipV = signal<boolean>(false);
  public filterHeight = signal<number>(0);
  public filterNoAudio = signal<boolean>(false);
  public filterRotate = signal<number>(0);
  public filterRotation = signal<number>(0);
  public filterWidth = signal<number>(0);

  // Reset filters state.
  public filtersReset(): void {
    this.filterAlgorithm.set('');
    this.filterClear.set(false);
    this.filterConcat.set([]);
    this.filterCrop.set(false);
    this.filterCropH.set(0);
    this.filterCropW.set(0);
    this.filterCropX.set(0);
    this.filterCropY.set(0);
    this.filterFlipH.set(false);
    this.filterFlipV.set(false);
    this.filterHeight.set(0);
    this.filterNoAudio.set(false);
    this.filterRotate.set(0);
    this.filterRotation.set(0);
    this.filterWidth.set(0);
  };

  // Initialize filters state.
  public filtersInit(): void {
    // Get rotation filter value.
    const filterRotation: number = this.filterRotateNumber();
    if (this.filterCrop()) {
      // Get necessary values from store.
      const playerCrop: DOMRect = this.store.storePlayer.playerCrop.getBoundingClientRect();
      const playerVideo: DOMRect = this.store.storePlayer.playerVideo()[this.store.storeIndex()].getBoundingClientRect();
      const videoHeight: number = this.store.storeVideos()[0].videoHeight;
      const videoWidth: number = this.store.storeVideos()[0].videoWidth;
      // Calculate coordinates to fix aspect ratio using original video dimensions.
      const aspectRatio: number = videoWidth / videoHeight;
      let cropHeight, cropWidth, videoHeight$, videoWidth$;
      if (filterRotation == 90 || filterRotation == 270) {
        videoWidth$ = playerVideo.width;
        videoHeight$ = videoWidth$ * aspectRatio;
        cropWidth = playerCrop.width;
        cropHeight = videoHeight$ * playerCrop.height / playerVideo.height;
        // Swap dimensions for the crop filter.
        this.store.storePlayer.playerWidth.set(this.store.storeVideos()[0].videoHeight);
        this.store.storePlayer.playerHeight.set(this.store.storeVideos()[0].videoWidth);
      } else {
        videoHeight$ = playerVideo.height;
        videoWidth$ = videoHeight$ * aspectRatio;
        cropHeight = playerCrop.height;
        cropWidth = videoWidth$ * playerCrop.width / playerVideo.width;
        // Swap dimensions for the crop filter.
        this.store.storePlayer.playerWidth.set(this.store.storeVideos()[0].videoWidth);
        this.store.storePlayer.playerHeight.set(this.store.storeVideos()[0].videoHeight);
      }
      // Calculate real absolute size values to fit the original video dimensions.
      if (videoWidth > videoHeight) {
        this.filterCropH.set(Math.round(videoWidth / videoHeight$ * cropHeight));
        this.filterCropW.set(Math.round(videoHeight / videoWidth$ * cropWidth));
        if (videoWidth$ > videoHeight$) {
          this.filterCropW.set(Math.round(videoWidth / videoWidth$ * cropWidth));
          this.filterCropH.set(Math.round(videoHeight / videoHeight$ * cropHeight));
        }
      } else {
        this.filterCropW.set(Math.round(videoWidth / videoWidth$ * cropWidth));
        this.filterCropH.set(Math.round(videoHeight / videoHeight$ * cropHeight));
        if (videoWidth$ > videoHeight$) {
          this.filterCropH.set(Math.round(videoWidth / videoHeight$ * cropHeight));
          this.filterCropW.set(Math.round(videoHeight / videoWidth$ * cropWidth));
        }
      }
    } else {
      if (filterRotation == 90 || filterRotation == 270) {
        // Swap dimensions for the scaler filter.
        this.filterCropW.set(this.store.storeVideos()[0].videoHeight);
        this.filterCropH.set(this.store.storeVideos()[0].videoWidth);
        // Swap dimensions for the crop filter.
        this.store.storePlayer.playerWidth.set(this.store.storeVideos()[0].videoHeight);
        this.store.storePlayer.playerHeight.set(this.store.storeVideos()[0].videoWidth);
      } else {
        // Swap dimensions for the scaler filter.
        this.filterCropW.set(this.store.storeVideos()[0].videoWidth);
        this.filterCropH.set(this.store.storeVideos()[0].videoHeight);
        // Swap dimensions for the crop filter.
        this.store.storePlayer.playerWidth.set(this.store.storeVideos()[0].videoWidth);
        this.store.storePlayer.playerHeight.set(this.store.storeVideos()[0].videoHeight);
      }
    }
    // Get dimension values from the store.
    this.filterHeight.set(this.filterCropH());
    this.filterWidth.set(this.filterCropW());
  };

  // Get crop filter parameter.
  public filterCropText(): string {
    // Get player elements and video dimensions.
    const playerCrop: HTMLElement = this.store.storePlayer.playerCrop;
    const playerVideo: DOMRect = this.store.storePlayer.playerVideo()[this.store.storeIndex()].getBoundingClientRect();
    const videoHeight: number = this.store.storeVideos()[0].videoHeight;
    const videoWidth: number = this.store.storeVideos()[0].videoWidth;
    // Calculate real absolute position values to fit the original video dimensions.
    const filterRotation: number = this.filterRotateNumber();
    const cropPosition: any = /translate3d\((?<x>.*?)px, (?<y>.*?)px/.exec(playerCrop.style.transform)?.groups;
    this.filterCropX.set(Math.round(cropPosition.x * (filterRotation == 90 || filterRotation == 270 ? videoHeight : videoWidth) / playerVideo.width));
    this.filterCropY.set(Math.round(cropPosition.y * (filterRotation == 90 || filterRotation == 270 ? videoWidth : videoHeight) / playerVideo.height));
    // Return built parameter.
    return `crop=${this.filterCropW()}:${this.filterCropH()}:${this.filterCropX()}:${this.filterCropY()}`;
  };

  // Get flip filter parameter.
  public filterFlipText(): string {
    // Define flip filters to use.
    const filterFlip: string[] = [];
    if (this.filterFlipH()) { filterFlip.push('hflip'); }
    if (this.filterFlipV()) { filterFlip.push('vflip'); }
    // Return built parameter.
    return filterFlip.join();
  };

  // Get rotation degree number.
  public filterRotateNumber(): number {
    // filterRotation: Metadata rotation.
    // filterRotate: Rotation tool rotation.
    switch (this.filterRotation()) {
      case 90: {
        switch (this.filterRotate()) {
          case 90: { return 0; }
          case 180: { return 90; }
          case 270: { return 180; }
          default: { return 270; }
        }
      }
      case 180: {
        switch (this.filterRotate()) {
          case 90: { return 270; }
          case 180: { return 0; }
          case 270: { return 90; }
          default: { return 180; }
        }
      }
      case 270: {
        switch (this.filterRotate()) {
          case 90: { return 180; }
          case 180: { return 270; }
          case 270: { return 0; }
          default: { return 90; }
        }
      }
      default: {
        switch (this.filterRotate()) {
          case 90: { return 90; }
          case 180: { return 180; }
          case 270: { return 270; }
          default: { return 0; }
        }
      }
    }
  };

  // Get rotate filter parameter.
  public filterRotateText(): string {
    // Return built parameter.
    switch (this.filterRotateNumber()) {
      case 90: { return 'transpose=1'; }
      case 180: { return 'transpose=2,transpose=2'; }
      case 270: { return 'transpose=2'; }
      default: { return ''; }
    }
  };

  // Get scaler filter parameter.
  public filterScalerText(): string {
    // Don't scale if dimensions remain unchanged.
    if ((this.filterWidth() == this.filterCropW()) && (this.filterHeight() == this.filterCropH())) { return ''; }
    // Return built parameter.
    return `scale=${this.filterWidth()}:${this.filterHeight()}:flags=${this.filterAlgorithm()}`;
  };

  // Update filter clear state.
  public filterUpdateClear(): void {
    this.filterClear.update((v) => !v);
  };

  // Update filter no audio state.
  public filterUpdateNoAudio(): void {
    this.filterNoAudio.update((v) => !v);
  };
};