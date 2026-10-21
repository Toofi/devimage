import { effect, inject, Injectable, signal } from '@angular/core';
import { KeyValueStore } from './ports';

interface PersistedSettings {
  /** `null` : aucun choix fait, tous les thèmes sont cochés (y compris ceux ajoutés plus tard). */
  selectedThemeIds: string[] | null;
  voiceId: string | null;
  rate: number;
  /** Bouton 🔈 qui lit le mot avant que l'enfant ait choisi. */
  helpEnabled: boolean;
}

const STORAGE_KEY = 'devimage.settings.v1';

const DEFAULTS: PersistedSettings = {
  selectedThemeIds: null,
  voiceId: null,
  rate: 0.8,
  helpEnabled: false,
};

/** Réglages de l'appareil, sauvegardés à chaque changement. */
@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly initial = {
    ...DEFAULTS,
    ...inject(KeyValueStore).read<PersistedSettings>(STORAGE_KEY),
  };

  readonly selectedThemeIds = signal<ReadonlySet<string> | null>(
    this.initial.selectedThemeIds ? new Set(this.initial.selectedThemeIds) : null,
  );
  readonly voiceId = signal(this.initial.voiceId);
  readonly rate = signal(this.initial.rate);
  readonly helpEnabled = signal(this.initial.helpEnabled);

  constructor() {
    const store = inject(KeyValueStore);
    effect(() => {
      const ids = this.selectedThemeIds();
      store.write(STORAGE_KEY, {
        selectedThemeIds: ids ? [...ids] : null,
        voiceId: this.voiceId(),
        rate: this.rate(),
        helpEnabled: this.helpEnabled(),
      } satisfies PersistedSettings);
    });
  }
}
