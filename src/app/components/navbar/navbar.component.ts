import { TagService, Tags } from './../../pages/tag/tag.service';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { iconoirHome, iconoirIconoir } from '@ng-icons/iconoir';
import { FormatBodyPipe } from '../../pipes/formatBody.pipe';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { LimitCharactersLenghtPipe } from '../../pipes/limitCharactersLenght.pipe';

@Component({
  selector: 'msuf-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [NgIcon, RouterModule],
  viewProviders: [provideIcons({ iconoirIconoir, iconoirHome })],
})
export class NavbarComponent implements OnInit {

  tagList: Tags[] = [];

  constructor(private tagService: TagService) { }

  ngOnInit() {
    this.tagService.getTags().subscribe(response => {
      this.tagList = response
    })
  }

}
