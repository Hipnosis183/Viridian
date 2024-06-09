// Import Angular elements.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Define types and interfaces.
type LoadingTheme = 'light' | 'dark' | '';

@Component({
  selector: 'vi-loading',
  templateUrl: './vi-loading.component.html',
  styleUrl: './vi-loading.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViLoading {
  // Define button state.
  public loadingTheme = input<LoadingTheme>('');
};