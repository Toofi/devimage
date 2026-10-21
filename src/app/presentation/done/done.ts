import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SessionStore } from '../../application/session.store';
import { withArticle } from '../../domain/word';
import { PictureView } from '../shared/picture-view';
import { RoughMark } from '../shared/rough-mark';

@Component({
  selector: 'app-done',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PictureView, RoughMark],
  template: `
    <main
      class="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-4 py-10 text-center"
    >
      <div class="flex flex-col items-center gap-3">
        <span class="text-6xl" aria-hidden="true">🌟</span>
        <h1
          class="inline-block font-display text-6xl font-black text-ochre"
          appRoughMark="circle"
          [pad]="14"
        >
          Bravo !
        </h1>
        <p class="mt-3 font-hand text-3xl">
          Tu as lu {{ total() }} {{ total() > 1 ? 'mots' : 'mot' }} !
        </p>
      </div>

      @if (session.struggles().length) {
        <section class="index-card w-full p-5 text-left" aria-labelledby="revoir">
          <h2 id="revoir" class="font-hand text-3xl">Ceux qui ont demandé un peu plus d'essais</h2>
          <ul class="mt-3 flex flex-col gap-2" role="list">
            @for (struggle of session.struggles(); track struggle.word.id) {
              <li class="flex items-center gap-3 border-b border-dashed border-dot pb-1">
                <app-picture
                  class="size-12 shrink-0"
                  [picture]="struggle.word.picture"
                  emojiSize="2.5rem"
                />
                <span class="font-read text-3xl font-bold">{{ withArticle(struggle.word) }}</span>
                <span
                  class="ml-auto font-hand text-2xl tracking-widest text-pen"
                  [attr.aria-label]="struggle.misses + ' essais en plus'"
                >
                  {{ tally(struggle.misses) }}
                </span>
              </li>
            }
          </ul>
        </section>
      } @else {
        <p class="font-hand text-2xl text-sage">Tout du premier coup, quelle championne ! ✨</p>
      }

      <div class="flex w-full flex-col gap-3">
        @if (session.struggles().length) {
          <button type="button" class="btn-ink bg-rose-soft" (click)="session.replayStruggles()">
            Rejouer les mots difficiles
          </button>
        }
        <button type="button" class="btn-ink bg-ochre" (click)="session.replayAll()">
          Rejouer tout
        </button>
        <button type="button" class="btn-ink bg-white" (click)="session.quit()">
          Choisir d'autres thèmes
        </button>
      </div>
    </main>
  `,
})
export class Done {
  protected readonly session = inject(SessionStore);
  protected readonly total = computed(() => this.session.progress().total);
  protected readonly withArticle = withArticle;

  /** Bâtonnets façon bullet journal : |||| barré tous les 5. */
  protected tally(n: number): string {
    return '𝍸'.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5);
  }
}
