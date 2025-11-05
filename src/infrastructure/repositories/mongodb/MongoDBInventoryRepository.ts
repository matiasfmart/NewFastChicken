/**
 * MongoDB Implementation of IInventoryRepository
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Implementa la interfaz del dominio (IInventoryRepository)
 * - Encapsula toda la lógica específica de MongoDB
 * - Permite cambiar de BD sin afectar el resto de la aplicación
 */

import { Db, Collection, ObjectId } from 'mongodb';
import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import type { InventoryItem } from '@/lib/types';

export class MongoDBInventoryRepository implements IInventoryRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('inventory');
  }

  /**
   * Convierte un documento de MongoDB a InventoryItem
   */
  private toInventoryItem(doc: any): InventoryItem {
    return {
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type, // ✅ Campo type agregado - CRÍTICO para el filtro
      price: doc.price,
      stock: doc.stock,
      category: doc.category // Opcional - solo para bebidas
    };
  }

  async getAll(): Promise<InventoryItem[]> {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => this.toInventoryItem(doc));
  }

  async getById(id: string): Promise<InventoryItem | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toInventoryItem(doc) : null;
  }

  async getByCategory(category: string): Promise<InventoryItem[]> {
    const docs = await this.collection.find({ category }).toArray();
    return docs.map(doc => this.toInventoryItem(doc));
  }

  async create(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const result = await this.collection.insertOne(item);
    return {
      ...item,
      id: result.insertedId.toString()
    };
  }

  async update(id: string, item: Partial<Omit<InventoryItem, 'id'>>): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: item }
    );
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { stock: quantity } }
    );
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  async getLowStock(): Promise<InventoryItem[]> {
    const docs = await this.collection.find({
      $expr: { $lte: ['$stock', '$minStock'] }
    }).toArray();
    return docs.map(doc => this.toInventoryItem(doc));
  }
}
