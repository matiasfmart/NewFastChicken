/**
 * Employee Repository Interface
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Define la interfaz que el dominio espera
 * - No depende de ninguna tecnología específica
 * - Permite múltiples implementaciones (MongoDB, SQL, etc)
 */

import type { Employee } from '@/lib/types';

export interface IEmployeeRepository {
  /**
   * Obtiene todos los empleados
   */
  getAll(): Promise<Employee[]>;

  /**
   * Obtiene solo empleados activos
   */
  getActive(): Promise<Employee[]>;

  /**
   * Obtiene un empleado por ID
   */
  getById(id: string): Promise<Employee | null>;

  /**
   * Crea un nuevo empleado
   */
  create(employee: Omit<Employee, 'id'>): Promise<Employee>;

  /**
   * Actualiza un empleado existente
   */
  update(id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<void>;

  /**
   * Elimina un empleado (o lo marca como inactivo)
   */
  delete(id: string): Promise<void>;
}
