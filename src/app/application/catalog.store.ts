import { computed, inject, Injectable, signal } from '@angular/core';
import { Theme } from '../domain/word';
import { ThemeRepository } from './ports';

export type CatalogStatus = 'loading' | 'ready' | 'error';

/** Tous les thèmes disponibles. */
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly repository = inject(ThemeRepository);

  readonly status = signal<CatalogStatus>('loading');
  readonly themes = signal<readonly Theme[]>([]);

  readonly totalWords = computed(() => countWords(this.themes()));

  async load(): Promise<void> {
    this.status.set('loading');
    try {
      this.themes.set(await this.repository.loadAll());
      this.status.set('ready');
    } catch (error) {
      console.error(error);
      this.status.set('error');
    }
  }
}

export function countWords(themes: readonly Theme[]): number {
  return themes.reduce((sum, t) => sum + t.words.length, 0);
}
