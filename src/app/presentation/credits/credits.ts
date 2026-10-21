import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScreenStore } from '../../application/screen.store';

@Component({
  selector: 'app-credits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <button
        type="button"
        class="self-start font-hand text-2xl text-ink-soft underline decoration-dotted underline-offset-4"
        (click)="screen.show('setup')"
      >
        ← Retour
      </button>
      <h1 class="font-display text-4xl font-black text-ochre">Crédits</h1>
      <section class="index-card flex flex-col gap-3 p-5 leading-relaxed">
        <h2 class="font-display text-xl font-bold">Pictogrammes</h2>
        <p>
          Les pictogrammes sont la propriété du Gouvernement d'Aragon. Ils ont été créés par Sergio
          Palao pour
          <a class="underline" href="https://arasaac.org" target="_blank" rel="noopener">ARASAAC</a
          >, qui les distribue sous licence
          <a
            class="underline"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr"
            target="_blank"
            rel="noopener"
            >Creative Commons BY-NC-SA</a
          >.
        </p>
        <h2 class="mt-2 font-display text-xl font-bold">Emoji</h2>
        <p>Les emoji sont ceux de ton appareil.</p>
      </section>
    </main>
  `,
})
export class Credits {
  protected readonly screen = inject(ScreenStore);
}
