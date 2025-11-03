import type { Order } from '@/lib/types';

/**
 * Repository Interface para Orders
 * Define el contrato que cualquier implementación debe cumplir
 */
export interface IOrderRepository {
  /**
   * Obtiene todas las órdenes
   */
  getAll(): Promise<Order[]>;

  /**
   * Obtiene órdenes por rango de fechas
   */
  getByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;

  /**
   * Obtiene una orden por su ID
   */
  getById(id: string): Promise<Order | null>;

  /**
   * Crea una nueva orden y actualiza el stock
   */
  createWithStockUpdate(order: Omit<Order, 'id'>): Promise<Order>;

  /**
   * Actualiza una orden existente
   */
  update(id: string, order: Partial<Omit<Order, 'id'>>): Promise<void>;

  /**
   * Elimina una orden
   */
  delete(id: string): Promise<void>;
}
