import { Component, ElementRef, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
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

  $selectClick: any;
  $selectUpdate: any;
  @Output() selectClick = new EventEmitter;
  @Output() selectUpdate = new EventEmitter;

  ngOnDestroy(): void {
    this.$selectClick.unsubscribe();
    this.$selectUpdate.unsubscribe();
  }

  ngOnInit(): void {
    this.$selectUpdate = this.select.selectUpdate.subscribe((v: any) => {
      setTimeout(() => {
        this.selectValue = v;
        this.selectValueChange.emit(v);
        this.selectUpdate.emit(v);
      });
    });
    this.$selectClick = this.select.selectClick.subscribe((v: any) => {
      setTimeout(() => {
        this.selectValue = v;
        this.selectValueChange.emit(v);
        this.selectClick.emit(v);
      });
    });
  }

  @Input() selectLabel: string = '';
  @Input() selectValue: any;
  @Output() selectValueChange = new EventEmitter;

  ngOnChanges(c: SimpleChanges) {
    if (c['selectValue']) {
      this.select.selectValue = c['selectValue'].currentValue;
    }
  }

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