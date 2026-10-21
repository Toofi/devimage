import { Rng } from '../deck';

/** Générateur pseudo-aléatoire déterministe pour les tests. */
export function seeded(seed: number): Rng {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
