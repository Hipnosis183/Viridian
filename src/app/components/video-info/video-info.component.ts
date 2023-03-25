import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { IpcService } from 'src/app/services/ipc.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'video-info',
  templateUrl: './video-info.component.html',
  styleUrls: ['./video-info.component.css']
})

export class VideoInfoComponent {

  constructor(
    private ipc: IpcService,
    public store: StoreService,
    private zone: NgZone
  ) { }

  @Output() inited = new EventEmitter;
  @Output() loaded = new EventEmitter;

  ngOnInit(): void { this.inited.emit(); }

  videoInfo: boolean = false;
  $videoInfo(v?: boolean): void {
    this.videoInfo = v ?? !this.videoInfo;
  }

  videoStreamFormat(s: any): string {
    // Parse and format/beautify stream information.
    let text: string = '';
    for (let v in s) {
      if (typeof s[v] == 'object') {
        text += `<span><span class="text-green-500 mr-2">${v}:</span><span class="text-blue-500">{</span></span>`;
        text += `<span class="flex flex-col ml-4 space-y-1">${this.videoStreamFormat(s[v])}</span>`
        text += `<span><span class="text-blue-500">}</span></span>`;
      } else { text += `<span><span class="text-green-500 mr-2">${v}:</span><span class="text-blue-500">${s[v]}</span></span>`; }
    } return text;
  }

  videoStreamOpen(i: number): void {
    // Expand selected stream information panel.
    for (let k = 0; k < this.store.state.videoInfo[this.store.i].videoStreams.length; k++) {
      if (k != i) { this.store.state.videoInfo[this.store.i].videoStreams[k].view = null; }
    } this.store.state.videoInfo[this.store.i].videoStreams[i].view = this.store.state.videoInfo[this.store.i].videoStreams[i].view ? false : true;
  }

  $videoStreamResize: any = [];
  videoStreamResize(e: any, i: number): void {
    this.$videoStreamResize.push(e);
    if (i == this.store.state.videoInfo[this.store.i].videoStreams.length - 1) {
      // Adjust table's width value to fit the information.
      let t: any = document.getElementsByTagName('table')[0];
      for (let k = 0; k < this.$videoStreamResize.length; k++) {
        this.$videoStreamResize[k].style.width = t.offsetWidth + 'px';
      }
    }
  }

  videoStreamLoad(): void {
    // Get video file metadata.
    const input: string = this.store.state.fileInfo[this.store.i].filePath;
    const command: string = `ffprobe -v error -show_format -show_entries streams -of json -i "${input}"`;
    this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
    this.ipc.once('exec', (err: any, r: string) => {
      this.zone.run(() => {
        // Get general format and streams/tracks information.
        let streams = [JSON.parse(r).format];
        streams = streams.concat(JSON.parse(r).streams);
        for (let i = 0; i < streams.length; i++) {
          this.store.state.videoInfo[this.store.i].videoStreamsText.push(this.videoStreamFormat(streams[i]));
          streams[i].view = null;
        } this.store.state.videoInfo[this.store.i].videoStreams = streams;
        this.store.state.videoInfo[this.store.i].videoFrameRate = new Function(`return ${streams[1].r_frame_rate}`)();
        // Get video stream key/i-frames.
        const command: string = `ffprobe -v error -select_streams v:0 -skip_frame nokey -show_entries frame=key_frame,pts_time -of json -i "${input}"`;
        this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
        this.ipc.once('exec', (err: any, r: string) => {
          // Sort keyframes to ensure they are in order.
          let frames = JSON.parse(r).frames.filter((v: any) => v.key_frame == 1).map((v: any) => v.pts_time);
          this.store.state.videoInfo[this.store.i].videoKeyFrames = frames.sort((a: number, b: number) => { return a - b; });
          // Check if file thumbnails were already generated.
          this.ipc.send('read-dir', `${this.store.state.fileInfo[this.store.i].fileTemp.slice(7)}thumbs`);
          this.ipc.once('read-dir', (err: any, r: string) => {
            this.zone.run(async () => {
              // Get seek intervals for thumbnail generation.
              const fileInfo: any = this.store.state.fileInfo[this.store.i];
              const interval: number = (streams[1].duration < 30) ? 2 : (streams[1].duration < 60) ? 4 : (streams[1].duration < 60 * 5) ? 10 : (streams[1].duration < 60 * 10) ? 20 : (streams[1].duration < 60 * 30) ? 30 : (streams[1].duration < 60 * 60) ? 60 : 120;
              let inputs = [], outputs = [];
              for (let i = 0; i < Math.floor(streams[1].duration / interval) + 1; i++) {
                // Take a second from last seek to avoid frames not being extracted.
                const l: number = i == Math.floor(streams[1].duration / interval) ? interval * i - 1 : interval * i;
                const output: string = `${fileInfo.fileTemp}thumbs/${i.toString().padStart(4, '0')}.jpg`;
                inputs.push(`-ss ${l} -i "${fileInfo.filePath}"`);
                outputs.push(`-map ${i}:v -vframes 1 -vf "scale=120:-1" "${output}"`);
                // Store thumbnail path into file information.
                this.store.state.fileInfo[this.store.i].fileThumbs.push(output);
              } this.store.state.fileInfo[this.store.i].fileInterval = interval;
              // Generate small video thumbnails.
              if (!r.length) {
                const command: string = `ffmpeg -v error -y ${inputs.join(' ')} ${outputs.join(' ')}`;
                this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
                this.ipc.once('exec', (err: any, r: string) => {
                  this.zone.run(() => { this.loaded.emit(); });});
              } else { this.loaded.emit(); }
            });
          });
        });
      });
    });
  }
}
