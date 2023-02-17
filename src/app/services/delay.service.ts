import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class DelayService {

  debounce(func: Function, wait: number) {
    // Set timer.
    let timer: any;
    // Debounced function.
    return (...args: any[]) => {
      // Reset timer (cancel timeout function).
      clearTimeout(timer);
      // Set timeout function.
      timer = setTimeout(() => { func.apply(this, args) }, wait);
    }
  }

  throttle(func: Function, wait: number) {
    // Set waiter.
    let waiting: boolean = false;
    // Throttled function.
    return (...args: any[]) => {
      if (!waiting) {
        func.apply(this, args);
        // Start waiting.
        waiting = true;
        // Set timeout function.
        setTimeout(() => { waiting = false }, wait);
      }
    }
  }
}
