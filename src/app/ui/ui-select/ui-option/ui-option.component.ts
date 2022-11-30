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

  optionsClick(): void {
    this.select.selectValueClick(this.optionValue);
    this.select.selectLabel = this.optionLabel;
    this.select.selectOptions = false;
  }

  optionsUpdate(): void {
    this.select.selectValueUpdate(this.optionValue);
    this.select.selectLabel = this.optionLabel;
    this.select.selectOptions = false;
  }

  optionLoaded: boolean = false;
  ngAfterContentInit(): void {
    setTimeout(() => { this.optionLoaded = true; });
  }

  ngOnInit(): void {
    if (this.optionSelected || (this.optionValue == this.select.selectValue)) {
      this.optionsUpdate();
    }
  }

  ngOnChanges(): void {
    if (this.optionSelected || (this.optionValue == this.select.selectValue)) {
      this.optionsUpdate();
    }
  }
}