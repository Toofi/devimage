import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { fakeAdapters } from './application/testing/fakes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: fakeAdapters(),
    }).compileComponents();
  });

  it("affiche les thèmes sur l'écran d'accueil", async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Devimage');
    expect(el.textContent).toContain('animaux');
    expect(el.textContent).toContain('5 cartes');
  });
});
