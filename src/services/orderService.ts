
import { collection, addDoc, doc, runTransaction, Firestore, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';

// This function creates a new order and updates product stock within a single transaction
// to ensure data consistency.
export const createOrderWithStockUpdate = async (db: Firestore, orderData: Omit<Order, 'id' | 'createdAt'> & { createdAt: Timestamp }): Promise<Order> => {
  
  return await runTransaction(db, async (transaction) => {
    // 1. Check stock and get fresh data for all items
    for (const orderItem of orderData.items) {
        const { combo, quantity } = orderItem;

        if (combo.products) {
            for (const productInCombo of combo.products) {
                const itemRef = doc(db, "inventory", productInCombo.productId);
                const itemDoc = await transaction.get(itemRef);

                if (!itemDoc.exists()) {
                    throw new Error(`El producto con ID ${productInCombo.productId} no existe.`);
                }
                
                const currentStock = itemDoc.data().stock;
                if (currentStock < productInCombo.quantity * quantity) {
                    throw new Error(`No hay suficiente stock para: ${itemDoc.data().name}.`);
                }
            }
        }
    }

    // 2. If all checks pass, decrement stock
    for (const orderItem of orderData.items) {
        const { combo, quantity } = orderItem;
        if (combo.products) {
            for (const productInCombo of combo.products) {
                const itemRef = doc(db, "inventory", productInCombo.productId);
                const itemDoc = await transaction.get(itemRef); // Re-get to be safe within transaction
                const newStock = itemDoc.data()!.stock - productInCombo.quantity * quantity;
                transaction.update(itemRef, { stock: newStock });
            }
        }
    }

    // 3. Create the order document
    const orderRef = doc(collection(db, 'orders'));
    transaction.set(orderRef, orderData);

    // 4. Return the complete order object for UI use
    return {
        ...orderData,
        id: orderRef.id,
        createdAt: orderData.createdAt.toDate(), // Convert Timestamp to Date for consistency
    };
  });
};
