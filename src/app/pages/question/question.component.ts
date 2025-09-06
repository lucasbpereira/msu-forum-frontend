import { Component, computed, effect } from '@angular/core';
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
export class QuestionComponent {
  // Computed signals baseados no QuestionService
  public readonly lastQuestions = computed(() => this.service.questions());
  public readonly questionsLoading = computed(() => this.service.loading());
  public readonly questionsError = computed(() => this.service.error());
  public readonly questionsByDate = computed(() => this.service.questionsByDate());

  private hasInitialized = false;

  constructor(private service: QuestionService) {
    // Effect para carregar questões apenas uma vez quando o componente é inicializado
    effect(() => {
      const questions = this.lastQuestions();
      const loading = this.questionsLoading();
      const error = this.questionsError();

      // Only load if we have no questions, are not currently loading, no error, and haven't initialized yet
      if (questions.length === 0 && !loading && !error && !this.hasInitialized) {
        this.hasInitialized = true;
        this.getLastQuestions();
      }
    }, { allowSignalWrites: true });
  }

  getLastQuestions() {
    this.service.getLastQuestions().subscribe({
      next: (res) => {
        console.log('Questões carregadas:', res);
      },
      error: (error) => {
        console.error('Erro ao carregar questões:', error);
      }
    });
  }

  onSelectQuestion(question: Questions) {
    console.log(question);
  }
}
