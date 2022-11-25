import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-progress',
  templateUrl: './ui-progress.component.html',
  styleUrls: ['./ui-progress.component.css']
})

export class UiProgressComponent {

  @Input() progressDuration: number = 0;
  @Input() progressTime: number = 0;
  @Output() progressTimeChange = new EventEmitter;

  updateProgress(e: any): void {
    const r = e.target.getBoundingClientRect();
    const p = (e.pageX - r.left) / e.target.offsetWidth;
    this.progressTime = p * this.progressDuration;
    this.progressTimeChange.emit(this.progressTime);
    this.updateThumb();
  }

  updateThumb(): void {
    const p: any = document.getElementById('progress');
    const l = this.progressTime * p.childNodes[0].offsetWidth / (this.progressDuration || 1);
    p.childNodes[1].style.left = `${l != 0 ? l - 4 : l}px`;
  }

  @HostListener('window:resize')
  onResize() { this.updateThumb(); }
  ngOnChanges(): void { this.updateThumb(); }
}