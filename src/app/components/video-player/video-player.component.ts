import { Component } from '@angular/core';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})

export class VideoPlayerComponent {

  playerFile: any;
  playerProgress: any;
  playerVideo: any;

  playerFileOpen(event: any): void {
    const file = event.target.files && event.target.files[0];
    if (file.type.indexOf('video') > -1) {
      this.playerFile = 'file://' + event.target.files[0].path;
    }
  }

  playerFileClose(): void {
    this.playerFile = null;
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

  ngAfterContentInit(): void {
    this.playerProgress = document.getElementById('playerProgress');
    this.playerVideo = <HTMLVideoElement>document.getElementById('playerVideo');
  }
}
