/**
 * Order Service - Servicio de Dominio
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE DOMINIO:
 * - Contiene TODA la lógica de negocio relacionada con órdenes
 * - Funciones PURAS sin dependencias (100% portable)
 * - NO accede a bases de datos ni APIs (eso es responsabilidad de repositories)
 * - NO contiene estado (stateless)
 * - Puede ser reutilizado en frontend, backend, tests, etc.
 */

import type { Order, Shift } from '@/lib/types';

export class OrderService {
  /**
   * Valida si una orden puede ser cancelada
   *
   * REGLAS DE NEGOCIO:
   * - Una orden solo puede cancelarse si está en estado 'completed'
   * - No se puede cancelar una orden ya cancelada
   *
   * @param order - La orden a validar
   * @returns true si puede cancelarse, false en caso contrario
   */
  static canBeCancelled(order: Order): boolean {
    return order.status === 'completed';
  }

  /**
   * Calcula el total de ingresos efectivos de una jornada
   * Solo cuenta órdenes completadas, excluyendo canceladas
   *
   * @param orders - Lista de órdenes de la jornada
   * @returns Total de ingresos sin incluir órdenes canceladas
   */
  static calculateEffectiveRevenue(orders: Order[]): number {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + order.total, 0);
  }

  /**
   * Cuenta las órdenes completadas (no canceladas)
   *
   * @param orders - Lista de órdenes
   * @returns Número de órdenes completadas
   */
  static countCompletedOrders(orders: Order[]): number {
    return orders.filter(order => order.status === 'completed').length;
  }

  /**
   * Cuenta las órdenes canceladas
   *
   * @param orders - Lista de órdenes
   * @returns Número de órdenes canceladas
   */
  static countCancelledOrders(orders: Order[]): number {
    return orders.filter(order => order.status === 'cancelled').length;
  }

  /**
   * Calcula el total perdido por cancelaciones
   *
   * @param orders - Lista de órdenes
   * @returns Total de dinero en órdenes canceladas
   */
  static calculateCancelledRevenue(orders: Order[]): number {
    return orders
      .filter(order => order.status === 'cancelled')
      .reduce((total, order) => total + order.total, 0);
  }

  /**
   * Recalcula los totales de una jornada basándose en sus órdenes
   * Usado cuando se cancela una orden para actualizar la jornada
   *
   * @param shift - La jornada actual
   * @param orders - Todas las órdenes de la jornada
   * @returns Objeto con los nuevos totales
   */
  static recalculateShiftTotals(
    shift: Shift,
    orders: Order[]
  ): Pick<Shift, 'totalOrders' | 'totalRevenue'> {
    return {
      totalOrders: this.countCompletedOrders(orders),
      totalRevenue: this.calculateEffectiveRevenue(orders),
    };
  }

  /**
   * Valida los datos de cancelación
   *
   * @param reason - Razón de la cancelación
   * @returns true si la razón es válida
   */
  static isValidCancellationReason(reason?: string): boolean {
    if (!reason) return true; // La razón es opcional
    return reason.trim().length > 0 && reason.length <= 500;
  }
}
