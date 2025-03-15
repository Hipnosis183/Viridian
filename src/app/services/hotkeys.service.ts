// Import Angular elements.
import { computed, inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { ActiveState } from '@app/models/general';
import { HotkeysKey, HotkeysState } from '@app/models/settings';
import { CaptureService, FiltersService, InfoService, LoadService, PlayerService, SaveService, SegmentsService, SettingsService, StoreService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class HotkeysService {
  // Inject app services.
  private capture = inject(CaptureService);
  private filters = inject(FiltersService);
  private info = inject(InfoService);
  private load = inject(LoadService);
  private player = inject(PlayerService);
  private save = inject(SaveService);
  private segments = inject(SegmentsService);
  private settings = inject(SettingsService);
  private store = inject(StoreService);

  // Define currently active modals/tools.
  private activeState: ActiveState = {
    modal: computed(() => {
      if (this.settings.settingsOpen()) { return 'settings'; }
      if (this.capture.captureOpen()) { return 'capture'; }
      if (this.info.infoOpen()) { return 'info'; }
      if (this.save.saveEditing()) { return 'manual'; }
      if (this.save.saveOpen()) { return 'save'; }
      return null;
    }),
    loaded: computed(() => { return this.load.filesLoadState() == 'loaded'; }),
    segments: computed(() => { return this.segments.segmentsOpen(); }),
    crop: computed(() => { return this.filters.filterCrop(); }),
  };

  // Define hotkeys state.
  public hotkeysAssign = signal<string>('');
  private hotkeysCustom = signal<HotkeysKey[]>(JSON.parse(localStorage.getItem('hotkeys') || '[]'));
  private hotkeysDefault: HotkeysKey[] = [
    // Video player hotkeys.
    { key: 'PLAY_PAUSE', state: { code: 'Space', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'PLAY_CLIP', state: { code: 'Space', altKey: false, ctrlKey: false, shiftKey: true } },
    { key: 'STOP', state: { code: 'Space', altKey: false, ctrlKey: true, shiftKey: false } },
    { key: 'JUMP_START', state: { code: 'Home', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'JUMP_END', state: { code: 'End', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'JUMP_FRONT', state: { code: 'ArrowRight', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'JUMP_BACK', state: { code: 'ArrowLeft', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'FRAME_NEXT', state: { code: 'ArrowRight', altKey: false, ctrlKey: false, shiftKey: true } },
    { key: 'FRAME_PREV', state: { code: 'ArrowLeft', altKey: false, ctrlKey: false, shiftKey: true } },
    { key: 'VOLUME_UP', state: { code: 'ArrowUp', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'VOLUME_DOWN', state: { code: 'ArrowDown', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'MUTE', state: { code: 'KeyM', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'SPEED_UP', state: { code: 'Period', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'SPEED_DOWN', state: { code: 'Comma', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'SPEED_RESET', state: { code: 'Slash', altKey: false, ctrlKey: false, shiftKey: false } },
    // Action/tool hotkeys.
    { key: 'SETTINGS', state: { code: 'F1', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'CAPTURE', state: { code: 'KeyS', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'SPLIT_MERGE', state: { code: 'Tab', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'INFO', state: { code: 'KeyI', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'ROTATE_CW', state: { code: 'KeyR', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'ROTATE_CCW', state: { code: 'KeyR', altKey: false, ctrlKey: true, shiftKey: false } },
    { key: 'FLIP_H', state: { code: 'KeyF', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'FLIP_V', state: { code: 'KeyF', altKey: false, ctrlKey: true, shiftKey: false } },
    { key: 'CROP', state: { code: 'KeyC', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'DONE', state: { code: 'Enter', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'CLOSE', state: { code: 'Escape', altKey: false, ctrlKey: false, shiftKey: false } },
    // Clip hotkeys.
    { key: 'CLIP_SPLIT_CURRENT', state: { code: 'Backslash', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'CLIP_SET_START', state: { code: 'BracketLeft', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'CLIP_SET_END', state: { code: 'BracketRight', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'CLIP_NAV_START_CLIP', state: { code: 'ArrowLeft', altKey: false, ctrlKey: true, shiftKey: false } },
    { key: 'CLIP_NAV_START_KEY', state: { code: 'ArrowLeft', altKey: true, ctrlKey: false, shiftKey: false } },
    { key: 'CLIP_NAV_END_CLIP', state: { code: 'ArrowRight', altKey: false, ctrlKey: true, shiftKey: false } },
    { key: 'CLIP_NAV_END_KEY', state: { code: 'ArrowRight', altKey: true, ctrlKey: false, shiftKey: false } },
    { key: 'CLIP_SNAP_START_CLIP', state: { code: 'BracketLeft', altKey: false, ctrlKey: true, shiftKey: false } },
    { key: 'CLIP_SNAP_START_KEY', state: { code: 'BracketLeft', altKey: true, ctrlKey: false, shiftKey: false } },
    { key: 'CLIP_SNAP_END_CLIP', state: { code: 'BracketRight', altKey: false, ctrlKey: true, shiftKey: false } },
    { key: 'CLIP_SNAP_END_KEY', state: { code: 'BracketRight', altKey: true, ctrlKey: false, shiftKey: false } },
    // Split/merge section hotkeys.
    { key: 'SEGMENT_NAV_UP', state: { code: 'PageUp', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'SEGMENT_NAV_DOWN', state: { code: 'PageDown', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'SEGMENT_MOVE_UP', state: { code: 'PageUp', altKey: false, ctrlKey: false, shiftKey: true } },
    { key: 'SEGMENT_MOVE_DOWN', state: { code: 'PageDown', altKey: false, ctrlKey: false, shiftKey: true } },
    { key: 'SEGMENT_ADD', state: { code: 'Insert', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'SEGMENT_SELECT', state: { code: 'Insert', altKey: false, ctrlKey: false, shiftKey: true } },
    { key: 'SEGMENT_REMOVE', state: { code: 'Delete', altKey: false, ctrlKey: false, shiftKey: false } },
    { key: 'SEGMENT_RESET', state: { code: 'Delete', altKey: false, ctrlKey: false, shiftKey: true } },
  ];
  public hotkeysKeys = computed<HotkeysKey[]>(() => {
    const hotkeys: HotkeysKey[] = structuredClone(this.hotkeysDefault);
    for (let i = 0; i < this.hotkeysDefault.length; i++) {
	    Object.assign(hotkeys[i], this.hotkeysCustom().find((v) => v.key == this.hotkeysDefault[i].key));
    } return hotkeys;
  });

  // Get hotkey state.
  public hotkeysGet(hotkeyKey: string): HotkeysKey {
    return this.hotkeysKeys().find((v) => v.key == hotkeyKey)!;
  };

  // Clear hotkey state.
  public hotkeysClear(hotkeyKey: string): void {
    this.hotkeysUpdate(hotkeyKey, { code: '', altKey: false, ctrlKey: false, shiftKey: false });
  };
  public hotkeysClearAll(): void {
    const hotkeys: HotkeysKey[] = this.hotkeysDefault.map((v) => { return { key: v.key, state: { code: '', altKey: false, ctrlKey: false, shiftKey: false }}});
    // Update custom hotkeys state and storage.
    localStorage.setItem('hotkeys', JSON.stringify(hotkeys));
    this.hotkeysCustom.set(hotkeys);
  };

  // Reset hotkey state.
  public hotkeysReset(hotkeyKey: string): void {
    const hotkey: HotkeysKey = this.hotkeysDefault.find((v) => v.key == hotkeyKey)!;
    this.hotkeysUpdate(hotkey.key, hotkey.state);
  };
  public hotkeysResetAll(): void {
    // Update custom hotkeys state and storage.
    localStorage.setItem('hotkeys', JSON.stringify([]));
    this.hotkeysCustom.set([]);
  };

  // Update hotkeys state.
  private hotkeysUpdate(hotkeyKey: string, hotkeyState: HotkeysState): void {
    // Update hotkey assignment.
    const hotkeys: HotkeysKey[] = structuredClone(this.hotkeysCustom());
    const hotkeyIndex: number = this.hotkeysCustom().findIndex((v) => v.key == hotkeyKey);
    if (hotkeyIndex >= 0) {
      Object.assign(hotkeys[hotkeyIndex], { key: hotkeyKey, state: hotkeyState });
    } else {
      hotkeys.push({ key: hotkeyKey, state: hotkeyState });
    }
    // Update custom hotkeys state and storage.
    localStorage.setItem('hotkeys', JSON.stringify(hotkeys));
    this.hotkeysCustom.set(hotkeys);
  };

  // Manage hotkeys presses.
  private hotkeysBlock = ['AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight'];
  private hotkeysPressed: { [index: string]: boolean } = {};
  public hotkeysUp = (e: KeyboardEvent) => { this.hotkeysPressed[e.code] = false; };
  public hotkeysDown = (e: KeyboardEvent) => {
    // Prevent hotkeys if a message dialog is open.
    if (this.store.storeMessage()) { return; }
    // Prevent the event from triggering repeatedly.
    if (this.hotkeysPressed[e.code]) { e.preventDefault(); return; }
    // Prevent blocked keys from being processed.
    if (this.hotkeysBlock.includes(e.code)) { return; }
    // Continue key press processing normally.
    this.hotkeysPressed[e.code] = true;
    // Get event keys state and check if it's valid.
    const hotkeyState: HotkeysState = { code: e.code, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey };
    const hotkeyKey: string = this.hotkeysKeys().find((v: HotkeysKey) => JSON.stringify(v.state) == JSON.stringify(hotkeyState))?.key ?? '';
    // Manage hotkey assignments.
    if (this.hotkeysAssign()) { e.preventDefault();
      // Check if assignment is already in use.
      if (hotkeyKey) {
        // Skip assignment if it's the same key and state.
        if (hotkeyKey == this.hotkeysAssign()) { this.hotkeysAssign.set(''); return; }
        // Clear old hotkey.
        this.hotkeysClear(hotkeyKey);
      }
      this.hotkeysUpdate(this.hotkeysAssign(), hotkeyState);
      // Reset assignment state and close message dialog.
      this.hotkeysAssign.set(''); return;
    }
    // Prevent default behaviour if it's a valid key combination.
    if (this.hotkeysKeys().map((v: HotkeysKey) => v.key).includes(hotkeyKey)) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
    // Process managed hotkeys.
    if (this.activeState.modal()) {
      // Process hotkeys to close modals.
      if (e.code == 'Escape') {
        switch (this.activeState.modal()) {
          case 'settings': { this.settings.settingsUpdateOpen(); return; }
          case 'capture': { this.capture.captureUpdateOpen(); return; }
          case 'info': { this.info.infoUpdateOpen(); return; }
          case 'save': { this.save.saveUpdateOpen(); return; }
          case 'manual': { this.save.saveUpdateEdit(); return; }
        }
      }
    } else {
      // Process hotkeys when video is already loaded.
      if (this.activeState.loaded()) {
        switch (hotkeyKey) {
          case 'PLAY_PAUSE': { this.player.playerPlayback(); return; }
          case 'PLAY_CLIP': { this.player.playerPlayCurrent(); return; }
          case 'STOP': { this.player.playerStop(); return; }
          case 'JUMP_START': { this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = 0; return; }
          case 'JUMP_END': { this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration; return; }
          case 'JUMP_FRONT': { this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = Math.min(Math.max(this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime + 10, 0), this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration); return; }
          case 'JUMP_BACK': { this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = Math.min(Math.max(this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime - 10, 0), this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration); return; }
          case 'FRAME_NEXT': { this.player.playerFrameAdvance(true); return; }
          case 'FRAME_PREV': { this.player.playerFrameAdvance(false); return; }
          case 'VOLUME_UP': { this.player.playerVolume(Math.min(Math.max(this.store.storePlayer.playerVideo()[this.store.storeIndex()].volume + 0.1, 0), 1)); document.body.click(); return; }
          case 'VOLUME_DOWN': { this.player.playerVolume(Math.min(Math.max(this.store.storePlayer.playerVideo()[this.store.storeIndex()].volume - 0.1, 0), 1)); document.body.click(); return; }
          case 'MUTE': { this.player.playerMute(); document.body.click(); return; }
          case 'SPEED_UP': { this.player.playerSpeed('increase'); document.body.click(); return; }
          case 'SPEED_DOWN': { this.player.playerSpeed('decrease'); document.body.click(); return; }
          case 'SPEED_RESET': { this.player.playerSpeed('reset'); document.body.click(); return; }
          case 'SETTINGS': { this.settings.settingsUpdateOpen(); return; }
          case 'CAPTURE': { this.capture.captureUpdateOpen(); return; }
          case 'SPLIT_MERGE': { this.segments.segmentsUpdateOpen(); return; }
          case 'INFO': { this.info.infoUpdateOpen(); return; }
          case 'ROTATE_CW': { this.player.playerFilterRotate(true); return; }
          case 'ROTATE_CCW': { this.player.playerFilterRotate(false); return; }
          case 'FLIP_H': { this.player.playerFilterFlip(false); return; }
          case 'FLIP_V': { this.player.playerFilterFlip(true); return; }
          case 'CROP': { this.player.playerFilterCrop(); return; }
          case 'DONE': { this.save.saveUpdateOpen(); return; }
          case 'CLOSE': { this.load.filesClose(); return; }
        }
        // Process split/merge section hotkeys.
        if (this.activeState.segments()) {
          switch (hotkeyKey) {
            case 'CLIP_SPLIT_CURRENT': { this.segments.clipSplit(true); return; }
            case 'CLIP_SET_START': { this.segments.clipSet(true); return; }
            case 'CLIP_SET_END': { this.segments.clipSet(false); return; }
            case 'CLIP_NAV_START_CLIP': { this.segments.clipNavigate(true, true); return; }
            case 'CLIP_NAV_START_KEY': { this.segments.clipNavigate(true, false); return; }
            case 'CLIP_NAV_END_CLIP': { this.segments.clipNavigate(false, true); return; }
            case 'CLIP_NAV_END_KEY': { this.segments.clipNavigate(false, false); return; }
            case 'CLIP_SNAP_START_CLIP': { this.segments.clipSnap(true, true); return; }
            case 'CLIP_SNAP_START_KEY': { this.segments.clipSnap(true, false); return; }
            case 'CLIP_SNAP_END_CLIP': { this.segments.clipSnap(false, true); return; }
            case 'CLIP_SNAP_END_KEY': { this.segments.clipSnap(false, false); return; }
            case 'SEGMENT_NAV_UP': { this.segments.clipIndex(this.store.storeIndex(), Math.max(0, this.store.storeFiles()[this.store.storeIndex()].fileClipIndex() - 1)); return; }
            case 'SEGMENT_NAV_DOWN': { this.segments.clipIndex(this.store.storeIndex(), Math.min(this.store.storeFiles()[this.store.storeIndex()].fileClips().length - 1, this.store.storeFiles()[this.store.storeIndex()].fileClipIndex() + 1)); return; }
            case 'SEGMENT_MOVE_UP': { this.segments.clipUp(); return; }
            case 'SEGMENT_MOVE_DOWN': { this.segments.clipDown(); return; }
            case 'SEGMENT_ADD': { this.segments.clipAdd(); return; }
            case 'SEGMENT_SELECT': { this.segments.clipSelect(this.store.storeFiles()[this.store.storeIndex()].fileClipIndex(), this.store.storeIndex()); return; }
            case 'SEGMENT_REMOVE': { this.segments.clipRemove(); return; }
            case 'SEGMENT_RESET': { this.segments.clipReset(); return; }
          }
        }
      }
      // Process hotkeys that don't require a video loaded.
      else {
        switch (hotkeyKey) {
          case 'SETTINGS': { this.settings.settingsUpdateOpen(); return; }
        }
      }
    }
  };
};