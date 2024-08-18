// Import Angular elements.
import { inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { ClipTimes, ClipUpdate, HTMLTarget } from '@app/models/general';
import { ClipInfo } from '@app/models/store';
import { DelayService, FiltersService, IpcService, PlayerService, StoreService } from '@app/services';

// @ts-ignore
// Import Resizable.
import Resizable from 'resizable';

@Injectable({
  providedIn: 'root',
})
export class SegmentsService {
  // Inject app services.
  private delay = inject(DelayService);
  private filters = inject(FiltersService);
  private ipc = inject(IpcService);
  private player = inject(PlayerService);
  private store = inject(StoreService);

  // Define video segments state.
  public segmentsOpen = signal<boolean>(false);
  private segmentsQueue: ClipTimes[] = [];
  public segmentsSplit = signal<number>(2);

  // Update segments open state.
  public segmentsUpdateOpen(segmentsOpen?: boolean): void {
    this.segmentsOpen.update((v) => segmentsOpen ?? !v);
    if (this.segmentsOpen()) {
      // Update clips state.
      setTimeout(() => { this.clipUpdate(true); });
    }
    if (!segmentsOpen) {
      // Update video player state.
      setTimeout(() => { this.player.playerUpdate(this.filters.filterRotate()); });
    }
  };

  // Update file concatenation text file.
  public async fileConcat(): Promise<void> {
    // Build string of files to concatenate.
    let fileConcat: string = '';
    for (let i = 0; i < this.store.storeFiles().length; i++) {
      fileConcat += 'file \'' + this.store.storeFiles()[i].filePath + '\'\n';
    }
    // Create temporal text file for the concatenation process.
    await this.ipc.invoke('file-create', this.store.storeFiles()[0].fileConcat, fileConcat);
  };

  // Update selected file index.
  public fileIndex(fileIndex: number): void {
    // Pause current video if it's playing.
    for (let i = 0; i < this.store.storeFiles().length; i++) {
      this.store.storePlayer.playerVideo()[i].pause();
    }
    // Update current file index.
    this.store.storeIndex.set(fileIndex);
  };

  // Move currently selected file up in the list.
  public fileUp(): void {
    // Avoid moving file if it's already at the top.
    if (this.store.storeIndex() > 0) {
      // Update selected file position in all places.
      this.store.storeFiles.update((v) => v.toSpliced(this.store.storeIndex() - 1, 0, v.splice(this.store.storeIndex(), 1)[0]));
      this.store.storeVideos.update((v) => v.toSpliced(this.store.storeIndex() - 1, 0, v.splice(this.store.storeIndex(), 1)[0]));
      this.store.storePlayer.playerVideo.update((v) => v.toSpliced(this.store.storeIndex() - 1, 0, v.splice(this.store.storeIndex(), 1)[0]));
      // Update current file index.
      this.store.storeIndex.update((v) => v - 1);
      // Update file concatenation text file.
      this.fileConcat();
    }
  };

  // Move currently selected file down in the list.
  public fileDown(): void {
    // Avoid moving file if it's already at the bottom.
    if ((this.store.storeIndex() + 1) < this.store.storeFiles().length) {
      // Update selected file position in all places.
      this.store.storeFiles.update((v) => v.toSpliced(this.store.storeIndex() + 1, 0, v.splice(this.store.storeIndex(), 1)[0]));
      this.store.storeVideos.update((v) => v.toSpliced(this.store.storeIndex() + 1, 0, v.splice(this.store.storeIndex(), 1)[0]));
      this.store.storePlayer.playerVideo.update((v) => v.toSpliced(this.store.storeIndex() + 1, 0, v.splice(this.store.storeIndex(), 1)[0]));
      // Update current file index.
      this.store.storeIndex.update((v) => v + 1);
      // Update file concatenation text file.
      this.fileConcat();
    }
  };

  // Remove currently selected video file from the list.
  public fileRemove(fileIndex?: number): void {
    if (this.store.storeFiles().length > 1) {
      // Update current file index.
      if (fileIndex != undefined) { this.fileIndex(fileIndex); }
      // Remove selected file from all places.
      this.filters.filterConcat.update((v) => v.filter((x) => x != this.store.storeFiles()[this.store.storeIndex()].filePath));
      this.store.storeFiles.update((v) => v.toSpliced(this.store.storeIndex(), 1));
      this.store.storeVideos.update((v) => v.toSpliced(this.store.storeIndex(), 1));
      this.store.storePlayer.playerVideo.update((v) => v.toSpliced(this.store.storeIndex(), 1));
      // Update current index to the nearest available file.
      if (this.store.storeFiles().length == this.store.storeIndex()) {
        this.store.storeIndex.update((v) => v - 1);
      }
      // Update file concatenation text file.
      this.fileConcat();
    }
  };

  // Add clip for the currently selected file.
  public clipAdd(clipStart?: number, clipEnd?: number, fileIndex?: number): void {
    // Update current file index.
    if (fileIndex != undefined) { this.fileIndex(fileIndex); }
    // Get current and total duration time in frames.
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    const currentTime: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime * frameRate;
    const totalDuration: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration * frameRate;
    // Create clip object and update file state.
    const clipInfo: ClipInfo = {
      clipColor: signal<number>(0),
      clipExport: signal<boolean>(true),
      clipStart: signal<number>(clipStart ?? currentTime),
      clipEnd: signal<number>(clipEnd ?? totalDuration),
      clipElement: signal<HTMLElement | null>(null),
    };
    const clipIndex: number = this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    this.store.storeFiles()[this.store.storeIndex()].fileClips.update((v) => v.toSpliced(clipIndex + 1, 0, clipInfo));
    // Update current clip index.
    this.store.storeFiles()[this.store.storeIndex()].fileClipIndex.update((v) => v + 1);
    // Remove clip from the queue.
    if (this.segmentsQueue.length) { this.segmentsQueue.shift(); }
  };

  // Remove selected clip.
  public clipRemove(clipIndex?: number, fileIndex?: number): void {
    // Update current file index.
    if (fileIndex != undefined) { this.fileIndex(fileIndex); }
    // Don't remove if it's the only clip available.
    if (this.store.storeFiles()[this.store.storeIndex()].fileClips().length == 1) { return; }
    // Remove clip object from file state.
    const clipIndex$: number = clipIndex ?? this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    this.store.storeFiles()[this.store.storeIndex()].fileClips.update((v) => v.toSpliced(clipIndex$, 1));
    // Update current clip index.
    this.store.storeFiles()[this.store.storeIndex()].fileClipIndex.update((v) => v > 0 ? v - 1 : v);
  };

  // Reset file(s) clips.
  public clipReset(fileIndex?: number): void {
    // Update current file index.
    if (fileIndex != undefined) { this.fileIndex(fileIndex); }
    // Reset file clips.
    this.store.storeFiles()[this.store.storeIndex()].fileClips.set([]);
    // Reset current clip index.
    this.store.storeFiles()[this.store.storeIndex()].fileClipIndex.set(-1);
    this.store.storeFiles()[this.store.storeIndex()].fileColor.set(0);
    // Create default clip segment.
    this.clipAdd(0);
  };

  // Update selected clip index.
  public clipIndex(fileIndex: number, clipIndex: number): void {
    this.store.storeIndex.set(fileIndex);
    this.store.storeFiles()[fileIndex].fileClipIndex.set(clipIndex);
  };

  // Move currently selected clip up in the list.
  public clipUp(clipIndex?: number, fileIndex?: number): void {
    // Update current file index.
    if (fileIndex != undefined) { this.fileIndex(fileIndex); }
    // Avoid moving clip if it's already at the top.
    const clipIndex$: number = clipIndex ?? this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    if (clipIndex$ > 0) {
      // Update selected clip position.
      const clipInfo: ClipInfo = this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex$];
      this.store.storeFiles()[this.store.storeIndex()].fileClips.update((v) => v.toSpliced(clipIndex$, 1).toSpliced(clipIndex$ - 1, 0, clipInfo));
      // Update current clip index.
      this.store.storeFiles()[this.store.storeIndex()].fileClipIndex.update((v) => v - 1);
    }
  };

  // Move currently selected clip down in the list.
  public clipDown(clipIndex?: number, fileIndex?: number): void {
    // Update current file index.
    if (fileIndex != undefined) { this.fileIndex(fileIndex); }
    // Avoid moving clip if it's already at the bottom.
    const clipIndex$: number = clipIndex ?? this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    if ((clipIndex$ + 1) < this.store.storeFiles()[this.store.storeIndex()].fileClips().length) {
      // Update selected clip position.
      const clipInfo: ClipInfo = this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex$];
      this.store.storeFiles()[this.store.storeIndex()].fileClips.update((v) => v.toSpliced(clipIndex$, 1).toSpliced(clipIndex$ + 1, 0, clipInfo));
      // Update current clip index.
      this.store.storeFiles()[this.store.storeIndex()].fileClipIndex.update((v) => v + 1);
    }
  };

  // Toggle selected clip for export.
  public clipSelect(clipIndex: number, fileIndex: number): void {
    // Update clip export state value.
    this.store.storeFiles()[fileIndex].fileClips()[clipIndex].clipExport.update((v) => !v);
  };

  // Split current clip into several.
  public clipSplit(splitCurrent: boolean): void {
    // Get current clip data.
    const clipIndex: number = this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    const clipInfo: ClipInfo = this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex];
    // Get current time in frames.
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    const currentTime: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime * frameRate;
    // Split selected clip at the current time.
    if (splitCurrent) {
      if (currentTime > clipInfo.clipStart() && currentTime < clipInfo.clipEnd()) {
        // Update current clip end time.
        const clipEnd: number = clipInfo.clipEnd();
        this.clipSet(false);
        // Create clip starting from current time.
        this.clipAdd(currentTime, clipEnd);
      }
    // Split selected clip in an even amount of clips.
    } else {
      // Calculate length for the clips.
      const clipsLength: number = (clipInfo.clipEnd() - clipInfo.clipStart()) / this.segmentsSplit();
      // Update current clip end time.
      this.clipSet(false, clipInfo.clipStart() + clipsLength);
      // Create selected amount of clips of even length.
      for (let i = 0; i < this.segmentsSplit() - 1; i++) {
        // Add clip to queue list.
        this.segmentsQueue.push({
          clipStart: clipInfo.clipStart() + (clipsLength * (i + 1)),
          clipEnd: clipInfo.clipStart() + (clipsLength * (i + 1)) + clipsLength,
        });
      }
      // Start split clips creation.
      this.clipAdd(this.segmentsQueue[0].clipStart, this.segmentsQueue[0].clipEnd);
    }
  };

  // Update current clip start/end time.
  public clipSet(clipStart: boolean, clipTime?: number): void {
    // Get current time in frames.
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    const currentTime: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime * frameRate;
    // Add new clip if the selected time is greater than the current end time.
    const clipIndex: number = this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    if (clipStart && currentTime >= this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex].clipEnd()) {
      this.clipAdd();
    } else {
      // Update start/end time with the selected/current time.
      this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex][clipStart ? 'clipStart': 'clipEnd'].set(clipTime ?? currentTime);
      this.clipUpdate();
    }
  };

  // Update current player time.
  public clipNavigate(clipStart: boolean, navigateClip: boolean): void {
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    // Set the start/end of the selected clip as the current time.
    if (navigateClip) {
      const clipIndex: number = this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
      const currentTime: number = this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex][clipStart ? 'clipStart': 'clipEnd']();
      this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = currentTime / frameRate;
    } else {
      // Set the nearest keyframe as the current time.
      const currentTime: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime;
      const totalDuration: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration * frameRate
      const videoKeyframes: number[] = [...this.store.storeVideos()[this.store.storeIndex()].videoKeyframes, totalDuration / frameRate];
      for (let i = 0; i < videoKeyframes.length; i++) {
        // Previous Keyframe.
        if (clipStart && (videoKeyframes[i] >= currentTime) && (videoKeyframes[i] > 0)) {
          this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = videoKeyframes[i - 1]; break;
        }
        // Next Keyframe.
        if (!clipStart && (videoKeyframes[i] > currentTime)) {
          this.store.storePlayer.playerVideo()[this.store.storeIndex()].currentTime = videoKeyframes[i]; break;
        }
      }
    }
  };

  // Snap/extend selected clip to the nearest clip/keyframe.
  public clipSnap(clipStart: boolean, snapClip: boolean): void {
    // Get total duration time in frames.
    const clipsInfo: ClipInfo[] = this.store.storeFiles()[this.store.storeIndex()].fileClips();
    const clipIndex: number = this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    const totalDuration: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration * frameRate;
    let snapNearest: number = 0;
    if (snapClip) {
      // Snap/extend start of clip to the nearest clip end.
      if (clipStart) {
        // Find nearest clip end.
        for (let [i, clip] of clipsInfo.entries()) {
          if (i != clipIndex && clip.clipEnd() < clipsInfo[clipIndex].clipEnd()) {
            if (clip.clipEnd() > snapNearest) { snapNearest = clip.clipEnd(); }
          }
        }
        // Update selected clip start time with nearest clip end value.
        clipsInfo[clipIndex].clipStart.set(snapNearest);
      // Snap/extend end of clip to the nearest clip start.
      } else {
        // Find nearest clip start.
        snapNearest = totalDuration;
        for (let [i, clip] of clipsInfo.entries()) {
          if (i != clipIndex && clip.clipStart() > clipsInfo[clipIndex].clipStart()) {
            if (clip.clipStart() < snapNearest) { snapNearest = clip.clipStart(); }
          }
        }
        // Update selected clip end time with nearest clip start value.
        clipsInfo[clipIndex].clipEnd.set(snapNearest);
      }
    } else {
      // Snap/extend to the nearest keyframe.
      let snapDistance: number = totalDuration;
      // Find nearest keyframe.
      const videoKeyframes: number[] = [...this.store.storeVideos()[this.store.storeIndex()].videoKeyframes, totalDuration / frameRate];
      for (let i = 0; i < videoKeyframes.length; i++) {
        const snapKeyframe: number = videoKeyframes[i] * frameRate;
        const snapDistance$ = Math.abs(clipsInfo[clipIndex][clipStart ? 'clipStart': 'clipEnd']() - snapKeyframe);
        if (snapDistance$ < Math.abs(snapDistance)) {
          snapDistance = snapDistance$; snapNearest = snapKeyframe;
        }
      }
      // Update selected clip start/end time with nearest keyframe value.
      clipsInfo[clipIndex][clipStart ? 'clipStart': 'clipEnd'].set(snapNearest);
    }
    // Update clips state.
    this.clipUpdate();
  };

  // Update clip element state.
  public clipUpdate(updateAll?: boolean): void {
    const playerClips: HTMLElement = document.querySelector('#playerClips')!;
    // Update clips for all files.
    if (updateAll) {
      for (let [i, file] of this.store.storeFiles().entries()) {
        for (let clip of file.fileClips()) {
          // Get total duration time in frames.
          const frameRate: number = this.store.storeVideos()[i].videoFrameRate;
          const totalDuration: number = this.store.storePlayer.playerVideo()[i].duration * frameRate;
          // Update clip element position and dimensions.
          const clipStart: number = clip.clipStart() * playerClips.offsetWidth / totalDuration;
          const clipEnd: number = clip.clipEnd() * playerClips.offsetWidth / totalDuration;
          clip.clipElement()!.style.transform = `translate3d(${clipStart}px, 0px, 0px)`;
          clip.clipElement()!.style.width = `${clipEnd - clipStart}px`;
        }
      }
    } else {
      // Update clips for current file.
      for (let clip of this.store.storeFiles()[this.store.storeIndex()].fileClips()) {
        // Get total duration time in frames.
        const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
        const totalDuration: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration * frameRate;
        // Update clip element position and dimensions.
        const clipStart: number = clip.clipStart() * playerClips.offsetWidth / totalDuration;
        const clipEnd: number = clip.clipEnd() * playerClips.offsetWidth / totalDuration;
        clip.clipElement()!.style.transform = `translate3d(${clipStart}px, 0px, 0px)`;
        clip.clipElement()!.style.width = `${clipEnd - clipStart}px`;
      }
    }
  };

  // Manage clip element creation after initial load.
  public clipLoaded(clipElement: HTMLElement): void {
    // Set default position values for the clip element.
    clipElement.style.transform = 'translate3d(0px, 0px, 0px)';
    // Create a resizable instance from the clip element.
    const resizable = new Resizable(clipElement, {
      draggable: { axis: 'x', within: 'parent' }, handles: 'e, w', within: 'parent',
    });
    // Update clip element state on resize event.
    resizable.on('resize', () => { this.clipResize$(); });
    // Update clip element state on drag event.
    resizable.draggable.on('drag', () => { this.clipResize$(); });
    // Define background color for clip element.
    const clipColor: number = this.store.storeFiles()[this.store.storeIndex()].fileColor();
    // Update clip object from file state.
    const clipIndex: number = this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex].clipColor.set(clipColor);
    this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex].clipElement.set(clipElement);
    // Update color assignment value index.
    this.store.storeFiles()[this.store.storeIndex()].fileColor.set(clipColor == this.store.storeColors.length - 1 ? 0 : clipColor + 1);
    // Update clip elements display dimensions.
    this.clipUpdate();
    // Continue adding clips in the queue.
    if (this.segmentsQueue.length) {
      this.clipAdd(this.segmentsQueue[0].clipStart, this.segmentsQueue[0].clipEnd);
    }
  };

  // Manage clip resizeable element.
  private clipResize$: Function = this.delay.throttle(() => this.clipResize(), 10);
  private clipResize(): void {
    // Get current clip data.
    const clipIndex: number = this.store.storeFiles()[this.store.storeIndex()].fileClipIndex();
    const clipInfo: ClipInfo = this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex];
    // Get total duration time in frames.
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    const totalDuration: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration * frameRate;
    // Calculate clip element position and dimensions from the real time values.
    const playerClips: HTMLElement = document.querySelector('#playerClips')!;
    const clipPosition: string = /translate3d\((?<x>.*?)px, (?<y>.*?)px/.exec(clipInfo.clipElement()!.style.transform)!.groups!.x;
    let clipStart: number = (+clipPosition) * totalDuration / playerClips.offsetWidth;
    let clipEnd: number = ((+clipPosition) + clipInfo.clipElement()!.getBoundingClientRect().width) * totalDuration / playerClips.offsetWidth;
    // Fix precision problems when end value overflows duration time.
    if (clipEnd > totalDuration) {
      clipStart = totalDuration - clipStart;
      clipEnd = totalDuration;
    }
    // Update clip object timing values.
    this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex].clipStart.set(clipStart);
    this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex].clipEnd.set(clipEnd);
  };

  // Update clip position and size from time inputs.
  public clipInputTime(updateMode: ClipUpdate, inputTarget: HTMLTarget, clipIndex: number, clipElement: HTMLElement): string {
    // Get input and total duration time in frames.
    const clipInfo: ClipInfo = this.store.storeFiles()[this.store.storeIndex()].fileClips()[clipIndex];
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    const inputTimes: string[] = inputTarget.value.split(':');
    const inputTime: number = Math.round(((+inputTimes[0]) * 60 * 60 + (+inputTimes[1]) * 60 + (+inputTimes[2])) * frameRate * 1000) / 1000;
    const totalDuration: number = this.store.storePlayer.playerVideo()[this.store.storeIndex()].duration * frameRate;
    // Calculate output time for the selected mode.
    let outputTime: number = 0;
    switch (updateMode) {
      // Update clip start time.
      case 'start': {
        if (inputTime > totalDuration) { clipInfo.clipStart.set(0); }
        else if (inputTime > clipInfo.clipEnd()) { clipInfo.clipStart.set(clipInfo.clipEnd()); }
        else { clipInfo.clipStart.set(inputTime); }
        outputTime = clipInfo.clipStart(); break;
      }
      // Update clip end time.
      case 'end': {
        if (inputTime > totalDuration) { clipInfo.clipEnd.set(totalDuration); }
        else if (inputTime < clipInfo.clipStart()) { clipInfo.clipEnd.set(clipInfo.clipStart()); }
        else { clipInfo.clipEnd.set(inputTime); }
        outputTime = clipInfo.clipEnd(); break;
      }
      // Update clip start time while maintaining end time.
      case 'position': {
        let clipTime: number = 0;
        if (inputTime > totalDuration) {
          clipTime = (inputTime > clipInfo.clipEnd() ? 0 : inputTime) - clipInfo.clipStart();
          clipInfo.clipStart.update((v) => v + clipTime);
          clipInfo.clipEnd.update((v) => v + clipTime);
        } else {
          if (inputTime - clipInfo.clipStart() + clipInfo.clipEnd() > totalDuration) {
            clipTime = totalDuration - clipInfo.clipEnd();
            clipInfo.clipStart.update((v) => v + clipTime);
            clipInfo.clipEnd.update((v) => v + clipTime);
          } else {
            clipTime = inputTime - clipInfo.clipStart();
            clipInfo.clipStart.update((v) => v + clipTime);
            clipInfo.clipEnd.update((v) => v + clipTime);
          }
        } outputTime = clipInfo.clipStart(); break;
      }
      // Update clip start/end time from length.
      case 'length': {
        if (clipInfo.clipStart() + inputTime > totalDuration) { clipInfo.clipEnd.set(totalDuration); }
        else { clipInfo.clipEnd.set(clipInfo.clipStart() + inputTime); }
        outputTime = clipInfo.clipEnd() - clipInfo.clipStart(); break;
      }
    }
    // Update input value and clip dimensions/position.
    inputTarget.value = new Date(Math.round(outputTime / frameRate * 1000)).toISOString().substring(11, 23);
    this.clipUpdate();
    // Update tooltip positioning.
    if ((clipElement as any)._tippy.popperInstance) {
      (clipElement as any)._tippy.popperInstance.update();
    }
    // Return time in frames.
    return Math.round(outputTime).toString();
  };

  // Update clip position and size from frame inputs.
  public clipInputFrame(updateMode: ClipUpdate, inputTarget: HTMLTarget, clipIndex: number, clipElement: HTMLElement): void {
    // Correct input value format.
    const frameRate: number = this.store.storeVideos()[this.store.storeIndex()].videoFrameRate;
    const frameTime: number = Math.round(+inputTarget.value / frameRate * 1000);
    const inputTarget$: HTMLTarget = { value: new Date(frameTime).toISOString().substring(11, 23) };
    // Update clip time value.
    inputTarget.value = this.clipInputTime(updateMode, inputTarget$, clipIndex, clipElement);
  };
};