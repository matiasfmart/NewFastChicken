import { collection, query, where, getDocs, getDoc, doc, runTransaction, Timestamp, Firestore } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';

/**
 * Implementación Firebase del IOrderRepository
 *
 * IMPORTANTE: Esta clase maneja la conversión entre Date (dominio) y Timestamp (Firebase)
 * Incluye lógica de transacciones para garantizar consistencia de datos
 */
export class FirebaseOrderRepository implements IOrderRepository {
  private readonly collectionName = 'orders';
  private readonly inventoryCollectionName = 'inventory';

  constructor(private readonly firestore: Firestore) {}

  async getAll(): Promise<Order[]> {
    const querySnapshot = await getDocs(collection(this.firestore, this.collectionName));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
      } as Order;
    });
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const ordersQuery = query(
      collection(this.firestore, this.collectionName),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<', Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(ordersQuery);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
      } as Order;
    });
  }

  async getById(id: string): Promise<Order | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
    } as Order;
  }

  /**
   * Crea una orden y actualiza el stock en una transacción atómica
   * Garantiza consistencia de datos usando transacciones de Firebase
   */
  async createWithStockUpdate(order: Omit<Order, 'id'>): Promise<Order> {
    // Convertir Date → Timestamp para Firebase
    const orderWithTimestamp = {
      ...order,
      createdAt: order.createdAt instanceof Date
        ? Timestamp.fromDate(order.createdAt)
        : order.createdAt
    };

    // Usar transacción para garantizar consistencia
    return await runTransaction(this.firestore, async (transaction) => {
      // 1. Verificar stock disponible para todos los productos
      for (const orderItem of order.items) {
        const { combo, quantity } = orderItem;

        if (combo.products) {
          for (const productInCombo of combo.products) {
            const itemRef = doc(this.firestore, this.inventoryCollectionName, productInCombo.productId);
            const itemDoc = await transaction.get(itemRef);

            if (!itemDoc.exists()) {
              throw new Error(`El producto con ID ${productInCombo.productId} no existe.`);
            }

            const currentStock = itemDoc.data().stock;
            const requiredStock = productInCombo.quantity * quantity;

            if (currentStock < requiredStock) {
              throw new Error(`No hay suficiente stock para: ${itemDoc.data().name}.`);
            }
          }
        }
      }

      // 2. Si todas las validaciones pasan, decrementar el stock
      for (const orderItem of order.items) {
        const { combo, quantity } = orderItem;

        if (combo.products) {
          for (const productInCombo of combo.products) {
            const itemRef = doc(this.firestore, this.inventoryCollectionName, productInCombo.productId);
            const itemDoc = await transaction.get(itemRef);
            const newStock = itemDoc.data()!.stock - productInCombo.quantity * quantity;
            transaction.update(itemRef, { stock: newStock });
          }
        }
      }

      // 3. Crear el documento de la orden
      const orderRef = doc(collection(this.firestore, this.collectionName));
      transaction.set(orderRef, orderWithTimestamp);

      // 4. Retornar la orden completa con Date nativo
      return {
        ...order,
        id: orderRef.id,
        createdAt: order.createdAt
      } as Order;
    });
  }

  async update(_id: string, _order: Partial<Omit<Order, 'id'>>): Promise<void> {
    // Implementación futura si es necesario
    throw new Error('Update order not implemented');
  }

  async delete(_id: string): Promise<void> {
    // Implementación futura si es necesario
    throw new Error('Delete order not implemented');
  }
}
