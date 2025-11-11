/**
 * IDiscountRepository - Interfaz de Repositorio de Descuentos
 *
 * 🟦 DOMAIN LAYER - Repository Interface
 *
 * Define el contrato para operaciones de persistencia de descuentos.
 * Esta interfaz pertenece a la capa de dominio y es implementada
 * por la capa de infraestructura.
 *
 * Portable: ✅ 100% - Sin dependencias de frameworks
 */

import type { DiscountRule } from '@/lib/types';

export interface IDiscountRepository {
  /**
   * Obtiene todos los descuentos del sistema
   */
  getAll(): Promise<DiscountRule[]>;

  /**
   * Obtiene un descuento por su ID
   */
  getById(id: string): Promise<DiscountRule | null>;

  /**
   * Obtiene todos los descuentos asociados a un combo específico
   */
  getByComboId(comboId: string): Promise<DiscountRule[]>;

  /**
   * Obtiene descuentos activos en este momento
   * (filtra por día, fecha y horario)
   */
  getActiveDiscounts(currentDate?: Date): Promise<DiscountRule[]>;

  /**
   * Crea un nuevo descuento
   */
  create(discount: Omit<DiscountRule, 'id'>): Promise<DiscountRule>;

  /**
   * Actualiza un descuento existente
   */
  update(id: string, discount: Partial<DiscountRule>): Promise<void>;

  /**
   * Elimina un descuento
   */
  delete(id: string): Promise<void>;

  /**
   * Asigna un descuento a un combo
   */
  assignToCombo(discountId: string, comboId: string): Promise<void>;

  /**
   * Desasigna un descuento de un combo
   */
  unassignFromCombo(discountId: string, comboId: string): Promise<void>;
}
