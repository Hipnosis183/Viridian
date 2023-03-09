import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { DelayService } from 'src/app/services/delay.service';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';
import { UtilsService } from 'src/app/services/utils.service';

// @ts-ignore
import Resizable from 'resizable';

@Component({
  selector: 'video-segments',
  templateUrl: './video-segments.component.html',
  styleUrls: ['./video-segments.component.css']
})

export class VideoSegmentsComponent {

  constructor(
    private delay: DelayService,
    public filters: FiltersService,
    private ipc: IpcService,
    public store: StoreService,
    public utils: UtilsService,
    private zone: NgZone
  ) { }

  @Output() added = new EventEmitter;
  @Output() inited = new EventEmitter;
  @Output() loaded = new EventEmitter;
  @Output() removed = new EventEmitter;

  ngOnInit(): void { this.inited.emit(); }

  videoCompatible: boolean = false;
  $videoCompatible(v?: boolean): void {
    this.videoCompatible = v ?? !this.videoCompatible;
  }

  videoIncompatible: boolean = false;
  $videoIncompatible(v?: boolean): void {
    this.videoIncompatible = v ?? !this.videoIncompatible;
  }

  videoSegments: boolean = false;
  $videoSegments(v?: boolean): void {
    this.videoSegments = v ?? !this.videoSegments;
    if (this.videoSegments) { setTimeout(() => { this.videoClipUpdate(true); }); }
    if (v == undefined) { setTimeout(() => { this.loaded.emit(); }); }
  }

  videoSplit: number = 2;
  $videoSplit(e: any): void {
    if (this.videoSplit < 2) { this.videoSplit = 2; }
    if (this.videoSplit > 100) { this.videoSplit = 100; }
    e.target.value = this.videoSplit;
  }

  async videoFileAdd(e: any): Promise<void> {
    // Get video file metadata.
    const input: string = 'file://' + e.target.files[0].path;
    const command: string = `ffprobe -v error -of json -show_format -show_entries streams -i "${input}"`;
    this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
    this.ipc.once('exec', (err: any, r: string) => {
      this.zone.run(() => {
        // Get general format and streams/tracks information.
        const stream = this.store.state.videoInfo[0].videoStreams[1];
        let streams = [JSON.parse(r).format];
        streams = streams.concat(JSON.parse(r).streams);
        // Add file if the width and height are the same as the default video.
        if ((stream.height == streams[1].height) && (stream.width == streams[1].width)) {
          // Define concat mode to use (demuxer/filter) depending on the codec and timebase.
          if ((stream.codec_name != streams[1].codec_name) || (stream.time_base != streams[1].time_base)) {
            this.store.state.filterInfo.filterConcat.push(input);
            this.$videoCompatible();
          } this.added.emit(e);
        } else { this.$videoIncompatible(); }
      });
    });
  }

  videoFileChange(i: number): void {
    // Pause current video if it's playing and update video index.
    for (let i = 0; i < this.store.state.fileInfo.length; i++) {
      this.store.state.playerInfo.playerVideo[i].pause();
    } this.store.i = i;
  }

  videoFileConcat(): void {
    // Build string of files to concatenate.
    let concat: string = '';
    for (let i = 0; i < this.store.state.fileInfo.length; i++) {
      concat += 'file \'' + this.store.state.fileInfo[i].filePath + '\'\n';
      // Create temporal text file for the concatenation process.
    } this.ipc.send('write-file', this.store.state.fileInfo[0].fileConcat.slice(7), concat);
  }

  videoFileMoveDown(): void {
    // Avoid moving file if it's already at the bottom.
    if ((this.store.i + 1) < this.store.state.fileInfo.length) {
      // Update selected file position in all places.
      this.store.state.fileInfo.splice(this.store.i + 1, 0, this.store.state.fileInfo.splice(this.store.i, 1)[0]);
      this.store.state.videoInfo.splice(this.store.i + 1, 0, this.store.state.videoInfo.splice(this.store.i, 1)[0]);
      this.store.state.playerInfo.playerVideo.splice(this.store.i + 1, 0, this.store.state.playerInfo.playerVideo.splice(this.store.i, 1)[0]);
      // Update current index.
      this.store.i += 1;
      // Update concatenation text file.
      this.videoFileConcat();
    }
  }

  videoFileMoveUp(): void {
    // Avoid moving file if it's already at the top.
    if (this.store.i > 0) {
      // Update selected file position in all places.
      this.store.state.fileInfo.splice(this.store.i - 1, 0, this.store.state.fileInfo.splice(this.store.i, 1)[0]);
      this.store.state.videoInfo.splice(this.store.i - 1, 0, this.store.state.videoInfo.splice(this.store.i, 1)[0]);
      this.store.state.playerInfo.playerVideo.splice(this.store.i - 1, 0, this.store.state.playerInfo.playerVideo.splice(this.store.i, 1)[0]);
      // Update current index.
      this.store.i -= 1;
      // Update concatenation text file.
      this.videoFileConcat();
    }
  }

  videoFileRemove(): void {
    // Close entire set of files if only one is currently open.
    if (this.store.state.fileInfo.length == 1) { this.removed.emit(); }
    // Update current index with another file.
    else { const i = this.store.i;
      if (this.store.state.fileInfo.length == this.store.i + 1) {
        this.store.i = this.store.i - 1;
      } // Remove selected file from all places.
      const filterConcat = this.store.state.filterInfo.filterConcat.filter((v: string) => v != this.store.state.fileInfo[i].filePath);
      this.store.state.filterInfo.filterConcat = filterConcat;
      this.store.state.fileInfo.splice(i, 1);
      this.store.state.videoInfo.splice(i, 1);
      this.store.state.playerInfo.playerVideo.splice(i, 1);
      // Update concatenation text file.
      this.videoFileConcat();
    }
  }

  videoClipAdd(s?: number, e?: number): void {
    // Get current and total duration time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const currentTime: number = this.store.state.playerInfo.playerVideo[this.store.i].currentTime * frameRate;
    const duration: number = this.store.state.playerInfo.playerVideo[this.store.i].duration * frameRate;
    // Create and store clip object into file information.
    const fileClip: any = { color: 0, start: s ?? currentTime, end: e ?? duration };
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    this.store.state.fileInfo[this.store.i].fileClips.splice(i + 1, 0, fileClip);
    // Update currently selected clip index.
    this.store.state.fileInfo[this.store.i].fileIndex += 1;
    // Remove split data if there's any.
    if (this.videoClipSplit.length > 0) { this.videoClipSplit.shift(); }
  }

  videoClipChange(i: number, k: number): void {
    this.store.i = i;
    this.store.state.fileInfo[i].fileIndex = k;
  }

  videoClipCreate(e: any): void {
    // Wait for next cycle so Angular doesn't complain about values changing before checking.
    setTimeout(() => {
      const i = this.store.state.fileInfo[this.store.i].fileIndex;
      // Set default position values for the clip element.
      e.style.transform = 'translate3d(0px, 0px, 0px)';
      // Create a resizable instance from the clip element.
      const resizable = new Resizable(e, {
        draggable: { axis: 'x', within: 'parent' }, handles: 'e, w', within: 'parent'
      });
      // Update clip element state on resize event.
      resizable.on('resize', () => { this.$clipOnResize(); });
      // Update clip element state on drag event.
      resizable.draggable.on('drag', () => { this.$clipOnDrag(); });
      // Assign background color to clip element.
      const color: number = this.store.state.fileInfo[this.store.i].fileColor;
      e.style.backgroundColor = this.store.state.colorInfo[color][600];
      // Update clip object information.
      this.store.state.fileInfo[this.store.i].fileClips[i].color = color;
      this.store.state.fileInfo[this.store.i].fileClips[i].e = e;
      // Update color assignment value index.
      this.store.state.fileInfo[this.store.i].fileColor = color == this.store.state.colorInfo.length - 1 ? 0 : color + 1;
      // Update clip elements display dimensions.
      this.videoClipUpdate();
      // Create split clips if there's any.
      if (this.videoClipSplit.length > 0) {
        this.videoClipAdd(this.videoClipSplit[0].start, this.videoClipSplit[0].end);
      }
    })
  }

  $clipOnDrag = this.delay.throttle(() => this.clipOnResize(), 100);
  $clipOnResize = this.delay.throttle(() => this.clipOnResize(), 100);
  clipOnResize(): void {
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    const fileClip: any = this.store.state.fileInfo[this.store.i].fileClips[i];
    // Get clip bar element.
    const playerClip: any = document.getElementById('playerClip');
    // Get total duration time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const duration: number = this.store.state.playerInfo.playerVideo[this.store.i].duration * frameRate;
    // Calculate clip element position and dimensions from the real time values.
    const re = /translate3d\((?<x>.*?)px, (?<y>.*?)px/;
    const res: any = re.exec(fileClip.e.style.transform);
    let start: number = (+res.groups.x) * duration / playerClip.offsetWidth;
    let end: number = ((+res.groups.x) + fileClip.e.getBoundingClientRect().width) * duration / playerClip.offsetWidth;
    // Fix precision problems when end value overflows duration time.
    if (end > duration) { start = duration - start; end = duration; }
    // Update clip object timing values.
    this.store.state.fileInfo[this.store.i].fileClips[i].start = start;
    this.store.state.fileInfo[this.store.i].fileClips[i].end = end;
  }

  videoClipManual: number = 0;
  videoClipManualKeyDown(): void {
    // Avoid processing on input event if a key is pressed.
    this.videoClipManual = 1;
  }

  videoClipManualInput(m: number, v: any, i: number, e: any): void {
    // Process input only if modified from input time panel.
    if (!this.videoClipManual) {
      // Add missing key code from event.
      v.keyCode = 0;
      this.videoClipManualKeyUp(m, v, i, e);
      this.videoClipManual = 0;
    }
  }

  videoClipManualKeyUp(m: number, v: any, i: number, e: any): void {
    this.videoClipManual = 0;
    const fileClip: any = this.store.state.fileInfo[this.store.i].fileClips[i];
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const duration: number = this.store.state.playerInfo.playerVideo[this.store.i].duration * frameRate;
    // Get input time in frames.
    const t = v.target.value.split(':'); let time;
    const input = Math.round(((+t[0]) * 60 * 60 + (+t[1]) * 60 + (+t[2])) * frameRate * 1000) / 1000;
    switch (m) {
      case 0: { // Update clip start time maintaining end time (X axis).
        let timeClip: number = 0;
        // Control wrapping of time when using down arrow.
        if (v.keyCode == 40) {
          timeClip = (input > fileClip.end ? 0 : input) - fileClip.start;
          fileClip.start += timeClip; fileClip.end += timeClip;
        } else {
          if (input - fileClip.start + fileClip.end > duration) {
            timeClip = duration - fileClip.end;
            fileClip.start += timeClip; fileClip.end += timeClip;
          } else {
            timeClip = input - fileClip.start;
            fileClip.start += timeClip; fileClip.end += timeClip; }
        } time = fileClip.start; break;
      }
      case 1: { // Update clip start time.
        // Control wrapping of time when using down arrow.
        if (v.keyCode == 40) {
          if (input > fileClip.end) { fileClip.start = 0; }
          else { fileClip.start = input; }
        } else {
          if (input > fileClip.end) { fileClip.start = fileClip.end; }
          else { fileClip.start = input; }
        } time = fileClip.start; break;
      }
      case 2: { // Update clip end time.
        if (input > duration) { fileClip.end = duration; }
        else if (input < fileClip.start) { fileClip.end = fileClip.start; }
        else { fileClip.end = input; }
        time = fileClip.end; break;
      }
      case 3: { // Update clip start/end time from length.
        if (fileClip.start + input > duration) { fileClip.end = duration; }
        else { fileClip.end = fileClip.start + input; }
        time = fileClip.end - fileClip.start; break;
      }
    } // Update input value with fixed time and update clip dimensions/position.
    v.target.value = new Date(Math.round(time / frameRate * 1000)).toISOString().substring(11, 23);
    this.videoClipUpdate();
    // Update tooltip positioning.
    if (e._tippy.popperInstance) { e._tippy.popperInstance.update(); }
    return time;
  }

  videoClipManualFrame(m: number, v: any, i: number, e: any): void {
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const frameTime: number = Math.round(v.target.value / frameRate * 1000);
    const value = { // Fix input value to be formatted correctly.
      target: { value: new Date(frameTime).toISOString().substring(11, 23) },
      keyCode: 0
    }; // Update time values with corrected input.
    v.target.value = this.videoClipManualKeyUp(m, value, i, e);
  }

  videoClipMoveDown(): void {
    // Avoid moving file if it's already at the bottom.
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    if ((i + 1) < this.store.state.fileInfo[this.store.i].fileClips.length) {
      // Update selected clip position.
      const fileClip = this.store.state.fileInfo[this.store.i].fileClips.splice(i, 1)[0];
      this.store.state.fileInfo[this.store.i].fileClips.splice(i + 1, 0, fileClip);
      // Update current index.
      this.store.state.fileInfo[this.store.i].fileIndex += 1;
    }
  }

  videoClipMoveUp(): void {
    // Avoid moving file if it's already at the top.
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    if (i > 0) {
      // Update selected clip position.
      const fileClip = this.store.state.fileInfo[this.store.i].fileClips.splice(i, 1)[0];
      this.store.state.fileInfo[this.store.i].fileClips.splice(i - 1, 0, fileClip);
      // Update current index.
      this.store.state.fileInfo[this.store.i].fileIndex -= 1;
    }
  }

  videoClipNavigate(e: number, m: number): void {
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    if (m) { // Set the start/end of the selected clip as the current time.
      const currentTime: number = this.store.state.fileInfo[this.store.i].fileClips[i][e ? 'start': 'end'];
      this.store.state.playerInfo.playerVideo[this.store.i].currentTime = currentTime / frameRate;
    } else { // Set the nearest keyframe as the current time.
      const currentTime: number = this.store.state.playerInfo.playerVideo[this.store.i].currentTime;
      const duration: number = this.store.state.playerInfo.playerVideo[this.store.i].duration * frameRate
      const videoKeyFrames: any = [...this.store.state.videoInfo[this.store.i].videoKeyFrames, duration / frameRate];
      for (let k = 0; k < videoKeyFrames.length; k++) { // Previous Keyframe.
        if (e && (videoKeyFrames[k] >= currentTime) && (videoKeyFrames[k] > 0)) {
          this.store.state.playerInfo.playerVideo[this.store.i].currentTime = videoKeyFrames[k - 1]; break; }
        if (!e && (videoKeyFrames[k] > currentTime)) { // Next Keyframe.
          this.store.state.playerInfo.playerVideo[this.store.i].currentTime = videoKeyFrames[k]; break; }
      }
    }
  }

  videoClipRemove(): void {
    // Don't remove if it's the only clip available.
    if (this.store.state.fileInfo[this.store.i].fileClips.length == 1) { return; }
    // Remove clip object from file information.
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    this.store.state.fileInfo[this.store.i].fileClips.splice(i, 1);
    // Fix selected clip index if it's the latest on the list.
    if (i == this.store.state.fileInfo[this.store.i].fileClips.length) {
      this.store.state.fileInfo[this.store.i].fileIndex--;
    }
  }

  videoClipSet(e: number, v?: number): void {
    // Get current time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const currentTime: number = this.store.state.playerInfo.playerVideo[this.store.i].currentTime * frameRate;
    // Create new clip if the selected time is bigger than the end time.
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    if (e && currentTime >= this.store.state.fileInfo[this.store.i].fileClips[i].end) {
      this.videoClipAdd();
    } else { // Update start/end time with the current time.
      this.store.state.fileInfo[this.store.i].fileClips[i][e ? 'start': 'end'] = v ?? currentTime;
      this.videoClipUpdate();
    }
  }

  videoClipSplit: any[] = [];
  $videoClipSplit(e: number): void {
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    const fileClip: any = this.store.state.fileInfo[this.store.i].fileClips[i];
    // Get current time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const currentTime: number = this.store.state.playerInfo.playerVideo[this.store.i].currentTime * frameRate;
    if (e) { // Split selected clip at the current time.
      if (currentTime > fileClip.start && currentTime < fileClip.end) {
        // Set split data to use during the process.
        const end = fileClip.end;
        // Update current clip end time.
        this.videoClipSet(0);
        // Create clip starting from current time.
        this.videoClipAdd(currentTime, end);
      } // Split selected clip in an even amount of clips.
    } else {
      // Calculate length for the clips.
      const length = (fileClip.end - fileClip.start) / this.videoSplit;
      // Update current clip end time.
      this.videoClipSet(0, fileClip.start + length);
      // Create clips of even length and desired amount.
      for (let k = 0; k < this.videoSplit - 1; k++) {
        // Set split data to use during the process.
        const start = fileClip.start + length * (k + 1);
        const end = start + length;
        this.videoClipSplit.push({ start: start, end: end });
      } // Create clip with the given time values.
      this.videoClipAdd(this.videoClipSplit[0].start, this.videoClipSplit[0].end);
    }
  }

  videoClipSnap(e: number, m: number): void {
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    // Get total duration time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const duration: number = this.store.state.playerInfo.playerVideo[this.store.i].duration * frameRate;
    if (m) {
      if (e) {
        let nearest: number = 0;
        for (let [k, clip] of this.store.state.fileInfo[this.store.i].fileClips.entries()) {
          if (k != i && clip.end < this.store.state.fileInfo[this.store.i].fileClips[i].end) {
            if (clip.end > nearest) { nearest = clip.end; }
          } // Update selected clip start time with nearest clip end value.
        } this.store.state.fileInfo[this.store.i].fileClips[i].start = nearest;
      } else {
        let nearest: number = duration;
        for (let [k, clip] of this.store.state.fileInfo[this.store.i].fileClips.entries()) {
          if (k != i && clip.start > this.store.state.fileInfo[this.store.i].fileClips[i].start) {
            if (clip.start < nearest) { nearest = clip.start; }
          } // Update selected clip end time with nearest clip start value.
        } this.store.state.fileInfo[this.store.i].fileClips[i].end = nearest;
      }
    } else {
      let nearest: number = 0;
      let distance: number = duration;
      const videoKeyFrames: any = [...this.store.state.videoInfo[this.store.i].videoKeyFrames, duration / frameRate];
      for (let k = 0; k < videoKeyFrames.length; k++) {
        const keyframe = videoKeyFrames[k] * frameRate;
        const length = Math.abs(this.store.state.fileInfo[this.store.i].fileClips[i][e ? 'start': 'end'] - keyframe);
        if (length < Math.abs(distance)) {
          distance = length; nearest = keyframe;
        } // Update selected clip start/end time with nearest keyframe value.
      } this.store.state.fileInfo[this.store.i].fileClips[i][e ? 'start': 'end'] = nearest;
    } this.videoClipUpdate();
  }

  videoClipUpdate(a?: boolean): void {
    // Get clip bar element.
    const playerClip: any = document.getElementById('playerClip');
    // Get total duration time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const duration: number = this.store.state.playerInfo.playerVideo[this.store.i].duration * frameRate;
    if (a) { // Update clips for all files.
      for (let file of this.store.state.fileInfo) {
        for (let clip of file.fileClips) {
          const start: number = clip.start * playerClip.offsetWidth / duration;
          const end: number = clip.end * playerClip.offsetWidth / duration;
          // Update clip element position and dimensions.
          clip.e.style.transform = `translate3d(${start}px, 0px, 0px)`;
          clip.e.style.width = `${end - start}px`;
        }
      }
    } else { // Update clips for current file.
      for (let clip of this.store.state.fileInfo[this.store.i].fileClips) {
        const start: number = clip.start * playerClip.offsetWidth / duration;
        const end: number = clip.end * playerClip.offsetWidth / duration;
        // Update clip element position and dimensions.
        clip.e.style.transform = `translate3d(${start}px, 0px, 0px)`;
        clip.e.style.width = `${end - start}px`;
      }
    }
  }
}
