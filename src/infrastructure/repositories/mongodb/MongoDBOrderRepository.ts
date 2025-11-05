/**
 * MongoDB Implementation of IOrderRepository
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Implementa la interfaz del dominio (IOrderRepository)
 * - Encapsula toda la lógica específica de MongoDB
 * - Usa transacciones para garantizar consistencia de datos
 */

import { Db, Collection, ObjectId, ClientSession } from 'mongodb';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import type { Order } from '@/lib/types';
import { getMongoClient } from '@/lib/mongodb';

export class MongoDBOrderRepository implements IOrderRepository {
  private collection: Collection;
  private inventoryCollection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('orders');
    this.inventoryCollection = db.collection('inventory');
  }

  /**
   * Convierte un documento de MongoDB a Order
   */
  private toOrder(doc: any): Order {
    return {
      id: doc._id.toString(),
      shiftId: doc.shiftId,
      items: doc.items,
      deliveryType: doc.deliveryType,
      subtotal: doc.subtotal,
      discount: doc.discount,
      total: doc.total,
      createdAt: doc.createdAt
    };
  }

  async getAll(): Promise<Order[]> {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => this.toOrder(doc));
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const docs = await this.collection.find({
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    }).toArray();
    return docs.map(doc => this.toOrder(doc));
  }

  async getById(id: string): Promise<Order | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toOrder(doc) : null;
  }

  /**
   * Crea una orden y actualiza el stock en una transacción atómica
   * Garantiza consistencia de datos usando sesiones de MongoDB
   */
  async createWithStockUpdate(order: Omit<Order, 'id'>): Promise<Order> {
    const client = await getMongoClient();
    const session: ClientSession = client.startSession();

    try {
      let createdOrder: Order;

      await session.withTransaction(async () => {
        // Calcular la cantidad total requerida de cada producto
        const productUpdates = new Map<string, number>();

        for (const orderItem of order.items) {
          const { combo, quantity } = orderItem;

          if (combo.products) {
            for (const productInCombo of combo.products) {
              const currentRequired = productUpdates.get(productInCombo.productId) || 0;
              productUpdates.set(
                productInCombo.productId,
                currentRequired + (productInCombo.quantity * quantity)
              );
            }
          }
        }

        // Validar y actualizar stock de cada producto
        for (const [productId, requiredQuantity] of productUpdates.entries()) {
          const product = await this.inventoryCollection.findOne(
            { _id: new ObjectId(productId) },
            { session }
          );

          if (!product) {
            throw new Error(`El producto con ID ${productId} no existe.`);
          }

          if (product.stock < requiredQuantity) {
            throw new Error(`No hay suficiente stock para: ${product.name}.`);
          }

          // Actualizar el stock
          await this.inventoryCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $inc: { stock: -requiredQuantity } },
            { session }
          );
        }

        // Insertar la orden
        const result = await this.collection.insertOne(order, { session });

        createdOrder = {
          ...order,
          id: result.insertedId.toString()
        };
      });

      return createdOrder!;
    } finally {
      await session.endSession();
    }
  }

  async update(_id: string, _order: Partial<Omit<Order, 'id'>>): Promise<void> {
    // Implementación futura si es necesario
    throw new Error('Update order not implemented');
  }

  async delete(_id: string): Promise<void> {
    // Implementación futura si es necesario
    throw new Error('Delete order not implemented');
  }
}
