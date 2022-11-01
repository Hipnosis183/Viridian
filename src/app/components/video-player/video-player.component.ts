import { Component } from '@angular/core';
import { IpcService } from 'src/app/services/ipc.service';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})

export class VideoPlayerComponent {

  constructor(private ipcRenderer: IpcService) { }

  playerProgress: any;
  playerVideo: any;

  ngAfterContentInit(): void {
    this.playerProgress = document.getElementById('playerProgress');
    this.playerVideo = document.getElementById('playerVideo');
  }

  playerFile: any = {
    filePath: null
  };

  playerFileClose(): void {
    this.playerFile = {
      filePath: null
    };
  }

  playerFileOpen(e: any): void {
    const file = e.target.files && e.target.files[0];
    if (file.type.indexOf('video') > -1) {
      this.playerFile.filePath = 'file://' + e.target.files[0].path;
    }
  }

  async playerFileSave(): Promise<void> {
    // Define video filters to apply.
    let filters: string[] = [];
    let filter = filters.length > 0 ? '-filter:v' : '-c:v copy';
    // Define paths and commands.
    const input: string = this.playerFile.filePath;
    const output: string = input.replace(/(\.[\w\d_-]+)$/i, '_out$1');
    const ffmpeg: string = 'ffmpeg';
    const params: string = ` -y -i ${input} ${filter} ${filters.length > 0 ? `"${filters.join(',')}"` : ''} -c:a copy ${output}`;
    // Execute command and listen for a response.
    this.ipcRenderer.send('exec', ffmpeg + params, null);
    this.ipcRenderer.on('exec', (e: any, r: string) => {
      console.log(r ? r : 'ok');
    });
  }

  playerLoadedMetadata(): void {
    this.playerProgress.setAttribute('max', this.playerVideo.duration.toString());
  }

  playerMute(): void {
    this.playerVideo.muted = !this.playerVideo.muted;
  }

  playerPlayPause(): void {
    if (this.playerVideo.paused || this.playerVideo.ended) {
      this.playerVideo.play();
    } else { this.playerVideo.pause(); }
  }

  playerProgressChange(e: any): void {
    const rect = this.playerProgress.getBoundingClientRect();
    const pos = (e.pageX - rect.left) / this.playerProgress.offsetWidth;
    this.playerVideo.currentTime = pos * this.playerVideo.duration;
  }

  playerProgressUpdate(): void {
    this.playerProgress.value = this.playerVideo.currentTime;
  }

  playerStop(): void {
    this.playerVideo.pause();
    this.playerVideo.currentTime = 0;
    this.playerProgress.value = 0;
  }
}
