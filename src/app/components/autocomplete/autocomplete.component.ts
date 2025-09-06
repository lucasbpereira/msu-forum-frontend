import { Component, EventEmitter, Input, Output, signal, computed, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { iconoirSearch, iconoirIconoir } from '@ng-icons/iconoir';
import { Questions, QuestionService } from '../../pages/question/question.service';
import { LoadingComponent } from '../loading/loading.component';
import { FormatBodyPipe } from '../../pipes/formatBody.pipe';
import { LimitCharactersLenghtPipe } from '../../pipes/limitCharactersLenght.pipe';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'msuf-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIcon,
    LoadingComponent,
    FormatBodyPipe,
    LimitCharactersLenghtPipe,
    HighlightPipe,
    RouterModule
  ],
  viewProviders: [provideIcons({ iconoirIconoir, iconoirSearch })],
  standalone: true
})
export class AutocompleteComponent {
  myControl = new FormControl('');

  @Input() options: Questions[] = [];
  @Input() placeholder!: string;
  @Output() selectedOption = new EventEmitter<Questions>();

  // Signals para gerenciar estado local
  private readonly _filteredOptions = signal<Questions[]>([]);
  private readonly _isFocused = signal<boolean>(false);
  private readonly _searching = signal<boolean>(false);

  // Signals públicos somente leitura
  public readonly filteredOptions = this._filteredOptions.asReadonly();
  public readonly isFocused = this._isFocused.asReadonly();
  public readonly searching = this._searching.asReadonly();

  // Signal para converter o valor do FormControl
  private readonly searchValue = toSignal(this.myControl.valueChanges, { initialValue: '' });

  // Cache local para não bater no backend repetidamente
  private cache = new Map<string, Questions[]>();

  constructor(private questionService: QuestionService) {
    // Effect para reagir a mudanças no valor de busca
    effect(() => {
      const value = this.searchValue() || '';
      this.handleSearch(value);
    });

    // Effect para reagir a mudanças nas opções de input
    effect(() => {
      if (this.options.length > 0) {
        this._filteredOptions.set(this.options);
      }
    });
  }

  private handleSearch(value: string): void {
    if (!value || value.length <= 3) {
      // Pesquisa local
      const localResults = this._filterLocal(value);
      this._filteredOptions.set(localResults);
      this._searching.set(false);
      return;
    }

    // Verifica cache primeiro
    const cached = this.cache.get(value.toLowerCase());
    if (cached) {
      this._filteredOptions.set(cached);
      this._searching.set(false);
      return;
    }

    // Busca no backend
    this._searching.set(true);
    this.questionService.getSearchResults(value).subscribe({
      next: (results) => {
        this.cache.set(value.toLowerCase(), results);
        this._filteredOptions.set(results);
        this._searching.set(false);
      },
      error: (error) => {
        console.error('Erro na busca:', error);
        this._searching.set(false);
      }
    });
  }



  /** pesquisa somente no array de opções já carregado */
  private _filterLocal(value: string): Questions[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option =>
      (option.title + option.body).toLowerCase().includes(filterValue)
    );
  }

  selectOption(option: Questions) {
    this.myControl.setValue(option.title); // exibe o nome no input
    this._filteredOptions.set([]);
    this._isFocused.set(false);

    this.selectedOption.emit(option);
  }

  onFocus() {
    this._isFocused.set(true);
  }

  onBlur() {
    setTimeout(() => this._isFocused.set(false), 200);
  }
}
