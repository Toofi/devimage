# Devimage

PWA Angular pour apprendre à lire : un mot s'affiche, l'enfant choisit parmi trois images celle qui lui correspond.

- Sur l'écran d'accueil, on coche les thèmes. Le paquet contient tous les mots des thèmes cochés.
- Les pièges commencent si possible comme le mot (« vache » → « valise », « vélo »), pour obliger à lire tout le mot. On les cherche dans tous les thèmes. S'il en manque, on complète au hasard avec les thèmes cochés.
- Une mauvaise image est barrée et l'enfant réessaie. Le mot revient alors plus loin dans le paquet.
- La bonne image est entourée et la voix lit le mot. Avant le choix, la voix ne parle que si le « bouton d'aide » est activé dans les réglages.
- L'écran de fin liste les mots qui ont demandé plus d'essais et propose de les rejouer.

## Développement

```bash
npm ci
npm start                 # http://localhost:4200
npm test -- --watch=false
npm run build
```

Node ≥ 24.15 (voir `.nvmrc`). Les scripts de `scripts/` sont écrits en TypeScript et lancés directement par Node.

## Architecture

```
src/app/
  domain/          logique pure, sans Angular : mots, paquet (deck), tirage d'une manche
  application/     cas d'usage (stores à signaux) et ports : ThemeRepository, KeyValueStore, Speaker
  infrastructure/  implémentations des ports : fetch des JSON, localStorage, Web Speech API
  presentation/    écrans (setup, play, done, credits) et composants partagés
```

Les dépendances vont vers l'intérieur : `presentation` → `application` → `domain`, et `infrastructure` implémente les ports d'`application`. Le branchement se fait dans `app.config.ts` (`adapters`). Les tests remplacent ces adaptateurs par des faux (`application/testing/fakes.ts`).

## Ajouter ou modifier un thème

Un thème est un fichier `public/themes/<id>.json` :

```json
{
  "id": "animaux",
  "label": "Les animaux",
  "emoji": "🐾",
  "mots": [
    { "mot": "chat", "det": "le", "emoji": "🐱", "arasaac": 7114 },
    { "mot": "âne", "det": "l'", "image": "animaux/ane.png" }
  ]
}
```

| Champ | Rôle |
|---|---|
| `det` | `le`, `la` ou `l'`. Affiché en gris devant le mot et lu par la voix. |
| `image` | Ta propre image, chemin relatif à `public/images/`. Prioritaire. |
| `arasaac` | Identifiant d'un pictogramme [ARASAAC](https://arasaac.org), téléchargé dans `public/images/arasaac/`. |
| `emoji` | Illustration si le mot n'a pas de fichier, ou de secours si le fichier ne charge pas. |

Il faut au moins un des trois champs `image`, `arasaac` ou `emoji`. Deux mots qui partagent une image ne sont jamais proposés ensemble.

```bash
npm run pictos -- --chercher chat   # trouver l'identifiant ARASAAC d'un mot
npm run pictos                      # télécharger les pictos manquants
npm run themes:index                # après un ajout ou une suppression de fichier
npm run themes:check                # vérifie tout (lancé aussi par la CI)
```

Les pictogrammes ARASAAC sont sous licence CC BY-NC-SA : les crédits sont affichés dans l'app.

## Icônes

`npm run icons` régénère `public/icons/` à partir du dessin décrit dans `scripts/icons.mts`.

## Déploiement

GitHub Actions (`.github/workflows/ci-cd.yml`) vérifie les thèmes, lance les tests et construit l'app sur chaque PR. Sur `main`, il déploie aussi sur GitHub Pages, avec un `--base-href` calculé à partir du nom du repo.

À faire une seule fois : Settings → Pages → Source : **GitHub Actions**.
