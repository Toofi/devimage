import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CatalogStore } from '../../application/catalog.store';
import { Speaker } from '../../application/ports';
import { ScreenStore } from '../../application/screen.store';
import { SessionStore } from '../../application/session.store';
import { SettingsStore } from '../../application/settings.store';
import { ThemeSelectionStore } from '../../application/theme-selection.store';

@Component({
  selector: 'app-setup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './setup.html',
})
export class Setup {
  protected readonly catalog = inject(CatalogStore);
  protected readonly selection = inject(ThemeSelectionStore);
  protected readonly settings = inject(SettingsStore);
  protected readonly speaker = inject(Speaker);
  protected readonly screen = inject(ScreenStore);
  private readonly session = inject(SessionStore);

  protected start(): void {
    this.session.start(this.selection.words());
  }

  protected onVoice(event: Event): void {
    this.settings.voiceId.set((event.target as HTMLSelectElement).value || null);
  }

  protected onRate(event: Event): void {
    this.settings.rate.set(Number((event.target as HTMLInputElement).value));
  }

  protected testVoice(): void {
    this.speaker.speak('Bonjour ! Lis le mot, et trouve la bonne image.');
  }
}
