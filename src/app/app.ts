import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CatalogStore } from './application/catalog.store';
import { ScreenStore } from './application/screen.store';
import { Credits } from './presentation/credits/credits';
import { Done } from './presentation/done/done';
import { Play } from './presentation/play/play';
import { Setup } from './presentation/setup/setup';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Setup, Play, Done, Credits],
  template: `
    @switch (screen.current()) {
      @case ('setup') {
        <app-setup />
      }
      @case ('play') {
        <app-play />
      }
      @case ('done') {
        <app-done />
      }
      @case ('credits') {
        <app-credits />
      }
    }
  `,
})
export class App {
  protected readonly screen = inject(ScreenStore);

  constructor() {
    void inject(CatalogStore).load();
  }
}
