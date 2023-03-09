import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import tippy, { followCursor } from 'tippy.js';

@Directive({ selector: '[tooltip]' })

export class TooltipDirective {

  constructor(private elementRef: ElementRef) { }

  @Input() tooltip!: any;
  @Input() tooltipDelay?: any = [800, 200];
  @Input() tooltipFollow?: any = false;
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
        delay: this.tooltipKeep ? [400, 100] : this.tooltipDelay,
        duration: [200, 200],
        followCursor: this.tooltipFollow,
        hideOnClick: this.tooltipKeep ? false : true,
        interactive: this.tooltipKeep ? true : false,
        interactiveBorder: 10,
        offset: this.tooltipOffset,
        placement: this.tooltipPlace,
        plugins: [followCursor],
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
