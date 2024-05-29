// Import Angular elements.
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(durationSeconds: number, durationMs: boolean = false): string {
    // Format duration in seconds to HH:MM:SS(.MS).
    return new Date(Math.round(durationSeconds * 1000)).toISOString().substring(11, (durationMs ? 23 : 19));
  };
};