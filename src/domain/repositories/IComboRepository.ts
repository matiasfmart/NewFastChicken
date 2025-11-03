import type { Combo } from '@/lib/types';

/**
 * Repository Interface para Combos
 * Define el contrato que cualquier implementación debe cumplir
 */
export interface IComboRepository {
  /**
   * Obtiene todos los combos
   */
  getAll(): Promise<Combo[]>;

  /**
   * Obtiene un combo por su ID
   */
  getById(id: string): Promise<Combo | null>;

  /**
   * Crea un nuevo combo
   */
  create(combo: Omit<Combo, 'id'>): Promise<Combo>;

  /**
   * Actualiza un combo existente
   */
  update(id: string, combo: Partial<Omit<Combo, 'id'>>): Promise<void>;

  /**
   * Elimina un combo
   */
  delete(id: string): Promise<void>;
}
