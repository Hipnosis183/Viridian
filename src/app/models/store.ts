// Import Angular elements.
import { WritableSignal } from '@angular/core';

// Video file clip information.
export interface ClipInfo {
  clipColor: WritableSignal<number>,
  clipStart: WritableSignal<number>,
  clipEnd: WritableSignal<number>,
  clipElement: WritableSignal<HTMLElement | null>,
};

// Video file information.
export interface FileInfo {
  fileColor: WritableSignal<number>,
  fileClip: string,
  fileClipIndex: WritableSignal<number>,
  fileClips: WritableSignal<ClipInfo[]>,
  fileConcat: string,
  fileConcatClip: string,
  fileExtension: string,
  fileInterval: number,
  fileName: string,
  filePath: string,
  fileTemp: string,
  fileThumb: string,
  fileThumbs: string[],
  fileType: string,
};

// Video player information.
export interface PlayerInfo {
  playerCrop: any,
  playerVideo: WritableSignal<HTMLVideoElement[]>,
  playerHeight: WritableSignal<number>,
  playerWidth: WritableSignal<number>,
};

// Video stream information.
export interface VideoInfo {
  videoFrameRate: number,
  videoHeight: number,
  videoKeyframes: number[],
  videoStreams: any[],
  videoStreamsText: string[],
  videoWidth: number
};