// Import Angular elements.
import { Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { FileInfo, PlayerInfo, VideoInfo} from '@app/models/store';

// Import Tailwind color values.
import DefaultColors from 'tailwindcss/colors'

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  // Define store state.
  public storeIndex = signal<number>(0);
  public storeFiles = signal<FileInfo[]>([]);
  public storeVideos = signal<VideoInfo[]>([]);
  public storePlayer: PlayerInfo = {
    playerCrop: null,
    playerVideo: signal<HTMLVideoElement[]>([]),
    playerHeight: signal<number>(0),
    playerWidth: signal<number>(0),
  };

  // Reset store state.
  public storeReset(): void {
    this.storeIndex.set(0);
    this.storeFiles.set([]);
    this.storeVideos.set([]);
    this.storePlayer.playerVideo.set([]);
    this.storePlayer.playerHeight.set(0);
    this.storePlayer.playerWidth.set(0);
  };

  // Define colors list for general usage.
  public storeColors: any[] = [
    DefaultColors.blue,
    DefaultColors.red,
    DefaultColors.green,
    DefaultColors.yellow,
    DefaultColors.purple,
    DefaultColors.pink,
    DefaultColors.teal,
    DefaultColors.indigo,
    DefaultColors.amber,
    DefaultColors.sky,
    DefaultColors.rose,
    DefaultColors.lime,
    DefaultColors.fuchsia,
    DefaultColors.orange,
  ];
};