// Import Angular elements.
import { Signal } from '@angular/core';

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

// Player speed state.
export type PlayerSpeed = 'increase' | 'decrease' | 'reset';

// State of currently active modals/tools.
export interface ActiveState {
  modal: Signal<null | 'settings' | 'capture' | 'info' | 'save' | 'manual'>,
  loaded: Signal<boolean>,
  segments: Signal<boolean>,
  crop: Signal<boolean>,
}

// Clip start/end times.
export interface ClipTimes {
  clipStart: number,
  clipEnd: number,
};