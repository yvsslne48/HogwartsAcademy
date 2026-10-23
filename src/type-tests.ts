import type { NewWizard, SpellCastEvent, Wizard } from "./types";
import type { WizardRepository } from "./repository";

declare const wizards: WizardRepository;

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

const ravenclaws: Wizard[] = wizards.findByHouse("Ravenclaw");

// @ts-expect-error — une chaîne arbitraire n'est pas une House
wizards.findByHouse("Durmstrang");

const lumos: SpellCastEvent = { type: "spell-cast", wizardId: 1, spellName: "Lumos" };
const spellName: string = lumos.spellName; // accessible sans vérifier lumos.type

// @ts-expect-error — un événement « level-up » n'est pas un SpellCastEvent
const levelUp: SpellCastEvent = { type: "level-up", wizardId: 2, newLevel: 9 };

// @ts-expect-error — un « spell-cast » sans spellName est incomplet
const incompleteCast: SpellCastEvent = { type: "spell-cast", wizardId: 1 };
