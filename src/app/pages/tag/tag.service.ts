import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap, retry, catchError, of, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Questions } from '../question/question.service';

const API = environment.API_URL;

export interface Tags {
    id: number;
    name: string;
    description: string;
    usageCount: number;
    createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  apiUrl: string = API;
  private lastFailedRequest: number = 0;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  // Signals para gerenciar o estado das tags
  private readonly _tags = signal<Tags[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _retryCount = signal<number>(0);

  // Signals públicos somente leitura
  public readonly tags = this._tags.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly retryCount = this._retryCount.asReadonly();

  // Computed signal para verificar se deve permitir nova tentativa
  public readonly canRetry = computed(() => {
    const now = Date.now();
    return now - this.lastFailedRequest > this.RETRY_DELAY;
  });

  // Computed signals para tags ordenadas e filtradas
  public readonly tagsByUsage = computed(() =>
    [...this._tags()].sort((a, b) => b.usageCount - a.usageCount)
  );

  public readonly popularTags = computed(() =>
    this._tags().filter(tag => tag.usageCount > 0)
  );

  public readonly tagsCount = computed(() => this._tags().length);

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<Tags[]> {
    this.lastFailedRequest = Date.now();
    this._retryCount.update(count => count + 1);

    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Servidor indisponível. Verifique sua conexão.';
          break;
        case 404:
          errorMessage = 'Tags não encontradas.';
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
    console.error('Erro na requisição de tags:', error);

    return of([]);
  }

  getTags(): Observable<Tags[]> {
    // Previne múltiplas requisições simultâneas
    if (this._loading()) {
      return of(this._tags());
    }

    // Verifica se pode fazer nova tentativa após falha
    if (!this.canRetry() && this._error()) {
      return of([]);
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Tags[]>(`${this.apiUrl}tags`).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => {
          console.log(`Tentativa ${retryCount} de carregar tags falhou, tentando novamente em 3s...`);
          return timer(3000);
        }
      }),
      tap({
        next: (tags) => {
          this._tags.set(tags);
          this._loading.set(false);
          this._retryCount.set(0); // Reset retry count on success
          this._error.set(null);
        }
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // Métodos para manipular o estado das tags
  addTag(tag: Tags): void {
    this._tags.update(tags => [...tags, tag]);
  }

  updateTag(updatedTag: Tags): void {
    this._tags.update(tags =>
      tags.map(t => t.id === updatedTag.id ? updatedTag : t)
    );
  }

  clearTags(): void {
    this._tags.set([]);
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
