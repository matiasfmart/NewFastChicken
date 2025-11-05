/**
 * MongoDB Initialization (SERVER-SIDE ONLY)
 *
 * ✅ Este archivo solo se debe importar en:
 * - Server Components
 * - API Routes
 * - Server Actions
 *
 * ❌ NUNCA importar en Client Components ("use client")
 */

import 'server-only';

import { getMongoDb } from './mongodb';
import { initializeAPIsWithMongoDB } from '@/api/initializeAPIs';

let isInitialized = false;

/**
 * Inicializa MongoDB y las APIs (solo en el servidor)
 * Es seguro llamar múltiples veces - solo se inicializa una vez
 */
export async function initializeMongoDB() {
  if (isInitialized) {
    return;
  }

  const db = await getMongoDb();
  initializeAPIsWithMongoDB(db);
  isInitialized = true;
}
