// Import Angular elements.
import { Directive, effect, ElementRef, input } from '@angular/core';

// Import Tippy elements.
import tippy, { followCursor, Placement } from 'tippy.js';

// Define types and interfaces.
type TooltipFollow = 'horizontal' | 'vertical';

@Directive({
  selector: '[tooltip]',
  standalone: true,
})
export class TooltipDirective {
  constructor(
    // Initialize Angular elements.
    private elementRef: ElementRef,
  ) {
    // Update Tippy element contents.
    effect(() => {
      if (this.tooltip()) { this.elementRef.nativeElement._tippy.setContent(this.tooltip()); }
    });
  };

  // Define tooltip state.
  public tooltip = input<HTMLElement | string>();
  public tooltipAppend = input<boolean>(false);
  public tooltipDelay = input<[number, number]>([800, 200]);
  public tooltipFollow = input<boolean | TooltipFollow>(false);
  public tooltipHide = input<boolean>(true);
  public tooltipKeep = input<boolean>(false);
  public tooltipOffset = input<[number, number]>([0, 10]);
  public tooltipPlace = input<Placement>('top');
  public tooltipShow = input<boolean>(false);
  public tooltipTrigger = input<string>('mouseenter focus');

  // Define lifecycle hooks.
  public ngAfterViewInit(): void {
    if (this.tooltip()) {
      // Create Tippy instance for input element.
      tippy(this.elementRef.nativeElement, {
        appendTo: () => this.tooltipAppend() ? this.elementRef.nativeElement : document.body,
        animation: 'fade',
        content: this.tooltip(),
        delay: this.tooltipKeep() ? [600, 100] : this.tooltipDelay(),
        duration: [200, 200],
        followCursor: this.tooltipFollow(),
        hideOnClick: this.tooltipKeep() ? false : this.tooltipHide(),
        interactive: this.tooltipKeep() ? true : false,
        interactiveBorder: 10,
        offset: this.tooltipOffset(),
        placement: this.tooltipPlace(),
        plugins: [followCursor],
        showOnCreate: this.tooltipShow(),
        theme: 'tooltip',
        trigger: this.tooltipTrigger(),
      });
    }
  };
};