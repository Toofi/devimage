import { TestBed } from '@angular/core/testing';
import { Word } from '../domain/word';
import { Speaker } from './ports';
import { ScreenStore } from './screen.store';
import { SessionStore } from './session.store';
import { CatalogStore } from './catalog.store';
import { ANIMAUX, FakeSpeaker, fakeAdapters, FRUITS, theme } from './testing/fakes';

describe('SessionStore', () => {
  let session: SessionStore;
  let screen: ScreenStore;
  let speaker: FakeSpeaker;
  const pool = [...ANIMAUX.words, ...FRUITS.words];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: fakeAdapters() });
    session = TestBed.inject(SessionStore);
    screen = TestBed.inject(ScreenStore);
    speaker = TestBed.inject(Speaker) as FakeSpeaker;
  });

  const answer = (): Word => session.round()!.answer;
  const wrongOption = (): Word => session.round()!.options.find((o) => o.id !== answer().id)!;

  it('démarre une partie avec trois images dont la bonne', () => {
    session.start(pool);
    expect(screen.current()).toBe('play');
    expect(session.round()!.options).toHaveLength(3);
    expect(session.round()!.options).toContain(answer());
  });

  it('une erreur barre l’image sans passer à la suite', () => {
    session.start(pool);
    const wrong = wrongOption();
    session.pick(wrong);
    expect(session.wrongPicks().has(wrong.id)).toBe(true);
    expect(session.solved()).toBe(false);
    session.next();
    expect(session.progress().done).toBe(0);
  });

  it('la bonne image lit le mot avec son déterminant', () => {
    session.start(pool);
    session.pick(answer());
    expect(session.solved()).toBe(true);
    expect(speaker.spoken).toEqual([`le ${answer().text}`]);
  });

  it('un mot trouvé du premier coup sort du paquet', () => {
    session.start(pool);
    session.pick(answer());
    session.next();
    expect(session.progress().done).toBe(1);
  });

  it('un mot trouvé après une erreur revient et compte parmi les mots difficiles', () => {
    session.start(ANIMAUX.words, pool);
    const hard = answer();
    session.pick(wrongOption());
    session.pick(hard);
    session.next();
    expect(session.progress().done).toBe(0);

    while (screen.current() === 'play') {
      session.pick(answer());
      session.next();
    }
    expect(screen.current()).toBe('done');
    expect(session.struggles()).toEqual([{ word: hard, misses: 1 }]);
  });

  it('cherche dans tous les thèmes des pièges qui commencent comme le mot', async () => {
    const vetements = theme('vetements', { chapeau: '🎩', chaussette: '🧦' });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: fakeAdapters([ANIMAUX, FRUITS, vetements]) });
    await TestBed.inject(CatalogStore).load();
    session = TestBed.inject(SessionStore);

    const chat = ANIMAUX.words.find((w) => w.text === 'chat')!;
    session.start([chat], ANIMAUX.words);
    expect(new Set(session.round()!.options)).toEqual(new Set([chat, ...vetements.words]));
  });

  it('rejouer les mots difficiles garde tous les pièges possibles', () => {
    session.start(ANIMAUX.words, pool);
    const hard = answer();
    session.pick(wrongOption());
    session.pick(hard);
    session.next();
    while (screen.current() === 'play') {
      session.pick(answer());
      session.next();
    }

    session.replayStruggles();
    expect(session.progress().total).toBe(1);
    expect(answer()).toBe(hard);
    expect(session.round()!.options).toHaveLength(3);
  });
});
