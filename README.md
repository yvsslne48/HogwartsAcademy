# Hogwarts Academy

Mini-projet TypeScript réalisé dans le cadre du cours. J'ai gardé le thème Harry Potter : l'application gère une petite académie de sorciers, avec des sorciers, des sorts et des événements (lancement de sort, passage de niveau, renvoi d'un élève).

Le projet tourne dans la console. Il n'y a pas de base de données, les données sont gardées en mémoire pendant l'exécution.

Notions TypeScript utilisées :

- génériques
- utility types (Pick, Omit, Partial, Record, Extract, Exclude, Parameters, ReturnType)
- types conditionnels et infer
- signatures d'index
- type guards et unions discriminées
- décorateurs de méthode (ancienne API, activée avec `experimentalDecorators`)

## Technologies

- TypeScript 5
- Node.js 18 ou plus
- tsx, pour exécuter les fichiers .ts directement
- Git (un commit par exercice)

## Installation

```bash
npm install
```

## Lancer le projet

```bash
npm start
```

Le programme affiche d'abord les démonstrations du projet de départ, puis les résultats des exercices 1 à 6.

Pour vérifier les types sans lancer le programme :

```bash
npm run typecheck
```

## Architecture

```
hogwarts-academy/
├── src/
│   ├── types.ts         modèle de données et types dérivés
│   ├── repository.ts    stockage des données (repository générique)
│   ├── decorators.ts    décorateurs de méthode
│   ├── main.ts          services, type guards et point d'entrée
│   └── type-tests.ts    tests de types (compilation uniquement)
├── package.json
└── tsconfig.json
```

### types.ts

Contient le modèle de données : `Wizard`, `Spell`, `House`, `SpellCategory` et `AcademyEvent` (union discriminée sur le champ `type`). Les autres types sont construits à partir de ceux-là avec les utility types, par exemple `NewWizard` (un sorcier sans id), `WizardSummary`, `SpellCastEvent` ou `HousePoints`.

### repository.ts

C'est la couche qui stocke les données. `Repository<T>` est une classe générique qui marche pour n'importe quel objet qui a un `id`, avec les méthodes `add`, `findById`, `getAll` et `update`.

Deux classes en héritent :

- `WizardRepository`, qui ajoute `register()` (enregistre un sorcier et lui donne un id) et `findByHouse()`
- `SpellRepository`, qui redéfinit `add()` pour vérifier la puissance du sort

### decorators.ts

Les décorateurs ajoutent un comportement à une méthode sans toucher à son code :

- `Log` affiche chaque appel avec ses arguments et sa valeur de retour
- `MeasureTime` affiche le temps d'exécution
- `ValidateSpellPower` refuse un sort dont la puissance est négative
- `Cache` réutilise le résultat quand la méthode est rappelée avec les mêmes arguments

### main.ts

Le point d'entrée du programme. On y trouve :

- les type guards `isHouse()` et `isWizard()`, pour vérifier des données de type `unknown`
- `AcademyService`, qui utilise les deux repositories (lancer un sort, chercher par maison, modifier un sorcier, filtrer les événements)
- `SpellCalculator`, un petit service qui calcule la puissance d'un sort, avec mise en cache
- la création des données de départ et les tests de chaque exercice

### type-tests.ts

Ce fichier n'est jamais exécuté. Il contient des lignes qui doivent provoquer une erreur de compilation (avec `// @ts-expect-error`), par exemple `findByHouse("Durmstrang")` ou un appel à `register()` avec un id. Si une de ces lignes devient valide, `npm run typecheck` échoue.

### Dépendances entre les fichiers

```
main.ts
├── repository.ts
│   ├── types.ts
│   └── decorators.ts
├── decorators.ts
└── types.ts
```

Au lancement, `main.ts` crée les deux repositories, ajoute les sorciers et les sorts de départ, crée `AcademyService`, puis exécute les démonstrations et les tests.

## Exercices réalisés

1. Ajouter un sorcier : `register(newWizard: NewWizard)` dans `WizardRepository`. L'appelant ne donne pas d'id, c'est le repository qui l'attribue (plus grand id existant + 1).
2. Filtrer par maison : `findByHouse(house: Wizard["house"])`, qui accepte seulement les quatre maisons.
3. Événements de sort : `SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>` et la fonction `handleSpellCast()`.
4. Puissance d'un sort : décorateur `ValidateSpellPower` sur `SpellRepository.add()`.
5. Mise en cache : décorateur `Cache` (une Map par instance, rangée dans une WeakMap) sur `SpellCalculator.calculatePower()`.
6. Type guard : `isHouse()` compare la valeur à la liste `validHouses`, et `isWizard()` l'utilise pour refuser une maison comme "Durmstrang".

## Remarque sur l'exercice 1

`Omit<Wizard, "id">` ne marchait pas comme prévu. Comme `Wizard` a une signature d'index (`[key: string]: ...`), `Omit` faisait aussi disparaître `name`, `house`, `level` et `active`, et un objet vide était accepté comme `NewWizard`. J'ai donc écrit un type `StrictOmit` qui retire seulement `id`.