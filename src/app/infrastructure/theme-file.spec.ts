import { parseIndex, parseThemeFile, picturePath, ThemeFormatError } from './theme-file';

const valid = {
  id: 'animaux',
  label: 'Les animaux',
  emoji: '🐾',
  mots: [
    { mot: 'chat', det: 'le', emoji: '🐱', arasaac: 2462 },
    { mot: 'âne', det: "l'", image: 'animaux/ane.png' },
  ],
};

function problemsOf(raw: unknown): readonly string[] {
  try {
    parseThemeFile(raw, 'test.json');
    return [];
  } catch (e) {
    return (e as ThemeFormatError).problems;
  }
}

describe('theme-file', () => {
  it('accepte un thème valide', () => {
    expect(parseThemeFile(valid, 'animaux.json')).toEqual(valid);
  });

  it('liste tous les problèmes en une fois', () => {
    const problems = problemsOf({
      id: 'x',
      emoji: '🐾',
      mots: [
        { mot: 'chat', det: 'un', emoji: '🐱' },
        { mot: 'chien', det: 'le' },
        { mot: 'chat', det: 'le', emoji: '🐈' },
      ],
    });
    expect(problems).toEqual([
      '« label » manquant',
      "mot n°1 (chat) : « det » doit valoir le, la, l'",
      'mot n°2 (chien) : il faut au moins « image », « arasaac » ou « emoji »',
      '« chat » est en double',
    ]);
  });

  it('refuse un thème sans mots', () => {
    expect(problemsOf({ ...valid, mots: [] })).toEqual(['« mots » doit être une liste non vide']);
  });

  it("le fichier perso passe avant le picto ARASAAC, qui passe avant l'emoji", () => {
    expect(picturePath({ mot: 'a', det: 'le', image: 'a.png', arasaac: 1 })).toBe('images/a.png');
    expect(picturePath({ mot: 'a', det: 'le', arasaac: 1, emoji: '🐱' })).toBe(
      'images/arasaac/1.png',
    );
    expect(picturePath({ mot: 'a', det: 'le', emoji: '🐱' })).toBeUndefined();
  });

  it("l'index est une liste de fichiers .json", () => {
    expect(parseIndex(['animaux.json'])).toEqual(['animaux.json']);
    expect(() => parseIndex({ animaux: 'animaux.json' })).toThrow(ThemeFormatError);
  });
});
