import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {

  transform(seconds: number): string {
    return new Date(seconds * 1000).toISOString().substring(11, 19);
  }
}
