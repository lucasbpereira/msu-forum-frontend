import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitCharactersLenght',
  standalone: true
})
export class LimitCharactersLenghtPipe implements PipeTransform {

  transform(value: string, limit: number = 120, trail: string = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }

}
