import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { QuestionComponent } from './pages/question/question.component';
import { authGuard } from './config/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomepageComponent,
    pathMatch: 'full'
  },
  {
    path: 'question/:id',
    pathMatch: 'full',
    component: QuestionComponent, canActivate: [authGuard]
  },
];
