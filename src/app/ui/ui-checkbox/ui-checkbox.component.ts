import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-checkbox',
  templateUrl: './ui-checkbox.component.html',
  styleUrls: ['./ui-checkbox.component.css']
})

export class UiCheckboxComponent {

  @Input() value: any;
  @Output() valueChange = new EventEmitter;

  changeValue(): void {
    this.value = !this.value;
    this.valueChange.emit(this.value);
  }
}
