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
        if (this.selectValue != v) {
          this.selectValue = v;
          this.selectValueChange.emit(v);
          this.selectUpdate.emit(v);
        }
      });
    });
    this.$selectClick = this.select.selectClick.subscribe((v: any) => {
      setTimeout(() => {
        this.selectValue = v;
        this.selectValueChange.emit(v);
        this.selectClick.emit(v);
        this.selectUpdate.emit(v);
      });
    });
  }

  @Input() selectDisabled: boolean = false;
  @Input() selectLabel: string = '';
  @Input() selectValue: any;
  @Output() selectValueChange = new EventEmitter;

  ngOnChanges(c: SimpleChanges) {
    if (c['selectValue']) {
      this.select.selectValueUpdate(c['selectValue'].currentValue);
      setTimeout(() => {
        const options = this.element.nativeElement.querySelector('ui-option');
        if (!options) { this.select.selectLabel = ''; }
      });
    }
  }

  selectOptions(): void {
    this.select.selectOptions = !this.select.selectOptions;
  }

  $selectPosition: boolean = false;

  @HostListener('window:resize')
  onResize() { this.selectPosition(); }
  ngAfterViewInit(): void { this.selectPosition(); }

  selectPosition(): void {
    setTimeout(() => {
      const vh = window.innerHeight;
      const pos = this.element.nativeElement.getBoundingClientRect().bottom;
      this.$selectPosition = (vh - pos) < 256 ? true : false;
    });
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