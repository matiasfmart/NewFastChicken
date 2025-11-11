
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { OrderItem, DeliveryType, Order, InventoryItem, Combo } from "@/lib/types";
import type { CreateOrderDTO } from "@/dtos";
import { useToast } from "@/hooks/use-toast";
import { OrderAPI, ShiftAPI } from "@/api";
import { useShift } from "./ShiftContext";
import { DiscountService } from "@/domain/services/DiscountService";

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
  getAvailableStock: (itemId: string) => number;
  checkStockForNewItem: (newItem: OrderItem) => { hasStock: boolean; missingProducts: string[] };
  finalizeOrder: () => Promise<Order | null>;
  startNewShift: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode, initialCombos: Combo[], initialInventory: InventoryItem[] }> = ({ children, initialCombos, initialInventory }) => {
  const { toast } = useToast();
  const { currentShift, refreshShift } = useShift();

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

  // Calcula cuánto stock está siendo usado en el carrito actual
  const getUsedStock = useCallback((itemId: string): number => {
    let usedQuantity = 0;

    for (const orderItem of orderItems) {
      const { combo, quantity, customizations } = orderItem;

      // Para combos, sumar productos del combo
      if (combo && combo.products) {
        for (const productInCombo of combo.products) {
          if (productInCombo.productId === itemId) {
            usedQuantity += productInCombo.quantity * quantity;
          }
        }
      }

      // Para productos individuales
      if (!combo && customizations) {
        if (customizations.product?.id === itemId) {
          usedQuantity += quantity;
        }
        if (customizations.drink?.id === itemId) {
          usedQuantity += quantity;
        }
        if (customizations.side?.id === itemId) {
          usedQuantity += quantity;
        }
      }
    }

    return usedQuantity;
  }, [orderItems]);

  // Retorna el stock disponible (stock total - stock en carrito)
  const getAvailableStock = useCallback((itemId: string): number => {
    const totalStock = getInventoryStock(itemId);
    const usedStock = getUsedStock(itemId);
    return Math.max(0, totalStock - usedStock);
  }, [getInventoryStock, getUsedStock]);

  // Verifica si hay suficiente stock para agregar un nuevo item
  const checkStockForNewItem = useCallback((newItem: OrderItem): { hasStock: boolean; missingProducts: string[] } => {
    const requiredProducts = new Map<string, { name: string; required: number; available: number }>();

    const { combo, quantity, customizations } = newItem;

    // Calcular productos necesarios
    if (combo && combo.products) {
      for (const productInCombo of combo.products) {
        const available = getAvailableStock(productInCombo.productId);
        const required = productInCombo.quantity * quantity;
        const product = inventory.find(p => p.id === productInCombo.productId);

        requiredProducts.set(productInCombo.productId, {
          name: product?.name || 'Producto desconocido',
          required,
          available
        });
      }
    }

    if (!combo && customizations) {
      if (customizations.product) {
        const available = getAvailableStock(customizations.product.id);
        requiredProducts.set(customizations.product.id, {
          name: customizations.product.name,
          required: quantity,
          available
        });
      }
      if (customizations.drink) {
        const available = getAvailableStock(customizations.drink.id);
        requiredProducts.set(customizations.drink.id, {
          name: customizations.drink.name,
          required: quantity,
          available
        });
      }
      if (customizations.side) {
        const available = getAvailableStock(customizations.side.id);
        requiredProducts.set(customizations.side.id, {
          name: customizations.side.name,
          required: quantity,
          available
        });
      }
    }

    // Verificar si hay stock suficiente
    const missingProducts: string[] = [];
    for (const [_, data] of requiredProducts.entries()) {
      if (data.available < data.required) {
        missingProducts.push(`${data.name} (Disponible: ${data.available}, Necesario: ${data.required})`);
      }
    }

    return {
      hasStock: missingProducts.length === 0,
      missingProducts
    };
  }, [getAvailableStock, inventory]);

  // Recalcular descuentos promocionales cuando cambia el carrito
  // ✅ ACTIVADO: Aplica descuentos de tipo quantity y cross-promotion automáticamente
  useEffect(() => {
    if (orderItems.length === 0) return;

    // Aplicar descuentos promocionales (quantity y cross-promotion)
    const itemsWithPromotionalDiscounts = DiscountService.applyPromotionalDiscounts(
      orderItems,
      combos
    );

    // Solo actualizar si hubo cambios REALES en los descuentos
    // Compara profundamente para evitar loops infinitos
    const hasChanges = itemsWithPromotionalDiscounts.some((newItem, index) => {
      const oldItem = orderItems[index];
      if (!oldItem) return true;

      const priceChanged = newItem.finalUnitPrice !== oldItem.finalUnitPrice;
      const discountChanged = newItem.appliedDiscount?.percentage !== oldItem.appliedDiscount?.percentage;
      const discountRuleChanged = newItem.appliedDiscount?.rule.id !== oldItem.appliedDiscount?.rule.id;

      return priceChanged || discountChanged || discountRuleChanged;
    });

    if (hasChanges) {
      setOrderItems(itemsWithPromotionalDiscounts);
    }
  }, [orderItems, combos]);

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
    if (orderItems.length === 0) return null;

    const subtotal = orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const total = orderItems.reduce((acc, item) => acc + item.finalUnitPrice * item.quantity, 0);

    const newOrderData: CreateOrderDTO = {
        shiftId: currentShift?.id,
        items: orderItems,
        deliveryType,
        subtotal,
        discount: subtotal - total,
        total,
        createdAt: new Date(),
    };

    try {
        const finalOrder = await OrderAPI.create(newOrderData);

        // Actualizar totales de la jornada activa si existe
        if (currentShift) {
          await ShiftAPI.update(currentShift.id, {
            totalOrders: currentShift.totalOrders + 1,
            totalRevenue: currentShift.totalRevenue + total
          });
          // Refrescar el estado de la jornada
          await refreshShift();
        }

        // After transaction is successful, update state
        setCompletedOrders(prev => [...prev, finalOrder]);
        setCurrentOrderNumber(prev => prev + 1);

        // Manually update local stock state for immediate UI feedback
        setInventoryStock(currentStock => {
            const newStock = {...currentStock};
            for (const orderItem of newOrderData.items) {
                const { combo, quantity, customizations } = orderItem;

                // Manejar combos con productos definidos
                if (combo && combo.products) {
                    for (const productInCombo of combo.products) {
                        newStock[productInCombo.productId] -= productInCombo.quantity * quantity;
                    }
                }

                // Manejar productos individuales (sin combo)
                if (!combo && customizations) {
                    if (customizations.product) {
                        newStock[customizations.product.id] -= quantity;
                    }
                    if (customizations.drink) {
                        newStock[customizations.drink.id] -= quantity;
                    }
                    if (customizations.side) {
                        newStock[customizations.side.id] -= quantity;
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
        getAvailableStock,
        checkStockForNewItem,
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
