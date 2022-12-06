import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';
import { UtilsService } from 'src/app/services/utils.service';

// Import formats and codecs list.
import Codecs from 'src/assets/lists/codecs.json'
import Encoders from 'src/assets/lists/encoders.json'
import Encoding from 'src/assets/lists/encoding.json'
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
  videoEncoder: any = Encoders[0]
  videoFormat: any = Formats[0];
  videoFormats: any = Formats;
  videoPresets: any = Encoding.presets;
  videoRates: any = Encoding.rates;
  videoScaler: any = Scaler;
  videoOutput: any = {
    videoBitrate: null,
    videoCodec: null,
    videoEncoder: null,
    videoLock: true,
    videoFormat: null,
    videoPreset: null,
    videoQuality: 0,
    videoRate: null,
    videoRatio: 0,
    videoScale: 0,
  };

  ngOnInit(): void {
    // Update default format and all formats list based on file extension.
    this.videoFormat = Formats.filter((v: any) => v.extensions.includes(this.store.state.fileInfo.fileExtension))[0];
    this.videoFormats = Formats.filter((v: any) => !v.extensions.includes(this.store.state.fileInfo.fileExtension));
    this.loaded.emit();
  }

  videoOutputFormat($f: any): void {
    const f: any = Formats.find((f: any) => f.extensions[0] == $f.extensions[0]);
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

  videoOutputEncoder(c: any): void {
    // Set default encoder for the selected codec.
    const e: any = Encoders.find((e: any) => e.codes.includes(c));
    this.videoEncoder = e;
    if (this.videoEncoder) {
      // Update encoding parameters lists.
      this.videoPresets = (<any>Encoding).presets[Object.keys(e.presets)[0]];
      this.videoRates = Encoding.rates.filter((v: any) => e.rates[v.value]);
      // Reset encoding values.
      this.videoOutput.videoQuality = e.quality[0];
      this.videoOutput.videoPreset = (<any>Encoding).presets[Object.keys(e.presets)[0]][0].value;
      this.videoOutput.videoRate = Encoding.rates[0].value;
    } else {
      // Clear encoding lists and values.
      this.videoPresets = [];
      this.videoRates = [];
      this.videoOutput.videoQuality = 0;
      this.videoOutput.videoPreset = null;
      this.videoOutput.videoRate = null;
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    });
  }

  videoScalerLock(): void {
    this.videoOutput.videoLock = !this.videoOutput.videoLock;
  }

  videoScalerHeight(h: any): void {
    this.videoOutput.videoRatio = 0;
    this.videoOutput.videoScale = 0;
    if (this.videoOutput.videoLock) {
      const ar = this.store.state.filterInfo.filterWidth / this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = 2 * Math.round(h * ar / 2);
    }
  }

  videoScalerWidth(w: any): void {
    this.videoOutput.videoRatio = 0;
    this.videoOutput.videoScale = 0;
    if (this.videoOutput.videoLock) {
      const ar = this.store.state.filterInfo.filterWidth / this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterHeight = 2 * Math.round(w / ar / 2);
    }
  }

  videoScalerRatio(ar: any): void {
    this.videoOutput.videoScale = 0;
    if (ar > 0) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = 2 * Math.round(this.store.state.filterInfo.filterHeight * ar / 2);
    } else if (ar < 0) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    }
  }

  videoScalerScale(s: any): void {
    this.videoOutput.videoRatio = 0;
    if (s == 1) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    } else if (s) {
      this.filters.filterInfo.filterHeight = 2 * Math.round(this.store.state.filterInfo.filterHeight * s / 2);
      this.filters.filterInfo.filterWidth = 2 * Math.round(this.store.state.filterInfo.filterWidth * s / 2);
    }
  }

  videoSave: any = {
    videoErrorText: null,
    videoErrorView: false,
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
    // Define video filters to apply.
    let filters: string[] = [];
    if (this.filters.filterInfo.filterFlipH || this.filters.filterInfo.filterFlipV) { filters.push(this.filters.filterFlip()); }
    if (this.filters.filterRotate()) { filters.push(this.filters.filterRotate()); }
    if (this.filters.filterInfo.filterCrop) { filters.push(this.filters.filterCrop()); }
    if (this.filters.filterScaler()) { filters.push(this.filters.filterScaler()); }
    const filter = filters.length > 0 ? `-filter:v "${filters.join()}"` : '';
    // Define video codec to use, or copy stream if the same as input is used.
    const stream = this.store.state.videoInfo.videoStreams[1];
    const codec = (filters.length > 0) || (this.videoOutput.videoCodec.code != stream.codec_name) ? '-c:v ' + this.videoOutput.videoEncoder : '-c:v copy';
    // Define encoding options for the selected codec.
    const encoding = (filters.length > 0) || (this.videoOutput.videoCodec.code != stream.codec_name) ? this.videoSaveEncoding() : '';
    // Define removal of audio streams.
    const audio = this.filters.filterInfo.filterNoAudio ? '-an' : '-c:a copy';
    // Define metadata modifications.
    const metadata = this.videoSaveMetadata();
    // Define paths and commands.
    const input: string = this.store.state.fileInfo.filePath;
    const output: string = input.replace(/(\.[\w\d_-]+)$/i, '_out.' + this.videoOutput.videoFormat.extensions[0]);
    let command: string = `ffmpeg -v error -y -noautorotate -i "${input}" ${codec} ${encoding} ${filter} ${metadata} ${audio} "${output}"`;
    // Detect and adapt command for 2-pass encoding.
    if (encoding.includes('$pass')) {
      const pass1 = `ffmpeg -v error -y -noautorotate -i "${input}" ${codec} ${encoding.replace('$pass', '1')} ${filter} -an -f null -`;
      const pass2 = this.store.state.filePaths.ffmpeg + command.replace('$pass', '2');
      command = `${pass1} && ${pass2}`;
    }
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

  videoSaveEncoding(): string {
    if (!this.videoEncoder) { return ''; }
    // Get encoding speed and compression ratio preset.
    let preset = this.videoEncoder.presets[Object.keys(this.videoEncoder.presets)[0]];
    preset = preset.replaceAll('$level', this.videoOutput.videoPreset);
    // Get control rate quality and calculate bitrate.
    const stream = this.store.state.videoInfo.videoStreams;
    const quality = this.videoOutput.videoQuality || this.videoEncoder.quality[0];
    const bitrate = this.videoOutput.videoBitrate || Math.round(stream[1].bit_rate / 1000) || Math.round(stream[0].bit_rate / 1000);
    let rate = this.videoEncoder.rates[this.videoOutput.videoRate];
    rate = rate.replaceAll('$crf', quality);
    rate = rate.replaceAll('$bit', bitrate);
    return `${preset} ${rate}`;
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