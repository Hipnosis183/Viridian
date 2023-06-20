import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-textarea',
  templateUrl: './ui-textarea.component.html',
  styleUrls: ['./ui-textarea.component.css']
})

export class UiTextareaComponent {

  constructor(private element: ElementRef) { }

  @Output() textareaUpdated = new EventEmitter;
  @Input() textareaValue: string = '';
  @Output() textareaValueChange = new EventEmitter;

  textareaUpdate() {
    const t: any = this.element.nativeElement.children[0];
    t.style.height = 'auto';
    t.style.height = t.scrollHeight + 'px';
    this.textareaUpdated.emit(this.textareaValue);
  }

  ngAfterViewInit(): void {
    setTimeout(() => { this.textareaUpdate(); });
  }
}