
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { OrderItem, Combo, InventoryItem, DeliveryType, Order } from "@/lib/types";
import { inventory as initialInventory } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

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
  finalizeOrder: () => Order | null;
  startNewShift: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('local');
  const [inventory, setInventory] = useState<Record<string, number>>(
    initialInventory.reduce((acc, item) => ({ ...acc, [item.id]: item.stock }), {})
  );
  const [currentOrderNumber, setCurrentOrderNumber] = useState(1);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  const getInventoryStock = useCallback((itemId: string) => inventory[itemId] || 0, [inventory]);

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

  const clearOrder = () => {
    setOrderItems([]);
    setDeliveryType('local');
  };
  
  const startNewShift = () => {
    clearOrder();
    setCompletedOrders([]);
    setCurrentOrderNumber(1);
    setInventory(initialInventory.reduce((acc, item) => ({ ...acc, [item.id]: item.stock }), {}));
  }

  const finalizeOrder = (): Order | null => {
    if (orderItems.length === 0) return null;

    const newInventory = { ...inventory };
    
    // Check stock before decrementing
    for (const orderItem of orderItems) {
        const { combo, quantity, customizations } = orderItem;

        // Decrement items from the combo itself
        if (combo.products) {
            for (const productInCombo of combo.products) {
                 if (newInventory[productInCombo.productId] < productInCombo.quantity * quantity) {
                    const itemInfo = initialInventory.find(i => i.id === productInCombo.productId);
                    toast({ variant: "destructive", title: "Stock Insuficiente", description: `No hay suficiente ${itemInfo?.name || 'producto'}.`});
                    return null;
                }
            }
        }
    }


    // If all checks pass, decrement stock
    for (const orderItem of orderItems) {
        const { combo, quantity } = orderItem;
         if (combo.products) {
            for (const productInCombo of combo.products) {
                newInventory[productInCombo.productId] -= productInCombo.quantity * quantity;
            }
        }
    }

    const subtotal = orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const total = orderItems.reduce((acc, item) => acc + item.finalUnitPrice * item.quantity, 0);
    
    const newOrder: Order = {
        id: currentOrderNumber,
        items: orderItems,
        deliveryType,
        subtotal,
        discount: subtotal - total,
        total,
        createdAt: new Date(),
    }

    setInventory(newInventory);
    setCompletedOrders(prev => [...prev, newOrder]);
    setCurrentOrderNumber(prev => prev + 1);
    
    // Not clearing the order here, that happens after showing the ticket.
    return newOrder;
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
