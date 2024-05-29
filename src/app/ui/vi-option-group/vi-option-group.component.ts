// Import Angular elements.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'vi-option-group',
  templateUrl: './vi-option-group.component.html',
  styleUrl: './vi-option-group.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViOptionGroup {
  // Define option group state.
  public optionLabel = input<string>('');
};