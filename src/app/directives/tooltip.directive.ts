import { Directive, ElementRef, Input } from '@angular/core';
import tippy from 'tippy.js';

@Directive({ selector: '[tooltip]' })

export class TooltipDirective {

  constructor(private elementRef: ElementRef) { }

  @Input() tooltip!: string;

  ngAfterViewInit(): void {
    if (this.tooltip) {
      tippy(this.elementRef.nativeElement, {
        animation: 'fade',
        content: this.tooltip,
        delay: [800, 200],
        duration: [200, 200],
        theme: 'default',
      });
    }
  }
}
