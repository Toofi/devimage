import { TestBed } from '@angular/core/testing';
import { CatalogStore } from './catalog.store';
import { KeyValueStore } from './ports';
import { SettingsStore } from './settings.store';
import { ThemeSelectionStore } from './theme-selection.store';
import { ANIMAUX, fakeAdapters, FRUITS, MemoryStore } from './testing/fakes';

describe('ThemeSelectionStore', () => {
  let selection: ThemeSelectionStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: fakeAdapters() });
    await TestBed.inject(CatalogStore).load();
    selection = TestBed.inject(ThemeSelectionStore);
  });

  it('par défaut, tous les thèmes sont cochés', () => {
    expect(selection.themes()).toEqual([ANIMAUX, FRUITS]);
    expect(selection.wordCount()).toBe(5);
  });

  it('décocher un thème retire ses mots du paquet', () => {
    selection.toggle(ANIMAUX);
    expect(selection.isSelected(ANIMAUX)).toBe(false);
    expect(selection.words()).toEqual(FRUITS.words);
  });

  it('il faut au moins trois mots pour jouer', () => {
    selection.toggle(ANIMAUX);
    expect(selection.canStart()).toBe(false);
    selection.selectAll();
    expect(selection.canStart()).toBe(true);
  });

  it('le choix est sauvegardé sur l’appareil', () => {
    selection.selectNone();
    selection.toggle(FRUITS);
    TestBed.tick();
    const store = TestBed.inject(KeyValueStore) as MemoryStore;
    expect([...store.data.values()][0]).toMatchObject({ selectedThemeIds: ['fruits'] });
    expect(TestBed.inject(SettingsStore).selectedThemeIds()).toEqual(new Set(['fruits']));
  });
});
