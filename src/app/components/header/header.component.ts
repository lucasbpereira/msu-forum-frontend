import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { Questions, QuestionService } from '../../pages/question/question.service';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { WalletComponent } from '../wallet/wallet.component';
import { WalletService } from '../wallet/wallet.service';



@Component({
  selector: 'msuf-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    FormsModule,
    AutocompleteComponent,
    WalletComponent
],
  standalone: true
})
export class HeaderComponent implements OnInit {

  lastQuestions: Questions[] = [];
  filteredQuestions: Questions[] = [];
  @Output() selectedQuestion= new EventEmitter();

  constructor(private questionService: QuestionService, private walletService: WalletService) {
    walletService.walletState$.subscribe(data => {
      console.log(data)
    })
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
