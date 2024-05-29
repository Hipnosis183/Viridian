// Import Angular elements.
import { WritableSignal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { Codec, Format } from '@app/models/listas';

// Video save concat mode.
export type SaveConcat = 'merge' | 'clips';

// Video save cut mode.
export type SaveCut = 'smart' | 'lossy' | 'lossless' | 'keyframe';

// Video save state.
export type SaveState = 'canceling' | 'saving' | 'saved' | null;

// Video save command.
export interface SaveCommand {
  color: string,
  full: string,
  name: string,
  text: WritableSignal<string>,
};

// Video save information.
export interface SaveInfo {
  saveAudio: string,
  saveClips: string[],
  saveCodec: string,
  saveCommands: WritableSignal<SaveCommand[]>,
  saveConcat: string,
  saveCut: WritableSignal<boolean>,
  saveDelete: string[],
  saveEncoding: string,
  saveFilters: string,
  saveFilters$: WritableSignal<string[]>,
  saveInput: string,
  saveMetadata: string,
  saveOutput: WritableSignal<string>,
};

// Video save settings.
export interface SaveSettings {
  saveBitrate: WritableSignal<string>,
  saveCodec: WritableSignal<Codec>,
  saveConcat: WritableSignal<SaveConcat>,
  saveCut: WritableSignal<SaveCut>,
  saveEncoder: WritableSignal<string | null>,
  saveLock: WritableSignal<boolean>,
  saveFormat: WritableSignal<Format>,
  savePreset: WritableSignal<string>,
  saveQuality: WritableSignal<number>,
  saveRate: WritableSignal<string>,
  saveRatio: WritableSignal<number>,
  saveScale: WritableSignal<number>,
};

// Video save split clip.
export interface SaveSplit {
  clipStart: number,
  clipEnd: number,
  clipMode: string,
};