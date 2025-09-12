import { Component, computed, effect } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Questions, QuestionService } from '../question/question.service';
import { RouterLink } from '@angular/router';
import { DatePipe, JsonPipe } from '@angular/common';
import { AuthService } from '../../config/auth.service';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { LimitCharactersLenghtPipe } from '../../pipes/limitCharactersLenght.pipe';
import { FormatBodyPipe } from '../../pipes/formatBody.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'msuf-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  standalone: true,
  imports: [
    HeaderComponent,
    NavbarComponent,
    RouterLink,
    FormatBodyPipe, LimitCharactersLenghtPipe, DatePipe
  ]
})
export class HomepageComponent {
  public publicApi = environment.API_URL.slice(0, -1);
  private hasInitializedQuestions = false;

  public readonly questions = computed(() => this.questionService.questions());
  public readonly questionsLoading = computed(() => this.questionService.loading());
  public readonly questionsError = computed(() => this.questionService.error());
  public readonly currentUser = computed(() => this.authService.currentUser());

  constructor(private questionService: QuestionService, private authService: AuthService) {
    effect(() => {
      const questions = this.questions();
      const loading = this.questionsLoading();
      const error = this.questionsError();

      // Only load if we have no tags, are not currently loading, no error, and haven't initialized yet
      if (questions.length === 0 && !loading && !error && !this.hasInitializedQuestions) {
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
    }, { allowSignalWrites: true })
  }

  onSelectQuestion(question: Questions) {
    console.log(question);
  }
}
