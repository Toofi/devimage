import { Rng, shuffle } from './deck';
import { sharedStart, sharePicture, Word } from './word';

export const OPTIONS_PER_ROUND = 3;

/** Une carte jouée : le mot à lire et les images proposées, déjà mélangées. */
export interface Round {
  readonly answer: Word;
  readonly options: readonly Word[];
}

/**
 * Choisit les pièges : d'abord les mots de `catalog` qui commencent comme la réponse
 * (« valise » puis « vélo » pour « vache »), pour obliger l'enfant à lire tout le mot ;
 * puis le hasard dans `pool`. Un mot dont l'image pourrait se confondre avec une
 * image déjà proposée est écarté.
 * S'il n'y a pas assez de mots distincts, la manche a moins d'options.
 */
export function buildRound(
  answer: Word,
  pool: readonly Word[],
  rng: Rng = Math.random,
  catalog: readonly Word[] = pool,
): Round {
  const options: Word[] = [answer];
  for (const candidate of [...lookalikes(answer, catalog, rng), ...shuffle(pool, rng)]) {
    if (options.length === OPTIONS_PER_ROUND) break;
    if (options.some((o) => o.id === candidate.id || sharePicture(o, candidate))) continue;
    options.push(candidate);
  }
  return { answer, options: shuffle(options, rng) };
}

/** Les mots qui commencent comme `answer`, du plus long début commun au plus court ; mélangés à égalité. */
function lookalikes(answer: Word, catalog: readonly Word[], rng: Rng): Word[] {
  return shuffle(catalog, rng)
    .map((word) => ({ word, shared: sharedStart(answer, word) }))
    .filter((c) => c.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .map((c) => c.word);
}
