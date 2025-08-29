import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormatBodyPipe } from '../../pipes/formatBody.pipe';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { LimitCharactersLenghtPipe } from '../../pipes/limitCharactersLenght.pipe';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
})
export class TagComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
