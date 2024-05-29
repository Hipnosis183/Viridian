// Import Angular elements.
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViSelectService {
  // Define shared select state.
  public selectClick = signal<boolean>(false);
  public selectLabel = signal<string>('');
  public selectOptions = signal<boolean>(false);
  public selectValue = signal<any>(null);
};