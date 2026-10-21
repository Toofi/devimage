import { computed, inject, Injectable, signal } from '@angular/core';
import { Speaker, Voice } from '../application/ports';
import { SettingsStore } from '../application/settings.store';

/** Synthèse vocale du navigateur (Web Speech API), en français, Belgique d'abord. */
@Injectable()
export class WebSpeechSpeaker extends Speaker {
  private readonly settings = inject(SettingsStore);
  private readonly synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private readonly frenchVoices = signal<SpeechSynthesisVoice[]>([]);

  readonly supported = this.synth !== null;
  readonly voices = computed<readonly Voice[]>(() =>
    this.frenchVoices().map((v) => ({ id: v.voiceURI, label: `${v.name} (${v.lang})` })),
  );

  constructor() {
    super();
    if (!this.synth) return;
    const refresh = () =>
      this.frenchVoices.set(
        (this.synth?.getVoices() ?? [])
          .filter((v) => v.lang.toLowerCase().startsWith('fr'))
          .sort((a, b) => score(b) - score(a)),
      );
    refresh();
    this.synth.addEventListener('voiceschanged', refresh);
  }

  speak(text: string): void {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.chosenVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'fr-BE';
    utterance.rate = this.settings.rate();
    utterance.pitch = 1.05;
    this.synth.speak(utterance);
  }

  stop(): void {
    this.synth?.cancel();
  }

  private chosenVoice(): SpeechSynthesisVoice | null {
    const voices = this.frenchVoices();
    return voices.find((v) => v.voiceURI === this.settings.voiceId()) ?? voices[0] ?? null;
  }
}

function score(v: SpeechSynthesisVoice): number {
  const lang = v.lang.toLowerCase();
  let s = 0;
  if (lang === 'fr-be') s += 4;
  else if (lang === 'fr-fr') s += 3;
  // Les voix « naturelles » / en ligne sont nettement meilleures (Edge, Chrome, iOS).
  if (/natural|online|neural|premium|enhanced|google/i.test(v.name)) s += 2;
  if (v.localService) s += 0.5;
  return s;
}
