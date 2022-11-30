import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class UiSelectService {

  selectLabel: string = '';
  selectOptions: boolean = false;
  selectValue: any;

  selectClick: any = new Subject();
  selectValueClick(v: any) {
    this.selectValue = v;
    this.selectClick.next(v);
  }

  selectUpdate: any = new Subject();
  selectValueUpdate(v: any) {
    this.selectValue = v;
    this.selectUpdate.next(v);
  }
}
