import type { DiscountRule } from '@/lib/types';
import type { IDiscountRepository } from '@/domain/repositories/IDiscountRepository';
import type { IComboRepository } from '@/domain/repositories/IComboRepository';
import {
  CreateDiscountUseCase,
  UpdateDiscountUseCase,
  DeleteDiscountUseCase,
  AssignDiscountToComboUseCase,
  type CreateDiscountInput,
  type UpdateDiscountInput
} from '@/application/use-cases';

/**
 * API interna de Descuentos
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - NO depende de Firebase ni MongoDB (depende de IDiscountRepository)
 * - Puede usar cualquier implementación
 * - Fácil de testear con mocks
 * - Coordina Use Cases de la capa de aplicación
 */
class DiscountAPIClient {
  private repository: IDiscountRepository | null = null;
  private comboRepository: IComboRepository | null = null;

  /**
   * Inyecta el repository de descuentos (Dependency Injection)
   */
  setRepository(repository: IDiscountRepository) {
    this.repository = repository;
  }

  /**
   * Inyecta el repository de combos (Dependency Injection)
   * Necesario para AssignDiscountToComboUseCase
   */
  setComboRepository(repository: IComboRepository) {
    this.comboRepository = repository;
  }

  /**
   * Obtiene todos los descuentos
   */
  async getAll(): Promise<DiscountRule[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getAll();
  }

  /**
   * Obtiene un descuento por ID
   */
  async getById(id: string): Promise<DiscountRule | null> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getById(id);
  }

  /**
   * Obtiene descuentos asignados a un combo
   */
  async getByComboId(comboId: string): Promise<DiscountRule[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getByComboId(comboId);
  }

  /**
   * Obtiene descuentos activos para una fecha
   */
  async getActiveDiscounts(currentDate?: Date): Promise<DiscountRule[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getActiveDiscounts(currentDate);
  }

  /**
   * Crea un nuevo descuento
   * Usa CreateDiscountUseCase para validación
   */
  async create(input: CreateDiscountInput): Promise<DiscountRule> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    const useCase = new CreateDiscountUseCase(this.repository);
    return await useCase.execute(input);
  }

  /**
   * Actualiza un descuento existente
   * Usa UpdateDiscountUseCase para validación
   */
  async update(id: string, input: Omit<UpdateDiscountInput, 'id'>): Promise<DiscountRule> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    const useCase = new UpdateDiscountUseCase(this.repository);
    return await useCase.execute({ id, ...input });
  }

  /**
   * Elimina un descuento
   * Usa DeleteDiscountUseCase para verificación
   */
  async delete(id: string): Promise<void> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    const useCase = new DeleteDiscountUseCase(this.repository);
    await useCase.execute({ id });
  }

  /**
   * Asigna un descuento a un combo
   * Usa AssignDiscountToComboUseCase para validación
   */
  async assignToCombo(discountId: string, comboId: string): Promise<void> {
    if (!this.repository || !this.comboRepository) {
      throw new Error('Repositories not initialized');
    }

    const useCase = new AssignDiscountToComboUseCase(
      this.repository,
      this.comboRepository
    );
    await useCase.execute({ discountId, comboId });
  }

  /**
   * Desasigna un descuento de un combo
   */
  async unassignFromCombo(discountId: string, comboId: string): Promise<void> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    await this.repository.unassignFromCombo(discountId, comboId);
  }
}

// Singleton
export const DiscountAPI = new DiscountAPIClient();
