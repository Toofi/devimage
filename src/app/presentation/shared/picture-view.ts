import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { Picture } from '../../domain/word';

/** Affiche l'illustration d'un mot : le fichier s'il charge, sinon l'emoji. */
@Component({
  selector: 'app-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center justify-center' },
  template: `
    @if (showFile()) {
      <img
        class="size-full object-contain"
        [src]="picture().src"
        alt=""
        draggable="false"
        (error)="fileFailed.set(true)"
      />
    } @else {
      <span class="leading-none" [style.font-size]="emojiSize()">{{
        picture().emoji ?? '❓'
      }}</span>
    }
  `,
})
export class PictureView {
  readonly picture = input.required<Picture>();
  /** Taille de l'emoji (CSS), les fichiers remplissent toujours le cadre. */
  readonly emojiSize = input('4rem');

  protected readonly fileFailed = linkedSignal({ source: this.picture, computation: () => false });
  protected readonly showFile = computed(() => !!this.picture().src && !this.fileFailed());
}
