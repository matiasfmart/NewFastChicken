/**
 * Search Orders Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta la búsqueda de órdenes
 * - Simple wrapper sobre el repositorio
 * - Permite extender con lógica adicional en el futuro
 * - 100% portable entre backend y frontend
 */

import type { Order } from '@/lib/types';
import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';

export interface SearchOrdersInput {
  orderId?: string;
  shiftId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'completed' | 'cancelled' | 'all';
}

export class SearchOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  /**
   * Ejecuta el caso de uso de búsqueda de órdenes
   *
   * @param input - Criterios de búsqueda
   * @returns Lista de órdenes que coinciden con los criterios
   */
  async execute(input: SearchOrdersInput): Promise<Order[]> {
    // Validaciones básicas
    if (input.startDate && input.endDate && input.startDate > input.endDate) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    // Delegar búsqueda al repositorio
    return this.orderRepository.search(input);
  }
}
