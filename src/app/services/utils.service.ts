import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class UtilsService {

  findValueByKey(o: any, k: string): any {
    if (o[k]) { return o[k]; }
    for (let key in o) {
      if (o[key] && typeof o[key] == 'object') {
        const v = this.findValueByKey(o[key], k);
        if (v) { return v; }
      }
    } return false;
  }

  findValueInKey(o: any, k: string): any {
    return Object.keys(o).filter((e) => e.indexOf(k) >= 0);
  }
}
