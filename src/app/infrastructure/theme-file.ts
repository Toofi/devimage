/**
 * Format des fichiers `public/themes/*.json` et leur validation.
 *
 * Ce module n'importe rien à l'exécution : il est partagé avec les scripts Node
 * (`scripts/*.mts`), qui le chargent directement en TypeScript.
 */

export interface WordEntry {
  readonly mot: string;
  readonly det: string;
  readonly emoji?: string;
  readonly arasaac?: number;
  /** Chemin relatif à `public/images/`. */
  readonly image?: string;
}

export interface ThemeFile {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly mots: readonly WordEntry[];
}

export const THEMES_DIR = 'themes';
export const INDEX_FILE = 'index.json';
const ARTICLES = ['le', 'la', "l'"];

/** Chemin (relatif à la racine du site) de l'illustration en fichier d'un mot, s'il en a une. */
export function picturePath(entry: WordEntry): string | undefined {
  if (entry.image) return `images/${entry.image}`;
  if (entry.arasaac !== undefined) return arasaacPath(entry.arasaac);
  return undefined;
}

export function arasaacPath(id: number): string {
  return `images/arasaac/${id}.png`;
}

export class ThemeFormatError extends Error {
  readonly problems: readonly string[];

  constructor(source: string, problems: readonly string[]) {
    super(`${source} : ${problems.join(' ; ')}`);
    this.name = 'ThemeFormatError';
    this.problems = problems;
  }
}

/** `index.json` : la liste des fichiers de thèmes. */
export function parseIndex(raw: unknown): string[] {
  if (!Array.isArray(raw) || !raw.every((f) => typeof f === 'string' && f.endsWith('.json'))) {
    throw new ThemeFormatError(INDEX_FILE, ['doit être une liste de noms de fichiers .json']);
  }
  return raw;
}

/** Vérifie un fichier de thème et le renvoie typé, ou lève une erreur listant tous les problèmes. */
export function parseThemeFile(raw: unknown, source: string): ThemeFile {
  const problems: string[] = [];
  const theme = raw as Partial<ThemeFile> | null;

  if (typeof theme !== 'object' || theme === null) {
    throw new ThemeFormatError(source, ['le contenu doit être un objet']);
  }
  for (const key of ['id', 'label', 'emoji'] as const) {
    if (!isFilled(theme[key])) problems.push(`« ${key} » manquant`);
  }
  if (!Array.isArray(theme.mots) || theme.mots.length === 0) {
    problems.push('« mots » doit être une liste non vide');
  } else {
    theme.mots.forEach((entry, i) => problems.push(...wordProblems(entry, i)));
    problems.push(...duplicates(theme.mots.map((m) => m.mot)).map((m) => `« ${m} » est en double`));
  }

  if (problems.length > 0) throw new ThemeFormatError(source, problems);
  return theme as ThemeFile;
}

function wordProblems(entry: Partial<WordEntry>, index: number): string[] {
  const where = `mot n°${index + 1}${isFilled(entry.mot) ? ` (${entry.mot})` : ''}`;
  const problems: string[] = [];
  if (!isFilled(entry.mot)) problems.push(`${where} : « mot » manquant`);
  if (!ARTICLES.includes(entry.det ?? '')) {
    problems.push(`${where} : « det » doit valoir ${ARTICLES.join(', ')}`);
  }
  if (entry.arasaac !== undefined && !Number.isInteger(entry.arasaac)) {
    problems.push(`${where} : « arasaac » doit être un nombre entier`);
  }
  if (!isFilled(entry.emoji) && entry.arasaac === undefined && !isFilled(entry.image)) {
    problems.push(`${where} : il faut au moins « image », « arasaac » ou « emoji »`);
  }
  return problems;
}

function isFilled(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function duplicates(values: readonly string[]): string[] {
  return [...new Set(values.filter((v, i) => values.indexOf(v) !== i))];
}
