import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-input',
  templateUrl: './ui-input.component.html',
  styleUrls: ['./ui-input.component.css']
})

export class UiInputComponent {

  @Input() inputDisabled: boolean = false;
  @Input() inputLabel: string = '';
  @Input() inputMax: number = Infinity;
  @Input() inputMin: number = 0;
  @Input() inputPlaceholder: string = '';
  @Input() inputRequired: boolean = true;
  @Input() inputType: string = 'text';
  @Output() inputUpdated = new EventEmitter;
  @Input() inputValue: any;
  @Output() inputValueChange = new EventEmitter;

  inputStepUp(e: any): void {
    e.preventDefault(); e.stopPropagation();
    this.inputValue++;
    this.inputUpdate();
  }

  inputStepDown(e: any): void {
    e.preventDefault(); e.stopPropagation();
    this.inputValue--;
    this.inputUpdate();
  }

  inputUpdate(): void {
    if (this.inputType == 'number') {
      if (this.inputValue > this.inputMax) {
        this.inputValue = this.inputMax;
        setTimeout(() => { this.inputValue = this.inputMax.toString(); });
      }
      if (this.inputValue < this.inputMin) {
        this.inputValue = this.inputMin;
        setTimeout(() => { this.inputValue = this.inputMin.toString(); });
      }
    }
    this.inputValueChange.emit(this.inputValue);
    this.inputUpdated.emit(this.inputValue);
  }
}