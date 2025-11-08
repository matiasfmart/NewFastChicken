/**
 * Finalize Order Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta el proceso completo de finalizar una orden
 * - Coordina múltiples repositorios y servicios de dominio
 * - Maneja transacciones y flujos complejos
 * - NO contiene lógica de negocio (eso va en domain/services)
 * - 100% portable entre backend y frontend
 */

import type { Order, OrderItem } from '@/lib/types';
import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import type { IShiftRepository } from '@/domain/repositories/IShiftRepository';

export interface FinalizeOrderInput {
  shiftId?: string;
  items: OrderItem[];
  deliveryType: 'local' | 'takeaway' | 'delivery';
  subtotal: number;
  discount: number;
  total: number;
}

export class FinalizeOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private shiftRepository: IShiftRepository
  ) {}

  /**
   * Ejecuta el caso de uso de finalizar orden
   *
   * @param input - Datos de la orden a finalizar
   * @returns La orden creada
   * @throws Error si no hay items, si no hay jornada activa, o si falla la creación
   */
  async execute(input: FinalizeOrderInput): Promise<Order> {
    // 1. Validaciones de negocio
    if (input.items.length === 0) {
      throw new Error('No se puede finalizar una orden vacía');
    }

    if (!input.shiftId) {
      throw new Error('No hay una jornada activa. Debe iniciar una jornada antes de crear órdenes.');
    }

    // 2. Crear la orden y actualizar stock (transacción atómica en el repository)
    const orderData = {
      shiftId: input.shiftId,
      items: input.items,
      deliveryType: input.deliveryType,
      subtotal: input.subtotal,
      discount: input.discount,
      total: input.total,
      createdAt: new Date(),
    };

    const finalOrder = await this.orderRepository.createWithStockUpdate(orderData);

    // 3. Actualizar totales de la jornada
    const shift = await this.shiftRepository.getById(input.shiftId);
    if (shift) {
      await this.shiftRepository.update(input.shiftId, {
        totalOrders: shift.totalOrders + 1,
        totalRevenue: shift.totalRevenue + input.total
      });
    }

    return finalOrder;
  }
}
