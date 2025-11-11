/**
 * MongoDB Implementation of IDiscountRepository
 *
 * 🟨 INFRASTRUCTURE LAYER
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Implementa la interfaz del dominio (IDiscountRepository)
 * - Encapsula toda la lógica específica de MongoDB
 * - Permite cambiar de BD sin afectar el resto de la aplicación
 * - Gestiona descuentos como entidades independientes
 * - Mantiene relación con combos mediante referencias
 */

import { Db, Collection, ObjectId } from 'mongodb';
import { IDiscountRepository } from '@/domain/repositories/IDiscountRepository';
import { DiscountService } from '@/domain/services/DiscountService';
import type { DiscountRule } from '@/lib/types';

interface MongoDiscountDocument {
  _id: ObjectId;
  type: string;
  percentage: number;
  value?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  requiredQuantity?: number;
  discountedQuantity?: number;
  triggerComboId?: string;
  targetComboId?: string;
  comboIds?: string[]; // Array de IDs de combos asociados
  createdAt: Date;
  updatedAt: Date;
}

export class MongoDBDiscountRepository implements IDiscountRepository {
  private collection: Collection<MongoDiscountDocument>;
  private combosCollection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('discounts');
    this.combosCollection = db.collection('combos');
  }

  /**
   * Convierte un documento de MongoDB a DiscountRule
   */
  private toDiscountRule(doc: MongoDiscountDocument): DiscountRule {
    return {
      id: doc._id.toString(),
      type: doc.type as any,
      percentage: doc.percentage,
      value: doc.value,
      timeRange: doc.timeRange,
      requiredQuantity: doc.requiredQuantity,
      discountedQuantity: doc.discountedQuantity,
      triggerComboId: doc.triggerComboId,
      targetComboId: doc.targetComboId,
    };
  }

  /**
   * Convierte un DiscountRule a documento de MongoDB
   */
  private toMongoDocument(discount: Omit<DiscountRule, 'id'>): Omit<MongoDiscountDocument, '_id'> {
    return {
      type: discount.type,
      percentage: discount.percentage,
      value: discount.value,
      timeRange: discount.timeRange,
      requiredQuantity: discount.requiredQuantity,
      discountedQuantity: discount.discountedQuantity,
      triggerComboId: discount.triggerComboId,
      targetComboId: discount.targetComboId,
      comboIds: [], // Inicialmente sin combos asociados
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getAll(): Promise<DiscountRule[]> {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => this.toDiscountRule(doc));
  }

  async getById(id: string): Promise<DiscountRule | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toDiscountRule(doc) : null;
  }

  async getByComboId(comboId: string): Promise<DiscountRule[]> {
    // Buscar descuentos que tengan este comboId en su array de combos asociados
    const docs = await this.collection.find({
      comboIds: comboId
    }).toArray();

    return docs.map(doc => this.toDiscountRule(doc));
  }

  async getActiveDiscounts(currentDate: Date = new Date()): Promise<DiscountRule[]> {
    const allDiscounts = await this.getAll();

    // Filtrar usando DiscountService del domain
    return allDiscounts.filter(discount =>
      DiscountService.isDiscountRuleActive(discount, currentDate)
    );
  }

  async create(discount: Omit<DiscountRule, 'id'>): Promise<DiscountRule> {
    const mongoDoc = this.toMongoDocument(discount);

    const result = await this.collection.insertOne(mongoDoc as any);

    const created = await this.collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error('Failed to create discount');
    }

    return this.toDiscountRule(created);
  }

  async update(id: string, discount: Partial<DiscountRule>): Promise<void> {
    const updateDoc: any = {
      updatedAt: new Date()
    };

    // Solo actualizar campos que vienen en el partial
    if (discount.type !== undefined) updateDoc.type = discount.type;
    if (discount.percentage !== undefined) updateDoc.percentage = discount.percentage;
    if (discount.value !== undefined) updateDoc.value = discount.value;
    if (discount.timeRange !== undefined) updateDoc.timeRange = discount.timeRange;
    if (discount.requiredQuantity !== undefined) updateDoc.requiredQuantity = discount.requiredQuantity;
    if (discount.discountedQuantity !== undefined) updateDoc.discountedQuantity = discount.discountedQuantity;
    if (discount.triggerComboId !== undefined) updateDoc.triggerComboId = discount.triggerComboId;
    if (discount.targetComboId !== undefined) updateDoc.targetComboId = discount.targetComboId;

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
  }

  async delete(id: string): Promise<void> {
    // Primero desasociar de todos los combos
    await this.combosCollection.updateMany(
      { 'discounts.id': id },
      { $pull: { discounts: { id } } }
    );

    // Luego eliminar el descuento
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  async assignToCombo(discountId: string, comboId: string): Promise<void> {
    // 1. Obtener el descuento
    const discount = await this.getById(discountId);
    if (!discount) {
      throw new Error(`Discount with id ${discountId} not found`);
    }

    // 2. Agregar comboId al array de combos asociados del descuento
    await this.collection.updateOne(
      { _id: new ObjectId(discountId) },
      {
        $addToSet: { comboIds: comboId },
        $set: { updatedAt: new Date() }
      }
    );

    // 3. Agregar el descuento al array de discounts del combo
    await this.combosCollection.updateOne(
      { _id: new ObjectId(comboId) },
      {
        $addToSet: {
          discounts: discount
        }
      }
    );
  }

  async unassignFromCombo(discountId: string, comboId: string): Promise<void> {
    // 1. Remover comboId del array de combos asociados del descuento
    await this.collection.updateOne(
      { _id: new ObjectId(discountId) },
      {
        $pull: { comboIds: comboId },
        $set: { updatedAt: new Date() }
      }
    );

    // 2. Remover el descuento del array de discounts del combo
    await this.combosCollection.updateOne(
      { _id: new ObjectId(comboId) },
      {
        $pull: {
          discounts: { id: discountId }
        }
      }
    );
  }
}
