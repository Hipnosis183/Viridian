// Import Angular elements.
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'frameRate',
  standalone: true,
})
export class FrameRatePipe implements PipeTransform {
  transform(frameRateValue: string): string {
    // Parse framerate string as a math operation.
    return new Function(`return ${frameRateValue}`)().toFixed(2);
  };
};