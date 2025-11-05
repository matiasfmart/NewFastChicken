import type { Shift } from '@/lib/types';
import type { IShiftRepository } from '@/domain/repositories';

/**
 * API Client para Jornadas (Shifts)
 *
 * Cliente singleton que delega todas las operaciones al repositorio inyectado.
 * Desacoplado de cualquier implementación específica de base de datos.
 */
class ShiftAPIClient {
  private repository: IShiftRepository | null = null;

  setRepository(repository: IShiftRepository) {
    this.repository = repository;
  }

  async getActiveShift(): Promise<Shift | null> {
    if (!this.repository) {
      throw new Error('ShiftRepository not initialized. Call setRepository first.');
    }
    return await this.repository.getActiveShift();
  }

  async create(shift: Omit<Shift, 'id'>): Promise<Shift> {
    if (!this.repository) {
      throw new Error('ShiftRepository not initialized. Call setRepository first.');
    }
    return await this.repository.create(shift);
  }

  async update(id: string, shift: Partial<Omit<Shift, 'id'>>): Promise<void> {
    if (!this.repository) {
      throw new Error('ShiftRepository not initialized. Call setRepository first.');
    }
    return await this.repository.update(id, shift);
  }

  async getAll(): Promise<Shift[]> {
    if (!this.repository) {
      throw new Error('ShiftRepository not initialized. Call setRepository first.');
    }
    return await this.repository.getAll();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    if (!this.repository) {
      throw new Error('ShiftRepository not initialized. Call setRepository first.');
    }
    return await this.repository.getByDateRange(startDate, endDate);
  }

  async getById(id: string): Promise<Shift | null> {
    if (!this.repository) {
      throw new Error('ShiftRepository not initialized. Call setRepository first.');
    }
    return await this.repository.getById(id);
  }
}

// Export singleton instance
export const ShiftAPI = new ShiftAPIClient();
