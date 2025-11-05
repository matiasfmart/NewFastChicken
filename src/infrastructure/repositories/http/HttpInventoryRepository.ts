/**
 * HTTP Inventory Repository
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - Implementa IInventoryRepository
 * - Llama a API Routes en lugar de acceder a la base de datos directamente
 * - Permite usar MongoDB desde el cliente sin exponer código de servidor
 * - Cuando separes backend, solo cambias baseUrl
 */

import type { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import type { InventoryItem } from '@/lib/types';
import type { CreateInventoryItemDTO, UpdateInventoryItemDTO } from '@/dtos';

export class HttpInventoryRepository implements IInventoryRepository {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/inventory') {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<InventoryItem[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    return response.json();
  }

  async getById(id: string): Promise<InventoryItem | null> {
    const response = await fetch(`${this.baseUrl}?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory item ${id}`);
    }
    return response.json();
  }

  async create(dto: CreateInventoryItemDTO): Promise<InventoryItem> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!response.ok) {
      throw new Error('Failed to create inventory item');
    }
    return response.json();
  }

  async update(id: string, dto: UpdateInventoryItemDTO): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: dto })
    });
    if (!response.ok) {
      throw new Error(`Failed to update inventory item ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete inventory item ${id}`);
    }
  }

  async getByCategory(category: string): Promise<InventoryItem[]> {
    const response = await fetch(`${this.baseUrl}?category=${category}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory by category ${category}`);
    }
    return response.json();
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: { stock: newStock } })
    });
    if (!response.ok) {
      throw new Error(`Failed to update stock for item ${id}`);
    }
  }
}
