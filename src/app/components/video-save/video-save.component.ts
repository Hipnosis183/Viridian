import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';
import { UtilsService } from 'src/app/services/utils.service';

// Import formats and codecs list.
import Codecs from 'src/assets/lists/codecs.json'
import Formats from 'src/assets/lists/formats.json'
import Scaler from 'src/assets/lists/scaler.json'

@Component({
  selector: 'video-save',
  templateUrl: './video-save.component.html',
  styleUrls: ['./video-save.component.css']
})

export class VideoSaveComponent {

  constructor(
    public filters: FiltersService,
    private ipc: IpcService,
    public store: StoreService,
    public utils: UtilsService,
    private zone: NgZone
  ) { }

  @Output() loaded = new EventEmitter;

  videoCodec: any = Codecs[0];
  videoCodecs: any = Codecs;
  videoFormat: any = Formats[0];
  videoFormats: any = Formats;
  videoOutput: any = {
    videoCodec: null,
    videoEncoder: null,
    videoFormat: null,
  };

  ngOnInit(): void {
    // Update default format and all formats list based on file extension.
    this.videoFormat = Formats.filter((v: any) => v.extensions.includes(this.store.state.fileInfo.fileExtension))[0];
    this.videoFormats = Formats.filter((v: any) => !v.extensions.includes(this.store.state.fileInfo.fileExtension));
    this.loaded.emit();
  }

  videoOutputFormat(format: any): void {
    const f: any = Formats.find((f: any) => f.extensions[0] == format.extensions[0]);
    const s: any = this.store.state.videoInfo.videoStreams[1];
    // Update default codec and all codecs list based on format.
    let videoCodec = Codecs.filter((v: any) => f.codecs.includes(v.code) && v.code == s.codec_name)[0];
    let videoCodecs = Codecs.filter((v: any) => f.codecs.includes(v.code) && v.code != s.codec_name);
    if (!videoCodec) {
      videoCodec = Codecs.filter((v: any) => v.code == f.codecs[0])[0];
      videoCodecs = videoCodecs.filter((v: any) => v.code != videoCodec.code);
    }
    this.videoCodec = videoCodec;
    this.videoCodecs = videoCodecs;
  }

  $videoScaler: any = Scaler;
  videoScaler: any = {
    videoLock: true,
    videoRatio: 0,
    videoScale: 0,
  };

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    });
  }

  videoScalerLock(): void {
    this.videoScaler.videoLock = !this.videoScaler.videoLock;
  }

  videoScalerHeight(h: any): void {
    this.videoScaler.videoRatio = 0;
    this.videoScaler.videoScale = 0;
    if (this.videoScaler.videoLock) {
      const ar = this.store.state.filterInfo.filterWidth / this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = 2 * Math.round(h * ar / 2);
    }
  }

  videoScalerWidth(w: any): void {
    this.videoScaler.videoRatio = 0;
    this.videoScaler.videoScale = 0;
    if (this.videoScaler.videoLock) {
      const ar = this.store.state.filterInfo.filterWidth / this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterHeight = 2 * Math.round(w / ar / 2);
    }
  }

  videoScalerRatio(ar: any): void {
    this.videoScaler.videoScale = 0;
    if (ar > 0) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = 2 * Math.round(this.store.state.filterInfo.filterHeight * ar / 2);
    } else if (ar < 0) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    }
  }

  videoScalerScale(s: any): void {
    this.videoScaler.videoRatio = 0;
    if (s == 1) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    } else if (s) {
      this.filters.filterInfo.filterHeight = 2 * Math.round(this.store.state.filterInfo.filterHeight * s / 2);
      this.filters.filterInfo.filterWidth = 2 * Math.round(this.store.state.filterInfo.filterWidth * s / 2);
    }
  }

  videoSave: any = {
    videoCodec: null,
    videoEncoder: null,
    videoErrorText: null,
    videoErrorView: false,
    videoFormat: null,
    videoSaving: false,
    videoSave: false,
    videoSaved: false,
  };

  $videoSave(c: boolean = false): void {
    // Setup values for the scale filter and video export.
    if (!c) { this.filters.filterInit(); }
    // Open export/save dialog.
    this.videoSave.videoSave = !this.videoSave.videoSave;
  }

  videoSaveDone(): void {
    this.videoSave = {
      videoErrorText: null,
      videoErrorView: false,
      videoSaving: false,
      videoSave: false,
      videoSaved: false,
    };
  }

  videoSaveError(): void {
    this.videoSave.videoErrorView = !this.videoSave.videoErrorView;
  }

  async videoSaveFile(): Promise<void> {
    // Define video codec to use, or copy stream if the same as input is used.
    const codec = this.videoOutput.videoCodec.code != this.store.state.videoInfo.videoStreams[1].codec_name ? '-c:v ' + this.videoOutput.videoCodec.code : '';
    // Define video filters to apply.
    let filters: string[] = [];
    if (this.filters.filterInfo.filterFlipH || this.filters.filterInfo.filterFlipV) { filters.push(this.filters.filterFlip()); }
    if (this.filters.filterRotate()) { filters.push(this.filters.filterRotate()); }
    if (this.filters.filterInfo.filterCrop) { filters.push(this.filters.filterCrop()); }
    if (this.filters.filterScaler()) { filters.push(this.filters.filterScaler()); }
    const filter = filters.length > 0 ? '-filter:v' : codec.length > 0 ? '' : '-c:v copy';
    // Define removal of audio streams.
    const audio = this.filters.filterInfo.filterNoAudio ? '-an' : '-c:a copy';
    // Define metadata modifications.
    const metadata = this.videoSaveMetadata();
    // Define paths and commands.
    const input: string = this.store.state.fileInfo.filePath;
    const output: string = input.replace(/(\.[\w\d_-]+)$/i, '_out.' + this.videoOutput.videoFormat.extensions[0]);
    const command: string = `ffmpeg -v error -y -noautorotate -i "${input}" ${codec} ${filter} ${filters.length > 0 ? `"${filters.join()}"` : ''} ${metadata} ${audio} "${output}"`;
    // Execute command and listen for a response.
    this.videoSave.videoSaving = true;
    this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
    this.ipc.once('exec', (e: any, r: string) => {
      this.zone.run(() => {
        this.videoSave.videoSaved = true;
        this.videoSave.videoSaving = false;
        if (r) { this.videoSave.videoErrorText = r; }
      });
    });
  }

  videoSaveMetadata(): string {
    if (!this.filters.filterInfo.filterClear) { return ''; }
    // Remove general metadata, rotation and encoder tags.
    let metadata = '-map_metadata -1 -metadata:s:v rotate="" -fflags +bitexact';
    const stream = this.store.state.videoInfo.videoStreams[1];
    // Correct aspect ratio if metadata exists, since it can't be removed.
    if (this.utils.findValueInKey(stream, 'aspect_ratio').length > 0) {
      const rotation = this.filters.filterInfo.filterRotate;
      metadata += rotation == 90 || rotation == 270
        ? ` -aspect ${stream.height}:${stream.width}`
        : ` -aspect ${stream.width}:${stream.height}`;
    } return metadata;
  }
}