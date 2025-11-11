/**
 * Assign Discount To Combo Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta la asignación de un descuento a un combo
 * - Verifica que el descuento y combo existen
 * - Coordina con repositories
 */

import type { IDiscountRepository } from '@/domain/repositories/IDiscountRepository';
import type { IComboRepository } from '@/domain/repositories/IComboRepository';

export interface AssignDiscountToComboInput {
  discountId: string;
  comboId: string;
}

export class AssignDiscountToComboUseCase {
  constructor(
    private discountRepository: IDiscountRepository,
    private comboRepository: IComboRepository
  ) {}

  /**
   * Ejecuta el caso de uso de asignar descuento a combo
   *
   * @param input - IDs del descuento y combo
   * @throws Error si el descuento o combo no existen
   */
  async execute(input: AssignDiscountToComboInput): Promise<void> {
    // Verificar que el descuento existe
    const discount = await this.discountRepository.getById(input.discountId);
    if (!discount) {
      throw new Error(`Descuento con id ${input.discountId} no encontrado`);
    }

    // Verificar que el combo existe
    const combo = await this.comboRepository.getById(input.comboId);
    if (!combo) {
      throw new Error(`Combo con id ${input.comboId} no encontrado`);
    }

    // Asignar
    await this.discountRepository.assignToCombo(input.discountId, input.comboId);
  }
}
