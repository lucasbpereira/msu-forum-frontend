import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Questions } from '../question/question.service';

@Component({
  selector: 'msuf-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  standalone: true,
  imports: [
    HeaderComponent,
    NavbarComponent
  ]
})
export class HomepageComponent {

  onSelectQuestion(question: Questions) {
    console.log(question);
  }
}
