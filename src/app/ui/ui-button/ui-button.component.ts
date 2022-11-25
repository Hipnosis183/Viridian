import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-button',
  templateUrl: './ui-button.component.html',
  styleUrls: ['./ui-button.component.css']
})

export class UiButtonComponent {

  @Input() buttonColor: string = '';
  @Input() buttonIcon: string = '';
  @Input() buttonIconClass: string = '';
  @Input() buttonToggle: boolean = false;

  @Input()
  get buttonBorder() { return this.$buttonBorder; }
  set buttonBorder(v: any) { this.$buttonBorder = 'bordered'; }
  $buttonBorder: string = '';

  @Input()
  get buttonOutline() { return this.$buttonOutline; }
  set buttonOutline(v: any) { this.$buttonOutline = 'outlined'; }
  $buttonOutline: string = 'default';
}