// Import Angular elements.
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'vi-loading',
  templateUrl: './vi-loading.component.html',
  styleUrl: './vi-loading.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViLoading {};