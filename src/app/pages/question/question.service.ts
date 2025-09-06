import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap, retry, catchError, of, delay, timer, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Questions {
    id: number,
    user_id: number,
    title: string,
    body: string,
    votes: number,
    view_count: number,
    answer_count: number,
    is_solved: boolean,
    created_at: string,
    updated_at: string,
    username: string,
    avatar_url: string,
}

const API = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  apiUrl: string = API;
  private lastFailedRequest: number = 0;
  private readonly RETRY_DELAY = 5000; // 5 seconds
  private readonly MAX_RETRY_ATTEMPTS = 3;

  // Signals para gerenciar o estado das questões
  private readonly _questions = signal<Questions[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _retryCount = signal<number>(0);

  // Signals públicos somente leitura
  public readonly questions = this._questions.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly retryCount = this._retryCount.asReadonly();

  // Computed signal para verificar se deve permitir nova tentativa
  public readonly canRetry = computed(() => {
    const now = Date.now();
    return now - this.lastFailedRequest > this.RETRY_DELAY && this._retryCount() < this.MAX_RETRY_ATTEMPTS;
  });

  // Computed signal para questões ordenadas por data
  public readonly questionsByDate = computed(() =>
    [...this._questions()].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  );

  // Computed signal para contagem de questões
  public readonly questionsCount = computed(() => this._questions().length);

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<Questions[]> {
    this.lastFailedRequest = Date.now();
    this._retryCount.update(count => count + 1);

    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 0:
          errorMessage = 'Servidor indisponível. Verifique sua conexão.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor.';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    this._error.set(errorMessage);
    this._loading.set(false);
    console.error('Erro na requisição:', error);

    return of([]);
  }

  getLastQuestions(): Observable<Questions[]> {
    // Previne múltiplas requisições simultâneas
    if (this._loading()) {
      return of(this._questions());
    }

    // Verifica se pode fazer nova tentativa após falha
    if (!this.canRetry() && this._error()) {
      return of([]);
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Questions[]>(`${this.apiUrl}questions`).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => {
          console.log(`Tentativa ${retryCount} falhou, tentando novamente em 3s...`);
          return timer(3000);
        }
      }),
      tap({
        next: (questions) => {
          this._questions.set(questions);
          this._loading.set(false);
          this._retryCount.set(0); // Reset retry count on success
          this._error.set(null);
        }
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getSearchResults(value: string): Observable<Questions[]> {
    // Previne múltiplas requisições simultâneas
    if (this._loading()) {
      return of([]);
    }

    this._loading.set(true);
    this._error.set(null);

    let params = new HttpParams().set('q', value);

    return this.http.get<Questions[]>(`${this.apiUrl}questions/search`, { params }).pipe(
      retry({
        count: 1,
        delay: () => timer(2000)
      }),
      tap({
        next: () => {
          this._loading.set(false);
        }
      }),
      catchError((error) => {
        this._error.set('Erro ao buscar questões');
        this._loading.set(false);
        console.error('Erro na busca:', error);
        return of([]);
      })
    );
  }

  // Métodos para manipular o estado das questões
  addQuestion(question: Questions): void {
    this._questions.update(questions => [...questions, question]);
  }

  updateQuestion(updatedQuestion: Questions): void {
    this._questions.update(questions =>
      questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
  }

  clearQuestions(): void {
    this._questions.set([]);
  }

  clearError(): void {
    this._error.set(null);
    this._retryCount.set(0);
  }

  // Método para forçar nova tentativa
  forceRetry(): void {
    this._retryCount.set(0);
    this._error.set(null);
    this.lastFailedRequest = 0;
  }

}
