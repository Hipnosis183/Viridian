import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({ name: 'numberInput' })

export class NumberInputPipe implements PipeTransform {

  transform(value: number, digitsInfo: string = ''): string {
    return formatNumber(value, 'en-US', digitsInfo).replace(/,/g, "");
  }
}
