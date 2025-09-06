import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  standalone: true,
  imports: [
    RouterModule
  ]
})
export class TagComponent {
  // Simplified component without lifecycle hooks
}
