import { Injectable } from '@angular/core';
import { ThemeRepository } from '../application/ports';
import { Theme, wordId } from '../domain/word';
import {
  INDEX_FILE,
  parseIndex,
  parseThemeFile,
  picturePath,
  ThemeFile,
  THEMES_DIR,
} from './theme-file';

/** Lit les thèmes servis dans `public/themes/` (chemins relatifs : respecte le base-href). */
@Injectable()
export class FetchThemeRepository extends ThemeRepository {
  async loadAll(): Promise<Theme[]> {
    const files = parseIndex(await fetchJson(`${THEMES_DIR}/${INDEX_FILE}`));
    const themes = await Promise.all(
      files.map(async (file) => parseThemeFile(await fetchJson(`${THEMES_DIR}/${file}`), file)),
    );
    return themes.map(toTheme);
  }
}

export function toTheme(file: ThemeFile): Theme {
  return {
    id: file.id,
    label: file.label,
    emoji: file.emoji,
    words: file.mots.map((entry) => ({
      id: wordId(file.id, entry.mot),
      text: entry.mot,
      article: entry.det,
      picture: { src: picturePath(entry), emoji: entry.emoji },
    })),
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} : HTTP ${response.status}`);
  return response.json();
}
