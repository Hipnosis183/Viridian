// Import Angular elements.
import { WritableSignal } from '@angular/core';

// Settings categories.
export type SettingsCategories = 'FFMPEG' | 'GENERAL';

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