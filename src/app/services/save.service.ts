// Import Angular elements.
import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// Import components, services, directives, pipes, types and interfaces.
import { VideoContainer, VideoStream } from '@app/models/ffmpeg';
import { Codec, Encoder, EncodingPreset, EncodingRate, Format, OutputConcat, OutputCut, Scaling } from '@app/models/listas';
import { SaveCommand, SaveCut, SaveConcat, SaveInfo, SaveSettings, SaveSplit, SaveState } from '@app/models/save';
import { FiltersService, IpcService, SettingsService, StoreService, UtilsService } from '@app/services';

// Import formats and codecs list.
import { Codecs, Encoders, Encoding, Formats, Outputs, Scaler } from 'src/assets/lists';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  constructor(
    // Initialize Angular elements.
    private translate: TranslateService,
  ) {};

  // Inject app services.
  private filters = inject(FiltersService);
  private ipc = inject(IpcService);
  private settings = inject(SettingsService);
  private store = inject(StoreService);
  private utils = inject(UtilsService);

  // Define video save state.
  public saveCodecs = signal<Codec[]>(Codecs);
  private saveCommandColor: number = 0;
  public saveCommandIndex = signal<number>(0);
  public saveCompatible = computed(() => this.store.storeCodecs.includes(this.store.storeVideos()[0].videoStreams[1].codec_name));
  public saveConcat = signal<OutputConcat[]>(Outputs.concat);
  public saveCut = signal<OutputCut[]>(Outputs.cut);
  public saveEditing = signal<boolean>(false);
  public saveEncoder = signal<Encoder | null>(Encoders[0]);
  public saveErrorText = signal<string>('');
  public saveErrorOpen = signal<boolean>(false);
  public saveFormats = signal<Format[]>(Formats);
  public saveOpen = signal<boolean>(false);
  public savePresets = signal<EncodingPreset[]>([]);
  public saveRates = signal<EncodingRate[]>([]);
  public saveReencode = signal<boolean>(false);
  public saveScaler: Scaling = Scaler;
  public saveState = signal<SaveState>(null);
  public saveSettings: SaveSettings = {
    saveBitrate: signal<string>(''),
    saveCodec: signal<Codec | null>(null),
    saveConcat: signal<SaveConcat>('merge'),
    saveCut: signal<SaveCut>('smart'),
    saveEncoder: signal<string | null>(null),
    saveExtension: computed(() => this.saveSettings.saveFormat()?.extensions[0] ?? this.store.storeFiles()[0].fileExtension),
    saveLock: signal<boolean>(true),
    saveFormat: signal<Format | null>(null),
    savePreset: signal<string>(''),
    saveQuality: signal<number>(0),
    saveRate: signal<string>(''),
    saveRatio: signal<number>(0),
    saveScale: signal<number>(0),
  };
  public saveInfo: SaveInfo = {
    saveAudio: '',
    saveClips: [],
    saveCodec: '',
    saveCommands: signal<SaveCommand[]>([]),
    saveConcat: '',
    saveCut: signal<boolean>(false),
    saveDelete: [],
    saveEncoding: '',
    saveFilters: '',
    saveFilters$: signal<string[]>([]),
    saveInput: '',
    saveMetadata: '',
    saveOutput: signal<string>(''),
  };

  // Update save state after file loading.
  public saveLoaded(): void {
    // Update default formats list based on file extension.
    const saveExtension: string = Formats.find((v) => v.extensions.includes(this.store.storeFiles()[0].fileExtension)) ? this.saveCompatible() ? this.store.storeFiles()[0].fileExtension : 'mp4' : 'mp4';
    const saveFormat: Format = Formats.filter((v) => v.extensions.includes(saveExtension))[0];
    const saveFormats: Format[] = Formats.filter((v) => !v.extensions.includes(saveExtension));
    saveFormats.unshift(saveFormat);
    this.saveFormats.set(saveFormats);
  };

  // Update save settings format state.
  public saveUpdateFormat(saveFormat: Format | null): void {
    const videoStream: VideoStream = this.store.storeVideos()[0].videoStreams[1];
    // Update default codec and all codecs list based on format.
    if (saveFormat) {
      const videoCodec: string = this.saveCompatible() ? videoStream.codec_name : 'h264';
      let saveCodec: Codec = Codecs.filter((v) => saveFormat.codecs.includes(v.code) && v.code == videoCodec)[0];
      let saveCodecs: Codec[] = Codecs.filter((v) => saveFormat.codecs.includes(v.code) && v.code != videoCodec);
      if (!saveCodec) {
        saveCodec = Codecs.filter((v) => v.code == saveFormat.codecs[0])[0];
        saveCodecs = saveCodecs.filter((v) => v.code != saveCodec.code);
      }
      saveCodecs.unshift(saveCodec);
      this.saveCodecs.set(saveCodecs);
      this.saveSettings.saveCodec.set(saveCodec);
      this.saveSettings.saveEncoder.set(saveCodec.encoders[0]);
    } else {
      this.saveCodecs.set(Codecs);
      this.saveSettings.saveCodec.set(null);
      this.saveSettings.saveEncoder.set(null);
    }
    // Update output path file extension.
    this.saveInfo.saveOutput.update((v) => v.replace(/(\.[\w\d_-]+)$/i, '.' + this.saveSettings.saveExtension()));
    // Update save reencoding state.
    this.saveUpdateReencode();
  };

  // Update save settings codec state.
  public saveUpdateCodec(): void {
    // Fallback to default value when not reencoding.
    if (!this.saveSettings.saveCodec() || !this.saveSettings.saveCodec()!.encoders.includes(this.saveSettings.saveEncoder()!)) {
      this.saveSettings.saveEncoder.set(null);
    }
    // Update save reencoding state.
    this.saveUpdateReencode();
  };

  // Update save settings encoder state.
  public saveUpdateEncoder(encoderCode: string | null): void {
    // Set default encoder for the selected codec.
    const saveEncoder: Encoder | null = Encoders.find((v) => v.codes.includes(encoderCode || '')) ?? null;
    this.saveEncoder.set(saveEncoder);
    if (saveEncoder) {
      // Update encoding parameters lists.
      this.savePresets.set((Encoding as any).presets[Object.keys(saveEncoder.presets)[0]]);
      this.saveRates.set(Encoding.rates.filter((v) => saveEncoder.rates[v.value]));
      // Reset encoding values.
      this.saveSettings.saveQuality.set(saveEncoder.quality[0]);
      this.saveSettings.savePreset.set((Encoding as any).presets[Object.keys(saveEncoder.presets)[0]][0].value);
      this.saveSettings.saveRate.set(Encoding.rates[0].value);
    } else {
      // Clear encoding lists and values.
      this.savePresets.set([]);
      this.saveRates.set([]);
      this.saveSettings.saveQuality.set(0);
      this.saveSettings.savePreset.set('');
      this.saveSettings.saveRate.set('');
    }
    // Update save reencoding state.
    this.saveUpdateReencode();
  };

  // Update save settings dimensions lock state.
  public saveUpdateLock(): void {
    this.saveSettings.saveLock.update((v) => !v);
  };

  // Update save settings dimensions state by height.
  public saveUpdateHeight(saveHeight: string): void {
    // Reset selected aspect ratio and scale values.
    this.saveSettings.saveRatio.set(0);
    this.saveSettings.saveScale.set(0);
    // Update output width if aspect ratio is locked.
    if (this.saveSettings.saveLock()) {
      const aspectRatio: number = this.filters.filterCropW() / this.filters.filterCropH();
      this.filters.filterWidth.set(2 * Math.round(+saveHeight * aspectRatio / 2));
    }
    // Update save reencoding state.
    this.saveUpdateReencode();
  };

  // Update save settings dimensions state by width.
  public saveUpdateWidth(saveWidth: string): void {
    // Reset selected aspect ratio and scale values.
    this.saveSettings.saveRatio.set(0);
    this.saveSettings.saveScale.set(0);
    // Update output height if aspect ratio is locked.
    if (this.saveSettings.saveLock()) {
      const aspectRatio: number = this.filters.filterCropW() / this.filters.filterCropH();
      this.filters.filterHeight.set(2 * Math.round(+saveWidth / aspectRatio / 2));
    }
    // Update save reencoding state.
    this.saveUpdateReencode();
  };

  // Update save settings dimensions state by aspect ratio.
  public saveUpdateRatio(aspectRatio: string): void {
    // Reset selected scale value.
    this.saveSettings.saveScale.set(0);
    if (+aspectRatio > 0) {
      // Update width value from current height and selected aspect ratio.
      this.filters.filterHeight.set(this.filters.filterCropH());
      this.filters.filterWidth.set(2 * Math.round(this.filters.filterCropH() * +aspectRatio / 2));
    } else if (+aspectRatio < 0) {
      // Reset to default width and height values.
      this.filters.filterHeight.set(this.filters.filterCropH());
      this.filters.filterWidth.set(this.filters.filterCropW());
    }
    // Update save reencoding state.
    this.saveUpdateReencode();
  };

  // Update save settings dimensions state by scale multiplier.
  public saveUpdateScale(saveScale: string): void {
    // Reset selected scale value.
    this.saveSettings.saveRatio.set(0);
    if (+saveScale == 1) {
      // Reset to default width and height values.
      this.filters.filterHeight.set(this.filters.filterCropH());
      this.filters.filterWidth.set(this.filters.filterCropW());
    } else if (saveScale) {
      // Multiply current width and height values by the selected scale multiplier.
      this.filters.filterHeight.set(2 * Math.round(this.filters.filterCropH() * +saveScale / 2));
      this.filters.filterWidth.set(2 * Math.round(this.filters.filterCropW() * +saveScale / 2));
    }
    // Update save reencoding state.
    this.saveUpdateReencode();
  };

  // Update save settings output path state.
  public async saveUpdateOutput(): Promise<void> {
    // Select output path for processed video file.
    const filesOptions = { defaultPath: this.saveInfo.saveOutput() };
    const filesPath: string | undefined = await this.ipc.invoke('dialog-save', filesOptions);
    if (filesPath) { this.saveInfo.saveOutput.set(filesPath); }
  };

  // Update save reencoding state.
  private saveUpdateReencode(): void {
    this.saveInfoFilters();
    this.saveReencode.set(this.saveInfo.saveFilters$().length || this.saveSettings.saveEncoder() ? true : false);
  };

  // Update save open state.
  public saveUpdateOpen(): void {
    // Initialize values for the scale filter and video export.
    if (!this.saveOpen()) { this.filters.filtersInit(); }
    // Reset filter output values.
    this.filters.filterClear.set(false);
    this.filters.filterNoAudio.set(false);
    // Check and update filters state.
    this.saveReset();
    // Check and update cut/clip state.
    this.saveInfoCut();
    // Toggle save/export dialog.
    this.saveOpen.update((v) => !v);
  };

  // Update save manual edit dialog open state.
  public async saveUpdateEdit(): Promise<void> {
    // Reset selected command.
    this.saveCommandColor = 0;
    this.saveCommandIndex.set(0);
    // Build save commands.
    if (!this.saveEditing()) { await this.saveBuild(); }
    // Update save editing state.
    this.saveEditing.update((v) => !v);
  };

  // Close save/export dialog.
  public saveClose(): void {
    // Reset save state values.
    this.saveErrorText.set('');
    this.saveErrorOpen.set(false);
    this.saveOpen.set(false);
    this.saveState.set(null);
    this.saveEditing.set(false);
  };

  // Reset save state.
  public saveReset(): void {
    // Reset scaling values.
    this.saveSettings.saveRatio.set(-1);
    this.saveSettings.saveScale.set(1);
    this.filters.filterHeight.set(this.filters.filterCropH());
    this.filters.filterWidth.set(this.filters.filterCropW());
    // Define output values.
    this.saveSettings.saveCut.set(Outputs.cut[0].code as SaveCut);
    this.saveInfo.saveOutput.set((this.store.storeFiles()[0].filePath.replace(/(\.[\w\d_-]+)$/i, '_out.' + this.saveSettings.saveExtension())));
    // Reset format and encoding values.
    this.saveLoaded();
    if (this.saveCompatible() || this.saveInfo.saveFilters$().length) {
      this.saveSettings.saveFormat.set(this.saveFormats()[0]);
      this.saveUpdateFormat(this.saveFormats()[0]);
      this.saveSettings.saveCodec.set(this.saveCodecs()[0]);
    } else {
      this.saveSettings.saveFormat.set(null);
      this.saveUpdateFormat(null);
      this.saveSettings.saveCodec.set(null);
    }
    this.saveUpdateCodec();
    if (this.saveInfo.saveFilters$().length == 0) {
      this.saveSettings.saveEncoder.set(null);
    }
    this.saveUpdateEncoder(this.saveSettings.saveEncoder());
  };

  // Export video to output file.
  public async saveExport(): Promise<void> {
    // Build save output commands.
    await this.saveBuild();
    // Start video saving/exporting process.
    await this.saveRun();
  };

  // Export video to output file (manual mode).
  public async saveExportManual(): Promise<void> {
    // Start video saving/exporting process.
    await this.saveRun();
  };

  // Open export output path in files browser.
  public saveExportOpen(): void {
    // Open window on output path.
    const openCommand: SaveCommand = this.saveInfo.saveCommands()[this.saveInfo.saveCommands().length - 1];
    this.ipc.invoke('dir-open', openCommand.text().match(/(?<=")[^"]*(?="[^"]*$)(?="$)/g)![0]);
    // Close saving dialog.
    this.saveClose();
  };

  // Update save error dialog open state.
  public saveUpdateError(): void {
    this.saveErrorOpen.update((v) => !v);
  };

  // Cancel saving process.
  public async saveCancel(): Promise<void> {
    // Update save saving state.
    this.saveState.set('canceling');
    // Kill currently executing process.
    await this.ipc.invoke('process-kill');
    // Close saving dialog.
    this.saveClose();
  };

  // Add new save output command.
  private saveCommandAdd(commandName: string, commandFull: string, commandText: string): void {
    // Add command to list.
    this.saveInfo.saveCommands.update((v) => [...v, {
      color: this.store.storeColors[this.saveCommandColor][0],
      full: `${this.saveInfo.saveCommands().length}: ${commandFull}`,
      name: commandName,
      text: signal<string>((this.settings.options.ffmpeg.filesPath() + commandText).replace(/\s\s+/g, ' ')),
    }]);
    // Update color assignment index value.
    this.saveCommandColor = this.saveCommandColor == this.store.storeColors.length - 1 ? 0 : this.saveCommandColor + 1;
  };

  // Update currently selected output command.
  public saveCommandSelect(commandIndex: number): void {
    this.saveCommandIndex.set(commandIndex);
  };

  // Build save output commands.
  private async saveBuild(): Promise<void> {
    // Reset output command.
    this.saveInfo.saveCommands.set([]);
    this.saveInfo.saveDelete = [];
    // Build output command.
    switch (this.saveSettings.saveConcat()) {
      case 'merge': {
        await this.saveInfoClipsMerge();
        this.saveInfoConcat();
        this.saveInfoAudio();
        this.saveInfoFilters();
        this.saveInfoMetadata();
        this.saveInfoCodec();
        this.saveInfoEncoding();
        this.saveInfoInput();
        this.saveInfoOutput(); break;
      }
      case 'clips': {
        this.saveInfoAudio();
        this.saveInfoFilters();
        this.saveInfoMetadata();
        this.saveInfoCodec();
        this.saveInfoEncoding()
        await this.saveInfoClips(); break;
      }
    }
    // Detect and adapt command for 2-pass encoding.
    if (!this.saveInfo.saveCut() && this.saveInfo.saveEncoding.includes('$pass')) {
      const encodingPass1: string = `ffmpeg -v error -y -noautorotate ${this.saveInfo.saveConcat} ${this.saveInfo.saveInput} ${this.saveInfo.saveCodec} ${this.saveInfo.saveEncoding.replace('$pass', '1')} ${this.saveInfo.saveFilters} -an -f null -`;
      const encodingPass2: string = `ffmpeg ${this.saveInfo.saveCommands()[0].text().slice(this.settings.options.ffmpeg.filesPath().length + 7).replace('$pass', '2')}`;
      // Reset command values.
      this.saveInfo.saveCommands.set([]);
      this.saveCommandColor = 0;
      // Add pass commands to list.
      this.saveCommandAdd(this.translate.instant('VIDEO_SAVE.EDIT.PASS.NAME', { i: '1' }), this.translate.instant('VIDEO_SAVE.EDIT.PASS.FULL', { i: '1' }), encodingPass1);
      this.saveCommandAdd(this.translate.instant('VIDEO_SAVE.EDIT.PASS.NAME', { i: '2' }), this.translate.instant('VIDEO_SAVE.EDIT.PASS.FULL', { i: '2' }), encodingPass2);
    }
  };

  // Start video saving/exporting process.
  private async saveRun(): Promise<void> {
    // Store final export command in the log file.
    const saveCommand: string = this.saveInfo.saveCommands().map((v) => v.text()).join(' && ') + '\n';
    if (this.settings.options.ffmpeg.commandsSave()) {
      await this.ipc.invoke('file-append', `${process.cwd()}/commands.txt`, saveCommand);
    }
    // Update save saving state.
    this.saveState.set('saving');
    // Execute final export command and handle errors.
    const saveError: string = await this.ipc.invoke('process-spawn', saveCommand, null);
    if (saveError) { this.saveErrorText.set(saveError); }
    // Delete temporal clip/concat files.
    for (let file of this.saveInfo.saveDelete) {
      this.ipc.invoke('file-delete', file);
    }
    // Manage process termination.
    if (this.saveState() == 'canceling') {
      // Delete remaining output files.
      for (let command of this.saveInfo.saveCommands()) {
        if (command.text().match(/(?<=")[^"]*(?="[^"]*$)(?="$)/g)) {
          this.ipc.invoke('file-delete', command.text().match(/(?<=")[^"]*(?="[^"]*$)(?="$)/g)![0]);
        }
      }
      // Close saving dialog.
      this.saveClose(); return;
    }
    // Update save saving state.
    this.saveState.set('saved');
  };

  // Manage audio output.
  private saveInfoAudio(): void {
    // Define removal of audio streams.
    const filterConcat: boolean = (this.filters.filterConcat().length == 0) || this.saveSettings.saveConcat() == 'clips';
    this.saveInfo.saveAudio = filterConcat ? this.filters.filterNoAudio() ? '-an' : '-c:a copy' : '';
  };

  // Manage clips creation for available files (clips concatenation mode).
  private async saveInfoClips(): Promise<void> {
    // Process all available files.
    for (let [i, file] of this.store.storeFiles().entries()) {
      // Get file total duration time in frames.
      const frameRate: number = this.store.storeVideos()[i].videoFrameRate;
      const totalDuration: number = this.store.storePlayer.playerVideo()[i].duration * frameRate;
      // Process all available clips for the selected file.
      for (let k = 0; k < file.fileClips().length; k++) {
        let clipStart: number = file.fileClips()[k].clipStart() / frameRate;
        const clipEnd: number = file.fileClips()[k].clipEnd() / frameRate;
        const clipInput: string = file.fileTemp + `clip_${k}.txt`;
        const clipOutput: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_clip_${k}.` + this.saveSettings.saveExtension());
        // Smart cut mode.
        if (this.saveSettings.saveCut() == 'smart') {
          let clipConcat: string = '', clipCutpoint: number = 0, clipSplits: SaveSplit[] = [];
          // Detect the point where to split the clip.
          for (let l = 0; l < this.store.storeVideos()[i].videoKeyframes.length; l++) {
            if (this.store.storeVideos()[i].videoKeyframes[l] < clipEnd &&
              this.store.storeVideos()[i].videoKeyframes[l] >= clipStart) {
              clipCutpoint = (+this.store.storeVideos()[i].videoKeyframes[l]); break;
            }
          }
          // Create list with the splitted clips.
          clipSplits.push({
            clipStart: clipStart,
            clipEnd: clipStart == clipCutpoint ? clipEnd : clipCutpoint || clipEnd,
            clipMode: clipStart == clipCutpoint ? '-c:v copy -c:a copy': '',
          });
          if (clipCutpoint && clipStart != clipCutpoint) {
            clipSplits.push({
              clipStart: clipCutpoint,
              clipEnd: clipEnd,
              clipMode: '-c:v copy -c:a copy',
            });
          }
          for (let [l, clip] of clipSplits.entries()) {
            // Add clip creation command to list.
            const fileOutput: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_tmp_${k}_${l}.` + this.saveSettings.saveExtension());
            this.saveCommandAdd(
              this.translate.instant('VIDEO_SAVE.EDIT.SPLIT.NAME', { i: i + 1, k: k + 1, l: l + 1 }),
              this.translate.instant('VIDEO_SAVE.EDIT.SPLIT.FULL', { i: `${i + 1}/${this.store.storeFiles().length}`, k: `${k + 1}/${file.fileClips().length}`, l: `${l + 1}/${clipSplits.length}` }),
              `ffmpeg -v error -y -noautorotate -ss ${clip.clipStart} -to ${clip.clipEnd} -i "${file.filePath}" ${clip.clipMode} "${fileOutput}"`,
            );
            // Add clip output file to temporal file for concatenation.
            clipConcat += 'file \'' + fileOutput + '\'\n';
            // Create temporal text file for the concatenation process.
            await this.ipc.invoke('file-create', clipInput, clipConcat);
            // Add clip output file for later deletion.
            this.saveInfo.saveDelete.push(fileOutput);
          }
          // Add clip creation command to list.
          this.saveCommandAdd(
            this.translate.instant('VIDEO_SAVE.EDIT.CLIP.NAME', { i: i + 1, k: k + 1 }),
            this.translate.instant('VIDEO_SAVE.EDIT.CLIP.FULL', { i: `${i + 1}/${this.store.storeFiles().length}`, k: `${k + 1}/${file.fileClips().length}` }),
            `ffmpeg -v error -y -noautorotate -f concat -safe 0 -i "${clipInput}" ${this.saveInfo.saveCodec} ${this.saveInfo.saveEncoding} ${this.saveInfo.saveFilters} ${this.saveInfo.saveMetadata} ${this.saveInfo.saveAudio} "${clipOutput}"`,
          );
        } else {
          // Single cut mode.
          if (this.saveSettings.saveCut() == 'keyframe') {
            // Change clip starting point to the nearest previous keyframe.
            const videoKeyframes: number[] = [...this.store.storeVideos()[i].videoKeyframes, totalDuration / frameRate];
            for (let l = 0; l < videoKeyframes.length; l++) {
              if (videoKeyframes[l] > clipStart) { clipStart = videoKeyframes[l - 1]; break; }
            }
          }
          // Add clip creation command to list.
          this.saveCommandAdd(
            this.translate.instant('VIDEO_SAVE.EDIT.CLIP.NAME', { i: i + 1, k: k + 1 }),
            this.translate.instant('VIDEO_SAVE.EDIT.CLIP.FULL', { i: `${i + 1}/${this.store.storeFiles().length}`, k: `${k + 1}/${file.fileClips().length}` }),
            `ffmpeg -v error -y -noautorotate -ss ${clipStart} -to ${clipEnd} -i "${file.filePath}" ${this.saveInfo.saveCodec} ${this.saveInfo.saveEncoding} ${this.saveInfo.saveFilters} ${this.saveInfo.saveMetadata} ${this.saveInfo.saveAudio} "${clipOutput}"`,
          );
        }
      }
    }
  };

  // Manage clips creation for available files (merge concatenation mode).
  private async saveInfoClipsMerge(): Promise<void> {
    // Reset clips list.
    this.saveInfo.saveClips = [];
    // Process all available files.
    for (let [i, file] of this.store.storeFiles().entries()) {
      // Get file total duration time in frames.
      const frameRate: number = this.store.storeVideos()[i].videoFrameRate;
      const totalDuration: number = this.store.storePlayer.playerVideo()[i].duration * frameRate;
      // Check if a clip has been added or modified.
      if ((file.fileClips()[0].clipStart() == 0 && file.fileClips()[0].clipEnd() == totalDuration) && file.fileClips().length == 1) {
        // Continue without processing the file.
        this.saveInfo.saveClips.push('');
      } else {
        // Build concatenation files list.
        let fileConcat: string = '';
        // Process all available clips for the selected file.
        for (let k = 0; k < file.fileClips().length; k++) {
          let clipStart: number = file.fileClips()[k].clipStart() / frameRate;
          const clipEnd: number = file.fileClips()[k].clipEnd() / frameRate;
          // Smart cut mode.
          if (this.saveSettings.saveCut() == 'smart') {
            let clipCutpoint: number = 0, clipSplits: SaveSplit[] = [];
            // Detect the point where to split the clip.
            for (let l = 0; l < this.store.storeVideos()[i].videoKeyframes.length; l++) {
              if (this.store.storeVideos()[i].videoKeyframes[l] < clipEnd &&
                this.store.storeVideos()[i].videoKeyframes[l] >= clipStart) {
                clipCutpoint = (+this.store.storeVideos()[i].videoKeyframes[l]); break;
              }
            }
            // Create list with the splitted clips.
            clipSplits.push({
              clipStart: clipStart,
              clipEnd: clipStart == clipCutpoint ? clipEnd : clipCutpoint || clipEnd,
              clipMode: clipStart == clipCutpoint ? '-c:v copy -c:a copy': '',
            });
            if (clipCutpoint && clipStart != clipCutpoint) {
              clipSplits.push({
                clipStart: clipCutpoint,
                clipEnd: clipEnd,
                clipMode: '-c:v copy -c:a copy',
              });
            }
            for (let [l, clip] of clipSplits.entries()) {
              // Add clip creation command to list.
              const fileOutput: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_tmp_${k}_${l}.` + this.saveSettings.saveExtension());
              this.saveCommandAdd(
                this.translate.instant('VIDEO_SAVE.EDIT.SPLIT.NAME', { i: i + 1, k: k + 1, l: l + 1 }),
                this.translate.instant('VIDEO_SAVE.EDIT.SPLIT.FULL', { i: `${i + 1}/${this.store.storeFiles().length}`, k: `${k + 1}/${file.fileClips().length}`, l: `${l + 1}/${clipSplits.length}` }),
                `ffmpeg -v error -y -noautorotate -ss ${clip.clipStart} -to ${clip.clipEnd} -i "${file.filePath}" ${clip.clipMode} "${fileOutput}"`,
              );
              // Add clip output file to temporal file for concatenation.
              fileConcat += 'file \'' + fileOutput + '\'\n';
              // Add clip output file for later deletion.
              this.saveInfo.saveDelete.push(fileOutput);
            }
          } else {
            // Single cut mode.
            let saveCut: string = '';
            // Manage selected clip mode.
            switch (this.saveSettings.saveCut()) {
              case 'lossless': { saveCut = '-c:v copy -c:a copy'; break; }
              case 'keyframe': { saveCut = '-c:v copy -c:a copy';
                // Change clip starting point to the nearest previous keyframe.
                const videoKeyframes: number[] = [...this.store.storeVideos()[i].videoKeyframes, totalDuration / frameRate];
                for (let l = 0; l < videoKeyframes.length; l++) {
                  if (videoKeyframes[l] > clipStart) { clipStart = videoKeyframes[l - 1]; break; }
                }
              }
            }
            // Add clip creation command to list.
            const fileOutput: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_tmp_${k}.` + this.saveSettings.saveExtension());
            this.saveCommandAdd(
              this.translate.instant('VIDEO_SAVE.EDIT.CLIP.NAME', { i: i + 1, k: k + 1 }),
              this.translate.instant('VIDEO_SAVE.EDIT.CLIP.FULL', { i: `${i + 1}/${this.store.storeFiles().length}`, k: `${k + 1}/${file.fileClips().length}` }),
              `ffmpeg -v error -y -noautorotate -ss ${clipStart} -to ${clipEnd} -i "${file.filePath}" ${saveCut} "${fileOutput}"`,
            );
            // Add clip output file to temporal file for concatenation.
            fileConcat += 'file \'' + fileOutput + '\'\n';
            // Add clip output file for later deletion.
            this.saveInfo.saveDelete.push(fileOutput);
          }
        }
        // Add clip concatenation command to list.
        const fileInput: string = file.fileClip;
        const fileOutput: string = file.filePath.replace(/(\.[\w\d_-]+)$/i, `_concat.` + this.saveSettings.saveExtension());
        this.saveCommandAdd(
          this.translate.instant('VIDEO_SAVE.EDIT.CONCAT.NAME', { i: i + 1 }),
          this.translate.instant('VIDEO_SAVE.EDIT.CONCAT.FULL', { i: `${i + 1}/${this.store.storeFiles().length}`, k: `${file.fileClips().length}` }),
          `ffmpeg -v error -y -noautorotate -f concat -safe 0 -i "${fileInput}" -c:v copy -c:a copy "${fileOutput}"`,
        );
        // Use clip concat output file instead of the original file.
        this.saveInfo.saveClips.push(fileOutput);
        // Add clip output file for later deletion.
        this.saveInfo.saveDelete.push(fileOutput);
        // Create temporal text file for the concatenation process.
        await this.ipc.invoke('file-create', fileInput, fileConcat);
      }
    }
    // Rebuild concatenation file if available and any clips were created.
    if (this.saveInfo.saveCut()) {
      // Build concatenation files list.
      let fileConcat: string = '';
      for (let i = 0; i < this.store.storeFiles().length; i++) {
        fileConcat += 'file \'' + this.saveInfo.saveClips[i] || this.store.storeFiles()[i].filePath + '\'\n';
      }
      // Create temporal text file for the concatenation process.
      await this.ipc.invoke('file-create', this.store.storeFiles()[0].fileConcatClip, fileConcat);
    }
  };

  // Manage video codec output.
  private saveInfoCodec(): void {
    // Define video codec to use, or copy stream if the same as input is used.
    this.saveInfo.saveCodec = this.saveInfo.saveFilters$().length || this.saveReencode() ? '-c:v ' + this.saveSettings.saveEncoder() : '-c:v copy';
  };

  // Manage concat mode output.
  private saveInfoConcat(): void {
    // Define concatenation of multiple files.
    this.saveInfo.saveConcat = (this.store.storeFiles().length > 1) && this.filters.filterConcat().length == 0 ? '-f concat -safe 0' : '';
  };

  // Manage video cut output.
  private saveInfoCut(): void {
    // Reset cut mode state.
    this.saveInfo.saveCut.set(false);
    for (let [i, file] of this.store.storeFiles().entries()) {
      // Get file total duration time in frames.
      const frameRate: number = this.store.storeVideos()[i].videoFrameRate;
      const totalDuration: number = this.store.storePlayer.playerVideo()[i].duration * frameRate;
      // Check if a clip has been added or modified.
      if (file.fileClips().length > 1 || (file.fileClips()[0].clipStart() != 0 || file.fileClips()[0].clipEnd() != totalDuration)) {
        // Update cut mode state.
        this.saveInfo.saveCut.set(true);
      }
    }
  };

  // Manage video encoding output.
  private saveInfoEncoding(): void {
    // Define encoding options for the selected codec.
    const videoStreams: VideoContainer[] = this.store.storeVideos()[0].videoStreams;
    if ((this.saveInfo.saveFilters$().length || this.saveReencode()) && this.saveEncoder()) {
      // Get encoding speed and compression ratio preset.
      const savePreset: string = this.saveEncoder()!.presets[Object.keys(this.saveEncoder()!.presets)[0]].replaceAll('$level', this.saveSettings.savePreset());
      // Get control rate quality and calculate bitrate.
      const saveQuality: number = this.saveSettings.saveQuality() || this.saveEncoder()!.quality[0];
      const saveBitrate: number = +this.saveSettings.saveBitrate() || Math.round(+videoStreams[1].bit_rate / 1000) || Math.round(+videoStreams[0].bit_rate / 1000);
      const saveRate: string = this.saveEncoder()!.rates[this.saveSettings.saveRate()].replaceAll('$crf', saveQuality.toString()).replaceAll('$bit', saveBitrate.toString());
      // Update encoding output command.
      this.saveInfo.saveEncoding = `${savePreset} ${saveRate}`;
    } else {
      this.saveInfo.saveEncoding = '';
    }
  };

  // Manage video filters output.
  private saveInfoFilters(): void {
    // Reset video filters.
    this.saveInfo.saveFilters$.set([]);
    // Define video filters to apply.
    if (this.filters.filterFlipH() || this.filters.filterFlipV()) {
      this.saveInfo.saveFilters$.update((v) => [...v, this.filters.filterFlipText()]);
    }
    if (this.filters.filterRotateText()) {
      this.saveInfo.saveFilters$.update((v) => [...v, this.filters.filterRotateText()]);
    }
    if (this.filters.filterCrop()) {
      this.saveInfo.saveFilters$.update((v) => [...v, this.filters.filterCropText()]);
    }
    if (this.filters.filterScalerText()) {
      this.saveInfo.saveFilters$.update((v) => [...v, this.filters.filterScalerText()]);
    }
    // Manage filters concatenation.
    const videoFiles: number = this.store.storeFiles().length;
    const saveConcat: boolean = !!this.filters.filterConcat().length && this.saveSettings.saveConcat() == 'merge';
    const saveFilters: string = this.saveInfo.saveFilters$().length ? saveConcat ? `;[v]${this.saveInfo.saveFilters$().join()}[v]` : `${this.saveInfo.saveFilters$().join()}` : '';
    // Update filter commands output.
    const concatFilter: string = saveConcat ? this.filters.filterNoAudio() ? `concat=n=${videoFiles}:v=1[v]${saveFilters}` : `concat=n=${videoFiles}:v=1:a=1[v][a]${saveFilters}` : saveFilters;
    const concatMap: string = saveConcat ? this.filters.filterNoAudio() ? '-map [v]' : '-map [v] -map [a]' : '';
    this.saveInfo.saveFilters = concatFilter ? `-lavfi "${concatFilter}" ${concatMap}` : '';
  };

  // Manage input file(s) output.
  private saveInfoInput(): void {
    // Reset save input.
    this.saveInfo.saveInput = '';
    // Check if concatenation filter should be used.
    if (this.filters.filterConcat().length) {
      for (let i = 0; i < this.store.storeFiles().length; i++) {
        // Check for clips and adjust the input file.
        const filePath: string = this.saveInfo.saveClips[i] || this.store.storeFiles()[i].filePath;
        this.saveInfo.saveInput += `-i "${filePath}" `;
      }
    } else {
      // Check for clips and adjust the input file.
      const fileConcat: string = this.saveInfo.saveCut() ? this.store.storeFiles()[0].fileConcatClip : this.store.storeFiles()[0].fileConcat;
      const filePath: string = this.saveInfo.saveClips[0] || this.store.storeFiles()[0].filePath;
      this.saveInfo.saveInput = `-i "${this.store.storeFiles().length > 1 ? fileConcat : filePath}"`;
    }
  };

  // Manage video metadata output.
  private saveInfoMetadata(): void {
    // Keep original metadata.
    if (!this.filters.filterClear()) { this.saveInfo.saveMetadata = ''; return; }
    // Remove general metadata, rotation and encoder tags.
    const videoStream: VideoStream = this.store.storeVideos()[0].videoStreams[1];
    let saveMetadata: string = '-map_metadata -1 -metadata:s:v rotate="" -fflags +bitexact';
    // Correct aspect ratio if metadata exists, since it can't be removed.
    if (this.utils.findValueInKey(videoStream, 'aspect_ratio').length) {
      switch (this.filters.filterRotate()) {
        case 90:
        case 270: { saveMetadata += ` -aspect ${videoStream.height}:${videoStream.width}`; break; }
        default: { saveMetadata += ` -aspect ${videoStream.width}:${videoStream.height}`; }
      }
    }
    // Update metadata output command.
    this.saveInfo.saveMetadata = saveMetadata;
  };

  // Manage final output command.
  private saveInfoOutput(): void {
    this.saveCommandAdd(this.translate.instant('VIDEO_SAVE.EDIT.FINAL'), this.translate.instant('VIDEO_SAVE.EDIT.FINAL'),
      `ffmpeg -v error -y -noautorotate ${this.saveInfo.saveConcat} ${this.saveInfo.saveInput} ${this.saveInfo.saveCodec} ${this.saveInfo.saveEncoding} ${this.saveInfo.saveFilters} ${this.saveInfo.saveMetadata} ${this.saveInfo.saveAudio} "${this.saveInfo.saveOutput()}"`);
  };
};