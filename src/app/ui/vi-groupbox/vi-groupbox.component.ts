// Import Angular elements.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
  public groupboxCenter = input<boolean>(false);
  public groupboxSlim = input<boolean>(false);
};