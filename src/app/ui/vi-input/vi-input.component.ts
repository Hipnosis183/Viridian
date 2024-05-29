// Import Angular elements.
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Define types and interfaces.
type InputType = 'text' | 'number';

@Component({
  selector: 'vi-input',
  templateUrl: './vi-input.component.html',
  styleUrl: './vi-input.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class ViInput {
  // Define input state.
  public inputDisabled = input<boolean>(false);
  public inputLabel = input<string>('');
  public inputMax = input<number>(Infinity);
  public inputMin = input<number>(0);
  public inputPlaceholder = input<string>('');
  public inputRequired = input<boolean>(true);
  public inputType = input<InputType>('text');
  public inputUpdated = output<string>();
  public inputValue = model.required<string | number>();

  // Handle input click event.
  public inputClick(e: MouseEvent): void {
    e.preventDefault(); e.stopPropagation();
  };

  // Increase input value.
  public inputStepUp(e: MouseEvent): void {
    e.preventDefault(); e.stopPropagation();
    // Update input value state.
    this.inputValue.update((v) => +v + 1);
    this.inputUpdate();
  };

  // Decrease input value.
  public inputStepDown(e: MouseEvent): void {
    e.preventDefault(); e.stopPropagation();
    // Update input value state.
    this.inputValue.update((v) => +v - 1);
    this.inputUpdate();
  };

  // Update input value state.
  public inputUpdate(): void {
    if (this.inputType() == 'number') {
      // Keep input value within boundaries.
      if (+this.inputValue() > this.inputMax()) {
        this.inputValue.set(this.inputMax());
        setTimeout(() => { this.inputValue.set(this.inputMax().toString()); });
      }
      if (+this.inputValue() < this.inputMin()) {
        this.inputValue.set(this.inputMin());
        setTimeout(() => { this.inputValue.set(this.inputMin().toString()); });
      }
    } this.inputUpdated.emit(this.inputValue().toString());
  };
};