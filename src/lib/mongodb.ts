/**
 * MongoDB Connection Manager
 *
 * Singleton para manejar la conexión a MongoDB de forma eficiente
 * Reutiliza la misma conexión en desarrollo (hot reload)
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

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar una variable global para preservar el cliente durante hot reload
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
