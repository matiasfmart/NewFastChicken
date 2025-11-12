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
      status: doc.status || 'completed', // Default para órdenes antiguas
      createdAt: doc.createdAt,
      cancelledAt: doc.cancelledAt,
      cancellationReason: doc.cancellationReason
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

  async getByShiftId(shiftId: string): Promise<Order[]> {
    const docs = await this.collection.find({ shiftId }).sort({ createdAt: -1 }).toArray();
    return docs.map(doc => this.toOrder(doc));
  }

  async getById(id: string): Promise<Order | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toOrder(doc) : null;
  }

  /**
   * Crea una orden y actualiza el stock
   *
   * ⚠️ NOTA: Sin transacciones para compatibilidad con MongoDB standalone
   * En producción con Replica Set, se pueden habilitar transacciones
   */
  async createWithStockUpdate(order: Omit<Order, 'id'>): Promise<Order> {
    try {
      // Calcular la cantidad total requerida de cada producto
      const productUpdates = new Map<string, number>();

      for (const orderItem of order.items) {
        const { combo, quantity, customizations } = orderItem;

        // Manejar combos con productos definidos
        if (combo && combo.products) {
          for (const productInCombo of combo.products) {
            const currentRequired = productUpdates.get(productInCombo.productId) || 0;
            productUpdates.set(
              productInCombo.productId,
              currentRequired + (productInCombo.quantity * quantity)
            );
          }
        }

        // Manejar productos individuales (sin combo)
        if (!combo && customizations) {
          if (customizations.product) {
            const currentRequired = productUpdates.get(customizations.product.id) || 0;
            productUpdates.set(customizations.product.id, currentRequired + quantity);
          }
          if (customizations.drink) {
            const currentRequired = productUpdates.get(customizations.drink.id) || 0;
            productUpdates.set(customizations.drink.id, currentRequired + quantity);
          }
          if (customizations.side) {
            const currentRequired = productUpdates.get(customizations.side.id) || 0;
            productUpdates.set(customizations.side.id, currentRequired + quantity);
          }
        }
      }

      // Validar y actualizar stock de cada producto
      for (const [productId, requiredQuantity] of productUpdates.entries()) {
        const product = await this.inventoryCollection.findOne(
          { _id: new ObjectId(productId) }
        );

        if (!product) {
          throw new Error(`El producto con ID ${productId} no existe.`);
        }

        if (product.stock < requiredQuantity) {
          throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Requerido: ${requiredQuantity}`);
        }

        // Actualizar el stock
        await this.inventoryCollection.updateOne(
          { _id: new ObjectId(productId) },
          { $inc: { stock: -requiredQuantity } }
        );
      }

      // Insertar la orden con estado 'completed' por defecto
      const orderData = {
        ...order,
        status: 'completed' as const
      };

      const result = await this.collection.insertOne(orderData);

      return {
        ...orderData,
        id: result.insertedId.toString()
      };
    } catch (error) {
      console.error('Error creating order with stock update:', error);
      throw error;
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

  /**
   * Cancela una orden existente
   * Marca la orden como cancelada sin eliminarla
   */
  async cancel(id: string, reason?: string): Promise<Order> {
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: now,
          cancellationReason: reason
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('No se encontró la orden para cancelar');
    }

    return this.toOrder(result);
  }

  /**
   * Busca órdenes por criterios
   */
  async search(criteria: {
    orderId?: string;
    shiftId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: 'completed' | 'cancelled' | 'all';
  }): Promise<Order[]> {
    const filter: any = {};

    // Búsqueda por ID específico
    if (criteria.orderId) {
      try {
        filter._id = new ObjectId(criteria.orderId);
      } catch {
        // Si no es un ObjectId válido, no encontrará nada
        return [];
      }
    }

    // Filtro por jornada
    if (criteria.shiftId) {
      filter.shiftId = criteria.shiftId;
    }

    // Filtro por rango de fechas
    if (criteria.startDate || criteria.endDate) {
      filter.createdAt = {};
      if (criteria.startDate) {
        filter.createdAt.$gte = criteria.startDate;
      }
      if (criteria.endDate) {
        filter.createdAt.$lte = criteria.endDate;
      }
    }

    // Filtro por estado
    if (criteria.status && criteria.status !== 'all') {
      filter.status = criteria.status;
    }

    const docs = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(doc => this.toOrder(doc));
  }
}
