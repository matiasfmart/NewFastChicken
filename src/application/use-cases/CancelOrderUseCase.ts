/**
 * Cancel Order Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta el proceso completo de cancelar una orden
 * - Coordina repositorios y servicios de dominio
 * - NO contiene lógica de negocio (delega en domain/services)
 * - 100% portable entre backend y frontend
 */

import type { Order } from '@/lib/types';
import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import type { IShiftRepository } from '@/domain/repositories/IShiftRepository';
import { OrderService } from '@/domain/services/OrderService';

export interface CancelOrderInput {
  orderId: string;
  reason?: string;
}

export class CancelOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private shiftRepository: IShiftRepository
  ) {}

  /**
   * Ejecuta el caso de uso de cancelar orden
   *
   * @param input - Datos de la cancelación
   * @returns La orden cancelada
   * @throws Error si la orden no existe, ya está cancelada, o no se puede cancelar
   */
  async execute(input: CancelOrderInput): Promise<Order> {
    // 1. Validar razón de cancelación (lógica de dominio)
    if (!OrderService.isValidCancellationReason(input.reason)) {
      throw new Error('La razón de cancelación no es válida');
    }

    // 2. Obtener la orden
    const order = await this.orderRepository.getById(input.orderId);
    if (!order) {
      throw new Error('No se encontró la orden especificada');
    }

    // 3. Validar si puede cancelarse (lógica de dominio)
    if (!OrderService.canBeCancelled(order)) {
      throw new Error('Esta orden no puede ser cancelada');
    }

    // 4. Cancelar la orden en el repositorio
    const cancelledOrder = await this.orderRepository.cancel(
      input.orderId,
      input.reason
    );

    // 5. Si la orden tiene jornada asociada, recalcular totales
    if (cancelledOrder.shiftId) {
      const shift = await this.shiftRepository.getById(cancelledOrder.shiftId);

      if (shift) {
        // Obtener todas las órdenes de la jornada
        const shiftOrders = await this.orderRepository.getByShiftId(
          cancelledOrder.shiftId
        );

        // Recalcular totales usando la lógica de dominio
        const newTotals = OrderService.recalculateShiftTotals(shift, shiftOrders);

        // Actualizar la jornada
        await this.shiftRepository.update(cancelledOrder.shiftId, newTotals);
      }
    }

    return cancelledOrder;
  }
}
