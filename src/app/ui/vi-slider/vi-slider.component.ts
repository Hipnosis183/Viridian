// Import Angular elements.
import { ChangeDetectionStrategy, Component, effect, ElementRef, input, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'vi-slider',
  templateUrl: './vi-slider.component.html',
  styleUrl: './vi-slider.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class ViSlider {
  constructor() {
    // Update current slider value.
    effect(() => { if (this.sliderValue()) { this.sliderUpdate(); } });
  };

  // Define slider state.
  public sliderMax = input<number>(100);
  public sliderMin = input<number>(0);
  public sliderValue = model<number>(0);
  public sliderVertical = input<boolean>(false);

  // Define template queries.
  private sliderInput = viewChild.required<ElementRef>('sliderInput');

  // Define lifecycle hooks.
  public ngAfterViewInit(): void { this.sliderUpdate(); };

  // Update slider value state.
  private sliderUpdate(): void {
    // Update bar color based on thumb position.
    const sliderPosition: number = (this.sliderValue() - this.sliderMin()) / (this.sliderMax() - this.sliderMin()) * 100;
    this.sliderInput().nativeElement.style.background = `linear-gradient(to right, #7D8590 0%, #7D8590 ${sliderPosition}%, #010409 ${sliderPosition}%, #010409 100%)`;
  };
};