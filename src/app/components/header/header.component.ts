import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';
import { Questions, QuestionService } from './question.service';

@Component({
  selector: 'msuf-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  standalone: true
})
export class HeaderComponent implements OnInit {
  myControl = new FormControl<string | Questions>('');
  options: Questions[] = [];
  filteredOptions!: Observable<Questions[]>;

  constructor(private questionService: QuestionService) {
  }

  ngOnInit() {
    this.questionService.getLastQuestions().subscribe(data => {
      console.log(data)
      this.options = data;
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const title = typeof value === 'string' ? value : value?.title;
        return title ? this._filter(title as string) : this.options.slice();
      }),
    );
  }

  displayFn(user: Questions): string {
    return user && user.title ? user.title : '';
  }

  private _filter(title: string): Questions[] {
    const filterValue = title.toLowerCase();

    return this.options.filter(option => option.title.toLowerCase().includes(filterValue));
  }

}
