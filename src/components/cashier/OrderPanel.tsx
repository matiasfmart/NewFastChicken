
"use client";

import React from 'react';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus } from 'lucide-react';
import { DeliveryTypeSelector } from '../icons/DeliveryIcons';
import { CheckoutDialog } from './CheckoutDialog';
import type { Order } from '@/lib/types';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

export function OrderPanel() {
  const { orderItems, updateItemQuantity, removeItemFromOrder, clearOrder, deliveryType, setDeliveryType, finalizeOrder, currentOrderNumber, checkStockForNewItem } = useOrder();
  const [finalizedOrder, setFinalizedOrder] = React.useState<Order | null>(null);
  const { toast } = useToast();
  
  const subtotal = orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const total = orderItems.reduce((acc, item) => acc + item.finalUnitPrice * item.quantity, 0);
  const discount = subtotal - total;

  const handleFinalize = async () => {
    const order = await finalizeOrder();
    if(order) {
        setFinalizedOrder(order);
    }
  }

  const handleCloseCheckout = () => {
    setFinalizedOrder(null);
    // Order is cleared inside context now
  }

  const handleIncreaseQuantity = (item: typeof orderItems[0]) => {
    // Crear un item temporal con la cantidad incrementada para verificar stock
    const tempItem = { ...item, quantity: 1 }; // Solo verificamos el incremento de 1 unidad
    const stockCheck = checkStockForNewItem(tempItem);

    if (!stockCheck.hasStock) {
      toast({
        variant: 'destructive',
        title: "Stock insuficiente",
        description: stockCheck.missingProducts.join('\n')
      });
      return;
    }

    updateItemQuantity(item.id, item.quantity + 1);
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="p-4">
          <h2 className="text-xl font-bold">Pedido #{currentOrderNumber.toString().padStart(4, '0')}</h2>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          {orderItems.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Agregue items al pedido</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              {orderItems.map(item => {
                // Determinar el nombre a mostrar
                const itemName = item.combo
                  ? item.combo.name
                  : (item.customizations.product?.name || item.customizations.drink?.name || item.customizations.side?.name || 'Producto');

                return (
                <div key={item.id} className="flex gap-3 pb-3 border-b border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm leading-tight">{itemName}</p>
                      <div className="text-right flex-shrink-0">
                        {item.appliedDiscount ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs line-through text-muted-foreground">${item.unitPrice.toLocaleString('es-AR')}</span>
                            <span className="text-sm font-semibold">${item.finalUnitPrice.toLocaleString('es-AR')}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold">${item.finalUnitPrice.toLocaleString('es-AR')}</span>
                        )}
                      </div>
                    </div>
                    {item.appliedDiscount && (
                        <Badge variant="outline" className="text-accent-foreground bg-accent mt-1 text-xs">
                            {item.appliedDiscount.percentage}% OFF
                        </Badge>
                    )}
                    {/* Solo mostrar detalles de customización para combos */}
                    {item.combo && (
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {item.customizations.product && <div>• {item.customizations.product.name}</div>}
                          {item.customizations.side && <div>• {item.customizations.side.name}</div>}
                          {item.customizations.drink && <div>• {item.customizations.drink.name} {item.customizations.withIce ? '(con hielo)' : '(sin hielo)'}</div>}
                          {item.customizations.isSpicy && <div className="font-semibold text-destructive">⚡ CON PICANTE</div>}
                      </div>
                    )}
                    {/* Para productos individuales, mostrar opciones si las hay */}
                    {!item.combo && (
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {item.customizations.isSpicy && <div className="font-semibold text-destructive">⚡ CON PICANTE</div>}
                          {item.customizations.withIce !== undefined && item.customizations.drink && (
                            <div>• {item.customizations.withIce ? 'Con hielo' : 'Sin hielo'}</div>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-muted rounded-md p-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold min-w-[1.5rem] text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleIncreaseQuantity(item)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">${(item.finalUnitPrice * item.quantity).toLocaleString('es-AR')}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeItemFromOrder(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="space-y-4 p-4">
            <DeliveryTypeSelector selected={deliveryType} onSelect={setDeliveryType} />
            <div className="space-y-1 text-sm">
                {discount > 0 && (
                    <>
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between text-destructive">
                            <span>Descuentos</span>
                            <span>-${discount.toLocaleString('es-AR')}</span>
                        </div>
                    </>
                )}
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toLocaleString('es-AR')}</span>
                </div>
            </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={clearOrder} disabled={orderItems.length === 0}>Limpiar</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleFinalize}
              disabled={orderItems.length === 0}
            >
              Terminar Pedido
            </Button>
          </div>
        </div>
      </div>
      {finalizedOrder && <CheckoutDialog order={finalizedOrder} onClose={handleCloseCheckout} />}
    </>
  );
}

    