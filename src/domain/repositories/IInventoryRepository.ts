import type { InventoryItem } from '@/lib/types';

/**
 * Repository Interface para Inventory
 * Define el contrato que cualquier implementación debe cumplir
 *
 * Principio de Inversión de Dependencias (SOLID):
 * - Las capas superiores dependen de esta abstracción
 * - Las implementaciones concretas también dependen de esta abstracción
 */
export interface IInventoryRepository {
  /**
   * Obtiene todos los items del inventario
   */
  getAll(): Promise<InventoryItem[]>;

  /**
   * Obtiene un item por su ID
   */
  getById(id: string): Promise<InventoryItem | null>;

  /**
   * Crea un nuevo item en el inventario
   */
  create(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem>;

  /**
   * Actualiza un item existente
   */
  update(id: string, item: Partial<Omit<InventoryItem, 'id'>>): Promise<void>;

  /**
   * Elimina un item del inventario
   */
  delete(id: string): Promise<void>;
}
