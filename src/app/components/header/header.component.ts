import { Component, EventEmitter, Output, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
export class HeaderComponent {
  @Output() selectedQuestion = new EventEmitter<Questions>();

  private hasInitializedQuestions = false;

  // Computed signals baseados nos serviços
  public readonly questions = computed(() => this.questionService.questions());
  public readonly questionsLoading = computed(() => this.questionService.loading());
  public readonly walletState = computed(() => this.walletService.walletState());

  constructor(
    private questionService: QuestionService,
    private walletService: WalletService
  ) {
    // Effect para carregar questões apenas uma vez quando o componente é inicializado
    effect(() => {
      const questions = this.questions();
      const loading = this.questionsLoading();

      // Only load if we have no questions, are not currently loading, and haven't initialized yet
      if (questions.length === 0 && !loading && !this.hasInitializedQuestions) {
        this.hasInitializedQuestions = true;
        this.questionService.getLastQuestions().subscribe({
          next: () => {
            console.log('Questions loaded successfully');
          },
          error: (error) => {
            console.error('Error loading questions:', error);
            // Reset initialization flag on error to allow retry
            this.hasInitializedQuestions = false;
          }
        });
      }
    }, { allowSignalWrites: true });

    // Effect para reagir a mudanças no estado da wallet
    effect(() => {
      const wallet = this.walletState();
      console.log('Wallet state changed:', wallet);
    });
  }

  onSelectQuestion(question: Questions) {
    this.selectedQuestion.emit(question);
  }
}
