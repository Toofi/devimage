import { Provider, signal } from '@angular/core';
import { Theme } from '../../domain/word';
import { KeyValueStore, Speaker, ThemeRepository, Voice } from '../ports';

export class FakeSpeaker extends Speaker {
  readonly supported = true;
  readonly voices = signal<readonly Voice[]>([]);
  readonly spoken: string[] = [];

  speak(text: string): void {
    this.spoken.push(text);
  }

  stop(): void {}
}

export class MemoryStore extends KeyValueStore {
  readonly data = new Map<string, unknown>();

  read<T>(key: string): T | null {
    return (this.data.get(key) as T) ?? null;
  }

  write(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}

export class FakeThemeRepository extends ThemeRepository {
  constructor(private readonly themes: Theme[]) {
    super();
  }

  loadAll(): Promise<Theme[]> {
    return Promise.resolve(this.themes);
  }
}

export function theme(id: string, words: Record<string, string>): Theme {
  return {
    id,
    label: id,
    emoji: '📦',
    words: Object.entries(words).map(([text, emoji]) => ({
      id: `${id}/${text}`,
      text,
      article: 'le',
      picture: { emoji },
    })),
  };
}

export const ANIMAUX = theme('animaux', { chat: '🐱', chien: '🐶', lapin: '🐰' });
export const FRUITS = theme('fruits', { kiwi: '🥝', citron: '🍋' });

export function fakeAdapters(themes: Theme[] = [ANIMAUX, FRUITS]): Provider[] {
  return [
    { provide: Speaker, useClass: FakeSpeaker },
    { provide: KeyValueStore, useClass: MemoryStore },
    { provide: ThemeRepository, useValue: new FakeThemeRepository(themes) },
  ];
}
