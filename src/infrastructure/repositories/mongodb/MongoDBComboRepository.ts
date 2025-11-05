/**
 * MongoDB Implementation of IComboRepository
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Implementa la interfaz del dominio (IComboRepository)
 * - Encapsula toda la lógica específica de MongoDB
 * - Permite cambiar de BD sin afectar el resto de la aplicación
 */

import { Db, Collection, ObjectId } from 'mongodb';
import { IComboRepository } from '@/domain/repositories/IComboRepository';
import type { Combo } from '@/lib/types';

export class MongoDBComboRepository implements IComboRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('combos');
  }

  /**
   * Convierte un documento de MongoDB a Combo
   */
  private toCombo(doc: any): Combo {
    return {
      id: doc._id.toString(),
      type: doc.type, // ✅ Campo type agregado - CRÍTICO
      name: doc.name,
      description: doc.description,
      price: doc.price,
      products: doc.products, // ✅ Corregido: era 'items' pero el tipo dice 'products'
      discounts: doc.discounts // ✅ Opcional
    };
  }

  async getAll(): Promise<Combo[]> {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => this.toCombo(doc));
  }

  async getById(id: string): Promise<Combo | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toCombo(doc) : null;
  }

  async getByCategory(category: string): Promise<Combo[]> {
    const docs = await this.collection.find({ category }).toArray();
    return docs.map(doc => this.toCombo(doc));
  }

  async getAvailable(): Promise<Combo[]> {
    const docs = await this.collection.find({ available: true }).toArray();
    return docs.map(doc => this.toCombo(doc));
  }

  async create(combo: Omit<Combo, 'id'>): Promise<Combo> {
    const result = await this.collection.insertOne(combo);
    return {
      ...combo,
      id: result.insertedId.toString()
    };
  }

  async update(id: string, combo: Partial<Omit<Combo, 'id'>>): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: combo }
    );
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
