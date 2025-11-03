import type { Combo } from '@/lib/types';
import type { CreateComboDTO, UpdateComboDTO } from '@/dtos';
import type { IComboRepository } from '@/domain/repositories/IComboRepository';

/**
 * API interna de Combos
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - NO depende de Firebase (depende de IComboRepository)
 * - Puede usar cualquier implementación (Firebase, MongoDB, etc)
 * - Fácil de testear con mocks
 */
class ComboAPIClient {
  private repository: IComboRepository | null = null;

  /**
   * Inyecta el repository (Dependency Injection)
   */
  setRepository(repository: IComboRepository) {
    this.repository = repository;
  }

  /**
   * Obtiene todos los combos
   */
  async getAll(): Promise<Combo[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getAll();
  }

  /**
   * Crea un nuevo combo
   */
  async create(dto: CreateComboDTO): Promise<Combo> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.create(dto);
  }

  /**
   * Actualiza un combo existente
   */
  async update(id: string, dto: UpdateComboDTO): Promise<void> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    await this.repository.update(id, dto);
  }

  /**
   * Elimina un combo
   */
  async delete(id: string): Promise<void> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    await this.repository.delete(id);
  }
}

// Singleton
export const ComboAPI = new ComboAPIClient();
