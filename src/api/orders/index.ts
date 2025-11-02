import { Firestore, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import type { CreateOrderDTO } from '@/dtos';
import { createOrderWithStockUpdate } from '@/services/orderService';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * API interna de Orders
 * Esta capa abstrae completamente Firebase del frontend
 *
 * En Fase 2, solo cambiamos la implementación a fetch() remoto
 */
class OrderAPIClient {
  private firestore: Firestore | null = null;

  setFirestore(firestore: Firestore) {
    this.firestore = firestore;
  }

  /**
   * Crea una nueva orden con actualización de stock
   */
  async create(dto: CreateOrderDTO): Promise<Order> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    // Convertir Date → Timestamp solo aquí (Firebase específico)
    const orderData = {
      ...dto,
      createdAt: Timestamp.fromDate(dto.createdAt)
    };

    const order = await createOrderWithStockUpdate(this.firestore, orderData);

    // Retornar con Date (NO Timestamp)
    return {
      ...order,
      createdAt: order.createdAt instanceof Date ? order.createdAt : order.createdAt.toDate()
    };
  }

  /**
   * Obtiene órdenes por fecha
   */
  async getByDate(date: Date): Promise<Order[]> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    const start = startOfDay(date);
    const end = endOfDay(date);

    const { collection, query, where, getDocs } = await import('firebase/firestore');

    const ordersQuery = query(
      collection(this.firestore, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<', Timestamp.fromDate(end))
    );

    const snapshot = await getDocs(ordersQuery);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate()
      } as Order;
    });
  }

  /**
   * Obtiene todas las órdenes
   */
  async getAll(): Promise<Order[]> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    const { collection, getDocs } = await import('firebase/firestore');

    const snapshot = await getDocs(collection(this.firestore, 'orders'));

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate()
      } as Order;
    });
  }
}

// Singleton
export const OrderAPI = new OrderAPIClient();
