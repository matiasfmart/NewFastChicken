/**
 * HTTP Implementation of IEmployeeRepository
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Implementa la interfaz del dominio (IEmployeeRepository)
 * - Hace peticiones HTTP a API Routes
 * - Permite separar frontend y backend fácilmente
 */

import { IEmployeeRepository } from '@/domain/repositories/IEmployeeRepository';
import type { Employee } from '@/lib/types';

export class HttpEmployeeRepository implements IEmployeeRepository {
  constructor(private baseUrl: string) {}

  async getAll(): Promise<Employee[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
  }

  async getActive(): Promise<Employee[]> {
    const response = await fetch(`${this.baseUrl}?active=true`);
    if (!response.ok) throw new Error('Failed to fetch active employees');
    return response.json();
  }

  async getById(id: string): Promise<Employee | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) return null;
    return response.json();
  }

  async create(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
  }

  async update(id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: employee })
    });
    if (!response.ok) throw new Error('Failed to update employee');
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete employee');
  }
}
