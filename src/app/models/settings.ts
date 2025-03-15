// Import Angular elements.
import { WritableSignal } from '@angular/core';

// Settings categories.
export type SettingsCategories = 'ABOUT' | 'FFMPEG' | 'GENERAL' | 'HOTKEYS';

// Settings themes.
export type SettingsThemes = 'light' | 'dark' | 'slate';

// Settings options.
export interface SettingsOptions {
  [index: string]: any;
  ffmpeg: {
    filesPath: WritableSignal<string>,
    commandsSave: WritableSignal<boolean>,
  },
  general: {
    appTheme: WritableSignal<SettingsThemes>,
    recentFiles: WritableSignal<boolean>,
    createThumbs: WritableSignal<boolean>,
    keyFrames: WritableSignal<boolean>,
  },
};

// Settings hotkeys.
export interface HotkeysKey {
  key: string,
  state: HotkeysState,
};
export interface HotkeysState {
  code: string,
  altKey: boolean,
  ctrlKey: boolean,
  shiftKey: boolean,
};