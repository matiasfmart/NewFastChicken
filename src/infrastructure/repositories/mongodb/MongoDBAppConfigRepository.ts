/**
 * MongoDB Repository para AppConfig
 *
 * 🟦 INFRASTRUCTURE LAYER
 * - Gestiona la configuración de la aplicación (credenciales de admin)
 * - Solo hay UN documento de configuración en la colección
 */

import { Collection } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';
import type { AppConfig } from '@/lib/types/appConfig';

export class MongoDBAppConfigRepository {
  private collection: Collection;
  private static readonly CONFIG_ID = 'app_config'; // ID único para el documento de configuración

  constructor(collection: Collection) {
    this.collection = collection;
  }

  static async initialize(): Promise<MongoDBAppConfigRepository> {
    const db = await getMongoDb();
    const collection = db.collection('app_config');
    return new MongoDBAppConfigRepository(collection);
  }

  /**
   * Obtiene la configuración de la aplicación
   */
  async getConfig(): Promise<AppConfig | null> {
    const doc = await this.collection.findOne({ _id: MongoDBAppConfigRepository.CONFIG_ID } as any);

    if (!doc) return null;

    return {
      id: String(doc._id),
      adminUsername: doc.adminUsername,
      adminPassword: doc.adminPassword,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * Actualiza las credenciales de admin
   */
  async updateCredentials(username: string, password: string): Promise<void> {
    await this.collection.updateOne(
      { _id: MongoDBAppConfigRepository.CONFIG_ID } as any,
      {
        $set: {
          adminUsername: username,
          adminPassword: password,
          updatedAt: new Date()
        }
      },
      { upsert: true } // Crea el documento si no existe
    );
  }

  /**
   * Inicializa la configuración por defecto si no existe
   */
  async ensureDefaultConfig(): Promise<void> {
    const existingConfig = await this.getConfig();

    if (!existingConfig) {
      await this.collection.insertOne({
        _id: MongoDBAppConfigRepository.CONFIG_ID,
        adminUsername: 'admin',
        adminPassword: 'admin',
        updatedAt: new Date()
      } as any);
    }
  }
}
