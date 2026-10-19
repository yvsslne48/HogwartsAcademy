/**
 * Tests de types — vérifiés à la compilation par `npm run typecheck`.
 * Ce fichier n'est jamais exécuté : main.ts ne l'importe pas.
 *
 * Chaque ligne précédée de « @ts-expect-error » DOIT provoquer une erreur de
 * compilation ; si elle devenait valide, tsc échouerait avec
 * « Unused '@ts-expect-error' directive ». Les autres lignes doivent compiler.
 */
import type { NewWizard, SpellCastEvent, Wizard } from "./types";
import type { WizardRepository } from "./repository";

declare const wizards: WizardRepository;

// ---------------------------------------------------------------------------
// Exercice 1 — NewWizard : toutes les propriétés de Wizard sauf « id »
// ---------------------------------------------------------------------------
const draft: NewWizard = { name: "Neville Longbottom", house: "Gryffindor", level: 4, active: true, toad: "Trevor" };
const neville: Wizard = wizards.register(draft); // register() renvoie un Wizard complet (avec id)

// @ts-expect-error — l'id est attribué par le référentiel : l'appelant ne peut pas le fournir
wizards.register({ id: 99, name: "Neville Longbottom", house: "Gryffindor", level: 4, active: true });

// @ts-expect-error — propriétés obligatoires manquantes (level, active)
wizards.register({ name: "Neville Longbottom", house: "Gryffindor" });

// @ts-expect-error — "Durmstrang" ne fait pas partie de l'union House
wizards.register({ name: "Viktor Krum", house: "Durmstrang", level: 5, active: true });

// Pourquoi StrictOmit ? Avec le Omit natif, ces objets incomplets compilent :
type NaiveNewWizard = Omit<Wizard, "id">;
const emptyWizard: NaiveNewWizard = {};
const foreignWizard: NaiveNewWizard = { house: "Durmstrang" };

// ---------------------------------------------------------------------------
// Exercice 2 — findByHouse(house: Wizard["house"])
// ---------------------------------------------------------------------------
const ravenclaws: Wizard[] = wizards.findByHouse("Ravenclaw");

// @ts-expect-error — une chaîne arbitraire n'est pas une House
wizards.findByHouse("Durmstrang");

// ---------------------------------------------------------------------------
// Exercice 3 — SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>
// ---------------------------------------------------------------------------
const lumos: SpellCastEvent = { type: "spell-cast", wizardId: 1, spellName: "Lumos" };
const spellName: string = lumos.spellName; // accessible sans vérifier lumos.type

// @ts-expect-error — un événement « level-up » n'est pas un SpellCastEvent
const levelUp: SpellCastEvent = { type: "level-up", wizardId: 2, newLevel: 9 };

// @ts-expect-error — un « spell-cast » sans spellName est incomplet
const incompleteCast: SpellCastEvent = { type: "spell-cast", wizardId: 1 };
