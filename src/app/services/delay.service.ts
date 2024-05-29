// Import Angular elements.
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DelayService {
  // Debounce function.
  public debounce(functionInput: Function, delayTime: number) {
    // Set delay timer.
    let delayTimer: NodeJS.Timeout;
    // Debounced function.
    return (...args: any[]) => {
      // Reset timer (cancel timeout function).
      clearTimeout(delayTimer);
      // Set timeout function.
      delayTimer = setTimeout(() => { functionInput.apply(this, args); }, delayTime);
    };
  };

  // Throttle function.
  public throttle(functionInput: Function, delayTime: number) {
    // Set waiting state.
    let stateWaiting: boolean = false;
    // Throttled function.
    return (...args: any[]) => {
      if (!stateWaiting) {
        functionInput.apply(this, args);
        // Start waiting.
        stateWaiting = true;
        // Set timeout function.
        setTimeout(() => { stateWaiting = false; }, delayTime);
      }
    };
  };
};