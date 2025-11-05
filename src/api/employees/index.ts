import type { Employee } from '@/lib/types';
import type { IEmployeeRepository } from '@/domain/repositories/IEmployeeRepository';

/**
 * API interna de Employees
 *
 * ✅ ARQUITECTURA LIMPIA:
 * - NO depende de MongoDB (depende de IEmployeeRepository)
 * - Puede usar cualquier implementación (MongoDB, SQL, etc)
 * - Fácil de testear con mocks
 */
class EmployeeAPIClient {
  private repository: IEmployeeRepository | null = null;

  /**
   * Inyecta el repository (Dependency Injection)
   */
  setRepository(repository: IEmployeeRepository) {
    this.repository = repository;
  }

  /**
   * Obtiene todos los empleados
   */
  async getAll(): Promise<Employee[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getAll();
  }

  /**
   * Obtiene solo empleados activos
   */
  async getActive(): Promise<Employee[]> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getActive();
  }

  /**
   * Obtiene un empleado por ID
   */
  async getById(id: string): Promise<Employee | null> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.getById(id);
  }

  /**
   * Crea un nuevo empleado
   */
  async create(employee: Omit<Employee, 'id'>): Promise<Employee> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    return await this.repository.create(employee);
  }

  /**
   * Actualiza un empleado existente
   */
  async update(id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<void> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    await this.repository.update(id, employee);
  }

  /**
   * Elimina un empleado (soft delete)
   */
  async delete(id: string): Promise<void> {
    if (!this.repository) {
      throw new Error('Repository not initialized');
    }

    await this.repository.delete(id);
  }
}

// Singleton
export const EmployeeAPI = new EmployeeAPIClient();
