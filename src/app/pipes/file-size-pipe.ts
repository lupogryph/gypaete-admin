import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {
  transform(value: number | undefined): string {
    const units = ['KB', 'MB', 'GB'];
    if (value) {
      let scaledValue = value;
      let unitIndex = 0;

      while (Math.abs(scaledValue) >= 1024 && unitIndex < units.length - 1) {
        scaledValue /= 1024;
        unitIndex++;
      }

      return `${Math.ceil(scaledValue)} ${units[unitIndex]}`;
    } else {
      return '';
    }
  }
}
