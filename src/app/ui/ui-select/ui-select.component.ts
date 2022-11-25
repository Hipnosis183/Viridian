import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UiSelectService } from './ui-select.service';

@Component({
  selector: 'ui-select',
  templateUrl: './ui-select.component.html',
  styleUrls: ['./ui-select.component.css'],
  providers: [UiSelectService]
})

export class UiSelectComponent {

  constructor(
    private element: ElementRef,
    public select: UiSelectService,
  ) { }

  selectUpdate: any;
  @Output() selectUpdated = new EventEmitter;

  ngOnDestroy(): void { this.selectUpdate.unsubscribe(); }
  ngOnInit(): void {
    this.selectUpdate = this.select.selectUpdate.subscribe(() => {
      setTimeout(() => {
        this.selectValueChange.emit(this.select.selectValue);
        this.selectUpdated.emit(this.select.selectValue);
      });
    });
  }

  @Input() selectLabel: string = '';
  @Input()
  get selectValue() { return this.select.selectValue; }
  set selectValue(v: any) { this.select.selectValue = v; }
  @Output() selectValueChange = new EventEmitter;

  selectOptions(): void {
    this.select.selectOptions = !this.select.selectOptions;
  }

  @HostListener('document:click', ['$event'])
  selectOutside(event: any) {
    if (!this.element.nativeElement.contains(event.target)) {
      if (this.select.selectOptions) {
        this.selectOptions();
      }
    }
  }
}