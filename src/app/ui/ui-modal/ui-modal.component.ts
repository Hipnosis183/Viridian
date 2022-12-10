import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-modal',
  templateUrl: './ui-modal.component.html',
  styleUrls: ['./ui-modal.component.css']
})

export class UiModalComponent {
  
  @Input() modalHidden: boolean = false;
}