import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

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
export class HomepageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onSelectQuestion(question: any) {
    console.log(question)
  }
}
