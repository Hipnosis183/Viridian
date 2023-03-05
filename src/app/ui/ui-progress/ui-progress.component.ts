import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ui-progress',
  templateUrl: './ui-progress.component.html',
  styleUrls: ['./ui-progress.component.css']
})

export class UiProgressComponent {

  @Input() progressDuration: number = 0;
  @Input() progressExtend: boolean = false;
  @Input() progressFrames: number[] = [];
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