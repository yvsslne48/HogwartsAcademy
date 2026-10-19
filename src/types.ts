export type House =
  | "Gryffindor"
  | "Slytherin"
  | "Ravenclaw"
  | "Hufflepuff";

export interface Wizard {
  id: number;
  name: string;
  house: House;
  level: number;
  active: boolean;

  // Index signature: dynamic properties must use these value types.
  [key: string]: string | number | boolean;
}

export type SpellCategory = "attack" | "defense" | "healing";

export interface Spell {
  id: number;
  name: string;
  category: SpellCategory;
  power: number;
}

export type AcademyEvent =
  | { type: "spell-cast"; wizardId: number; spellName: string }
  | { type: "level-up"; wizardId: number; newLevel: number }
  | { type: "wizard-expelled"; wizardId: number };

// Conditional type: choose an output type based on the spell category.
export type SpellOutput<T extends SpellCategory> =
  T extends "attack" ? number :
  T extends "defense" ? boolean :
  T extends "healing" ? string :
  never;

// infer extracts an array element type.
export type ArrayElement<T> =
  T extends (infer Item)[] ? Item : never;

// Utility type examples.

/**
 * Exercice 1 — Omit qui conserve les propriétés connues.
 *
 * Wizard a une signature d'index, donc keyof Wizard = string | number.
 * Le Omit natif devient alors Pick<Wizard, string | number> : il ne garde
 * QUE la signature d'index et perd name, house, level et active
 * (un objet vide ou { house: "Durmstrang" } serait un NewWizard valide !).
 * Le remappage de clés (as) retire uniquement « id » et garde tout le reste,
 * signature d'index comprise.
 */
export type StrictOmit<T, K extends PropertyKey> = {
  [P in keyof T as Exclude<P, K>]: T[P];
};

// Sorcier sans « id » : c'est le référentiel qui l'attribue (id interdit à l'appelant).
export type NewWizard = StrictOmit<Wizard, "id"> & { id?: never };
export type WizardSummary = Pick<Wizard, "id" | "name" | "house">;
export type WizardUpdate = Partial<Wizard>;

export type AttackSpell = Extract<Spell, { category: "attack" }>;
export type NonHealingCategory = Exclude<SpellCategory, "healing">;
export type HousePoints = Record<House, number>;
