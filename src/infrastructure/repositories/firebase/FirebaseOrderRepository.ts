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

  async getByShiftId(shiftId: string): Promise<Order[]> {
    const ordersQuery = query(
      collection(this.firestore, this.collectionName),
      where('shiftId', '==', shiftId)
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
    // Limpiar undefined de customizaciones anidadas (Firestore no los permite)
    const cleanItems = order.items.map(item => {
      const cleanedItem = { ...item };

      // Limpiar customizaciones opcionales undefined
      if (item.customizations) {
        cleanedItem.customizations = Object.fromEntries(
          Object.entries(item.customizations).filter(([_, value]) => value !== undefined)
        ) as any;
      }

      // Limpiar appliedDiscount si es undefined
      if (item.appliedDiscount === undefined) {
        delete (cleanedItem as any).appliedDiscount;
      }

      return cleanedItem;
    });

    // Convertir Date → Timestamp para Firebase
    const orderWithTimestamp = {
      items: cleanItems,
      deliveryType: order.deliveryType,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      createdAt: order.createdAt instanceof Date
        ? Timestamp.fromDate(order.createdAt)
        : order.createdAt
    };

    // Usar transacción para garantizar consistencia
    return await runTransaction(this.firestore, async (transaction) => {
      // Recopilar todas las referencias únicas de productos necesarios
      const productUpdates = new Map<string, { ref: any; requiredQuantity: number }>();

      // Calcular la cantidad total requerida de cada producto
      for (const orderItem of order.items) {
        const { combo, quantity, customizations } = orderItem;

        // Manejar combos con productos definidos
        if (combo && combo.products) {
          for (const productInCombo of combo.products) {
            const currentRequired = productUpdates.get(productInCombo.productId)?.requiredQuantity || 0;
            const itemRef = doc(this.firestore, this.inventoryCollectionName, productInCombo.productId);

            productUpdates.set(productInCombo.productId, {
              ref: itemRef,
              requiredQuantity: currentRequired + (productInCombo.quantity * quantity)
            });
          }
        }

        // Manejar productos individuales (sin combo)
        if (!combo && customizations) {
          if (customizations.product) {
            const currentRequired = productUpdates.get(customizations.product.id)?.requiredQuantity || 0;
            const itemRef = doc(this.firestore, this.inventoryCollectionName, customizations.product.id);

            productUpdates.set(customizations.product.id, {
              ref: itemRef,
              requiredQuantity: currentRequired + quantity
            });
          }

          if (customizations.drink) {
            const currentRequired = productUpdates.get(customizations.drink.id)?.requiredQuantity || 0;
            const itemRef = doc(this.firestore, this.inventoryCollectionName, customizations.drink.id);

            productUpdates.set(customizations.drink.id, {
              ref: itemRef,
              requiredQuantity: currentRequired + quantity
            });
          }

          if (customizations.side) {
            const currentRequired = productUpdates.get(customizations.side.id)?.requiredQuantity || 0;
            const itemRef = doc(this.firestore, this.inventoryCollectionName, customizations.side.id);

            productUpdates.set(customizations.side.id, {
              ref: itemRef,
              requiredQuantity: currentRequired + quantity
            });
          }
        }
      }

      // FASE 1: Realizar TODAS las lecturas primero
      const inventorySnapshots = new Map<string, { snapshot: any; requiredQuantity: number }>();

      for (const [productId, { ref, requiredQuantity }] of productUpdates.entries()) {
        const itemDoc = await transaction.get(ref);
        inventorySnapshots.set(productId, { snapshot: itemDoc, requiredQuantity });
      }

      // FASE 2: Validar stock disponible (solo lectura, sin escrituras)
      for (const [productId, { snapshot, requiredQuantity }] of inventorySnapshots.entries()) {
        if (!snapshot.exists()) {
          throw new Error(`El producto con ID ${productId} no existe.`);
        }

        const currentStock = snapshot.data().stock;
        if (currentStock < requiredQuantity) {
          throw new Error(`No hay suficiente stock para: ${snapshot.data().name}.`);
        }
      }

      // FASE 3: Realizar TODAS las escrituras al final
      for (const [productId, { snapshot, requiredQuantity }] of inventorySnapshots.entries()) {
        const itemRef = productUpdates.get(productId)!.ref;
        const newStock = snapshot.data().stock - requiredQuantity;
        transaction.update(itemRef, { stock: newStock });
      }

      // Crear el documento de la orden
      const orderRef = doc(collection(this.firestore, this.collectionName));
      transaction.set(orderRef, orderWithTimestamp);

      // Retornar la orden completa con Date nativo
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
