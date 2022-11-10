import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'expression' })

export class ExpressionPipe implements PipeTransform {

  transform(value: string): string {
    return new Function(`return ${value}`)();
  }
}
