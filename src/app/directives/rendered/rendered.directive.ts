// Import Angular elements.
import { Directive, ElementRef, output } from '@angular/core';

@Directive({
  selector: '[rendered]',
  standalone: true,
})
export class RenderedDirective {
  constructor(
    // Initialize Angular elements.
    private elementRef: ElementRef,
  ) {};

  // Define rendered state.
  public rendered = output<HTMLElement>();

  // Define lifecycle hooks.
  public ngOnInit(): void {
    // Wait for component to finish loading.
    this.rendered.emit(this.elementRef.nativeElement);
  };
};