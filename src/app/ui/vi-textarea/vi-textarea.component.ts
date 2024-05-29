// Import Angular elements.
import { ChangeDetectionStrategy, Component, ElementRef, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'vi-textarea',
  templateUrl: './vi-textarea.component.html',
  styleUrl: './vi-textarea.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class ViTextarea {
  constructor(
    // Initialize Angular elements.
    private element: ElementRef,
  ) {};

  // Define textarea state.
  public textareaValue = model<string>('');

  // Define lifecycle hooks.
  public ngAfterViewInit(): void { this.textareaUpdate(); };

  // Update textarea display state.
  public textareaUpdate(): void {
    setTimeout(() => {
      // Update textarea element height to fit contents.
      const textareaElement: HTMLElement = this.element.nativeElement.children[0];
      textareaElement.style.height = 'auto';
      textareaElement.style.height = textareaElement.scrollHeight + 'px';
    });
  };
};