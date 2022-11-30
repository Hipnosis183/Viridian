import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-input',
  templateUrl: './ui-input.component.html',
  styleUrls: ['./ui-input.component.css']
})

export class UiInputComponent {

  @Input() inputLabel: string = '';
  @Input() inputPlaceholder: string = '';
  @Input() inputRequired: boolean = true;
  @Input() inputType: string = 'text';
  @Output() inputUpdated = new EventEmitter;
  @Input() inputValue: any;
  @Output() inputValueChange = new EventEmitter;

  inputUpdate(): void {
    this.inputValueChange.emit(this.inputValue);
    this.inputUpdated.emit(this.inputValue);
  }
}