import { afterRenderEffect, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import rough from 'roughjs';

export type Mark = 'circle' | 'cross';

/** Entoure (bonne réponse) ou barre (erreur) l'élément d'un trait de stylo dessiné à la main. */
@Directive({
  selector: '[appRoughMark]',
  host: { style: 'position: relative;' },
})
export class RoughMark {
  readonly appRoughMark = input<Mark | null>(null);
  readonly color = input('#c0392b');
  readonly pad = input(10);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  constructor() {
    Object.assign(this.svg.style, {
      position: 'absolute',
      pointerEvents: 'none',
      overflow: 'visible',
    });
    this.svg.setAttribute('aria-hidden', 'true');
    this.host.appendChild(this.svg);

    const resize = new ResizeObserver(() => this.draw());
    resize.observe(this.host);
    inject(DestroyRef).onDestroy(() => resize.disconnect());

    afterRenderEffect(() => {
      this.appRoughMark();
      this.draw();
    });
  }

  private draw(): void {
    const mark = this.appRoughMark();
    const pad = this.pad();
    const w = this.host.offsetWidth + pad * 2;
    const h = this.host.offsetHeight + pad * 2;
    if (!mark || w <= pad * 2 || h <= pad * 2) {
      this.svg.replaceChildren();
      return;
    }
    Object.assign(this.svg.style, { left: `${-pad}px`, top: `${-pad}px` });
    this.svg.setAttribute('width', `${w}`);
    this.svg.setAttribute('height', `${h}`);

    const pen = rough.svg(this.svg);
    const options = {
      stroke: this.color(),
      strokeWidth: 3,
      roughness: 1.6,
      bowing: 1.5,
      seed: Math.floor(Math.random() * 10_000) + 1,
    };
    const inset = pad * 2;
    this.svg.replaceChildren(
      ...(mark === 'circle'
        ? [pen.ellipse(w / 2, h / 2, w - 6, h - 6, options)]
        : [
            pen.line(inset, inset, w - inset, h - inset, options),
            pen.line(w - inset, inset, inset, h - inset, options),
          ]),
    );
  }
}
