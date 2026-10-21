import { Injectable, signal } from '@angular/core';

export type Screen = 'setup' | 'play' | 'done' | 'credits';

/** L'écran affiché. Pas de routeur : l'app tient sur quatre écrans sans URL propre. */
@Injectable({ providedIn: 'root' })
export class ScreenStore {
  readonly current = signal<Screen>('setup');

  show(screen: Screen): void {
    this.current.set(screen);
  }
}
