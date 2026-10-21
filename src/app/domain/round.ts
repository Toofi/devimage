import { Rng, shuffle } from './deck';
import { sharePicture, Word } from './word';

export const OPTIONS_PER_ROUND = 3;

/** Une carte jouée : le mot à lire et les images proposées, déjà mélangées. */
export interface Round {
  readonly answer: Word;
  readonly options: readonly Word[];
}

/**
 * Tire les pièges au hasard dans `pool`, en écartant tout mot dont l'image
 * pourrait se confondre avec une autre image déjà proposée.
 * S'il n'y a pas assez de mots distincts, la manche a moins d'options.
 */
export function buildRound(answer: Word, pool: readonly Word[], rng: Rng = Math.random): Round {
  const options: Word[] = [answer];
  for (const candidate of shuffle(pool, rng)) {
    if (options.length === OPTIONS_PER_ROUND) break;
    if (options.some((o) => o.id === candidate.id || sharePicture(o, candidate))) continue;
    options.push(candidate);
  }
  return { answer, options: shuffle(options, rng) };
}
