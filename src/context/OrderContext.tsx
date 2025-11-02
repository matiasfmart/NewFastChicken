
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { OrderItem, DeliveryType, Order, InventoryItem, Combo } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/hooks/use-firebase";
import { Timestamp } from 'firebase/firestore';
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

export const OrderProvider: React.FC<{ children: React.ReactNode, initialCombos: Combo[], initialInventory: InventoryItem[] }> = ({ children, initialCombos, initialInventory }) => {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [combos, setCombos] = useState<Combo[]>(initialCombos);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('local');
  
  const [inventoryStock, setInventoryStock] = useState<Record<string, number>>({});
  
  const [currentOrderNumber, setCurrentOrderNumber] = useState(1);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Initialize stock from the server-provided inventory
    const stock = initialInventory.reduce((acc, item) => {
        acc[item.id] = item.stock;
        return acc;
    }, {} as Record<string, number>);
    setInventoryStock(stock);
  }, [initialInventory]);


  const getInventoryStock = useCallback((itemId: string) => inventoryStock[itemId] ?? 0, [inventoryStock]);

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

        // After transaction is successful, update state
        setCompletedOrders(prev => [...prev, finalOrder]);
        setCurrentOrderNumber(prev => prev + 1);
        
        // Manually update local stock state for immediate UI feedback
        setInventoryStock(currentStock => {
            const newStock = {...currentStock};
            for (const orderItem of newOrderData.items) {
                const { combo, quantity } = orderItem;
                if (combo.products) {
                    for (const productInCombo of combo.products) {
                        newStock[productInCombo.productId] -= productInCombo.quantity * quantity;
                    }
                }
            }
            return newStock;
        });

        clearOrder();
        return finalOrder;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el pedido';
        toast({ variant: "destructive", title: "Error al procesar el pedido", description: errorMessage });
        return null;
    }
  };

  // isLoading is false because data is now pre-fetched on the server
  const isLoading = false;

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
