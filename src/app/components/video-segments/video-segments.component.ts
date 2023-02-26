import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'video-segments',
  templateUrl: './video-segments.component.html',
  styleUrls: ['./video-segments.component.css']
})

export class VideoSegmentsComponent {

  constructor(
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
}
