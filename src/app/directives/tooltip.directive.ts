import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import tippy from 'tippy.js';

@Directive({ selector: '[tooltip]' })

export class TooltipDirective {

  constructor(private elementRef: ElementRef) { }

  @Input() tooltip!: any;
  @Input() tooltipKeep?: boolean = false;
  @Input() tooltipOffset?: any = [0, 10];
  @Input() tooltipPlace?: any = 'top';
  @Input() tooltipTheme?: string = 'tooltip-dark';
  @Input() tooltipTrigger?: string = 'mouseenter focus';

  ngAfterViewInit(): void {
    if (this.tooltip) {
      tippy(this.elementRef.nativeElement, {
        appendTo: () => document.body,
        animation: 'fade',
        content: this.tooltip,
        delay: this.tooltipKeep ? [0, 0] : [800, 200],
        duration: [200, 200],
        hideOnClick: this.tooltipKeep ? false : true,
        interactive: this.tooltipKeep ? true : false,
        interactiveBorder: 80,
        moveTransition: 'transform 0.2s linear',
        offset: this.tooltipOffset,
        placement: this.tooltipPlace,
        theme: this.tooltipTheme,
        trigger: this.tooltipTrigger,
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tooltip'].previousValue) {
      this.elementRef.nativeElement._tippy.setContent(this.tooltip);
    }
  }
}
