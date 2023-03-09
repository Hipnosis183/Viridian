import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'ui-slider',
  templateUrl: './ui-slider.component.html',
  styleUrls: ['./ui-slider.component.css']
})

export class UiSliderComponent {

  @Input() sliderMax: number = 100;
  @Input() sliderMin: number = 0;
  @Input() sliderValue: number = 0;
  @Input() sliderVertical: boolean = false;
  @Output() sliderValueChange = new EventEmitter;
  @ViewChild('slider') slider!: ElementRef;

  updateSlider(): void {
    // Update bar color based on thumb position.
    const value = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin) * 100;
    this.slider.nativeElement.style.background = `linear-gradient(to right, #0f172a 0%, #0f172a ${value}%, #f1f5f9 ${value}%, #f1f5f9 100%)`;
    // Emit input value to parent.
    this.sliderValueChange.emit(this.sliderValue);
  }

  updateValue(event: any): void {
    this.sliderValue = event;
    this.sliderValueChange.emit(this.sliderValue);
  }

  ngAfterViewInit(): void {
    this.updateSlider();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sliderValue'] && !changes['sliderValue'].firstChange) { this.updateSlider(); }
  }
}