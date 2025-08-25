import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'msuf-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  standalone: true,
  imports: [
    HeaderComponent
  ]
})
export class HomepageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
