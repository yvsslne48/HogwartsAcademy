import {
  type Wizard,
  type Spell,
  type AcademyEvent,
  type House,
  type HousePoints,
  type SpellCategory,
  type SpellOutput,
  type ArrayElement,
  type WizardSummary,
  type WizardUpdate,
  type AttackSpell,
  type NonHealingCategory,
  type SpellCastEvent,
} from "./types";

import { WizardRepository, SpellRepository } from "./repository";
import { Log, Cache } from "./decorators";

// Exercice 6 — Les quatre maisons autorisées. Le type readonly House[]
const validHouses: readonly House[] = [
  "Gryffindor",
  "Slytherin",
  "Ravenclaw",
  "Hufflepuff"
];

// Exercice 6 — Type guard dédié. « value is House » est un prédicat de type :
function isHouse(value: unknown): value is House {
  return (
    typeof value === "string" &&
    validHouses.some(house => house === value)
  );
}

// Valeurs autorisées par la signature d'index de Wizard.
function isIndexSignatureValue(value: unknown): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

// Exercice 6 — house est validée par isHouse() : "Durmstrang" est rejeté.
function isWizard(value: unknown): value is Wizard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isHouse(candidate.house) &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean" &&
    Object.values(candidate).every(isIndexSignatureValue)
  );
}

// Exercice 3 — Gestionnaire qui n'accepte QUE les événements « spell-cast ».
function handleSpellCast(event: SpellCastEvent): void {
  console.log(
    `Wizard ${event.wizardId} cast ${event.spellName}`
  );
}

// Exercice 5 — Service dont la méthode est mise en cache par @Cache.
class SpellCalculator {
  @Cache
  calculatePower(basePower: number, multiplier: number): number {
    console.log("Calculating...");

    return basePower * multiplier;
  }
}

class AcademyService {
  constructor(
    private readonly wizards: WizardRepository,
    private readonly spells: SpellRepository
  ) {}

  @Log
  castSpell(wizardId: number, spellId: number): string {
    const wizard = this.wizards.findById(wizardId);
    const spell = this.spells.findById(spellId);

    if (!wizard || !spell) {
      throw new Error("Wizard or spell not found");
    }

    return `${wizard.name} casts ${spell.name}!`;
  }

  findByHouse(house: House): WizardSummary[] {
    // Exercice 2 — le service réutilise le filtre du référentiel.
    return this.wizards
      .findByHouse(house)
      .map(({ id, name, house }) => ({ id, name, house }));
  }

  updateWizard(id: number, changes: WizardUpdate): boolean {
    return this.wizards.update(id, changes);
  }

  // Exercice 3 — réutilise l'alias SpellCastEvent au lieu de répéter Extract<...>.
  getSpellEvents(events: AcademyEvent[]): SpellCastEvent[] {
    return events.filter(
      (event): event is SpellCastEvent => event.type === "spell-cast"
    );
  }
}

const wizards = new WizardRepository();
const spells = new SpellRepository();

wizards.add({
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true,
  patronus: "Stag"
});

wizards.add({
  id: 2,
  name: "Hermione Granger",
  house: "Gryffindor",
  level: 8,
  active: true
});

wizards.add({
  id: 3,
  name: "Draco Malfoy",
  house: "Slytherin",
  level: 6,
  active: true
});

spells.add({
  id: 101,
  name: "Expelliarmus",
  category: "attack",
  power: 80
});


const academy = new AcademyService(wizards, spells);

console.log("\n--- Cast a spell ---");
console.log(academy.castSpell(1, 101));

console.log("\n--- Find wizards by house ---");
console.log(academy.findByHouse("Gryffindor"));

console.log("\n--- Update a wizard ---");
academy.updateWizard(1, { level: 6 });
console.log(wizards.findById(1));

console.log("\n--- Type guard ---");
const unknownWizard: unknown = wizards.findById(1);
if (isWizard(unknownWizard)) {
  console.log(`${unknownWizard.name} belongs to ${unknownWizard.house}`);
}

console.log("\n--- Record utility type ---");
const points: HousePoints = {
  Gryffindor: 100,
  Slytherin: 80,
  Ravenclaw: 90,
  Hufflepuff: 70
};
console.log(points);

console.log("\n--- Extract spell-cast events ---");
const events: AcademyEvent[] = [
  { type: "spell-cast", wizardId: 1, spellName: "Lumos" },
  { type: "level-up", wizardId: 2, newLevel: 9 },
  { type: "wizard-expelled", wizardId: 3 }
];
console.log(academy.getSpellEvents(events));

// TAF — Tests des exercices

console.log("\n=== Exercice 1 : Ajouter un nouveau sorcier (NewWizard) ===");
const luna = wizards.register({
  name: "Luna Lovegood",
  house: "Ravenclaw",
  level: 6,
  active: true,
  patronus: "Hare" // propriété dynamique autorisée par la signature d'index
});

const cedric = wizards.register({
  name: "Cedric Diggory",
  house: "Hufflepuff",
  level: 7,
  active: true
});

console.log(`Id attribué à ${luna.name} : ${luna.id}`); // 4
console.log(`Id attribué à ${cedric.name} : ${cedric.id}`); // 5
console.log(wizards.findById(luna.id));

console.log("\n=== Exercice 2 : Filtrer les sorciers par maison (findByHouse) ===");
console.log("Gryffindor :", wizards.findByHouse("Gryffindor").map(wizard => wizard.name));
console.log("Slytherin  :", wizards.findByHouse("Slytherin").map(wizard => wizard.name));
console.log("Ravenclaw  :", wizards.findByHouse("Ravenclaw").map(wizard => wizard.name));
console.log("Hufflepuff :", wizards.findByHouse("Hufflepuff").map(wizard => wizard.name));

console.log("\n=== Exercice 3 : Événements de lancement de sorts (Extract) ===");
handleSpellCast({
  type: "spell-cast",
  wizardId: 1,
  spellName: "Expelliarmus"
});

const spellEvents = academy.getSpellEvents(events);
console.log(`${events.length} événements reçus, ${spellEvents.length} transmis au gestionnaire :`);
spellEvents.forEach(handleSpellCast);

console.log("\n=== Exercice 4 : Valider la puissance d'un sort (@ValidateSpellPower) ===");
spells.add({
  id: 102,
  name: "Protego",
  category: "defense",
  power: 50
});

try {
  spells.add({
    id: 103,
    name: "Invalid Spell",
    category: "attack",
    power: -10
  });
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`Sort "Invalid Spell" refusé : ${message}`);
}

console.log(
  "Sorts enregistrés :",
  spells.getAll().map(spell => `${spell.name} (${spell.power})`)
);

console.log("\n=== Exercice 5 : Méthode mise en cache (@Cache) ===");
const calculator = new SpellCalculator();

console.log(calculator.calculatePower(10, 3)); // MISS : calcul -> 30
console.log(calculator.calculatePower(10, 3)); // HIT  : 30 sans recalcul
console.log(calculator.calculatePower(5, 2)); // MISS : nouveaux arguments -> 10

console.log("Nouvelle instance de SpellCalculator (cache séparé) :");
const otherCalculator = new SpellCalculator();
console.log(otherCalculator.calculatePower(10, 3)); // MISS : calcul -> 30

console.log("\n=== Exercice 6 : Type guard strict (isHouse / isWizard) ===");
const validData: unknown = {
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true
};

const invalidData: unknown = {
  id: 2,
  name: "Viktor",
  house: "Durmstrang",
  level: 5,
  active: true
};

console.log("isWizard(validData)   :", isWizard(validData)); // true
console.log("isWizard(invalidData) :", isWizard(invalidData)); // false
console.log('isHouse("Ravenclaw")  :', isHouse("Ravenclaw")); // true
console.log('isHouse("Durmstrang") :', isHouse("Durmstrang")); // false
console.log("isHouse(42)           :", isHouse(42)); // false

const wandData: unknown = {
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true,
  wand: { wood: "Holly", core: "Phoenix feather" }
};
console.log("isWizard(wandData)    :", isWizard(wandData)); // false

// Compile-time demonstrations: these aliases are checked by TypeScript.
type CastArguments = Parameters<AcademyService["castSpell"]>;
type CastResult = ReturnType<AcademyService["castSpell"]>;
type AttackOutput = SpellOutput<"attack">; // number
type HealingOutput = SpellOutput<"healing">; // string
type SpellItem = ArrayElement<Spell[]>; // Spell
type AttackSpellExample = AttackSpell;
type RemainingCategories = NonHealingCategory;
type CategoryExample = SpellCategory;

const typeExamples: [
  CastArguments,
  CastResult,
  AttackOutput,
  HealingOutput,
  SpellItem,
  AttackSpellExample["category"],
  RemainingCategories,
  CategoryExample
] | null = null;

void typeExamples;
