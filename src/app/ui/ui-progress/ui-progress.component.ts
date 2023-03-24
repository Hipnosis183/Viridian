import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { DelayService } from 'src/app/services/delay.service';

@Component({
  selector: 'ui-progress',
  templateUrl: './ui-progress.component.html',
  styleUrls: ['./ui-progress.component.css']
})

export class UiProgressComponent {

  constructor(private delay: DelayService) { }

  @Input() progressDuration: number = 0;
  @Input() progressExtend: boolean = false;
  @Input() progressFrames: number[] = [];
  @Input() progressHover: any = [];
  @Input() progressInterval: number = 10;
  @Input() progressTime: number = 0;
  @Output() progressTimeChange = new EventEmitter;

  updateFrame(e: any, i: number): void {
    const p: any = document.getElementById('progress');
    const l: number = this.progressFrames[i] * p.childNodes[0].offsetWidth / (this.progressDuration || 1);
    e.style.left = `${l}px`;
  }

  updateFrames(): void {
    if (!this.progressExtend) { return; }
    const p: any = document.getElementById('progress');
    for (let i = 0; i < this.progressFrames.length; i++) {
      this.updateFrame(p.childNodes[2].childNodes[i].childNodes[0], i); }
  }

  $progressHover: any = { line: 0, time: 0, thumb: null };
  $updateHover = this.delay.throttle((e: any) => this.updateHover(e), 10);
  updateHover(e: any): void {
    // Update hover mark position.
    if (this.progressExtend) {
      const l: any = document.getElementById('progress-line');
      l.style.left = `${e.layerX}px`;
    } // Update hover tooltip time.
    const p: any = document.getElementById('progress');
    this.$progressHover.time = e.layerX * this.progressDuration / p.childNodes[0].offsetWidth;
    // Update hover tooltip thumbnail.
    if (this.progressHover.length) {
      const i: number = Math.round(this.$progressHover.time / this.progressInterval);
      const l: number = this.progressHover.length;
      this.$progressHover.thumb = this.progressHover[i >= l ? l - 1 : i];
    }
  }

  updateProgress(e: any): void {
    const r: any = e.target.getBoundingClientRect();
    const p: number = (e.pageX - r.left) / e.target.offsetWidth;
    this.progressTime = p * this.progressDuration;
    this.progressTimeChange.emit(this.progressTime);
    this.updateThumb();
  }

  updateThumb(): void {
    const p: any = document.getElementById('progress');
    const l: number = this.progressTime * p.childNodes[0].offsetWidth / (this.progressDuration || 1);
    p.childNodes[1].style.left = `${l - 4}px`;
  }

  @HostListener('window:resize')
  onResize(): void { this.updateFrames(); this.updateThumb(); }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progressExtend']) { this.updateFrames(); }
    if (changes['progressTime']) { this.updateThumb(); }
  }
}