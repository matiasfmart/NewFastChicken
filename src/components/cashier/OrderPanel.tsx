
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

export function OrderPanel() {
  const { orderItems, updateItemQuantity, removeItemFromOrder, clearOrder, deliveryType, setDeliveryType, finalizeOrder, currentOrderNumber } = useOrder();
  const [finalizedOrder, setFinalizedOrder] = React.useState<Order | null>(null);
  
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
              {orderItems.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{item.combo.name}</p>
                    {item.appliedDiscount && (
                        <Badge variant="outline" className="text-accent-foreground bg-accent mt-1 -ml-1">
                            {item.appliedDiscount.percentage}% OFF
                        </Badge>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                        {item.customizations.product && <div>{item.customizations.product.name}</div>}
                        {item.customizations.side && <div>+ {item.customizations.side.name}</div>}
                        {item.customizations.drink && <div>+ {item.customizations.drink.name} {item.customizations.withIce ? '(con hielo)' : '(sin hielo)'}</div>}
                        {item.customizations.isSpicy && <div className="font-semibold text-destructive">CON PICANTE</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span>{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItemFromOrder(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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

    