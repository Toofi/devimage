import { computed, inject, Injectable } from '@angular/core';
import { OPTIONS_PER_ROUND } from '../domain/round';
import { Theme } from '../domain/word';
import { CatalogStore, countWords } from './catalog.store';
import { SettingsStore } from './settings.store';

/** Les thèmes cochés sur l'écran d'accueil. */
@Injectable({ providedIn: 'root' })
export class ThemeSelectionStore {
  private readonly catalog = inject(CatalogStore);
  private readonly settings = inject(SettingsStore);

  readonly themes = computed(() => {
    const ids = this.settings.selectedThemeIds();
    return this.catalog.themes().filter((t) => ids === null || ids.has(t.id));
  });

  readonly words = computed(() => this.themes().flatMap((t) => t.words));
  readonly wordCount = computed(() => countWords(this.themes()));
  /** Il faut au moins autant de mots que d'images proposées. */
  readonly canStart = computed(() => this.wordCount() >= OPTIONS_PER_ROUND);

  isSelected(theme: Theme): boolean {
    return this.themes().includes(theme);
  }

  toggle(theme: Theme): void {
    const next = new Set(this.themes().map((t) => t.id));
    if (next.has(theme.id)) next.delete(theme.id);
    else next.add(theme.id);
    this.settings.selectedThemeIds.set(next);
  }

  selectAll(): void {
    this.settings.selectedThemeIds.set(null);
  }

  selectNone(): void {
    this.settings.selectedThemeIds.set(new Set());
  }
}
