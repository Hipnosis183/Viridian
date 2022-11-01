import { Component } from '@angular/core';
import { IpcService } from 'src/app/services/ipc.service';

// @ts-ignore
import Resizable from 'resizable';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})

export class VideoPlayerComponent {

  constructor(private ipcRenderer: IpcService) { }

  playerCrop: any;
  playerProgress: any;
  playerVideo: any;
  playerResizable: any;

  ngAfterContentInit(): void {
    this.playerProgress = document.getElementById('playerProgress');
    this.playerVideo = document.getElementById('playerVideo');
    // Get crop element and set default position values.
    this.playerCrop = document.querySelector('#playerCrop');
    this.playerCrop.style.transform = 'translate3d(0px, 0px, 0px)';
    // Create a resizable instance from the crop element.
    this.playerResizable = new Resizable(this.playerCrop, {
      draggable: true, within: 'parent'
    });
  }

  playerFile: any = {
    filePath: null,
    videoWidth: null,
    videoHeight: null
  };

  playerFileClose(): void {
    this.playerFile = {
      filePath: null,
      videoWidth: null,
      videoHeight: null
    };
    this.filterActive = {
      filterCrop: false
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
    if (this.filterActive.filterCrop) { filters.push(this.filterCrop()); }
    let filter = filters.length > 0 ? '-filter:v' : '-c:v copy';
    // Define paths and commands.
    const input: string = this.playerFile.filePath;
    const output: string = input.replace(/(\.[\w\d_-]+)$/i, '_out$1');
    const ffmpeg: string = '/home/renzo/Downloads/ffmpeg/ffmpeg';
    const params: string = ` -y -i ${input} ${filter} ${filters.length > 0 ? `"${filters.join(',')}"` : ''} -c:a copy ${output}`;
    // Execute command and listen for a response.
    this.ipcRenderer.send('exec', ffmpeg + params, null);
    this.ipcRenderer.on('exec', (e: any, r: string) => {
      console.log(r ? r : 'ok');
    });
  }

  playerLoadedMetadata(d: any): void {
    this.playerProgress.setAttribute('max', this.playerVideo.duration.toString());
    // Store dimensions from the original video.
    this.playerFile.videoWidth = d.srcElement.videoWidth;
    this.playerFile.videoHeight = d.srcElement.videoHeight;
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

  filterActive = { filterCrop: false };

  $filterCrop(): void {
    this.filterActive.filterCrop = !this.filterActive.filterCrop;
  }

  filterCrop(): string {
    // Calculate real absolute position values to fit the original video dimensions.
    const re = /translate3d\((?<x>.*?)px, (?<y>.*?)px/;
    const res: any = re.exec(this.playerCrop.style.transform);
    const x = Math.round(res.groups.x * this.playerFile.videoWidth / this.playerVideo.offsetWidth);
    const y = Math.round(res.groups.y * this.playerFile.videoHeight / this.playerVideo.offsetHeight);
    // Calculate real absolute size values to fit the original video dimensions.
    const w = Math.round(this.playerFile.videoWidth / this.playerVideo.offsetWidth * this.playerCrop.offsetWidth);
    const h = Math.round(this.playerFile.videoHeight / this.playerVideo.offsetHeight * this.playerCrop.offsetHeight);
    // Return built parameter.
    return `crop=${w}:${h}:${x}:${y}`;
  }
}
