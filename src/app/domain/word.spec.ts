import { sharedStart, sharePicture, withArticle, Word } from './word';

const word = (text: string, article: string, picture: Word['picture'] = {}): Word => ({
  id: `t/${text}`,
  text,
  article,
  picture,
});

describe('word', () => {
  it('colle le déterminant élidé, espace sinon', () => {
    expect(withArticle(word('avion', "l'"))).toBe("l'avion");
    expect(withArticle(word('chat', 'le'))).toBe('le chat');
  });

  it('deux mots partagent une image si le fichier ou l’emoji est le même', () => {
    expect(sharePicture(word('a', 'le', { emoji: '🍎' }), word('b', 'la', { emoji: '🍎' }))).toBe(
      true,
    );
    expect(sharePicture(word('a', 'le', { src: 'x.png' }), word('b', 'la', { src: 'x.png' }))).toBe(
      true,
    );
    expect(sharePicture(word('a', 'le', { src: 'x.png' }), word('b', 'la', { emoji: '🍎' }))).toBe(
      false,
    );
    expect(sharePicture(word('a', 'le'), word('b', 'la'))).toBe(false);
  });

  it('compte les lettres communes au début des deux mots', () => {
    expect(sharedStart(word('vache', 'la'), word('valise', 'la'))).toBe(2);
    expect(sharedStart(word('vache', 'la'), word('vélo', 'le'))).toBe(1);
    expect(sharedStart(word('vache', 'la'), word('chat', 'le'))).toBe(0);
    expect(sharedStart(word('Lapin', 'le'), word('lait', 'le'))).toBe(2);
  });
});
