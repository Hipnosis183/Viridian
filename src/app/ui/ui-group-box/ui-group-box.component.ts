import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-group-box',
  templateUrl: './ui-group-box.component.html',
  styleUrls: ['./ui-group-box.component.css']
})

export class UiGroupBoxComponent {

  @Input() groupBoxLabel: string = '';
  @Input() groupBoxCenter: boolean = false;
  @Input() groupBoxSlim: boolean = false;
}
