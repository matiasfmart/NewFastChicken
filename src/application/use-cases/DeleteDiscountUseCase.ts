/**
 * Delete Discount Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta la eliminación de un descuento
 * - Verifica que el descuento existe
 * - Elimina el descuento y sus asociaciones con combos
 */

import type { IDiscountRepository } from '@/domain/repositories/IDiscountRepository';

export interface DeleteDiscountInput {
  id: string;
}

export class DeleteDiscountUseCase {
  constructor(private discountRepository: IDiscountRepository) {}

  /**
   * Ejecuta el caso de uso de eliminar descuento
   *
   * @param input - ID del descuento a eliminar
   * @throws Error si el descuento no existe
   */
  async execute(input: DeleteDiscountInput): Promise<void> {
    // Verificar que existe
    const existing = await this.discountRepository.getById(input.id);
    if (!existing) {
      throw new Error(`Descuento con id ${input.id} no encontrado`);
    }

    // Eliminar (el repositorio se encarga de desasociar de combos)
    await this.discountRepository.delete(input.id);
  }
}
