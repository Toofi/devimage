import { Signal } from '@angular/core';
import { Theme } from '../domain/word';

/** Ports : ce dont l'application a besoin du monde extérieur. Les implémentations sont dans `infrastructure/`. */

export abstract class ThemeRepository {
  abstract loadAll(): Promise<Theme[]>;
}

/** Petit stockage clé → valeur JSON, persistant sur l'appareil. */
export abstract class KeyValueStore {
  abstract read<T>(key: string): T | null;
  abstract write(key: string, value: unknown): void;
}

export interface Voice {
  readonly id: string;
  readonly label: string;
}

export abstract class Speaker {
  abstract readonly supported: boolean;
  /** Voix françaises disponibles, la meilleure en premier. */
  abstract readonly voices: Signal<readonly Voice[]>;
  abstract speak(text: string): void;
  abstract stop(): void;
}
