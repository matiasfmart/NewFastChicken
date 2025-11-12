
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { OrderItem, DeliveryType, Order, InventoryItem, Combo } from "@/lib/types";
import type { CreateOrderDTO } from "@/dtos";
import { useToast } from "@/hooks/use-toast";
import { OrderAPI, ShiftAPI } from "@/api";
import { useShift } from "./ShiftContext";
import { useDiscounts } from "./DiscountContext";
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
  loadCurrentShiftOrders: () => Promise<Order[]>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode, initialCombos: Combo[], initialInventory: InventoryItem[] }> = ({ children, initialCombos, initialInventory }) => {
  const { toast } = useToast();
  const { currentShift, refreshShift } = useShift();
  const { discounts } = useDiscounts();

  const [combos, setCombos] = useState<Combo[]>(initialCombos);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('local');

  const [inventoryStock, setInventoryStock] = useState<Record<string, number>>({});

  // ✅ useRef para prevenir loop infinito en useEffect de descuentos
  const prevOrderItemsRef = useRef<OrderItem[]>([]);
  const isApplyingDiscountsRef = useRef(false);
  
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

  // ✅ REACTIVADO: Aplicar descuentos cross-promotion con useRef para prevenir loop
  // Crear signature estable para detectar cambios en items sin causar re-renders innecesarios
  const orderItemsSignature = useMemo(
    () => orderItems.map(i => `${i.id}:${i.quantity}`).join(','),
    [orderItems]
  );

  useEffect(() => {
    // Prevenir loop cuando estamos aplicando descuentos
    if (isApplyingDiscountsRef.current) {
      isApplyingDiscountsRef.current = false;
      return;
    }

    if (orderItems.length === 0) {
      prevOrderItemsRef.current = [];
      return;
    }

    // Aplicar descuentos cross-promotion (2x1, A→B)
    const itemsWithPromotionalDiscounts = DiscountService.applyPromotionalDiscounts(
      orderItems,
      combos,
      discounts
    );

    // Comparar con estado anterior usando referencia
    const prevItems = prevOrderItemsRef.current;

    // Verificar si hay cambios reales
    const hasRealChanges =
      itemsWithPromotionalDiscounts.length !== prevItems.length ||
      itemsWithPromotionalDiscounts.some((newItem, index) => {
        const prevItem = prevItems[index];
        if (!prevItem) return true;

        // Comparar solo campos relevantes
        return (
          newItem.id !== prevItem.id ||
          newItem.quantity !== prevItem.quantity ||
          Math.abs(newItem.finalUnitPrice - prevItem.finalUnitPrice) > 0.01 ||
          newItem.appliedDiscount?.percentage !== prevItem.appliedDiscount?.percentage
        );
      });

    if (hasRealChanges) {
      isApplyingDiscountsRef.current = true;
      prevOrderItemsRef.current = itemsWithPromotionalDiscounts;
      setOrderItems(itemsWithPromotionalDiscounts);
    }
  }, [orderItemsSignature, combos, discounts, orderItems]);

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

    // ✅ Los descuentos cross-promotion YA están aplicados por el useEffect
    // Solo necesitamos calcular subtotal, total y aplicar descuento sobre orden

    // Calcular subtotal (precios originales sin descuento)
    const subtotal = orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    // Calcular total con descuentos por item (simples + cross-promotion ya aplicados)
    let total = orderItems.reduce((acc, item) => acc + item.finalUnitPrice * item.quantity, 0);

    // ✅ Aplicar descuento sobre el total de la orden si existe
    const orderDiscount = DiscountService.getActiveOrderDiscount(discounts);
    if (orderDiscount) {
      total = total * (1 - orderDiscount.percentage / 100);
    }

    const newOrderData: CreateOrderDTO = {
        shiftId: currentShift?.id,
        items: orderItems, // ✅ Items ya tienen todos los descuentos aplicados
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

  /**
   * Carga los pedidos de la jornada actual ordenados por fecha (más reciente primero)
   * 🟥 PRESENTATION LAYER - UI orchestration
   */
  const loadCurrentShiftOrders = async (): Promise<Order[]> => {
    try {
      if (!currentShift) {
        return [];
      }
      const orders = await OrderAPI.getByShiftId(currentShift.id);
      // Ordenar por fecha descendente (más reciente primero)
      return orders.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt as any);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt as any);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar pedidos';
      toast({ variant: "destructive", title: "Error al cargar pedidos", description: errorMessage });
      return [];
    }
  };

  /**
   * Cancela una orden y actualiza la jornada
   * 🟥 PRESENTATION LAYER - UI orchestration
   */
  const cancelOrder = async (orderId: string, reason?: string): Promise<void> => {
    try {
      await OrderAPI.cancel(orderId, reason);

      // Si hay jornada activa, refrescarla para actualizar los totales
      if (currentShift) {
        await refreshShift();
      }

      toast({
        title: "Pedido cancelado",
        description: "El pedido ha sido cancelado correctamente"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cancelar pedido';
      toast({ variant: "destructive", title: "Error al cancelar pedido", description: errorMessage });
      throw error;
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
        startNewShift,
        loadCurrentShiftOrders,
        cancelOrder
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
