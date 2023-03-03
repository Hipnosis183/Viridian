import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import tippy from 'tippy.js';

@Directive({ selector: '[dropdown]' })

export class DropdownDirective {

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) { }

  @Input() dropdown!: HTMLElement;
  @Input() dropdownDelay: any = [800, 200];
  @Input() dropdownHover: boolean = false;
  @Input() dropdownOffset: any = [0, 34];
  @Input() dropdownPlace: any = 'top';
  @Input() dropdownTheme?: string = 'dropdown';
  @Input() dropdownTarget: any = null;

  ngAfterViewInit(): void {
    // Create Tippy instance.
    tippy(this.elementRef.nativeElement, {
      animation: 'fade',
      content: this.dropdown,
      delay: this.dropdownHover ? this.dropdownDelay : 0,
      duration: [200, 200],
      interactive: true,
      offset: this.dropdownOffset,
      placement: this.dropdownPlace,
      theme: this.dropdownTheme,
      trigger: this.dropdownHover ? 'mouseenter focus' : 'click',
      triggerTarget: this.dropdownTarget,
    });
    // Attach listener to close dropdowns upon clicking inside.
    if (!this.dropdownHover) {
      this.renderer.listen(this.elementRef.nativeElement._tippy.popper, 'click', (e) => {
        if (e.target.getAttribute('dropdownIgnore') == null) {
          this.elementRef.nativeElement._tippy.hide();
        }
      });
    }
  }
}
