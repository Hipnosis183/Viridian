// Clip update mode.
export type ClipUpdate = 'start' | 'end' | 'position' | 'length';

// Crop element coordinate.
export type CropCoordinate = 'h' | 'w' | 'x' | 'y';

// File compatibility state.
export type FileCompat = 'lossyConcat' | 'noConcat';

// File load state.
export type FileLoad = 'converting' | 'loading' | 'loaded' | null;

// HTML element target.
export type HTMLTarget = { value: string };

// Player flip state.
export type PlayerFlip = 'horizontal' | 'vertical';

// Clip start/end times.
export interface ClipTimes {
  clipStart: number,
  clipEnd: number,
};