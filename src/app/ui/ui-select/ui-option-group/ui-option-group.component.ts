import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-option-group',
  templateUrl: './ui-option-group.component.html',
  styleUrls: ['./ui-option-group.component.css']
})

export class UiOptionGroupComponent {

  @Input() optionLabel: string = '';
}