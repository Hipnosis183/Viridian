// Import Angular elements.
import { Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { FileInfo, PlayerInfo, VideoInfo } from '@app/models/store';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  // Define store state.
  public storeIndex = signal<number>(0);
  public storeFiles = signal<FileInfo[]>([]);
  public storeMessage = signal<string>('');
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

  // Define natively compatible codecs.
  public storeCodecs = ['h264', 'hevc', 'vp8', 'vp9', 'av1'];

  // Define colors list for general usage.
  public storeColors: [string, string][] = [
    ['rgb(38, 100, 236)', 'rgb(28, 78, 216)'],  // Blue
    ['rgb(220, 38, 38)', 'rgb(186, 28, 28)'],   // Red
    ['rgb(22, 164, 74)', 'rgb(22, 128, 62)'],   // Green
    ['rgb(234, 178, 8)', 'rgb(202, 138, 4)'],   // Yellow
    ['rgb(148, 52, 234)', 'rgb(126, 34, 206)'], // Purple
    ['rgb(220, 40, 120)', 'rgb(190, 24, 94)'],  // Pink
    ['rgb(20, 184, 166)', 'rgb(14, 148, 136)'], // Teal
    ['rgb(80, 70, 230)', 'rgb(68, 56, 202)'],   // Indigo
    ['rgb(246, 158, 12)', 'rgb(218, 120, 6)'],  // Amber
    ['rgb(2, 132, 200)', 'rgb(4, 106, 162)'],   // Sky
    ['rgb(226, 30, 72)', 'rgb(190, 18, 60)'],   // Rose
    ['rgb(132, 204, 22)', 'rgb(102, 164, 14)'], // Lime
    ['rgb(192, 38, 212)', 'rgb(162, 28, 176)'], // Fuchsia
    ['rgb(234, 88, 12)', 'rgb(200, 72, 18)'],   // Orange
  ];
};