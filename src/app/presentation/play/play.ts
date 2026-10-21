import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Speaker } from '../../application/ports';
import { SessionStore } from '../../application/session.store';
import { SettingsStore } from '../../application/settings.store';
import { articlePrefix, withArticle, Word } from '../../domain/word';
import { PictureView } from '../shared/picture-view';
import { Mark, RoughMark } from '../shared/rough-mark';

const LONG_WORD = 8;

@Component({
  selector: 'app-play',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PictureView, RoughMark],
  templateUrl: './play.html',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class Play {
  protected readonly session = inject(SessionStore);
  protected readonly settings = inject(SettingsStore);
  private readonly speaker = inject(Speaker);

  protected readonly round = this.session.round;
  protected readonly articlePrefix = articlePrefix;
  protected readonly progressPercent = computed(() => {
    const { done, total } = this.session.progress();
    return total === 0 ? 0 : Math.round((done / total) * 100);
  });
  protected readonly isLongWord = computed(
    () => (this.round()?.answer.text.length ?? 0) > LONG_WORD,
  );

  protected markOf(word: Word): Mark | null {
    if (this.session.wrongPicks().has(word.id)) return 'cross';
    if (this.session.solved() && word.id === this.round()?.answer.id) return 'circle';
    return null;
  }

  protected isDisabled(word: Word): boolean {
    return this.session.solved() || this.session.wrongPicks().has(word.id);
  }

  protected help(): void {
    const round = this.round();
    if (round) this.speaker.speak(withArticle(round.answer));
  }

  /** 1, 2, 3 choisissent une image ; Entrée ou → passent à la suite. */
  protected onKey(event: KeyboardEvent): void {
    const options = this.round()?.options ?? [];
    const index = Number(event.key) - 1;
    if (options[index]) {
      this.session.pick(options[index]);
    } else if ((event.key === 'Enter' || event.key === 'ArrowRight') && this.session.solved()) {
      event.preventDefault();
      this.session.next();
    }
  }
}
