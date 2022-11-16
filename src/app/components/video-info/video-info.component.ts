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

  @Output() loaded = new EventEmitter;

  videoInfo: boolean = false;
  $videoInfo(): void {
    this.videoInfo = !this.videoInfo;
  }

  videoStreamFormat(stream: any): string {
    let text: string = '';
    for (let v in stream) {
      if (typeof stream[v] == 'object') {
        text += `<span><span class="text-green-500 mr-2">${v}:</span><span class="text-blue-500">{</span></span>`;
        text += `<span class="flex flex-col ml-4 space-y-1">${this.videoStreamFormat(stream[v])}</span>`
        text += `<span><span class="text-blue-500">}</span></span>`;
      } else { text += `<span><span class="text-green-500 mr-2">${v}:</span><span class="text-blue-500">${stream[v]}</span></span>`; }
    } return text;
  }

  videoStreamOpen(i: number): void {
    for (let k = 0; k < this.store.state.videoInfo.videoStreams.length; k++) {
      if (k != i) { this.store.state.videoInfo.videoStreams[k].view = null; }
    } this.store.state.videoInfo.videoStreams[i].view = this.store.state.videoInfo.videoStreams[i].view ? false : true;
  }

  ngOnInit(): void {
    // Get video file metadata.
    const input: string = this.store.state.fileInfo.filePath;
    const command: string = `ffprobe -v error -of json -show_format -show_entries streams -i "${input}"`;
    // Execute command and listen for a response.
    this.ipc.send('exec', this.store.state.filePaths.ffmpeg + command, null);
    this.ipc.once('exec', (e: any, r: string) => {
      this.zone.run(() => {
        // Get format (general) and streams (tracks) data.
        let streams = [JSON.parse(r).format];
        streams = streams.concat(JSON.parse(r).streams);
        for (let i = 0; i < streams.length; i++) {
          this.store.state.videoInfo.videoStreamsText.push(this.videoStreamFormat(streams[i]));
          streams[i].view = null;
        } this.store.state.videoInfo.videoStreams = streams;
        this.loaded.emit();
      });
    });
  }
}
