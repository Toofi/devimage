import { Injectable } from '@angular/core';
import { KeyValueStore } from '../application/ports';

@Injectable()
export class LocalStorageStore extends KeyValueStore {
  read<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  }

  write(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* stockage indisponible (navigation privée…) : les réglages restent en mémoire */
    }
  }
}
