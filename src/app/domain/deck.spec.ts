import { seeded } from './testing/seeded';
import { createDeck, current, fail, isFinished, MIN_GAP, pass, shuffle } from './deck';

describe('deck', () => {
  const ids = ['ou', 'on', 'an', 'oi', 'ch', 'ph'];

  it('shuffle garde tous les éléments', () => {
    const out = shuffle(ids, seeded(1));
    expect([...out].sort()).toEqual([...ids].sort());
  });

  it('une carte réussie sort du paquet', () => {
    let deck = createDeck(ids, seeded(2));
    const first = current(deck)!;
    deck = pass(deck);
    expect(deck.queue).not.toContain(first);
    expect(deck.done).toEqual([first]);
  });

  it('une carte ratée revient plus loin dans le paquet, pas juste après', () => {
    for (let seed = 0; seed < 50; seed++) {
      let deck = createDeck(ids, seeded(seed));
      const first = current(deck)!;
      deck = fail(deck, seeded(seed + 100));
      expect(deck.queue.length).toBe(ids.length);
      expect(deck.queue.indexOf(first)).toBeGreaterThanOrEqual(MIN_GAP);
      expect(deck.misses[first]).toBe(1);
    }
  });

  it('avec une seule carte restante, la carte ratée revient', () => {
    let deck = createDeck(['ou'], seeded(3));
    deck = fail(deck);
    expect(current(deck)).toBe('ou');
    deck = pass(deck);
    expect(isFinished(deck)).toBe(true);
  });

  it('le paquet se termine quand tout est réussi', () => {
    let deck = createDeck(ids, seeded(4));
    const rng = seeded(5);
    let guard = 0;
    while (!isFinished(deck) && guard++ < 100) {
      deck = rng() < 0.4 ? fail(deck, rng) : pass(deck);
    }
    expect(isFinished(deck)).toBe(true);
    expect([...deck.done].sort()).toEqual([...ids].sort());
  });
});
