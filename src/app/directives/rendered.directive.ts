import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';

@Directive({ selector: '[rendered]' })

export class RenderedDirective {

  constructor(private elementRef: ElementRef){}

  @Output() rendered = new EventEmitter;

  ngOnInit(): void {
    this.rendered.emit(this.elementRef.nativeElement);
  }
}
