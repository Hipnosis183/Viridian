// Import Angular elements.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'vi-modal',
  templateUrl: './vi-modal.component.html',
  styleUrl: './vi-modal.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViModal {
  // Define modal state.
  public modalHidden = input<boolean>(false);
};