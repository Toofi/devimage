/**
 * Paquet de cartes façon Anki, en logique pure (testable).
 * - Réussi → la carte sort du paquet.
 * - Raté → la carte est remise plus loin dans le paquet (pas tout de suite derrière).
 */

export type Rng = () => number;

export interface DeckState {
  readonly queue: readonly string[];
  readonly done: readonly string[];
  readonly misses: Readonly<Record<string, number>>;
  readonly total: number;
}

/** Nombre minimum de cartes à voir avant qu'une carte ratée revienne. */
export const MIN_GAP = 2;

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createDeck(ids: readonly string[], rng: Rng = Math.random): DeckState {
  return { queue: shuffle(ids, rng), done: [], misses: {}, total: ids.length };
}

export function current(state: DeckState): string | null {
  return state.queue[0] ?? null;
}

export function pass(state: DeckState): DeckState {
  const [id, ...rest] = state.queue;
  if (id === undefined) return state;
  return { ...state, queue: rest, done: [...state.done, id] };
}

export function fail(state: DeckState, rng: Rng = Math.random): DeckState {
  const [id, ...rest] = state.queue;
  if (id === undefined) return state;
  const min = Math.min(MIN_GAP, rest.length);
  const index = min + Math.floor(rng() * (rest.length - min + 1));
  const queue = [...rest.slice(0, index), id, ...rest.slice(index)];
  return { ...state, queue, misses: { ...state.misses, [id]: (state.misses[id] ?? 0) + 1 } };
}

export function isFinished(state: DeckState): boolean {
  return state.queue.length === 0;
}
