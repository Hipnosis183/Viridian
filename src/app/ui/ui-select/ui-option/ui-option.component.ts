import { Component, Input } from '@angular/core';
import { UiSelectService } from '../ui-select.service';

@Component({
  selector: 'ui-option',
  templateUrl: './ui-option.component.html',
  styleUrls: ['./ui-option.component.css']
})

export class UiOptionComponent {

  constructor(public select: UiSelectService) { }

  @Input() optionLabel: string = '';
  @Input() optionSelected: boolean = false;
  @Input() optionValue: any;

  optionsSelect(): void {
    this.select.selectLabel = this.optionLabel;
    this.select.selectValue = this.optionValue;
    this.select.selectOptions = false;
  }

  ngOnInit(): void {
    if (this.optionSelected) { this.optionsSelect(); }
  }

  ngOnChanges(): void {
    if (this.optionSelected) { this.optionsSelect(); }
  }
}