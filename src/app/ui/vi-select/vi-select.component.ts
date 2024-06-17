// Import Angular elements.
import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Import components, services, directives, pipes, types and interfaces.
import { ViSelectService } from './vi-select.service';

@Component({
  selector: 'vi-select',
  templateUrl: './vi-select.component.html',
  styleUrl: './vi-select.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  providers: [ViSelectService],
  host: {
    '(document:click)': 'onClick($event)',
    '(window:resize)': 'onResize()',
  },
})
export class ViSelect {
  constructor(
    // Initialize Angular elements.
    private element: ElementRef,
  ) {
    // Update service select value state.
    effect(() => { this.selectUpdateService(this.select.selectValue()); });
    // Update component select value state.
    effect(() => { this.selectUpdateValue(this.selectValue()); });
  };

  // Inject app services.
  public select = inject(ViSelectService);

  // Define select state.
  public selectClick = output<any>();
  public selectDisabled = input<boolean>(false);
  public selectLabel = input<string>('');
  public selectPosition = signal<boolean>(false);
  public selectUpdate = output<any>();
  public selectValue = model.required<any>();

  // Define lifecycle hooks.
  public ngAfterViewInit(): void { this.selectPositionUpdate(); }

  // Define host event functions.
  public onClick(e: MouseEvent): void { this.selectClose(e); };
  public onResize(): void { this.selectPositionUpdate(); };

  // Close select menu.
  private selectClose(e: MouseEvent): void {
    // Close options menu if clicked outside the select input.
    if ((e.target as HTMLElement).localName == 'label' || !this.element.nativeElement.contains(e.target)) {
      if (this.select.selectOptions()) { this.selectOptions(); }
    }
  };

  // Update select menu open state.
  public selectOptions(): void {
    this.select.selectOptions.update((v) => !v);
  };

  // Update select menu position.
  private selectPositionUpdate(): void {
    // Determine select opening position.
    setTimeout(() => {
      const vh: number = window.innerHeight;
      const pos: number = this.element.nativeElement.getBoundingClientRect().bottom;
      this.selectPosition.set((vh - pos) < 256 ? true : false);
    });
  };

  // Update service select value state.
  private selectUpdateService(selectValue: any): void {
    untracked(() => {
      // Update component select value if the service one has changed.
      if ((selectValue != undefined) && (this.selectValue() != selectValue)) {
        this.selectValue.set(selectValue);
        this.selectUpdate.emit(selectValue);
        if (this.select.selectClick()) { this.selectClick.emit(selectValue); }
      }
    });
  };

  // Update component select value state.
  private selectUpdateValue(selectValue: any): void {
    untracked(() => {
      // Update service select value if the component one has changed.
      if (this.select.selectValue() != selectValue) {
        this.select.selectClick.set(false);
        this.select.selectValue.set(selectValue);
      }
      // Clear select label if there are no options available.
      if (!this.selectDisabled()) {
        setTimeout(() => {
          if (!this.element.nativeElement.querySelector('vi-option')) {
            this.select.selectLabel.set('');
          }
        });
      }
    });
  };
};