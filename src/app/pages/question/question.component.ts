import { Component, OnInit } from '@angular/core';
import { Questions, QuestionService } from './question.service';
import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  standalone: true,
  imports: [
    HeaderComponent,
    NavbarComponent
  ]
})
export class QuestionComponent implements OnInit {

  lastQuestions!: Questions[];


  constructor(private service: QuestionService) { }

  ngOnInit() {
    this.getLastQuestions()
  }

  getLastQuestions() {
    this.service.getLastQuestions().subscribe(res => {
      console.log(res)
      this.lastQuestions = res;
    })
  }

    onSelectQuestion(question: any) {
    console.log(question)
  }
}
