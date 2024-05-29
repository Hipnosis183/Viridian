// Import Angular elements.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { TooltipDirective } from '@app/directives';

// Define types and interfaces.
type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'light' | 'dark' | 'darker' | '';
type ButtonStyle = 'default' | 'outlined';

@Component({
  selector: 'vi-button',
  templateUrl: './vi-button.component.html',
  styleUrl: './vi-button.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective],
})
export class ViButton {
  // Define button state.
  public buttonColor = input<ButtonColor>('');
  public buttonIcon = input<string>('');
  public buttonIconClass = input<string>('');
  public buttonStyle = input<ButtonStyle>('default');
  public buttonText = input<string>('');
  public buttonToggle = input<boolean>(false);
  public buttonTooltip = input<string>('');
};