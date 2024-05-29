// Import Angular elements.
import { ChangeDetectionStrategy, Component, model} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'vi-checkbox',
  templateUrl: './vi-checkbox.component.html',
  styleUrl: './vi-checkbox.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class ViCheckbox {
  // Define checkbox state.
  public checkboxValue = model<boolean>();

  // Update checkbox value state.
  public checkboxUpdateValue(): void {
    this.checkboxValue.update((v) => !v);
  };
};