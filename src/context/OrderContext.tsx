
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { OrderItem, DeliveryType, Order, InventoryItem, Combo } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/hooks/use-firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, doc, runTransaction, Timestamp } from 'firebase/firestore';
import { createOrderWithStockUpdate } from "@/services/orderService";

interface OrderContextType {
  orderItems: OrderItem[];
  currentOrderNumber: number;
  completedOrders: Order[];
  deliveryType: DeliveryType;
  combos: Combo[];
  inventory: InventoryItem[];
  isLoading: boolean;
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

  const [inventoryCollection, inventoryLoading] = useCollection(firestore ? collection(firestore, 'inventory') : null);
  const [combosCollection, combosLoading] = useCollection(firestore ? collection(firestore, 'combos') : null);

  const inventory = useMemo(() => inventoryCollection?.docs.map(d => ({ ...d.data(), id: d.id } as InventoryItem)) || [], [inventoryCollection]);
  const combos = useMemo(() => combosCollection?.docs.map(d => ({ ...d.data(), id: d.id } as Combo)) || [], [combosCollection]);
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('local');
  
  const [inventoryStock, setInventoryStock] = useState<Record<string, number>>({});
  
  const [currentOrderNumber, setCurrentOrderNumber] = useState(1);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (inventoryCollection) {
        const stock = inventoryCollection.docs.reduce((acc, doc) => {
            const item = doc.data() as InventoryItem;
            acc[doc.id] = item.stock;
            return acc;
        }, {} as Record<string, number>);
        setInventoryStock(stock);
    }
  }, [inventoryCollection]);

  const getInventoryStock = useCallback((itemId: string) => inventoryStock[itemId], [inventoryStock]);

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
  }, [clearOrder]);

  const finalizeOrder = async (): Promise<Order | null> => {
    if (orderItems.length === 0 || !firestore) return null;

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


    try {
        const finalOrder = await createOrderWithStockUpdate(firestore, newOrderData);

        // After transaction is successful
        setCompletedOrders(prev => [...prev, finalOrder]);
        setCurrentOrderNumber(prev => prev + 1);
        clearOrder();

        // Update local inventory stock state for immediate UI feedback
        setInventoryStock(prevStock => {
            const newStock = { ...prevStock };
            finalOrder.items.forEach(orderItem => {
                if (orderItem.combo.products) {
                    orderItem.combo.products.forEach(p => {
                        newStock[p.productId] -= p.quantity * orderItem.quantity;
                    });
                }
            });
            return newStock;
        });

        return finalOrder;

    } catch (e: any) {
        toast({ variant: "destructive", title: "Error al procesar el pedido", description: e.message });
        return null;
    }
  };

  const isLoading = inventoryLoading || combosLoading;

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        deliveryType,
        currentOrderNumber,
        completedOrders,
        combos,
        inventory,
        isLoading,
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
