import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  Provider,
} from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { KeyValueStore, Speaker, ThemeRepository } from './application/ports';
import { FetchThemeRepository } from './infrastructure/fetch-theme.repository';
import { LocalStorageStore } from './infrastructure/local-storage.store';
import { WebSpeechSpeaker } from './infrastructure/web-speech.speaker';

/** Branche chaque port de l'application sur son implémentation. */
export const adapters: Provider[] = [
  { provide: ThemeRepository, useClass: FetchThemeRepository },
  { provide: KeyValueStore, useClass: LocalStorageStore },
  { provide: Speaker, useClass: WebSpeechSpeaker },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    ...adapters,
  ],
};
