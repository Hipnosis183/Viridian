// Import Angular elements.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Define types and interfaces.
type GroupboxPosition = 'left' | 'center' | 'right';

@Component({
  selector: 'vi-groupbox',
  templateUrl: './vi-groupbox.component.html',
  styleUrl: './vi-groupbox.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViGroupbox {
  // Define groupbox state.
  public groupboxLabel = input<string>('');
  public groupboxPosition = input<GroupboxPosition>('left');
};