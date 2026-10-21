/**
 * Ce qui illustre un mot. `src` (un fichier) est prioritaire ; `emoji` sert
 * d'illustration quand il n'y a pas de fichier, ou de secours s'il ne charge pas.
 */
export interface Picture {
  readonly src?: string;
  readonly emoji?: string;
}

export interface Word {
  /** Unique dans tout le catalogue : `<thème>/<mot>`. */
  readonly id: string;
  readonly text: string;
  /** Déterminant défini : « le », « la » ou « l' ». */
  readonly article: string;
  readonly picture: Picture;
}

export interface Theme {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly words: readonly Word[];
}

export function wordId(themeId: string, text: string): string {
  return `${themeId}/${text}`;
}

/** Le déterminant tel qu'il se colle au mot : « le␣ », mais « l' » sans espace. */
export function articlePrefix(word: Word): string {
  return word.article.endsWith("'") ? word.article : `${word.article} `;
}

/** « le chat », « l'avion ». */
export function withArticle(word: Word): string {
  return articlePrefix(word) + word.text;
}

/** Deux mots se confondraient à l'écran s'ils partagent un fichier ou un emoji. */
export function sharePicture(a: Word, b: Word): boolean {
  const same = (x?: string, y?: string) => x !== undefined && x === y;
  return same(a.picture.src, b.picture.src) || same(a.picture.emoji, b.picture.emoji);
}
