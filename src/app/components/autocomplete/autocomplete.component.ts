import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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

@Component({
  selector: 'msuf-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  imports: [ReactiveFormsModule, NgIcon, LoadingComponent, FormatBodyPipe, LimitCharactersLenghtPipe, HighlightPipe, RouterModule],
  viewProviders: [provideIcons({ iconoirIconoir, iconoirSearch })]
})
export class AutocompleteComponent implements OnChanges, OnInit {
  myControl = new FormControl('');
  @Input() options: any[] = [];
  @Input() placeholder!: string;
  filteredOptions: any[] = [];
  isFocused = false;
  @Output() selectedOption = new EventEmitter();
  searching = false;

  // cache local para não bater no backend repetidamente
  private cache = new Map<string, any[]>();

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.myControl.valueChanges.pipe(
      debounceTime(400),              // espera 400ms após o usuário parar de digitar
      distinctUntilChanged(),         // evita requisições duplicadas
      tap(value => {
        if(value)
          this.searching = value?.length > 3; // só ativa loading se for pesquisar no backend
      }),
      switchMap(value => {
        if (!value || value.length <= 3) {
          return of(this._filterLocal(value || '')); // pesquisa só local
        }

        // consulta no backend
        return this.questionService.getSearchResults(value).pipe(
          tap(response => {
            this.cache.set(value.toLowerCase(), response); // salva no cache
            this.searching = false;
          })
        );
      })
    ).subscribe(results => {
      this.filteredOptions = results;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions = changes['options'].currentValue || [];
    }
  }

  /** pesquisa somente no array de opções já carregado */
  private _filterLocal(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option =>
      (option.title + option.body).toLowerCase().includes(filterValue)
    );
  }

  selectOption(option: any) {
    this.myControl.setValue(option.title); // exibe o nome no input
    this.filteredOptions = [];
    this.isFocused = false;

    this.selectedOption.emit(option);
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    setTimeout(() => this.isFocused = false, 200);
  }
}
