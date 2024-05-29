// Import Angular elements.
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  // Find value in object matching the given key.
  public findValueByKey(objectInput: Object, objectKey: string): any {
    // Return if the object key was found.
    if (objectInput[objectKey as keyof Object]) {
      return objectInput[objectKey as keyof Object];
    }
    // Start recursive search for object key.
    for (let k in objectInput) {
      if (objectInput[k as keyof Object] && typeof objectInput[k as keyof Object] == 'object') {
        const v = this.findValueByKey(objectInput[k as keyof Object], objectKey);
        if (v) { return v; }
      }
    } return false;
  };

  // Get element from object matching the given key.
  public findValueInKey(objectInput: Object, objectKey: string): any {
    return Object.keys(objectInput).filter((v) => v.indexOf(objectKey) >= 0);
  };
};