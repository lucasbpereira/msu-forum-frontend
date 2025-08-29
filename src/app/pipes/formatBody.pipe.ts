import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatBody'
})
export class FormatBodyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

 transform(value: string): SafeHtml {
    if (!value) return value;

    const parsed = value
      .replace(/\[paragraph\]/g, '<p>')
      .replace(/\[\/paragraph\]/g, '</p>');

    return this.sanitizer.bypassSecurityTrustHtml(parsed);
  }
}
