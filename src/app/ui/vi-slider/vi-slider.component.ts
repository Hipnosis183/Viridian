// Import Angular elements.
import { ChangeDetectionStrategy, Component, effect, ElementRef, input, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Import components, services, directives, pipes, types and interfaces.
import { TooltipDirective } from '@app/directives';

@Component({
  selector: 'vi-slider',
  templateUrl: './vi-slider.component.html',
  styleUrl: './vi-slider.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TooltipDirective],
})
export class ViSlider {
  constructor() {
    // Update current slider value.
    effect(() => { if (this.sliderValue()) { this.sliderUpdate(); } });
  };

  // Define slider state.
  public sliderMax = input<number>(100);
  public sliderMin = input<number>(0);
  public sliderTooltip = model<string>('');
  public sliderValue = model<number>(0);
  public sliderVertical = input<boolean>(false);
  public sliderWidth = model<string>('');

  // Define template queries.
  private sliderInput = viewChild.required<ElementRef>('sliderInput');
  private sliderThumb = viewChild.required<ElementRef>('sliderThumb');

  // Define lifecycle hooks.
  public ngAfterViewInit(): void { this.sliderUpdate(); };

  // Update slider value state.
  private sliderUpdate(): void {
    // Update bar color based on thumb position.
    const sliderPosition: number = (this.sliderValue() - this.sliderMin()) / (this.sliderMax() - this.sliderMin()) * 100;
    this.sliderInput().nativeElement.style.background = `linear-gradient(to right, var(--slider-fill) 0%, var(--slider-fill) ${sliderPosition}%, var(--slider-color) ${sliderPosition}%, var(--slider-color) 100%)`;
    this.sliderThumb().nativeElement.style.left = `${sliderPosition / 100 * (100 - 16 * 100 / this.sliderInput().nativeElement.offsetWidth)}%`;
  };
};