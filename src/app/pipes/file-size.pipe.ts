import { Pipe, PipeTransform } from '@angular/core';

const unitsShort = ['B', 'KB', 'MB', 'GB'];
const unitsLong = ['Bytes', 'Kilobytes', 'Megabytes', 'Gigabytes'];

@Pipe({ name: 'fileSize' })

export class FileSizePipe implements PipeTransform {

  transform(sizeInBytes: number, longForm: boolean = false): string {
    const units = longForm ? unitsLong : unitsShort;

    let power = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
    power = Math.min(power, units.length - 1);

    const size = sizeInBytes / Math.pow(1024, power);
    const formattedSize = Math.round(size * 100) / 100;
    const unit = units[power];

    return `${formattedSize} ${unit}`;
  }
}
