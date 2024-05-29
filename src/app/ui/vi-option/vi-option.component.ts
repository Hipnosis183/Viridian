// Import Angular elements.
import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { ViSelectService } from '../vi-select/vi-select.service';

@Component({
  selector: 'vi-option',
  templateUrl: './vi-option.component.html',
  styleUrl: './vi-option.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViOption {
  constructor() {
    // Update selected option on service changes.
    effect(() => { this.optionUpdateSelect(this.select.selectValue()); });
    // Update selected option on component changes.
    effect(() => { this.optionUpdateValue(this.optionValue()); });
  };

  // Inject app services.
  public select = inject(ViSelectService);

  // Define option state.
  public optionLabel = input<string>('');
  public optionSelected = input<boolean>(false);
  public optionValue = input.required<any>();

  // Update select state from option click.
  public optionClick(): void {
    this.select.selectClick.set(true);
    this.select.selectValue.set(this.optionValue());
    this.select.selectOptions.set(false);
  };

  // Update select state.
  private optionUpdate(): void {
    this.select.selectClick.set(false);
    this.select.selectValue.set(this.optionValue());
    this.select.selectOptions.set(false);
  };

  // Update selected option on service changes.
  private optionUpdateSelect(optionValue: any): void {
    untracked(() => {
      // Update parent select label.
      if (this.optionValue() == optionValue) {
        this.select.selectLabel.set(this.optionLabel());
      }
    });
  };

  // Update selected option on component changes.
  private optionUpdateValue(optionValue: any): void {
    untracked(() => {
      // Update parent select data.
      if (this.optionSelected() || (this.select.selectValue() == optionValue)) {
        this.optionUpdate();
      }
    });
  };
};