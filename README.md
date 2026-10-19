# Hogwarts Academy — Mini-projet TypeScript

Petit projet en ligne de commande (thème Poudlard conservé) pour pratiquer :

- les génériques et leurs contraintes ;
- les utility types : `Pick`, `Omit`, `Partial`, `Record`, `Parameters`, `ReturnType`, `Extract`, `Exclude` ;
- les types conditionnels et `infer` ;
- les signatures d'index ;
- les type guards et les unions discriminées ;
- les décorateurs de méthode « legacy » de TypeScript (`target`, `propertyKey`, `descriptor`).

## Prérequis

- Node.js 18 ou plus récent
- npm

## Installation et exécution

```bash
npm install        # installe typescript, tsx et @types/node
npm start          # exécute src/main.ts : démonstrations + tests des exercices
npm run typecheck  # vérifie les types (tsc --noEmit), y compris src/type-tests.ts
```

## Exercices réalisés (TAF)

Chaque exercice correspond à un commit (voir [Historique Git](#historique-git)).

| # | Exercice | Fichiers modifiés | Réalisation |
|---|----------|-------------------|-------------|
| 1 | Ajouter un nouveau sorcier | `types.ts`, `repository.ts`, `main.ts` | `WizardRepository.register(newWizard: NewWizard): Wizard` : l'appelant ne fournit pas d'id, le référentiel attribue le suivant (plus grand id existant + 1) |
| 2 | Filtrer par maison | `repository.ts`, `main.ts` | `WizardRepository.findByHouse(house: Wizard["house"]): Wizard[]`, réutilisée par `AcademyService.findByHouse()` |
| 3 | Événement de sort | `types.ts`, `main.ts` | `SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>` et `handleSpellCast(event: SpellCastEvent)` |
| 4 | Valider la puissance d'un sort | `decorators.ts`, `repository.ts`, `main.ts` | Décorateur `@ValidateSpellPower` appliqué à `SpellRepository.add()` (`override`) |
| 5 | Méthode mise en cache | `decorators.ts`, `main.ts` | Décorateur `@Cache` (une `Map` par instance, rangée dans une `WeakMap`) sur `SpellCalculator.calculatePower()` |
| 6 | Type guard strict | `main.ts` | `validHouses` + `isHouse(value): value is House`, utilisé par `isWizard()` |

### Remarque sur l'exercice 1 : `Omit<Wizard, "id">` ne suffit pas ici

`Wizard` possède une signature d'index (`[key: string]: string | number | boolean`), donc
`keyof Wizard` vaut `string | number`. Le `Omit` natif calcule alors
`Pick<Wizard, Exclude<string | number, "id">>`, c'est-à-dire `Pick<Wizard, string | number>` :
il ne reste **que** la signature d'index, et `name`, `house`, `level`, `active` ne sont plus
obligatoires. Avec le type d'origine, ces appels compileraient :

```ts
wizards.register({});                      // aucun champ !
wizards.register({ house: "Durmstrang" }); // maison invalide
```

De plus, `register()` ne pouvait pas construire un `Wizard` sans cast :
`{ ...newWizard, id }` n'était pas assignable à `Wizard` (erreur TS2739).

`NewWizard` repose donc sur un `Omit` « strict » qui utilise le remappage de clés : il retire
seulement `id` et conserve les propriétés connues **et** la signature d'index.

```ts
export type StrictOmit<T, K extends PropertyKey> = {
  [P in keyof T as Exclude<P, K>]: T[P];
};

export type NewWizard = StrictOmit<Wizard, "id"> & { id?: never };
```

`{ id?: never }` empêche en plus l'appelant de fournir un id : c'est bien le référentiel qui
l'attribue.

### Autres choix

- **Exercice 4** : Protego (id 102) n'est plus ajouté au démarrage. C'est le test de
  l'exercice 4 qui l'ajoute, comme dans le TAF, ce qui évite deux sorts avec le même id. Le sort
  invalide est ajouté dans un `try/catch`, sinon l'erreur du décorateur arrêterait le programme
  avant les exercices 5 et 6.
- **Exercice 6 (bonus)** : `isWizard()` vérifie aussi que les propriétés dynamiques respectent
  la signature d'index. Sans cela, `{ ..., wand: { core: "Phoenix feather" } }` serait accepté
  comme `Wizard`, alors que TypeScript refuse ce même objet à la compilation.
- `AcademyService.findByHouse()` et `getSpellEvents()` réutilisent `findByHouse()` du référentiel
  et l'alias `SpellCastEvent`, au lieu de dupliquer le filtre et le `Extract<...>`.

## Tests

- **À l'exécution** (`npm start`) : chaque exercice a sa section `=== Exercice N ===` dans
  `src/main.ts`.
- **À la compilation** (`npm run typecheck`) : `src/type-tests.ts` vérifie ce qui doit être
  **refusé** par TypeScript, avec `// @ts-expect-error`. Exemples : fournir un `id` à `register()`,
  oublier `level`, passer `"Durmstrang"` à `findByHouse()`, typer un événement `level-up` en
  `SpellCastEvent`. Si l'une de ces lignes devenait valide, `tsc` échouerait. Ce fichier n'est
  jamais exécuté.

<details>
<summary><strong>Sortie de <code>npm start</code> pour les exercices</strong> (les durées <code>[TIME]</code> peuvent varier)</summary>

```text
=== Exercice 1 : Ajouter un nouveau sorcier (NewWizard) ===
[CALL] add [
  {
    name: 'Luna Lovegood',
    house: 'Ravenclaw',
    level: 6,
    active: true,
    patronus: 'Hare',
    id: 4
  }
]
[RETURN] add undefined
[CALL] add [
  {
    name: 'Cedric Diggory',
    house: 'Hufflepuff',
    level: 7,
    active: true,
    id: 5
  }
]
[RETURN] add undefined
Id attribué à Luna Lovegood : 4
Id attribué à Cedric Diggory : 5
[TIME] findById: 0 ms
{
  name: 'Luna Lovegood',
  house: 'Ravenclaw',
  level: 6,
  active: true,
  patronus: 'Hare',
  id: 4
}

=== Exercice 2 : Filtrer les sorciers par maison (findByHouse) ===
Gryffindor : [ 'Harry Potter', 'Hermione Granger' ]
Slytherin  : [ 'Draco Malfoy' ]
Ravenclaw  : [ 'Luna Lovegood' ]
Hufflepuff : [ 'Cedric Diggory' ]

=== Exercice 3 : Événements de lancement de sorts (Extract) ===
Wizard 1 cast Expelliarmus
3 événements reçus, 1 transmis au gestionnaire :
Wizard 1 cast Lumos

=== Exercice 4 : Valider la puissance d'un sort (@ValidateSpellPower) ===
[CALL] add [ { id: 102, name: 'Protego', category: 'defense', power: 50 } ]
[RETURN] add undefined
Sort "Invalid Spell" refusé : Spell power cannot be negative
Sorts enregistrés : [ 'Expelliarmus (80)', 'Protego (50)' ]

=== Exercice 5 : Méthode mise en cache (@Cache) ===
[CACHE MISS] calculatePower
Calculating...
30
[CACHE HIT] calculatePower
30
[CACHE MISS] calculatePower
Calculating...
10
Nouvelle instance de SpellCalculator (cache séparé) :
[CACHE MISS] calculatePower
Calculating...
30

=== Exercice 6 : Type guard strict (isHouse / isWizard) ===
isWizard(validData)   : true
isWizard(invalidData) : false
isHouse("Ravenclaw")  : true
isHouse("Durmstrang") : false
isHouse(42)           : false
isWizard(wandData)    : false
```

</details>

## Structure du projet

```text
src/
├── types.ts        types du domaine et utility types (NewWizard, SpellCastEvent…)
├── repository.ts   Repository<T> générique, WizardRepository, SpellRepository
├── decorators.ts   Log, MeasureTime, ValidateSpellPower, Cache
├── main.ts         services, type guards, démonstrations et tests des exercices
└── type-tests.ts   tests de types vérifiés à la compilation (jamais exécuté)
```

## Historique Git

Un commit par étape (`git log --oneline --reverse`) :

```text
chore: projet de départ Hogwarts Academy
chore: ajout du .gitignore et du package-lock.json
feat(ex1): enregistrer un nouveau sorcier avec NewWizard
feat(ex2): filtrer les sorciers par maison avec findByHouse
feat(ex3): type SpellCastEvent avec Extract et handleSpellCast
feat(ex4): décorateur ValidateSpellPower sur SpellRepository.add
feat(ex5): décorateur Cache (WeakMap + Map) et SpellCalculator
feat(ex6): type guard isHouse basé sur validHouses
docs: README en français (exercices, tests, sortie attendue)
```

Pour voir le détail d'un exercice : `git show <hash>` (hash affiché par `git log --oneline`).

## Note sur les décorateurs

Le projet utilise volontairement l'API de décorateurs « legacy » de TypeScript, pour manipuler
les trois arguments d'un décorateur de méthode : `target`, `propertyKey` et `descriptor`. Elle
est activée par `"experimentalDecorators": true` dans `tsconfig.json`.
