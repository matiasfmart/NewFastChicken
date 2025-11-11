/**
 * MongoDB Connection Manager
 *
 * Singleton para manejar la conexión a MongoDB de forma eficiente
 * Reutiliza la misma conexión en desarrollo (hot reload)
 * NO se conecta durante la fase de build
 */

import { MongoClient, Db } from 'mongodb';
import { mongoDBConfig } from './mongodb-config';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoDb: Db | undefined;
}

let clientPromise: Promise<MongoClient>;
let db: Db | undefined;

// ✅ NO conectar a MongoDB durante el build
if (process.env.NEXT_PHASE === "phase-production-build") {
  console.log("[MongoDB] Build phase detected - using mock client");

  // Mock client para satisfacer el build sin conectarse
  clientPromise = Promise.resolve({
    db: () => ({
      collection: () => ({
        find: () => ({
          toArray: async () => [],
          limit: () => ({ toArray: async () => [] }),
          skip: () => ({ toArray: async () => [] }),
          sort: () => ({ toArray: async () => [] }),
        }),
        findOne: async () => null,
        insertOne: async () => ({ insertedId: "mock", acknowledged: true }),
        insertMany: async () => ({
          insertedIds: {},
          insertedCount: 0,
          acknowledged: true,
        }),
        updateOne: async () => ({
          modifiedCount: 0,
          matchedCount: 0,
          acknowledged: true,
          upsertedId: null,
          upsertedCount: 0,
        }),
        updateMany: async () => ({
          modifiedCount: 0,
          matchedCount: 0,
          acknowledged: true,
          upsertedId: null,
          upsertedCount: 0,
        }),
        deleteOne: async () => ({ deletedCount: 0, acknowledged: true }),
        deleteMany: async () => ({ deletedCount: 0, acknowledged: true }),
        countDocuments: async () => 0,
        aggregate: () => ({ toArray: async () => [] }),
      }),
    }),
    close: async () => {},
  } as any);
} else if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar una variable global para preservar el cliente durante hot reload (HMR)
  if (!global._mongoClientPromise) {
    const client = new MongoClient(mongoDBConfig.uri, mongoDBConfig.options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, crear un nuevo cliente
  const client = new MongoClient(mongoDBConfig.uri, mongoDBConfig.options);
  clientPromise = client.connect();
}

/**
 * Obtiene la instancia de la base de datos MongoDB
 * @returns {Promise<Db>} Instancia de la base de datos
 */
export async function getMongoDb(): Promise<Db> {
  if (process.env.NODE_ENV === 'development' && global._mongoDb) {
    return global._mongoDb;
  }

  if (db) {
    return db;
  }

  const client = await clientPromise;
  db = client.db(mongoDBConfig.database);

  if (process.env.NODE_ENV === 'development') {
    global._mongoDb = db;
  }

  return db;
}

/**
 * Obtiene el cliente de MongoDB
 * @returns {Promise<MongoClient>} Cliente de MongoDB
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export default clientPromise;
