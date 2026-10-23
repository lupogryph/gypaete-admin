import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterEmpty',
  standalone: true
})
export class FilterEmptyPipe implements PipeTransform {

  transform(obj: any, ...args: unknown[]): any {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
  }

}
