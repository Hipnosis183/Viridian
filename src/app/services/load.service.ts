// Import Angular elements.
import { inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { VideoFrames, VideoStream } from '@app/models/ffmpeg';
import { FileCompat, FileLoad } from '@app/models/general';
import { ClipInfo, FileInfo, VideoInfo } from '@app/models/store';
import { DownloadService, FiltersService, InfoService, IpcService, PlayerService, RecentService, SaveService, SegmentsService, SettingsService, StoreService, UtilsService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class LoadService {
  // Inject app services.
  private download = inject(DownloadService);
  private filters = inject(FiltersService);
  private info = inject(InfoService);
  private ipc = inject(IpcService);
  private player = inject(PlayerService);
  private recent = inject(RecentService);
  private save = inject(SaveService);
  private segments = inject(SegmentsService);
  private settings = inject(SettingsService);
  private store = inject(StoreService);
  private utils = inject(UtilsService);

  // Define video load state.
  public fileCompat = signal<FileCompat[]>([]);
  public filesLoadList = signal<Partial<File>[]>([]);
  public filesLoadState = signal<FileLoad>(null);
  public filesLoadTotal = signal<number>(0);

  // Update load compatibility state.
  public fileUpdateCompat(): void {
    this.fileCompat.set([]);
  };

  // Close all open video files.
  public filesClose(): void {
    // Reset file load state.
    this.filesLoadState.set(null);
    // Reset app state.
    this.store.storeReset();
    this.filters.filtersReset();
    this.segments.segmentsOpen.set(false);
  };

  // Initial video file load.
  public async filesLoadInit(filesList: File[] | Partial<File>[] | FileList): Promise<void> {
    // Define FFmpeg file paths.
    const fileName: string = process.platform == 'linux' ? 'ffmpeg' : 'ffmpeg.exe';
    const filePath: string = `${this.settings.options.ffmpeg.filesPath()}${fileName}`;
    // Check if FFmpeg binaries are downloaded/installed.
    const fileExists: boolean = await this.ipc.invoke('file-exists', filePath);
    if (!fileExists) { this.download.downloadUpdateMissing(); return; }
    // Load video file(s).
    this.filesLoadList.set(Object.values(filesList).slice(1));
    this.filesLoadTotal.set(Object.values(filesList).length);
    await this.filesLoadVideo(filesList[0]);
  };

  // Load file/video data into the app state.
  private async filesLoadVideo(fileInfo: File | Partial<File>): Promise<void> {
    // Check if opened file is a valid video file.
    if (fileInfo.type!.indexOf('video') == -1) { return; }
    // Check if file is already opened.
    if (this.store.storeFiles().find((v) => v.filePath == fileInfo.path)) { return; }
    // Manage opened file in recent files list.
    if (!this.store.storeFiles().length) { this.recent.recentFileAdd(fileInfo); }
    // Update file load state to loading.
    this.filesLoadState.set('loading');
    // Get video file stream data.
    const fileCommand: string = `ffprobe -v error -show_format -show_entries streams -of json -i "${fileInfo.path!}"`;
    const fileData: string = await this.ipc.invoke('process-exec', this.settings.options.ffmpeg.filesPath() + fileCommand, null);
    const fileStreams: any[] = [JSON.parse(fileData).format].concat(JSON.parse(fileData).streams);
    const videoStream: VideoStream = this.store.storeVideos()[0]?.videoStreams[1];
    // Add file if the width and height are the same as the default video.
    if (!this.store.storeVideos().length || ((videoStream.height == fileStreams[1].height) && (videoStream.width == fileStreams[1].width))) {
      // Define concat mode to use (demuxer/filter) depending on the codec and timebase.
      if (this.store.storeVideos().length && ((videoStream.codec_name != fileStreams[1].codec_name) || (videoStream.time_base != fileStreams[1].time_base))) {
        this.filters.filterConcat.update((v) => [...v, fileInfo.path!]);
        this.fileCompat.update((v) => [...v, 'lossyConcat']);
      }
      // Define file data.
      const fileTemp: string = await this.filesLoadTemp(fileInfo.name!);
      const fileInterval: number = this.filesLoadInterval(fileStreams);
      const fileThumbs: string[] = await this.filesLoadThumbs(fileStreams, fileInterval, fileInfo.path!, fileTemp);
      const fileInfo$: FileInfo = {
        fileColor: signal<number>(0),
        fileClip: `${fileTemp}clip.txt`,
        fileClipIndex: signal<number>(-1),
        fileClips: signal<ClipInfo[]>([]),
        fileConcat: `${fileTemp}concat.txt`,
        fileConcatClip: `${fileTemp}concat_clip.txt`,
        fileExtension: fileInfo.path!.split('.').pop()!,
        fileInterval: fileInterval,
        fileName: fileInfo.name!,
        filePath: fileInfo.path!,
        fileTemp: `${fileTemp}`,
        fileThumb: `file://${fileTemp}thumb.jpg`,
        fileThumbs: fileThumbs,
        fileType: fileInfo.type!,
      };
      // Define video data.
      const videoKeyframes: number[] = await this.filesLoadFrames(fileInfo.path!);
      const videoInfo$: VideoInfo = {
        videoFrameRate: new Function(`return ${fileStreams[1].r_frame_rate}`)(),
        videoHeight: fileStreams[1].height,
        videoKeyframes: videoKeyframes,
        videoStreams: fileStreams,
        videoStreamsText: fileStreams.map((v) => this.info.infoFormat(v)),
        videoWidth: fileStreams[1].width,
      };
      // Update file and video state in store.
      this.store.storeFiles.update((v) => [...v, fileInfo$]);
      this.store.storeVideos.update((v) => [...v, videoInfo$]);
      // Update concatenation text file.
      this.segments.fileConcat();
    } else {
      // Update file compatibility state.
      this.fileCompat.update((v) => [...v, 'noConcat']);
      // Load next file in the list.
      this.filesLoadNext();
    }
  };

  // Manage directory for temporal storage.
  private async filesLoadTemp(fileName: string): Promise<string> {
    // Create cache directory for the file.
    const fileTemp: string = process.cwd() + '/temp/' + fileName.replace(/(\.[\w\d_-]+)$/i, '/');
    await this.ipc.invoke('dir-create', `${fileTemp}thumbs`); return fileTemp;
  };

  // Get video stream key/i-frames.
  private async filesLoadFrames(filePath: string): Promise<number[]> {
    const fileCommand: string = `ffprobe -v error -select_streams v:0 -show_entries packet=pts_time,flags -of json -i "${filePath}"`;
    const fileFrames: VideoFrames = JSON.parse(await this.ipc.invoke('process-exec', this.settings.options.ffmpeg.filesPath() + fileCommand, null));
    // Filter key/i-frames time values only.
    const fileFrames$: number[] = fileFrames.packets.filter((v) => v.flags[0] == 'K').map((v) => v.pts_time);
    // Sort keyframes to ensure they are in order.
    return fileFrames$.sort((a, b) => { return a - b; });
  };

  // Get seek intervals for thumbnail generation.
  private filesLoadInterval(fileStreams: any[]): number {
    return (fileStreams[1].duration < 30) ? 2 : (fileStreams[1].duration < 60) ? 4 : (fileStreams[1].duration < 60 * 5) ? 10 : (fileStreams[1].duration < 60 * 10) ? 20 : (fileStreams[1].duration < 60 * 30) ? 30 : (fileStreams[1].duration < 60 * 60) ? 60 : 120;
  };

  // Manage video thumbnails creation.
  private async filesLoadThumbs(fileStreams: any[], fileInterval: number, filePath: string, fileTemp: string): Promise<string[]> {
    // Check if main video thumbnail has already been generated.
    const fileExists: boolean = await this.ipc.invoke('file-exists', `${fileTemp}thumb.jpg`);
    if (!fileExists) {
      // Generate main video thumbnail.
      const fileCommand: string = `ffmpeg -v error -y -i "${filePath}" -vf "select=eq(n\\,0),scale=200:-1" -vframes 1 -qmin 1 -q:v 1 "${fileTemp}thumb.jpg"`;
      await this.ipc.invoke('process-exec', this.settings.options.ffmpeg.filesPath() + fileCommand, null);
    }
    // Manage video thumbnails if were not generated already.
    const fileThumbs: string[] = [], fileInputs: string[] = [], fileOutputs: string[] = [];
    const fileThumbs$: string[] = await this.ipc.invoke('dir-read', `${fileTemp}thumbs`);
    if (this.settings.options.general.createThumbs() || fileThumbs$.length) {
      for (let i = 0; i < Math.floor(fileStreams[1].duration / fileInterval) + 1; i++) {
        // Take a second from last seek to avoid frames not being extracted.
        const thumbInterval: number = i == Math.floor(fileStreams[1].duration / fileInterval) ? fileInterval * i - 1 : fileInterval * i;
        // Add thumbnail path to files list.
        const thumbPath: string = `${fileTemp}thumbs/${i.toString().padStart(4, '0')}.jpg`;
        fileThumbs.push(`file://${thumbPath}`);
        // Manage thumbnail creation command.
        fileInputs.push(`-ss ${thumbInterval} -i "${filePath}"`);
        fileOutputs.push(`-map ${i}:v -vframes 1 -vf "scale=120:-1" "${thumbPath}"`);
      }
    }
    // Generate small video thumbnails.
    if (this.settings.options.general.createThumbs()) {
      const thumbsCommand: string = `ffmpeg -v error -y ${fileInputs.join(' ')} ${fileOutputs.join(' ')}`;
      await this.ipc.invoke('process-exec', this.settings.options.ffmpeg.filesPath() + thumbsCommand, null);
    }
    // Return thumbnails files list.
    return fileThumbs;
  };

  // Load any remaining files in the list.
  private filesLoadNext(): void {
    if (this.filesLoadList().length) {
      // Process the next video file.
      this.filesLoadVideo(this.filesLoadList().shift()!);
    } else {
      // Update load and save states after all videos are fully loaded.
      this.filesLoadState.set('loaded');
      this.save.saveLoaded();
    }
  };

  // Manage remaining elements after video file load.
  public async filesLoaded(fileLoaded: Event): Promise<void> {
    // Update video player state.
    (fileLoaded.target as HTMLVideoElement).muted = JSON.parse(localStorage.getItem('player.muted') || 'false');
    (fileLoaded.target as HTMLVideoElement).volume = JSON.parse(localStorage.getItem('player.volume') || '1');
    // Add video element to list.
    this.store.storePlayer.playerVideo.update((v) => [...v, fileLoaded.target as HTMLVideoElement]);
    // Update video index with newly opened file.
    this.store.storeIndex.set(this.store.storePlayer.playerVideo().length - 1);
    // Get video file stream data.
    const videoStream: VideoStream = this.store.storeVideos()[this.store.storeIndex()].videoStreams[1];
    // Store dimensions from the original video.
    this.filters.filterCropW.set(videoStream.width);
    this.filters.filterCropH.set(videoStream.height);
    this.store.storePlayer.playerWidth.set(videoStream.width);
    this.store.storePlayer.playerHeight.set(videoStream.height);
    // Normalize video rotation display if rotate metadata is present.
    const rotated: number = this.utils.findValueByKey(videoStream, 'rotation');
    // Older rotation API is measured CW, newer (display matrix) is CCW.
    let rotation: number = 0;
    switch (rotated) {
      case 90: case -270: { rotation = 90; break; }
      case 270: case -90: { rotation = 270; break; }
      case 180: case -180: { rotation = 180; break; }
    } this.filters.filterRotation.set(rotation);
    // Reset and setup positioning of the video container.
    setTimeout(() => { this.player.playerUpdate(rotation); });
    // Create default clip segment.
    this.segments.clipAdd();
    // Open split/merge panel if multiple files are open.
    if (this.store.storeFiles().length > 1) {
      setTimeout(() => { this.segments.segmentsOpen.set(true); });
    }
    // Load next file in the list.
    this.filesLoadNext();
  };
};