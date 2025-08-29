import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(text: string, search: string | null): string {
    if (!search || search.length < 3) {
      return text;
    }

    const pattern = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(pattern, 'gi');

    // Dividimos o texto em partes: fora e dentro de []
    return text.replace(/\[[^\]]*\]|[^[]+/g, (part) => {
      // Se for um trecho entre colchetes, devolve sem highlight
      if (part.startsWith('[') && part.endsWith(']')) {
        return part;
      }
      // Fora de colchetes → aplica highlight normalmente
      return part.replace(regex, match => `<b>${match}</b>`);
    });
  }

}
