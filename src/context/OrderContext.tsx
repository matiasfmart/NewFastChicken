
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { OrderItem, DeliveryType, Order, InventoryItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/hooks/use-firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, addDoc, doc, runTransaction, Timestamp } from 'firebase/firestore';

interface OrderContextType {
  orderItems: OrderItem[];
  currentOrderNumber: number;
  completedOrders: Order[];
  deliveryType: DeliveryType;
  addItemToOrder: (item: OrderItem) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItemFromOrder: (itemId: string) => void;
  clearOrder: () => void;
  setDeliveryType: (type: DeliveryType) => void;
  getInventoryStock: (itemId: string) => number;
  finalizeOrder: () => Promise<Order | null>;
  startNewShift: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [inventoryCollection] = useCollection(firestore ? collection(firestore, 'inventory') : null);
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('local');
  
  const [inventory, setInventory] = useState<Record<string, number>>({});
  
  const [currentOrderNumber, setCurrentOrderNumber] = useState(1);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (inventoryCollection) {
        const stock = inventoryCollection.docs.reduce((acc, doc) => {
            const item = doc.data() as InventoryItem;
            acc[doc.id] = item.stock;
            return acc;
        }, {} as Record<string, number>);
        setInventory(stock);
    }
  }, [inventoryCollection]);

  const getInventoryStock = useCallback((itemId: string) => inventory[itemId], [inventory]);

  const addItemToOrder = (newItem: OrderItem) => {
    setOrderItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      }
      return [...prevItems, newItem];
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
        removeItemFromOrder(itemId);
        return;
    };
    setOrderItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeItemFromOrder = (itemId: string) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearOrder = useCallback(() => {
    setOrderItems([]);
    setDeliveryType('local');
  }, []);
  
  const startNewShift = useCallback(() => {
    clearOrder();
    setCompletedOrders([]);
    setCurrentOrderNumber(1);
    // Inventory will be refetched automatically by useCollection
  }, [clearOrder]);

  const finalizeOrder = async (): Promise<Order | null> => {
    if (orderItems.length === 0 || !firestore) return null;

    try {
        const finalOrder = await runTransaction(firestore, async (transaction) => {
            const inventoryItemsForToast: Record<string, InventoryItem> = {};
            if (inventoryCollection) {
                for(const doc of inventoryCollection.docs) {
                    inventoryItemsForToast[doc.id] = doc.data() as InventoryItem;
                }
            }
            
            // 1. Check stock and get fresh data for all items
            for (const orderItem of orderItems) {
                const { combo, quantity, customizations } = orderItem;

                if (combo.products) {
                    for (const productInCombo of combo.products) {
                        const itemRef = doc(firestore, "inventory", productInCombo.productId);
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
            for (const orderItem of orderItems) {
                const { combo, quantity } = orderItem;
                if (combo.products) {
                    for (const productInCombo of combo.products) {
                        const itemRef = doc(firestore, "inventory", productInCombo.productId);
                        // We already got the doc, so we can just update based on that.
                        const itemDoc = await transaction.get(itemRef);
                        const newStock = itemDoc.data()!.stock - productInCombo.quantity * quantity;
                        transaction.update(itemRef, { stock: newStock });
                    }
                }
            }

            // 3. Create the order
            const subtotal = orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
            const total = orderItems.reduce((acc, item) => acc + item.finalUnitPrice * item.quantity, 0);
            
            const newOrderData = {
                items: orderItems,
                deliveryType,
                subtotal,
                discount: subtotal - total,
                total,
                createdAt: Timestamp.now(),
            };

            const orderRef = await addDoc(collection(firestore, 'orders'), newOrderData);

            // This is the object that will be returned by the transaction
            return {
                ...newOrderData,
                id: orderRef.id, // using the generated doc id
                createdAt: newOrderData.createdAt.toDate(),
            };
        });

        // After transaction is successful
        setCompletedOrders(prev => [...prev, finalOrder]);
        setCurrentOrderNumber(prev => prev + 1); // This is just for display on the frontend now
        clearOrder();

        return finalOrder;

    } catch (e: any) {
        toast({ variant: "destructive", title: "Error al procesar el pedido", description: e.message });
        return null;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        deliveryType,
        currentOrderNumber,
        completedOrders,
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        clearOrder,
        setDeliveryType,
        getInventoryStock,
        finalizeOrder,
        startNewShift
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};

    