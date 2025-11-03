import type { InventoryItem } from '@/lib/types';
import type { CreateInventoryDTO, UpdateInventoryDTO } from '@/dtos';
import type { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';

/**
 * API interna de Inventory
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - NO depende de Firebase (depende de IInventoryRepository)
 * - Puede usar cualquier implementación (Firebase, MongoDB, etc)
 * - Fácil de testear con mocks
 */
class InventoryAPIClient {
  private repository: IInventoryRepository | null = null;

  /**
   * Inyecta el repository (Dependency Injection)
   * En el futuro, esto podría recibir cualquier implementación
   */
  setRepository(repository: IInventoryRepository) {
    this.repository = repository;
  }

  /**
   * Obtiene todos los items del inventario
   */
  async getAll(): Promise<InventoryItem[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getAll();
  }

  /**
   * Crea un nuevo item
   */
  async create(dto: CreateInventoryDTO): Promise<InventoryItem> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.create(dto);
  }

  /**
   * Actualiza un item existente
   */
  async update(id: string, dto: UpdateInventoryDTO): Promise<void> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    await this.repository.update(id, dto);
  }

  /**
   * Elimina un item
   */
  async delete(id: string): Promise<void> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    await this.repository.delete(id);
  }
}

// Singleton
export const InventoryAPI = new InventoryAPIClient();
