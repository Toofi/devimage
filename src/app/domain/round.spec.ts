import { seeded } from './testing/seeded';
import { buildRound, OPTIONS_PER_ROUND } from './round';
import { Word } from './word';

const word = (text: string, emoji: string): Word => ({
  id: `t/${text}`,
  text,
  article: 'le',
  picture: { emoji },
});

describe('buildRound', () => {
  const chat = word('chat', '🐱');
  const pool = [chat, word('chien', '🐶'), word('lapin', '🐰'), word('cochon', '🐷')];

  it('propose la réponse et deux pièges différents', () => {
    for (let seed = 0; seed < 30; seed++) {
      const round = buildRound(chat, pool, seeded(seed));
      expect(round.options).toHaveLength(OPTIONS_PER_ROUND);
      expect(round.options).toContain(chat);
      expect(new Set(round.options.map((o) => o.id)).size).toBe(OPTIONS_PER_ROUND);
    }
  });

  it("ne propose jamais un piège qui a la même image qu'une autre option", () => {
    const minou = word('minou', '🐱');
    for (let seed = 0; seed < 30; seed++) {
      const round = buildRound(chat, [minou, ...pool], seeded(seed));
      expect(round.options).not.toContain(minou);
    }
  });

  it("place la bonne réponse à n'importe quelle position", () => {
    const positions = new Set(
      Array.from({ length: 30 }, (_, seed) =>
        buildRound(chat, pool, seeded(seed)).options.indexOf(chat),
      ),
    );
    expect(positions.size).toBe(OPTIONS_PER_ROUND);
  });

  it("se contente de moins d'options s'il n'y a pas assez de mots", () => {
    expect(buildRound(chat, [chat, word('minou', '🐱')]).options).toEqual([chat]);
  });

  describe('pièges qui commencent comme la réponse', () => {
    const vache = word('vache', '🐄');
    const valise = word('valise', '🧳');
    const velo = word('vélo', '🚲');
    const catalog = [vache, valise, velo, word('lapin', '🐰'), word('pomme', '🍎')];

    it('passent avant le hasard, le plus long début commun en premier', () => {
      for (let seed = 0; seed < 30; seed++) {
        const round = buildRound(vache, pool, seeded(seed), catalog);
        expect(new Set(round.options)).toEqual(new Set([vache, valise, velo]));
      }
    });

    it('viennent du catalogue, et le hasard complète depuis le paquet', () => {
      for (let seed = 0; seed < 30; seed++) {
        const round = buildRound(vache, pool, seeded(seed), [vache, valise]);
        expect(round.options).toContain(valise);
        expect(round.options.filter((o) => pool.includes(o))).toHaveLength(1);
      }
    });

    it("sont écartés s'ils ont la même image qu'une autre option", () => {
      const vachette = word('vachette', '🐄');
      for (let seed = 0; seed < 30; seed++) {
        const round = buildRound(vache, pool, seeded(seed), [vache, vachette, valise]);
        expect(round.options).not.toContain(vachette);
      }
    });
  });
});
