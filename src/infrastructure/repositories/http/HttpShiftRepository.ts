/**
 * HTTP Shift Repository
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - Implementa IShiftRepository
 * - Llama a API Routes en lugar de acceder a la base de datos directamente
 * - Permite usar MongoDB desde el cliente sin exponer código de servidor
 * - Cuando separes backend, solo cambias baseUrl
 */

import type { IShiftRepository } from '@/domain/repositories/IShiftRepository';
import type { Shift } from '@/lib/types';

export class HttpShiftRepository implements IShiftRepository {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/shifts') {
    this.baseUrl = baseUrl;
  }

  async getActiveShift(): Promise<Shift | null> {
    const response = await fetch(`${this.baseUrl}?active=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch active shift');
    }
    return response.json();
  }

  async create(shift: Omit<Shift, 'id'>): Promise<Shift> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shift)
    });
    if (!response.ok) {
      throw new Error('Failed to create shift');
    }
    return response.json();
  }

  async update(id: string, shift: Partial<Omit<Shift, 'id'>>): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: shift })
    });
    if (!response.ok) {
      throw new Error(`Failed to update shift ${id}`);
    }
  }

  async getAll(): Promise<Shift[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch shifts');
    }
    return response.json();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shifts by date range');
    }
    return response.json();
  }

  async getById(id: string): Promise<Shift | null> {
    const response = await fetch(`${this.baseUrl}?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch shift ${id}`);
    }
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete shift ${id}`);
    }
  }
}
