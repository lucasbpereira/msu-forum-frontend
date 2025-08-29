import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { Questions, QuestionService } from '../../pages/question/question.service';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';


@Component({
  selector: 'msuf-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    FormsModule,
    AutocompleteComponent
  ],
  standalone: true
})
export class HeaderComponent implements OnInit {

  lastQuestions: Questions[] = [];
  filteredQuestions: Questions[] = [];
  @Output() selectedQuestion= new EventEmitter();

  constructor(private questionService: QuestionService) {
  }

  ngOnInit() {
    this.questionService.getLastQuestions().subscribe(data => {
      this.lastQuestions = data;
    });
  }

  onSelectQuestion(question: Questions) {
    this.selectedQuestion.emit(question)
  }
}
