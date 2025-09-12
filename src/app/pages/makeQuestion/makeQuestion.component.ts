import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Questions } from '../question/question.service';

@Component({
  selector: 'app-makeQuestion',
  templateUrl: './makeQuestion.component.html',
  styleUrls: ['./makeQuestion.component.scss'],
  imports: [
    HeaderComponent,
    NavbarComponent,
    RouterLink,
  ]
})
export class MakeQuestionComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

    onSelectQuestion(question: Questions) {
      console.log(question);
    }
}
