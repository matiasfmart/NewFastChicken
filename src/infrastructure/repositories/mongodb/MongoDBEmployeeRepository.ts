/**
 * MongoDB Implementation of IEmployeeRepository
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Implementa la interfaz del dominio (IEmployeeRepository)
 * - Encapsula toda la lógica específica de MongoDB
 * - Permite cambiar de BD sin afectar el resto de la aplicación
 */

import { Db, Collection, ObjectId } from 'mongodb';
import { IEmployeeRepository } from '@/domain/repositories/IEmployeeRepository';
import type { Employee } from '@/lib/types';

export class MongoDBEmployeeRepository implements IEmployeeRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('employees');
  }

  /**
   * Convierte un documento de MongoDB a Employee
   */
  private toEmployee(doc: any): Employee {
    return {
      id: doc._id.toString(),
      name: doc.name,
      role: doc.role,
      active: doc.active,
      createdAt: doc.createdAt
    };
  }

  async getAll(): Promise<Employee[]> {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => this.toEmployee(doc));
  }

  async getActive(): Promise<Employee[]> {
    const docs = await this.collection.find({ active: true }).toArray();
    return docs.map(doc => this.toEmployee(doc));
  }

  async getById(id: string): Promise<Employee | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toEmployee(doc) : null;
  }

  async create(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const result = await this.collection.insertOne(employee);
    return {
      ...employee,
      id: result.insertedId.toString()
    };
  }

  async update(id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: employee }
    );
  }

  async delete(id: string): Promise<void> {
    // Soft delete: marcamos como inactivo en lugar de eliminar
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { active: false } }
    );
  }
}
