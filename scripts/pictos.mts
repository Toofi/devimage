/**
 * Pictogrammes ARASAAC (https://arasaac.org, licence CC BY-NC-SA).
 *
 *   npm run pictos                     télécharge les pictos référencés par les thèmes et absents du disque
 *   npm run pictos -- --force          les retélécharge tous
 *   npm run pictos -- --chercher chat  liste les pictos candidats pour un mot
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  arasaacPath,
  INDEX_FILE,
  parseIndex,
  parseThemeFile,
  THEMES_DIR,
} from '../src/app/infrastructure/theme-file.ts';

const PUBLIC_DIR = 'public';
const API = 'https://api.arasaac.org/v1/pictograms/fr';
const pictogramUrl = (id: number) => `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;

interface SearchResult {
  _id: number;
  keywords: { keyword: string }[];
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf-8'));
}

async function referencedIds(): Promise<number[]> {
  const themesDir = join(PUBLIC_DIR, THEMES_DIR);
  const ids = new Set<number>();
  for (const file of parseIndex(await readJson(join(themesDir, INDEX_FILE)))) {
    const theme = parseThemeFile(await readJson(join(themesDir, file)), file);
    for (const entry of theme.mots) if (entry.arasaac !== undefined) ids.add(entry.arasaac);
  }
  return [...ids].sort((a, b) => a - b);
}

async function download(force: boolean): Promise<void> {
  const ids = await referencedIds();
  let downloaded = 0;
  const failures: string[] = [];
  for (const id of ids) {
    const target = join(PUBLIC_DIR, arasaacPath(id));
    const present = await access(target).then(
      () => true,
      () => false,
    );
    if (present && !force) continue;
    const response = await fetch(pictogramUrl(id));
    if (!response.ok) {
      failures.push(`${id} : HTTP ${response.status}`);
      continue;
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
    downloaded++;
  }
  console.log(`${ids.length} pictos référencés, ${downloaded} téléchargés.`);
  failures.forEach((f) => console.error(`✗ ${f}`));
  if (failures.length > 0) process.exitCode = 1;
}

async function search(word: string): Promise<void> {
  const response = await fetch(`${API}/search/${encodeURIComponent(word)}`);
  if (!response.ok) {
    console.error(`Aucun résultat pour « ${word} » (HTTP ${response.status})`);
    process.exitCode = 1;
    return;
  }
  const results = (await response.json()) as SearchResult[];
  for (const r of results.slice(0, 15)) {
    const keywords = r.keywords.map((k) => k.keyword).join(', ');
    console.log(`${String(r._id).padEnd(6)} ${keywords}\n       ${pictogramUrl(r._id)}`);
  }
}

const args = process.argv.slice(2);
const searchAt = args.indexOf('--chercher');
if (searchAt >= 0) {
  const word = args[searchAt + 1];
  if (word) await search(word);
  else {
    console.error('Usage : npm run pictos -- --chercher <mot>');
    process.exitCode = 1;
  }
} else {
  await download(args.includes('--force'));
}
