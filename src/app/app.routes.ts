import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { QuestionComponent } from './pages/question/question.component';

export const routes: Routes = [
  {
    path: '',
    component: HomepageComponent,
    pathMatch: 'full'
  },
  {
    path: 'question/:id',
    component: QuestionComponent,
    pathMatch: 'full'
  },
];
