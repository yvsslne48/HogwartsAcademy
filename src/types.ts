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

export type SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>;

export type SpellOutput<T extends SpellCategory> =
  T extends "attack" ? number :
  T extends "defense" ? boolean :
  T extends "healing" ? string :
  never;

// infer extracts an array element type.
export type ArrayElement<T> =
  T extends (infer Item)[] ? Item : never;

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
