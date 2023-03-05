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

  videoClipAdd(): void {
    // Get current and total duration time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const currentTime: number = this.store.state.playerInfo.playerVideo[this.store.i].currentTime * frameRate;
    const duration: number = this.store.state.playerInfo.playerVideo[this.store.i].duration * frameRate;
    // Create and store clip object into file information.
    const fileClip: any = { color: 0, start: currentTime, end: duration };
    this.store.state.fileInfo[this.store.i].fileClips.push(fileClip);
    // Update currently selected clip index.
    const i = this.store.state.fileInfo[this.store.i].fileClips.length - 1;
    this.store.state.fileInfo[this.store.i].fileIndex = i;
  }

  videoClipChange(i: number, k: number): void {
    this.store.i = i;
    this.store.state.fileInfo[i].fileIndex = k;
  }

  videoClipCreate(e: any): void {
    // Wait for next cycle so Angular doesn't complain about values changing before checking.
    setTimeout(() => {
      const i = this.store.state.fileInfo[this.store.i].fileClips.length - 1;
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
      // Update clip elements display dimentions.
      this.videoClipUpdate();
    })
  }

  $clipOnDrag = this.delay.throttle(() => this.clipOnResize('drag'), 100);
  $clipOnResize = this.delay.throttle(() => this.clipOnResize('resize'), 100);
  clipOnResize(e: string): void {
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
    let start = res.groups.x * duration / playerClip.offsetWidth; let end;
    if (e == 'drag') { end = start + fileClip.end - fileClip.start; }
    if (e == 'resize') { end = (parseInt(res.groups.x) + fileClip.e.offsetWidth) * duration / playerClip.offsetWidth; }
    // Update clip object timing values.
    this.store.state.fileInfo[this.store.i].fileClips[i].start = start;
    this.store.state.fileInfo[this.store.i].fileClips[i].end = end;
  }

  videoClipNavigate(e: number): void {
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    // Set the start/end of the selected clip as the current time.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const currentTime: number = this.store.state.fileInfo[this.store.i].fileClips[i][e ? 'start': 'end'];
    this.store.state.playerInfo.playerVideo[this.store.i].currentTime = currentTime / frameRate;
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

  videoClipSet(e: number): void {
    // Get current time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const currentTime: number = this.store.state.playerInfo.playerVideo[this.store.i].currentTime * frameRate;
    // Create new clip if the selected time is bigger than the end time.
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    if (e && currentTime > this.store.state.fileInfo[this.store.i].fileClips[i].end) {
      this.videoClipAdd();
    } else { // Update start/end time with the current time.
      this.store.state.fileInfo[this.store.i].fileClips[i][e ? 'start': 'end'] = currentTime;
      this.videoClipUpdate();
    }
  }

  videoClipSnap(e: number): void {
    const i = this.store.state.fileInfo[this.store.i].fileIndex;
    // Get total duration time in frames.
    const frameRate: number = this.store.state.videoInfo[this.store.i].videoFrameRate;
    const duration: number = this.store.state.playerInfo.playerVideo[this.store.i].duration * frameRate;
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
