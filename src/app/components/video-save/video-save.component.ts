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

  videoOutputCodec(): void {
    // Fallback to default value when reencoding is not used.
    if (!this.videoOutput.videoCodec.encoders.includes(this.videoOutput.videoEncoder)) {
      this.videoOutput.videoEncoder = null;
    } this.$videoReencode();
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
    } this.$videoReencode();
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
    } this.$videoReencode();
  }

  videoScalerWidth(w: any): void {
    this.videoOutput.videoRatio = 0;
    this.videoOutput.videoScale = 0;
    if (this.videoOutput.videoLock) {
      const ar = this.store.state.filterInfo.filterWidth / this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterHeight = 2 * Math.round(w / ar / 2);
    } this.$videoReencode();
  }

  videoScalerRatio(ar: any): void {
    this.videoOutput.videoScale = 0;
    if (ar > 0) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = 2 * Math.round(this.store.state.filterInfo.filterHeight * ar / 2);
    } else if (ar < 0) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    } this.$videoReencode();
  }

  videoScalerScale(s: any): void {
    this.videoOutput.videoRatio = 0;
    if (s == 1) {
      this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
      this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    } else if (s) {
      this.filters.filterInfo.filterHeight = 2 * Math.round(this.store.state.filterInfo.filterHeight * s / 2);
      this.filters.filterInfo.filterWidth = 2 * Math.round(this.store.state.filterInfo.filterWidth * s / 2);
    } this.$videoReencode();
  }

  videoReencode: boolean = false;
  $videoReencode(): void {
    this.videoSaveFilters();
    this.videoReencode = (this.videoSave.$videoFilters.length > 0) || this.videoOutput.videoEncoder ? true : false;
  }

  videoSave: any = {
    videoAudio: '',
    videoCodec: '',
    videoCommand: '',
    videoEncoding: '',
    videoErrorText: null,
    videoErrorView: false,
    $videoFilters: [],
    videoFilters: '',
    videoMetadata: '',
    videoSaving: false,
    videoSave: false,
    videoSaved: false,
  };

  $videoSave(c: boolean = false): void {
    // Setup values for the scale filter and video export.
    if (!c) { this.filters.filterInit(); }
    // Check and update filters state.
    this.$videoReencode();
    // Open export/save dialog.
    this.videoSave.videoSave = !this.videoSave.videoSave;
  }

  videoSaveAudio(): void {
    // Define removal of audio streams.
    this.videoSave.videoAudio = this.filters.filterInfo.filterNoAudio ? '-an' : '-c:a copy';
  }

  videoSaveCodec(): void {
    // Define video codec to use, or copy stream if the same as input is used.
    this.videoSave.videoCodec = (this.videoSave.$videoFilters.length > 0) || this.videoReencode ? '-c:v ' + this.videoOutput.videoEncoder : '-c:v copy';
  }

  videoSaveEncoding(): void {
    // Define encoding options for the selected codec.
    const stream = this.store.state.videoInfo.videoStreams;
    if ((this.videoSave.$videoFilters.length > 0) || this.videoReencode) {
      if (!this.videoEncoder) { this.videoSave.videoEncoding = ''; return; }
      // Get encoding speed and compression ratio preset.
      let preset = this.videoEncoder.presets[Object.keys(this.videoEncoder.presets)[0]];
      preset = preset.replaceAll('$level', this.videoOutput.videoPreset);
      // Get control rate quality and calculate bitrate.
      const quality = this.videoOutput.videoQuality || this.videoEncoder.quality[0];
      const bitrate = this.videoOutput.videoBitrate || Math.round(stream[1].bit_rate / 1000) || Math.round(stream[0].bit_rate / 1000);
      let rate = this.videoEncoder.rates[this.videoOutput.videoRate];
      rate = rate.replaceAll('$crf', quality);
      rate = rate.replaceAll('$bit', bitrate);
      this.videoSave.videoEncoding = `${preset} ${rate}`;
    } else { this.videoSave.videoEncoding = ''; }
  }

  videoSaveError(): void {
    this.videoSave.videoErrorView = !this.videoSave.videoErrorView;
  }

  videoSaveFilters(): void {
    // Define video filters to apply.
    this.videoSave.$videoFilters = [];
    if (this.filters.filterInfo.filterFlipH || this.filters.filterInfo.filterFlipV) { this.videoSave.$videoFilters.push(this.filters.filterFlip()); }
    if (this.filters.filterRotate()) { this.videoSave.$videoFilters.push(this.filters.filterRotate()); }
    if (this.filters.filterInfo.filterCrop) { this.videoSave.$videoFilters.push(this.filters.filterCrop()); }
    if (this.filters.filterScaler()) { this.videoSave.$videoFilters.push(this.filters.filterScaler()); }
    this.videoSave.videoFilters = this.videoSave.$videoFilters.length > 0 ? `-filter:v "${this.videoSave.$videoFilters.join()}"` : '';
  }

  videoSaveMetadata(): void {
    // Define metadata modifications.
    if (!this.filters.filterInfo.filterClear) { this.videoSave.videoMetadata = ''; return; }
    // Remove general metadata, rotation and encoder tags.
    let metadata = '-map_metadata -1 -metadata:s:v rotate="" -fflags +bitexact';
    const stream = this.store.state.videoInfo.videoStreams[1];
    // Correct aspect ratio if metadata exists, since it can't be removed.
    if (this.utils.findValueInKey(stream, 'aspect_ratio').length > 0) {
      const rotation = this.filters.filterInfo.filterRotate;
      metadata += rotation == 90 || rotation == 270
        ? ` -aspect ${stream.height}:${stream.width}`
        : ` -aspect ${stream.width}:${stream.height}`;
    } this.videoSave.videoMetadata = metadata;
  }

  videoSaveOutput(): void {
    // Define paths and commands.
    const output = this.store.state.fileInfo.filePath.replace(/(\.[\w\d_-]+)$/i, '_out.' + this.videoOutput.videoFormat.extensions[0]);
    this.videoSave.videoCommand = `ffmpeg -v error -y -noautorotate -i "${this.store.state.fileInfo.filePath}" ${this.videoSave.videoCodec} ${this.videoSave.videoEncoding} ${this.videoSave.videoFilters} ${this.videoSave.videoMetadata} ${this.videoSave.videoAudio} "${output}"`;
  }

  videoSaveClose(): void {
    this.videoSave.videoErrorText = null;
    this.videoSave.videoErrorView = false;
    this.videoSave.videoSaving = false;
    this.videoSave.videoSave = false;
    this.videoSave.videoSaved = false;
  }

  async videoSaveFile(): Promise<void> {
    // Build output command.
    this.videoSaveAudio();
    this.videoSaveFilters();
    this.videoSaveMetadata();
    this.videoSaveCodec();
    this.videoSaveEncoding();
    this.videoSaveOutput();
    // Detect and adapt command for 2-pass encoding.
    if (this.videoSave.videoEncoding.includes('$pass')) {
      const pass1 = `ffmpeg -v error -y -noautorotate -i "${this.store.state.fileInfo.filePath}" ${this.videoSave.videoCodec} ${this.videoSave.videoEncoding.replace('$pass', '1')} ${this.videoSave.videoFilters} -an -f null -`;
      const pass2 = this.store.state.filePaths.ffmpeg + this.videoSave.videoCommand.replace('$pass', '2');
      this.videoSave.videoCommand = `${pass1} && ${pass2}`;
    }
    // Execute command and listen for a response.
    this.videoSave.videoSaving = true;
    this.ipc.send('exec', this.store.state.filePaths.ffmpeg + this.videoSave.videoCommand, null);
    this.ipc.once('exec', (e: any, r: string) => {
      this.zone.run(() => {
        this.videoSave.videoSaved = true;
        this.videoSave.videoSaving = false;
        if (r) { this.videoSave.videoErrorText = r; }
      });
    });
  }
}