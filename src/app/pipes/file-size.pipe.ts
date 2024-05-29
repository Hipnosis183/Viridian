// Import Angular elements.
import { Pipe, PipeTransform } from '@angular/core';

// Define unit values.
const unitsShort = ['B', 'KB', 'MB', 'GB'];
const unitsLong = ['Bytes', 'Kilobytes', 'Megabytes', 'Gigabytes'];

@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(sizeInBytes: number, longForm: boolean = false): string {
    // Define unit type.
    const fileUnits: string[] = longForm ? unitsLong : unitsShort;
    // Get the appropriate unit based on file size.
    let fileUnit: number = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
    fileUnit = Math.min(fileUnit, fileUnits.length - 1);
    const formattedUnit: string = fileUnits[fileUnit];
    // Get the updated file size based on the calculated unit.
    const fileSize: number = sizeInBytes / Math.pow(1024, fileUnit);
    const formattedSize: number = Math.round(fileSize * 100) / 100;
    // Return formatted file size.
    return `${formattedSize} ${formattedUnit}`;
  };
};