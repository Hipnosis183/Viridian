// Import Angular elements.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { FormatKeyPipe } from './vi-keys.pipe';

@Component({
  selector: 'vi-keys',
  templateUrl: './vi-keys.component.html',
  styleUrl: './vi-keys.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatKeyPipe],
})
export class ViKeys {
  // Define button state.
  public keysCenter = input<boolean>(false);
  public keysKeys = input<string[]>([]);
  public keysText = input<string | null>(null);
};