/**
 * HTTP Combo Repository
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - Implementa IComboRepository
 * - Llama a API Routes en lugar de acceder a la base de datos directamente
 * - Permite usar MongoDB desde el cliente sin exponer código de servidor
 * - Cuando separes backend, solo cambias baseUrl
 */

import type { IComboRepository } from '@/domain/repositories/IComboRepository';
import type { Combo } from '@/lib/types';
import type { CreateComboDTO, UpdateComboDTO } from '@/dtos';

export class HttpComboRepository implements IComboRepository {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/combos') {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Combo[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch combos');
    }
    return response.json();
  }

  async getById(id: string): Promise<Combo | null> {
    const response = await fetch(`${this.baseUrl}?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch combo ${id}`);
    }
    return response.json();
  }

  async create(dto: CreateComboDTO): Promise<Combo> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!response.ok) {
      throw new Error('Failed to create combo');
    }
    return response.json();
  }

  async update(id: string, dto: UpdateComboDTO): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: dto })
    });
    if (!response.ok) {
      throw new Error(`Failed to update combo ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete combo ${id}`);
    }
  }
}
