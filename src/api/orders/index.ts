import type { Order } from '@/lib/types';
import type { CreateOrderDTO } from '@/dtos';
import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * API interna de Orders
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - NO depende de Firebase (depende de IOrderRepository)
 * - Puede usar cualquier implementación (Firebase, MongoDB, etc)
 * - Fácil de testear con mocks
 *
 * En Fase 2, solo cambiamos la implementación a fetch() remoto
 */
class OrderAPIClient {
  private repository: IOrderRepository | null = null;

  /**
   * Inyecta el repository (Dependency Injection)
   */
  setRepository(repository: IOrderRepository) {
    this.repository = repository;
  }

  /**
   * Crea una nueva orden con actualización de stock
   */
  async create(dto: CreateOrderDTO): Promise<Order> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    // El repository se encarga de las conversiones específicas de la DB
    return await this.repository.createWithStockUpdate(dto);
  }

  /**
   * Obtiene órdenes por fecha
   */
  async getByDate(date: Date): Promise<Order[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    const start = startOfDay(date);
    const end = endOfDay(date);

    return await this.repository.getByDateRange(start, end);
  }

  /**
   * Obtiene órdenes de una jornada específica
   */
  async getByShiftId(shiftId: string): Promise<Order[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getByShiftId(shiftId);
  }

  /**
   * Obtiene todas las órdenes
   */
  async getAll(): Promise<Order[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getAll();
  }
}

// Singleton
export const OrderAPI = new OrderAPIClient();
