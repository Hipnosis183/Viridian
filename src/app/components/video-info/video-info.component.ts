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
        const command: string = `ffprobe -v error -select_streams v:0 -skip_frame nokey -show_entries frame=pts_time -of json -i "${input}"`;
        this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
        this.ipc.once('exec', (err: any, r: string) => {
          this.zone.run(() => {
            let frames = JSON.parse(r).frames;
            this.store.state.videoInfo[this.store.i].videoKeyFrames = frames.map((v: any) => v.pts_time);
            this.loaded.emit();
          });
        });
      });
    });
  }
}
