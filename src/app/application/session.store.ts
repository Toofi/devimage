import { computed, inject, Injectable, signal } from '@angular/core';
import { createDeck, current, DeckState, fail, isFinished, pass } from '../domain/deck';
import { buildRound, Round } from '../domain/round';
import { withArticle, Word } from '../domain/word';
import { CatalogStore } from './catalog.store';
import { Speaker } from './ports';
import { ScreenStore } from './screen.store';

export interface Struggle {
  readonly word: Word;
  /** Nombre de fois où la carte est revenue. */
  readonly misses: number;
}

/**
 * Une partie : un paquet de mots ; pour chaque carte, trois images dont une seule est la bonne.
 * Une erreur barre l'image et l'enfant réessaie ; la carte reviendra plus loin dans le paquet.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly speaker = inject(Speaker);
  private readonly screen = inject(ScreenStore);
  private readonly catalog = inject(CatalogStore);

  /** Les mots où l'on pioche les pièges au hasard : tous ceux des thèmes cochés. */
  private readonly pool = signal<readonly Word[]>([]);
  /** Les mots où l'on cherche d'abord des pièges qui commencent comme la réponse : tous les thèmes. */
  private readonly allWords = computed(() => this.catalog.themes().flatMap((t) => t.words));
  private readonly deck = signal<DeckState>(createDeck([]));

  readonly round = signal<Round | null>(null);
  readonly wrongPicks = signal<ReadonlySet<string>>(new Set());
  readonly solved = signal(false);

  readonly progress = computed(() => ({ done: this.deck().done.length, total: this.deck().total }));

  /** Les mots qui ont demandé plus d'essais, du plus raté au moins raté. */
  readonly struggles = computed<readonly Struggle[]>(() => {
    const byId = new Map(this.pool().map((w) => [w.id, w]));
    return Object.entries(this.deck().misses)
      .sort(([, a], [, b]) => b - a)
      .map(([id, misses]) => ({ word: byId.get(id)!, misses }));
  });

  start(words: readonly Word[], pool: readonly Word[] = words): void {
    if (words.length === 0) return;
    this.pool.set(pool);
    this.deck.set(createDeck(words.map((w) => w.id)));
    this.dealRound();
    this.screen.show('play');
  }

  /** Rejoue les mots difficiles, avec toujours les mêmes pièges possibles. */
  replayStruggles(): void {
    this.start(
      this.struggles().map((s) => s.word),
      this.pool(),
    );
  }

  replayAll(): void {
    this.start(this.pool());
  }

  pick(word: Word): void {
    const round = this.round();
    if (!round || this.solved()) return;
    if (word.id === round.answer.id) {
      this.solved.set(true);
      this.speaker.speak(withArticle(word));
    } else {
      this.wrongPicks.update((ids) => new Set(ids).add(word.id));
    }
  }

  next(): void {
    if (!this.solved()) return;
    this.speaker.stop();
    this.deck.update((d) => (this.wrongPicks().size > 0 ? fail(d) : pass(d)));
    if (isFinished(this.deck())) this.screen.show('done');
    else this.dealRound();
  }

  quit(): void {
    this.speaker.stop();
    this.screen.show('setup');
  }

  private dealRound(): void {
    const id = current(this.deck());
    const answer = this.pool().find((w) => w.id === id);
    this.round.set(answer ? buildRound(answer, this.pool(), Math.random, this.allWords()) : null);
    this.wrongPicks.set(new Set());
    this.solved.set(false);
  }
}
