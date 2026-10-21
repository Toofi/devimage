/**
 * Outils pour les fichiers de thèmes (public/themes/*.json).
 *
 *   npm run themes:index   régénère public/themes/index.json à partir des fichiers présents
 *   npm run themes:check   vérifie tous les thèmes (format, index à jour, images présentes)
 */
import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import {
  INDEX_FILE,
  parseIndex,
  parseThemeFile,
  picturePath,
  THEMES_DIR,
  type ThemeFile,
} from '../src/app/infrastructure/theme-file.ts';

const PUBLIC_DIR = 'public';
const themesDir = join(PUBLIC_DIR, THEMES_DIR);

async function themeFileNames(): Promise<string[]> {
  return (await readdir(themesDir)).filter((f) => f.endsWith('.json') && f !== INDEX_FILE).sort();
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf-8'));
}

async function exists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false,
  );
}

async function writeIndex(): Promise<void> {
  const files = await themeFileNames();
  await writeFile(join(themesDir, INDEX_FILE), JSON.stringify(files, null, 2) + '\n');
  console.log(`${INDEX_FILE} : ${files.length} thèmes (${files.join(', ')})`);
}

async function check(): Promise<boolean> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const files = await themeFileNames();

  const indexed = parseIndex(await readJson(join(themesDir, INDEX_FILE)));
  if (JSON.stringify(indexed) !== JSON.stringify(files)) {
    errors.push(`${INDEX_FILE} n'est pas à jour : lance « npm run themes:index »`);
  }

  const themes: ThemeFile[] = [];
  for (const file of files) {
    try {
      const theme = parseThemeFile(await readJson(join(themesDir, file)), file);
      const expectedId = basename(file, '.json');
      if (theme.id !== expectedId) errors.push(`${file} : l'id doit être « ${expectedId} »`);
      themes.push(theme);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  const seenPictures = new Map<string, string>();
  for (const theme of themes) {
    for (const entry of theme.mots) {
      const where = `${theme.id}/${entry.mot}`;
      const path = picturePath(entry);
      if (path && !(await exists(join(PUBLIC_DIR, path)))) {
        errors.push(
          `${where} : ${path} introuvable${entry.arasaac !== undefined ? ' (lance « npm run pictos »)' : ''}`,
        );
      }
      for (const key of [path, entry.emoji].filter((k) => k !== undefined)) {
        const other = seenPictures.get(key);
        if (other) {
          warnings.push(
            `${where} et ${other} ont la même image (${key}) : jamais proposés ensemble`,
          );
        } else {
          seenPictures.set(key, where);
        }
      }
    }
  }

  warnings.forEach((w) => console.warn(`⚠ ${w}`));
  errors.forEach((e) => console.error(`✗ ${e}`));
  const words = themes.reduce((n, t) => n + t.mots.length, 0);
  if (errors.length === 0) console.log(`✓ ${themes.length} thèmes, ${words} mots`);
  return errors.length === 0;
}

const command = process.argv[2];
if (command === 'index') await writeIndex();
else if (command === 'check') process.exitCode = (await check()) ? 0 : 1;
else {
  console.error('Usage : node scripts/themes.mts index|check');
  process.exitCode = 1;
}
