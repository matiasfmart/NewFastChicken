import 'server-only';

import { Firestore } from 'firebase/firestore';
import { Db } from 'mongodb';
import { OrderAPI } from './orders';
import { ComboAPI } from './combos';
import { InventoryAPI } from './inventory';
import { ShiftAPI } from './shifts';
import {
  FirebaseInventoryRepository,
  FirebaseComboRepository,
  FirebaseOrderRepository,
  FirebaseShiftRepository
} from '@/infrastructure/repositories/firebase';
import {
  MongoDBInventoryRepository,
  MongoDBComboRepository,
  MongoDBOrderRepository,
  MongoDBShiftRepository
} from '@/infrastructure/repositories/mongodb';

/**
 * Inicializa todas las APIs con los repositories de Firebase
 *
 * ✅ DEPENDENCY INJECTION:
 * - Crea instancias concretas de los repositories
 * - Las inyecta en las APIs
 *
 * Llamar esto una vez cuando Firestore esté disponible (CLIENT-SIDE)
 */
export function initializeAPIsWithFirebase(firestore: Firestore) {
  // Crear instancias de los repositories de Firebase
  const inventoryRepository = new FirebaseInventoryRepository(firestore);
  const comboRepository = new FirebaseComboRepository(firestore);
  const orderRepository = new FirebaseOrderRepository(firestore);
  const shiftRepository = new FirebaseShiftRepository(firestore);

  // Inyectar repositories en las APIs
  InventoryAPI.setRepository(inventoryRepository);
  ComboAPI.setRepository(comboRepository);
  OrderAPI.setRepository(orderRepository);
  ShiftAPI.setRepository(shiftRepository);
}

/**
 * Inicializa todas las APIs con los repositories de MongoDB
 *
 * ✅ DEPENDENCY INJECTION:
 * - Crea instancias concretas de los repositories de MongoDB
 * - Las inyecta en las APIs
 * - ✅ Sin problemas de índices: usa consultas simplificadas
 *
 * Llamar esto una vez cuando MongoDB esté disponible (SERVER-SIDE ONLY)
 */
export function initializeAPIsWithMongoDB(db: Db) {
  // Crear instancias de los repositories de MongoDB
  const inventoryRepository = new MongoDBInventoryRepository(db);
  const comboRepository = new MongoDBComboRepository(db);
  const orderRepository = new MongoDBOrderRepository(db);
  const shiftRepository = new MongoDBShiftRepository(db);

  // Inyectar repositories en las APIs
  InventoryAPI.setRepository(inventoryRepository);
  ComboAPI.setRepository(comboRepository);
  OrderAPI.setRepository(orderRepository);
  ShiftAPI.setRepository(shiftRepository);
}

// Re-exportar ambas funciones con nombres alternativos para compatibilidad
export const initializeAPIs = initializeAPIsWithFirebase; // Por defecto Firebase (compatibilidad)

/**
 * ⚠️ NOTA IMPORTANTE:
 * - initializeAPIsWithHttp() se movió a @/api/initializeAPIsClient
 * - Esto evita que MongoDB/Firebase se incluyan en el bundle del cliente
 * - Usa initializeAPIsClient para Client Components
 * - Usa este archivo solo para Server Components
 */
