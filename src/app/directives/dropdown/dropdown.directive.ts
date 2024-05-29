// Import Angular elements.
import { Directive, ElementRef, input, Renderer2 } from '@angular/core';

// Import Tippy elements.
import tippy, { Placement } from 'tippy.js';

@Directive({
  selector: '[dropdown]',
  standalone: true,
})
export class DropdownDirective {
  constructor(
    // Initialize Angular elements.
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {};

  // Define dropdown state.
  public dropdown = input.required<HTMLElement>();
  public dropdownDelay = input<[number, number]>([800, 200]);
  public dropdownHover = input<boolean>(false);
  public dropdownOffset = input<[number, number]>([0, 34]);
  public dropdownPlace = input<Placement>('top');
  public dropdownTarget = input<Element | null>(null);

  // Define lifecycle hooks.
  public ngAfterViewInit(): void {
    // Create Tippy instance.
    tippy(this.elementRef.nativeElement, {
      animation: 'fade',
      content: this.dropdown(),
      delay: this.dropdownHover() ? this.dropdownDelay() : 0,
      duration: [200, 200],
      interactive: true,
      offset: this.dropdownOffset(),
      placement: this.dropdownPlace(),
      theme: 'dropdown',
      trigger: this.dropdownHover() ? 'mouseenter focus' : 'click',
      triggerTarget: this.dropdownTarget(),
    });
    // Attach listener to close dropdowns upon clicking inside.
    if (!this.dropdownHover()) {
      this.renderer.listen(this.elementRef.nativeElement._tippy.popper, 'click', (e) => {
        if (e.target.getAttribute('dropdownIgnore') == null) {
          this.elementRef.nativeElement._tippy.hide();
        }
      });
    }
  };
};