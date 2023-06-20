import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-checkbox',
  templateUrl: './ui-checkbox.component.html',
  styleUrls: ['./ui-checkbox.component.css']
})

export class UiCheckboxComponent {

  @Input() checkboxValue: any;
  @Output() checkboxValueChange = new EventEmitter;

  changeValue(): void {
    this.checkboxValue = !this.checkboxValue;
    this.checkboxValueChange.emit(this.checkboxValue);
  }
}
