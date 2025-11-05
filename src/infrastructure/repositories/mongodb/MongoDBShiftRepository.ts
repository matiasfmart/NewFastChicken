/**
 * MongoDB Implementation of IShiftRepository
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Implementa la interfaz del dominio (IShiftRepository)
 * - Encapsula toda la lógica específica de MongoDB
 * - ✅ SOLUCIÓN AL PROBLEMA DE ÍNDICES: Consulta simplificada sin orderBy
 *   - Busca todas las jornadas abiertas (normalmente 0-1)
 *   - Ordena en memoria (muy eficiente para pocos registros)
 *   - Funciona sin índices compuestos
 *   - Portable a cualquier base de datos
 */

import { Db, Collection, ObjectId } from 'mongodb';
import { IShiftRepository } from '@/domain/repositories/IShiftRepository';
import type { Shift } from '@/lib/types';

export class MongoDBShiftRepository implements IShiftRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('shifts');
  }

  /**
   * Convierte un documento de MongoDB a Shift
   */
  private toShift(doc: any): Shift {
    return {
      id: doc._id.toString(),
      employeeName: doc.employeeName,
      startedAt: doc.startedAt,
      endedAt: doc.endedAt,
      status: doc.status,
      initialCash: doc.initialCash,
      totalOrders: doc.totalOrders,
      totalRevenue: doc.totalRevenue,
      actualCash: doc.actualCash,
      cashDifference: doc.cashDifference
    };
  }

  /**
   * ✅ SOLUCIÓN AL PROBLEMA DE ÍNDICES
   *
   * En lugar de usar un query compuesto (where + orderBy) que requiere índices:
   * 1. Busca todas las jornadas con status='open' (simple where)
   * 2. Ordena en memoria por startedAt descendente
   * 3. Retorna la primera
   *
   * Ventajas:
   * - No requiere índice compuesto
   * - Funciona idéntico en MongoDB, Firebase, PostgreSQL, etc.
   * - Muy eficiente: normalmente hay 0-1 jornadas abiertas
   */
  async getActiveShift(): Promise<Shift | null> {
    // Buscar todas las jornadas abiertas (normalmente solo 1)
    const docs = await this.collection
      .find({ status: 'open' })
      .toArray();

    // Si no hay ninguna, retornar null
    if (docs.length === 0) {
      return null;
    }

    // Si hay más de una (caso raro), ordenar en memoria y tomar la más reciente
    const sortedDocs = docs.sort((a, b) => {
      const dateA = a.startedAt instanceof Date ? a.startedAt : new Date(a.startedAt);
      const dateB = b.startedAt instanceof Date ? b.startedAt : new Date(b.startedAt);
      return dateB.getTime() - dateA.getTime();
    });

    return this.toShift(sortedDocs[0]);
  }

  async create(shift: Omit<Shift, 'id'>): Promise<Shift> {
    const result = await this.collection.insertOne(shift);
    return {
      ...shift,
      id: result.insertedId.toString()
    };
  }

  async update(id: string, shift: Partial<Omit<Shift, 'id'>>): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: shift }
    );
  }

  async getAll(): Promise<Shift[]> {
    const docs = await this.collection
      .find({})
      .sort({ startedAt: -1 })
      .toArray();
    return docs.map(doc => this.toShift(doc));
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    const docs = await this.collection
      .find({
        startedAt: {
          $gte: startDate,
          $lt: endDate
        }
      })
      .sort({ startedAt: -1 })
      .toArray();
    return docs.map(doc => this.toShift(doc));
  }

  async getById(id: string): Promise<Shift | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toShift(doc) : null;
  }
}
