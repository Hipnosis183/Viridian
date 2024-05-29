// Import Angular elements.
import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberInput',
  standalone: true,
})
export class NumberInputPipe implements PipeTransform {
  transform(numberValue: number, digitsInfo: string = ''): string {
    // Round decimal numbers for input elements.
    return formatNumber(numberValue, 'en-US', digitsInfo).replace(/,/g, '');
  };
};