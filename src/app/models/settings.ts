// Import Angular elements.
import { WritableSignal } from '@angular/core';

// Settings categories.
export type SettingsCategories = 'FFMPEG' | 'GENERAL';

// Settings options.
export interface SettingsOptions {
  [index: string]: any;
  ffmpeg: {
    filesPath: WritableSignal<string>,
    commandsSave: WritableSignal<boolean>,
  },
  general: {
    createThumbs: WritableSignal<boolean>,
    recentFiles: WritableSignal<boolean>,
  },
};