import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FiltersService } from 'src/app/services/filters.service';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';
import { UtilsService } from 'src/app/services/utils.service';

// Import formats and codecs list.
import Codecs from 'src/assets/lists/codecs.json'
import Outputs from 'src/assets/lists/outputs.json'
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
    private translate: TranslateService,
    private utils: UtilsService,
    private zone: NgZone
  ) { }

  @Output() loaded = new EventEmitter;

  videoCodec: any = Codecs[0];
  videoCodecs: any = Codecs;
  videoConcat: any = Outputs.concat;
  videoCut: any = Outputs.cut;
  videoEncoder: any = Encoders[0];
  videoFormat: any = Formats[0];
  videoFormats: any = Formats;
  videoPresets: any = Encoding.presets;
  videoRates: any = Encoding.rates;
  videoScaler: any = Scaler;
  videoOutput: any = {
    videoBitrate: null,
    videoCodec: null,
    videoConcat: '',
    videoCut: null,
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
    this.videoFormat = Formats.filter((v: any) => v.extensions.includes(this.store.state.fileInfo[0].fileExtension))[0];
    this.videoFormats = Formats.filter((v: any) => !v.extensions.includes(this.store.state.fileInfo[0].fileExtension));
    this.loaded.emit();
  }

  videoOutputFormat($f: any): void {
    const f: any = Formats.find((f: any) => f.extensions[0] == $f.extensions[0]);
    const s: any = this.store.state.videoInfo[0].videoStreams[1];
    // Update default codec and all codecs list based on format.
    let videoCodec: any = Codecs.filter((v: any) => f.codecs.includes(v.code) && v.code == s.codec_name)[0];
    let videoCodecs: any = Codecs.filter((v: any) => f.codecs.includes(v.code) && v.code != s.codec_name);
    if (!videoCodec) {
      videoCodec = Codecs.filter((v: any) => v.code == f.codecs[0])[0];
      videoCodecs = videoCodecs.filter((v: any) => v.code != videoCodec.code);
    }
    this.videoCodec = videoCodec;
    this.videoCodecs = videoCodecs;
    // Update output path with format extension.
    this.videoSave.videoOutput = this.videoSave.videoOutput.replace(/(\.[\w\d_-]+)$/i, '.' + f.extensions[0]);
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

  videoFilterClear(): void {
    this.filters.filterInfo.filterClear = !this.filters.filterInfo.filterClear;
  }

  videoFilterNoAudio(): void {
    this.filters.filterInfo.filterNoAudio = !this.filters.filterInfo.filterNoAudio;
  }

  videoReencode: boolean = false;
  $videoReencode(): void {
    this.videoSaveFilters();
    this.videoReencode = (this.videoSave.$videoFilters.length > 0) || this.videoOutput.videoEncoder ? true : false;
  }

  videoCommandColor: number = 0;
  videoCommandIndex: number = 0;
  $videoCommandIndex(i: number): void {
    this.videoCommandIndex = i;
  }

  videoCommandAdd(n: string, f: string, t: string): void {
    // Add command to list.
    this.videoSave.videoCommands.push({
      color: this.store.state.colorInfo[this.videoCommandColor][600],
      full: `${this.videoSave.videoCommands.length}: ${f}`, name: n,
      text: (this.store.state.settings.ffmpeg.filesPath + t).replace(/\s\s+/g, ' ')
    }); // Update color assignment value index.
    this.videoCommandColor = this.videoCommandColor == this.store.state.colorInfo.length - 1 ? 0 : this.videoCommandColor + 1;
  }

  videoSave: any = {
    videoAudio: '',
    videoClips: [],
    videoCodec: '',
    videoCommands: [],
    videoConcat: '',
    videoCut: false,
    videoDelete: [],
    videoEditing: false,
    videoEncoding: '',
    videoErrorText: null,
    videoErrorView: false,
    $videoFilters: [],
    videoFilters: '',
    videoInput: '',
    videoMetadata: '',
    videoOutput: '',
    videoSaving: false,
    videoSave: false,
    videoSaved: false,
  };

  $videoSave(c: boolean = false): void {
    // Setup values for the scale filter and video export.
    if (!c) { this.filters.filterInit(); }
    this.filters.filterInfo.filterClear = false;
    this.filters.filterInfo.filterNoAudio = false;
    // Check and update filters state.
    this.videoSaveReset();
    // Check and update cut/clip state.
    this.$videoSaveClip();
    // Open export/save dialog.
    this.videoSave.videoSave = !this.videoSave.videoSave;
  }

  videoSaveAudio(): void {
    // Define removal of audio streams.
    const concat: boolean = (this.store.state.filterInfo.filterConcat.length == 0) || this.videoOutput.videoConcat == 'clips';
    this.videoSave.videoAudio = concat ? this.filters.filterInfo.filterNoAudio ? '-an' : '-c:a copy' : '';
  }

  videoSaveCodec(): void {
    // Define video codec to use, or copy stream if the same as input is used.
    this.videoSave.videoCodec = (this.videoSave.$videoFilters.length > 0) || this.videoReencode ? '-c:v ' + this.videoOutput.videoEncoder : '-c:v copy';
  }

  videoSaveConcat(): void {
    // Define concatenation of multiple files.
    this.videoSave.videoConcat = (this.store.state.fileInfo.length > 1) && this.store.state.filterInfo.filterConcat.length == 0 ? '-f concat -safe 0' : '';
  }

  $videoSaveClip(): void {
    this.videoSave.videoCut = false;
    for (let [i, file] of this.store.state.fileInfo.entries()) {
      // Get file total duration time in frames.
      const frameRate: number = this.store.state.videoInfo[i].videoFrameRate;
      const duration: number = this.store.state.playerInfo.playerVideo[i].duration * frameRate;
      // Check if a clip has been added or modified.
      if ((file.fileClips[0].start != 0 || file.fileClips[0].end != duration)
        || file.fileClips.length > 1) { this.videoSave.videoCut = true; }
    }
  }

  videoSaveClip(): void {
    // Define clips creation for available files.
    this.videoSave.videoClips = [];
    for (let [i, file] of this.store.state.fileInfo.entries()) {
      // Get file total duration time in frames.
      const frameRate: number = this.store.state.videoInfo[i].videoFrameRate;
      const duration: number = this.store.state.playerInfo.playerVideo[i].duration * frameRate;
      // Check if a clip has been added or modified.
      if ((file.fileClips[0].start == 0 && file.fileClips[0].end == duration) && file.fileClips.length == 1) {
        // Continue without processing the file.
        this.videoSave.videoClips.push('');
      } else {
        let concat: string = '';
        for (let k = 0; k < file.fileClips.length; k++) {
          let start: number = file.fileClips[k].start / frameRate;
          let end: number = file.fileClips[k].end / frameRate;
          // Smart cut mode.
          if (this.videoOutput.videoCut == 'smart') {
            let cutpoint: number = 0;
            // Detect the point where to split the clip.
            for (let l = 0; l < this.store.state.videoInfo[i].videoKeyFrames.length; l++) {
              if (this.store.state.videoInfo[i].videoKeyFrames[l] < end &&
                this.store.state.videoInfo[i].videoKeyFrames[l] >= start) {
                cutpoint = (+this.store.state.videoInfo[i].videoKeyFrames[l]); break; }
            } // Create list with the splitted clips.
            let splits: any[] = [];
            splits.push({ start: start, end: start == cutpoint ? end : cutpoint || end, mode: start == cutpoint ? '-c:v copy -c:a copy': '' });
            if (cutpoint && start != cutpoint) { splits.push({ start: cutpoint, end: end, mode: '-c:v copy -c:a copy' }); }
            for (let [l, clip] of splits.entries()) {
              const output: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_tmp_${k}_${l}.` + this.videoOutput.videoFormat.extensions[0]);
              // Add clip creation command to list.
              const command: any = {
                name: this.translate.instant('VIDEO_SAVE.EDIT.SPLIT.NAME', { i: i + 1, k: k + 1, l: l + 1 }),
                full: this.translate.instant('VIDEO_SAVE.EDIT.SPLIT.FULL', { i: `${i + 1}/${this.store.state.fileInfo.length}`, k: `${k + 1}/${file.fileClips.length}`, l: `${l + 1}/${splits.length}` }),
                text: `ffmpeg -v error -y -noautorotate -ss ${clip.start} -to ${clip.end} -i "${file.filePath}" ${clip.mode} "${output}"`
              }; this.videoCommandAdd(command.name, command.full, command.text);
              // Add clip output file to temporal file for concatenation.
              concat += 'file \'' + output + '\'\n';
              // Add clip output file for later deletion.
              this.videoSave.videoDelete.push(output);
            }
          } else { // Single cut mode.
            let mode: string = '';
            // Manage selected clip mode.
            if (this.videoOutput.videoCut == 'lossless') { mode = '-c:v copy -c:a copy'; }
            if (this.videoOutput.videoCut == 'keyframe') { mode = '-c:v copy -c:a copy';
              // Change clip starting point to the nearest previous keyframe.
              const videoKeyFrames: any = [...this.store.state.videoInfo[i].videoKeyFrames, duration / frameRate];
              for (let l = 0; l < videoKeyFrames.length; l++) {
                if (videoKeyFrames[l] > start) { start = videoKeyFrames[l-1]; break; }
              }
            } const output: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_tmp_${k}.` + this.videoOutput.videoFormat.extensions[0]);
            // Add clip creation command to list.
            const command: any = {
              name: this.translate.instant('VIDEO_SAVE.EDIT.CLIP.NAME', { i: i + 1, k: k + 1 }),
              full: this.translate.instant('VIDEO_SAVE.EDIT.CLIP.FULL', { i: `${i + 1}/${this.store.state.fileInfo.length}`, k: `${k + 1}/${file.fileClips.length}` }),
              text: `ffmpeg -v error -y -noautorotate -ss ${start} -to ${end} -i "${file.filePath}" ${mode} "${output}"`
            }; this.videoCommandAdd(command.name, command.full, command.text);
            // Add clip output file to temporal file for concatenation.
            concat += 'file \'' + output + '\'\n';
            // Add clip output file for later deletion.
            this.videoSave.videoDelete.push(output);
          }
        }
        const input: string = file.fileClip;
        const output: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_concat.` + this.videoOutput.videoFormat.extensions[0]);
        // Add clip concatenation command to list.
        const command: any = {
          name: this.translate.instant('VIDEO_SAVE.EDIT.CONCAT.NAME', { i: i + 1 }),
          full: this.translate.instant('VIDEO_SAVE.EDIT.CONCAT.FULL', { i: `${i + 1}/${this.store.state.fileInfo.length}`, k: `${file.fileClips.length}` }),
          text: `ffmpeg -v error -y -noautorotate -f concat -safe 0 -i "${input}" -c:v copy -c:a copy "${output}"`
        }; this.videoCommandAdd(command.name, command.full, command.text);
        // Use clip concat output file instead of the original file.
        this.videoSave.videoClips.push(output);
        // Add clip output file for later deletion.
        this.videoSave.videoDelete.push(output);
        // Create temporal text file for the concatenation process.
        this.ipc.send('write-file', input, concat);
      }
    } // Rebuild concatenation file if available and any clips were made.
    if (this.videoSave.videoCut) {
      let concat: string = '';
      for (let i = 0; i < this.store.state.fileInfo.length; i++) {
        const filePath: string = this.videoSave.videoClips[i] || this.store.state.fileInfo[i].filePath;
        concat += 'file \'' + filePath + '\'\n';
        // Create temporal text file for the concatenation process.
      } this.ipc.send('write-file', this.store.state.fileInfo[0].fileConcatClip, concat);
    }
  }

  videoSaveClips(): void {
    // Process all available files.
    for (let [i, file] of this.store.state.fileInfo.entries()) {
      // Get file total duration time in frames.
      const frameRate: number = this.store.state.videoInfo[i].videoFrameRate;
      const duration: number = this.store.state.playerInfo.playerVideo[i].duration * frameRate;
      // Process all available clips for the selected file.
      for (let k = 0; k < file.fileClips.length; k++) {
        const input: string = file.fileTemp + `clip_${k}.txt`;
        const output: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_clip_${k}.` + this.videoOutput.videoFormat.extensions[0]);
        let start: number = file.fileClips[k].start / frameRate;
        let end: number = file.fileClips[k].end / frameRate;
        // Smart cut mode.
        if (this.videoOutput.videoCut == 'smart') {
          let concat: string = '';
          let cutpoint: number = 0;
          // Detect the point where to split the clip.
          for (let l = 0; l < this.store.state.videoInfo[i].videoKeyFrames.length; l++) {
            if (this.store.state.videoInfo[i].videoKeyFrames[l] < end &&
              this.store.state.videoInfo[i].videoKeyFrames[l] >= start) {
              cutpoint = (+this.store.state.videoInfo[i].videoKeyFrames[l]); break; }
          } // Create list with the splitted clips.
          let splits: any[] = [];
          splits.push({ start: start, end: start == cutpoint ? end : cutpoint || end, mode: start == cutpoint ? '-c:v copy -c:a copy': '' });
          if (cutpoint && start != cutpoint) { splits.push({ start: cutpoint, end: end, mode: '-c:v copy -c:a copy' }); }
          for (let [l, clip] of splits.entries()) {
            const output: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_tmp_${k}_${l}.` + this.videoOutput.videoFormat.extensions[0]);
            // Add clip creation command to list.
            const command: any = {
              name: this.translate.instant('VIDEO_SAVE.EDIT.SPLIT.NAME', { i: i + 1, k: k + 1, l: l + 1 }),
              full: this.translate.instant('VIDEO_SAVE.EDIT.SPLIT.FULL', { i: `${i + 1}/${this.store.state.fileInfo.length}`, k: `${k + 1}/${file.fileClips.length}`, l: `${l + 1}/${splits.length}` }),
              text: `ffmpeg -v error -y -noautorotate -ss ${clip.start} -to ${clip.end} -i "${file.filePath}" ${clip.mode} "${output}"`
            }; this.videoCommandAdd(command.name, command.full, command.text);
            // Add clip output file to temporal file for concatenation.
            concat += 'file \'' + output + '\'\n';
            // Create temporal text file for the concatenation process.
            this.ipc.send('write-file', input, concat);
            // Add clip output file for later deletion.
            this.videoSave.videoDelete.push(output);
          } // Add clip creation command to list.
          const command: any = {
            name: this.translate.instant('VIDEO_SAVE.EDIT.CLIP.NAME', { i: i + 1, k: k + 1 }),
            full: this.translate.instant('VIDEO_SAVE.EDIT.CLIP.FULL', { i: `${i + 1}/${this.store.state.fileInfo.length}`, k: `${k + 1}/${file.fileClips.length}` }),
            text: `ffmpeg -v error -y -noautorotate -f concat -safe 0 -i "${input}" ${this.videoSave.videoCodec} ${this.videoSave.videoEncoding} ${this.videoSave.videoFilters} ${this.videoSave.videoMetadata} ${this.videoSave.videoAudio} "${output}"`
          }; this.videoCommandAdd(command.name, command.full, command.text);
        } else { // Single cut mode.
          if (this.videoOutput.videoCut == 'keyframe') {
            // Change clip starting point to the nearest previous keyframe.
            const videoKeyFrames: any = [...this.store.state.videoInfo[i].videoKeyFrames, duration / frameRate];
            for (let l = 0; l < videoKeyFrames.length; l++) {
              if (videoKeyFrames[l] > start) { start = videoKeyFrames[l-1]; break; }
            }
          } // Add clip creation command to list.
          const command: any = {
            name: this.translate.instant('VIDEO_SAVE.EDIT.CLIP.NAME', { i: i + 1, k: k + 1 }),
            full: this.translate.instant('VIDEO_SAVE.EDIT.CLIP.FULL', { i: `${i + 1}/${this.store.state.fileInfo.length}`, k: `${k + 1}/${file.fileClips.length}` }),
            text: `ffmpeg -v error -y -noautorotate -ss ${start} -to ${end} -i "${file.filePath}" ${this.videoSave.videoCodec} ${this.videoSave.videoEncoding} ${this.videoSave.videoFilters} ${this.videoSave.videoMetadata} ${this.videoSave.videoAudio} "${output}"`
          }; this.videoCommandAdd(command.name, command.full, command.text);
        }
      }
    }
  }

  videoSaveEncoding(): void {
    // Define encoding options for the selected codec.
    const stream: any = this.store.state.videoInfo[0].videoStreams;
    if ((this.videoSave.$videoFilters.length > 0) || this.videoReencode) {
      if (!this.videoEncoder) { this.videoSave.videoEncoding = ''; return; }
      // Get encoding speed and compression ratio preset.
      let preset: any = this.videoEncoder.presets[Object.keys(this.videoEncoder.presets)[0]];
      preset = preset.replaceAll('$level', this.videoOutput.videoPreset);
      // Get control rate quality and calculate bitrate.
      const quality: number = this.videoOutput.videoQuality || this.videoEncoder.quality[0];
      const bitrate: number = this.videoOutput.videoBitrate || Math.round(stream[1].bit_rate / 1000) || Math.round(stream[0].bit_rate / 1000);
      let rate: any = this.videoEncoder.rates[this.videoOutput.videoRate];
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
    // Manage concatenation filter.
    const concat: boolean = (this.store.state.filterInfo.filterConcat.length > 0) && this.videoOutput.videoConcat == 'merge';
    const files: number = this.store.state.fileInfo.length;
    const filters: string = this.videoSave.$videoFilters.length > 0 ? concat ? `;[v]${this.videoSave.$videoFilters.join()}[v]` : `${this.videoSave.$videoFilters.join()}` : '';
    const concatFilter: string = concat ? this.filters.filterInfo.filterNoAudio ? `concat=n=${files}:v=1[v]${filters}` : `concat=n=${files}:v=1:a=1[v][a]${filters}` : filters;
    const concatMap: string = concat ? this.filters.filterInfo.filterNoAudio ? '-map [v]' : '-map [v] -map [a]' : '';
    this.videoSave.videoFilters = concatFilter ? `-lavfi "${concatFilter}" ${concatMap}` : '';
  }

  videoSaveInput(): void {
    // Define input file(s).
    this.videoSave.videoInput = '';
    // Check if concatenation filter should be used.
    if (this.store.state.filterInfo.filterConcat.length > 0) {
      for (let i = 0; i < this.store.state.fileInfo.length; i++) {
        // Check if any clips were made and adjust the input file.
        const filePath = this.videoSave.videoClips[i] || this.store.state.fileInfo[i].filePath;
        this.videoSave.videoInput += `-i "${filePath}" `;
      }
    } else { // Check if any clips were made and adjust the input file.
      const fileConcat = this.videoSave.videoCut ? this.store.state.fileInfo[0].fileConcatClip : this.store.state.fileInfo[0].fileConcat;
      const filePath = this.videoSave.videoClips[0] || this.store.state.fileInfo[0].filePath;
      this.videoSave.videoInput = `-i "${this.store.state.fileInfo.length > 1 ? fileConcat : filePath}"`;
    }
  }

  videoSaveMetadata(): void {
    // Define metadata modifications.
    if (!this.filters.filterInfo.filterClear) { this.videoSave.videoMetadata = ''; return; }
    // Remove general metadata, rotation and encoder tags.
    let metadata: string = '-map_metadata -1 -metadata:s:v rotate="" -fflags +bitexact';
    const stream: any = this.store.state.videoInfo[0].videoStreams[1];
    // Correct aspect ratio if metadata exists, since it can't be removed.
    if (this.utils.findValueInKey(stream, 'aspect_ratio').length > 0) {
      const rotation: number = this.filters.filterInfo.filterRotate;
      metadata += rotation == 90 || rotation == 270
        ? ` -aspect ${stream.height}:${stream.width}`
        : ` -aspect ${stream.width}:${stream.height}`;
    } this.videoSave.videoMetadata = metadata;
  }

  videoSaveOutput(): void {
    // Define output command.
    const command: any = {
      name: this.translate.instant('VIDEO_SAVE.EDIT.FINAL'),
      full: this.translate.instant('VIDEO_SAVE.EDIT.FINAL'),
      text: `ffmpeg -v error -y -noautorotate ${this.videoSave.videoConcat} ${this.videoSave.videoInput} ${this.videoSave.videoCodec} ${this.videoSave.videoEncoding} ${this.videoSave.videoFilters} ${this.videoSave.videoMetadata} ${this.videoSave.videoAudio} "${this.videoSave.videoOutput}"`
    }; this.videoCommandAdd(command.name, command.full, command.text);
  }

  videoSaveDirectory(): void {
    // Select output path for processed video file.
    this.ipc.send('dialog-save', { defaultPath: this.videoSave.videoOutput });
    this.ipc.once('dialog-save', (err: any, r: string) => {
      this.zone.run(() => { if (r) { this.videoSave.videoOutput = r; } });
    });
  }

  videoSaveEdit(): void {
    this.videoCommandColor = 0;
    this.videoCommandIndex = 0;
    if (!this.videoSave.videoEditing) { this.videoSaveBuild(); }
    this.videoSave.videoEditing = !this.videoSave.videoEditing;
  }

  videoSaveReset(): void {
    // Reset scaling values.
    this.videoOutput.videoRatio = -1;
    this.videoOutput.videoScale = 1;
    this.filters.filterInfo.filterHeight = this.store.state.filterInfo.filterHeight;
    this.filters.filterInfo.filterWidth = this.store.state.filterInfo.filterWidth;
    // Define output values.
    this.videoOutput.videoCut = Outputs.cut[0].code;
    this.videoSave.videoOutput = (this.store.state.fileInfo[0].filePath.replace(/(\.[\w\d_-]+)$/i, '_out.' + this.videoOutput.videoFormat.extensions[0]));
    // Reset format and encoding values.
    this.videoFormat = Formats.filter((v: any) => v.extensions.includes(this.store.state.fileInfo[0].fileExtension))[0];
    this.videoFormats = Formats.filter((v: any) => !v.extensions.includes(this.store.state.fileInfo[0].fileExtension));
    this.videoOutput.videoFormat = this.videoFormat;
    this.videoOutputFormat(this.videoFormat);
    this.videoOutput.videoCodec = this.videoCodec;
    this.videoOutputCodec();
    if (this.videoSave.$videoFilters.length == 0) {
      this.videoOutput.videoEncoder = null;
      this.videoReencode = false;
    }
  }

  videoSaveClose(): void {
    this.videoSave.videoErrorText = null;
    this.videoSave.videoErrorView = false;
    this.videoSave.videoSaving = false;
    this.videoSave.videoSave = false;
    this.videoSave.videoSaved = false;
    this.videoSave.videoEditing = false;
  }

  videoSaveBuild(): void {
    // Reset output command.
    this.videoSave.videoCommands = [];
    this.videoSave.videoDelete = [];
    // Build output command.
    switch (this.videoOutput.videoConcat) {
      case 'merge': {
        this.videoSaveClip();
        this.videoSaveConcat();
        this.videoSaveAudio();
        this.videoSaveFilters();
        this.videoSaveMetadata();
        this.videoSaveCodec();
        this.videoSaveEncoding();
        this.videoSaveInput();
        this.videoSaveOutput(); break; }
      case 'clips': {
        this.videoSaveAudio();
        this.videoSaveFilters();
        this.videoSaveMetadata();
        this.videoSaveCodec();
        this.videoSaveEncoding()
        this.videoSaveClips(); break; }
    }
    // Detect and adapt command for 2-pass encoding.
    if (!this.videoSave.videoCut && this.videoSave.videoEncoding.includes('$pass')) {
      const pass1: string = `ffmpeg -v error -y -noautorotate ${this.videoSave.videoConcat} ${this.videoSave.videoInput} ${this.videoSave.videoCodec} ${this.videoSave.videoEncoding.replace('$pass', '1')} ${this.videoSave.videoFilters} -an -f null -`;
      const pass2: string = `ffmpeg ${this.videoSave.videoCommands[0].text.slice(this.store.state.settings.ffmpeg.filesPath.length + 7).replace('$pass', '2')}`;
      this.videoSave.videoCommands = [];
      this.videoCommandColor = 0;
      this.videoCommandAdd(this.translate.instant('VIDEO_SAVE.EDIT.PASS.NAME', { i: '1' }), this.translate.instant('VIDEO_SAVE.EDIT.PASS.FULL', { i: '1' }), pass1);
      this.videoCommandAdd(this.translate.instant('VIDEO_SAVE.EDIT.PASS.NAME', { i: '2' }), this.translate.instant('VIDEO_SAVE.EDIT.PASS.FULL', { i: '2' }), pass2);
    }
  }

  videoSaveRun(): void {
    // Store final export command in the log file.
    const command: string = this.videoSave.videoCommands.map((v: any) => v.text).join(' && ') + '\n';
    if (this.store.state.settings.ffmpeg.saveCommands) {
      this.ipc.send('append-file', `${process.cwd()}/commands.txt`, command);
    } // Execute final export command.
    this.videoSave.videoSaving = true;
    this.ipc.send('exec', command, null);
    this.ipc.once('exec', (err: any, r: string) => {
      this.zone.run(() => {
        // Delete temporal clip/concat files.
        for (let file of this.videoSave.videoDelete) {
          this.ipc.send('unlink', file);
        } // Update dialog related values.
        this.videoSave.videoSaved = true;
        this.videoSave.videoSaving = false;
        if (r) { this.videoSave.videoErrorText = r; }
      });
    });
  }

  videoSaveExport(): void {
    this.videoSaveBuild();
    this.videoSaveRun();
  }
}
