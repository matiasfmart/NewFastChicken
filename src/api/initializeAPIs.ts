import { Firestore } from 'firebase/firestore';
import { OrderAPI } from './orders';
import { ComboAPI } from './combos';
import { InventoryAPI } from './inventory';

/**
 * Inicializa todas las APIs con Firestore
 * Llamar esto una vez cuando Firestore esté disponible
 */
export function initializeAPIs(firestore: Firestore) {
  OrderAPI.setFirestore(firestore);
  ComboAPI.setFirestore(firestore);
  InventoryAPI.setFirestore(firestore);
}
