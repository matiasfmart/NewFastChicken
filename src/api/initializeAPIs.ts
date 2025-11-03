import { Firestore } from 'firebase/firestore';
import { OrderAPI } from './orders';
import { ComboAPI } from './combos';
import { InventoryAPI } from './inventory';
import {
  FirebaseInventoryRepository,
  FirebaseComboRepository,
  FirebaseOrderRepository
} from '@/infrastructure/repositories/firebase';

/**
 * Inicializa todas las APIs con los repositories de Firebase
 *
 * ✅ DEPENDENCY INJECTION:
 * - Crea instancias concretas de los repositories
 * - Las inyecta en las APIs
 * - Para cambiar a MongoDB, solo cambia las implementaciones aquí
 *
 * Llamar esto una vez cuando Firestore esté disponible
 */
export function initializeAPIs(firestore: Firestore) {
  // Crear instancias de los repositories de Firebase
  const inventoryRepository = new FirebaseInventoryRepository(firestore);
  const comboRepository = new FirebaseComboRepository(firestore);
  const orderRepository = new FirebaseOrderRepository(firestore);

  // Inyectar repositories en las APIs
  InventoryAPI.setRepository(inventoryRepository);
  ComboAPI.setRepository(comboRepository);
  OrderAPI.setRepository(orderRepository);
}
