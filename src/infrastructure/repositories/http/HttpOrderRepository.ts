/**
 * HTTP Order Repository
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - Implementa IOrderRepository
 * - Llama a API Routes en lugar de acceder a la base de datos directamente
 * - Permite usar MongoDB desde el cliente sin exponer código de servidor
 * - Cuando separes backend, solo cambias baseUrl
 */

import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import type { Order } from '@/lib/types';

export class HttpOrderRepository implements IOrderRepository {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/orders') {
    this.baseUrl = baseUrl;
  }

  async createWithStockUpdate(order: Omit<Order, 'id'>): Promise<Order> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    return response.json();
  }

  async getAll(): Promise<Order[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  }

  async getById(id: string): Promise<Order | null> {
    const response = await fetch(`${this.baseUrl}?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch order ${id}`);
    }
    return response.json();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders by date range');
    }
    return response.json();
  }

  async getByShiftId(shiftId: string): Promise<Order[]> {
    const response = await fetch(`${this.baseUrl}?shiftId=${shiftId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders by shift');
    }
    return response.json();
  }

  async update(id: string, order: Partial<Omit<Order, 'id'>>): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: order })
    });
    if (!response.ok) {
      throw new Error(`Failed to update order ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete order ${id}`);
    }
  }

  async cancel(id: string, reason?: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reason })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel order');
    }
    return response.json();
  }

  async search(criteria: {
    orderId?: string;
    shiftId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: 'completed' | 'cancelled' | 'all';
  }): Promise<Order[]> {
    const params = new URLSearchParams();

    if (criteria.orderId) params.append('orderId', criteria.orderId);
    if (criteria.shiftId) params.append('shiftId', criteria.shiftId);
    if (criteria.startDate) params.append('startDate', criteria.startDate.toISOString());
    if (criteria.endDate) params.append('endDate', criteria.endDate.toISOString());
    if (criteria.status) params.append('status', criteria.status);

    const response = await fetch(`${this.baseUrl}/search?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search orders');
    }
    return response.json();
  }
}
