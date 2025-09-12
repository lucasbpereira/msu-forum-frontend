import { Component, computed, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { iconoirShieldQuestion, iconoirHome, iconoirIconoir } from '@ng-icons/iconoir';
import { TagService, Tags } from './../../pages/tag/tag.service';

@Component({
  selector: 'msuf-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [NgIcon, RouterModule],
  viewProviders: [provideIcons({ iconoirIconoir, iconoirHome, iconoirShieldQuestion })],
  standalone: true
})
export class NavbarComponent {
  private hasInitializedTags = false;

  // Computed signals baseados no TagService
  public readonly tags = computed(() => this.tagService.tags());
  public readonly tagsLoading = computed(() => this.tagService.loading());
  public readonly tagsError = computed(() => this.tagService.error());
  public readonly popularTags = computed(() => this.tagService.popularTags());

  constructor(private tagService: TagService) {
    // Effect para carregar tags apenas uma vez quando o componente é inicializado
    effect(() => {
      const tags = this.tags();
      const loading = this.tagsLoading();
      const error = this.tagsError();

      // Only load if we have no tags, are not currently loading, no error, and haven't initialized yet
      if (tags.length === 0 && !loading && !error && !this.hasInitializedTags) {
        this.hasInitializedTags = true;
        this.tagService.getTags().subscribe({
          next: () => {
            console.log('Tags loaded successfully');
          },
          error: (error) => {
            console.error('Error loading tags:', error);
            // Reset initialization flag on error to allow retry
            this.hasInitializedTags = false;
          }
        });
      }
    }, { allowSignalWrites: true });
  }

}
