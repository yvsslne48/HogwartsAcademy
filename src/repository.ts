import type { Wizard, Spell, NewWizard } from "./types";
import { Log, MeasureTime } from "./decorators";

export class Repository<T extends { id: number }> {
  private items: T[] = [];

  @Log
  add(item: T): void {
    this.items.push(item);
  }

  @MeasureTime
  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  update(id: number, changes: Partial<T>): boolean {
    const item = this.findById(id);

    if (!item) return false;

    Object.assign(item, changes);
    return true;
  }
}

export class WizardRepository extends Repository<Wizard> {
  /**
   * Exercice 1 — Enregistre un nouveau sorcier.
   * L'appelant fournit toutes les propriétés sauf « id » (type NewWizard) ;
   * le référentiel attribue l'identifiant et renvoie le sorcier complet.
   */
  register(newWizard: NewWizard): Wizard {
    const wizard: Wizard = { ...newWizard, id: this.nextId() };
    this.add(wizard);
    return wizard;
  }

  // Prochain identifiant libre : plus grand id existant + 1, ce qui évite
  // toute collision avec les sorciers ajoutés directement via add().
  private nextId(): number {
    return this.getAll().reduce((maxId, wizard) => Math.max(maxId, wizard.id), 0) + 1;
  }
}
export class SpellRepository extends Repository<Spell> {}
