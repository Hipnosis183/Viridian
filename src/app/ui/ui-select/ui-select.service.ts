import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class UiSelectService {

  selectLabel: string = '';
  selectOptions: boolean = false;

  selectUpdate: any = new Subject();
  $selectValue: any;
  get selectValue() { return this.$selectValue; }
  set selectValue(v: any) {
    this.$selectValue = v;
    this.selectUpdate.next(v);
  }
}
