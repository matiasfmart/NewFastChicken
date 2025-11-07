
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Order, OrderItem } from "@/lib/types";
import { FastChickenLogo } from "../icons/FastChickenLogo";
import { DeliveryIcon } from "../icons/DeliveryIcons";
import { Badge } from "../ui/badge";

interface CheckoutDialogProps {
  order: Order;
  onClose: () => void;
}

const TicketLayout = ({ order, isKitchen }: { order: Order; isKitchen: boolean }) => {

  const deliveryText = {
      local: 'Para comer acá',
      takeaway: 'Para llevar',
      delivery: 'Delivery'
  }

  // Función helper para convertir createdAt a Date de forma segura
  const getOrderDate = (): Date => {
    if (order.createdAt instanceof Date) {
      return order.createdAt;
    }
    // Si es un objeto Timestamp de Firestore
    if (typeof order.createdAt === 'object' && 'seconds' in order.createdAt) {
      return new Date((order.createdAt as any).seconds * 1000);
    }
    // Si es un string ISO (desde API)
    if (typeof order.createdAt === 'string') {
      return new Date(order.createdAt);
    }
    // Fallback
    return new Date();
  }

  const renderItem = (item: OrderItem) => {
    // Determinar el nombre del ítem
    const itemName = item.combo
      ? item.combo.name
      : (item.customizations.product?.name || item.customizations.drink?.name || item.customizations.side?.name || 'Producto');

    return (
      <div key={item.id} className="text-sm">
          <div className="flex justify-between">
              <span className="font-bold">{item.quantity}x {itemName}</span>
              {!isKitchen && (
                   <div className="flex flex-col items-end">
                      {item.appliedDiscount ? (
                          <>
                             <span className="text-xs line-through text-muted-foreground">${item.unitPrice.toLocaleString('es-AR')}</span>
                             <span className="font-bold">${item.finalUnitPrice.toLocaleString('es-AR')} c/u</span>
                          </>
                      ) : (
                          <span className="font-bold">${item.unitPrice.toLocaleString('es-AR')} c/u</span>
                      )}
                   </div>
              )}
          </div>
          {!isKitchen && item.appliedDiscount && <Badge variant="outline" className="text-accent-foreground bg-accent mb-1">{item.appliedDiscount.percentage}% OFF</Badge>}

          {/* Solo mostrar detalles de customización para combos */}
          {item.combo && (
            <div className="pl-4 text-muted-foreground">
                {item.customizations.product && <div>{item.customizations.product.name}</div>}
                {item.customizations.side && <div>+ {item.customizations.side.name}</div>}
                {item.customizations.drink && <div>+ {item.customizations.drink.name} {item.customizations.withIce ? '(con hielo)' : '(sin hielo)'}</div>}
                {item.customizations.isSpicy && <div className="font-semibold text-destructive">CON PICANTE</div>}
            </div>
          )}

          {/* Para productos individuales, mostrar opciones si las hay */}
          {!item.combo && (
            <div className="pl-4 text-muted-foreground">
                {item.customizations.isSpicy && <div className="font-semibold text-destructive">CON PICANTE</div>}
                {item.customizations.withIce !== undefined && (
                  <div>{item.customizations.withIce ? '(con hielo)' : '(sin hielo)'}</div>
                )}
            </div>
          )}
      </div>
    );
  }

  const orderId = typeof order.id === 'string' ? order.id.substring(0, 6).toUpperCase() : order.id.toString().padStart(6, '0');

  return (
    <div className="w-full max-w-sm mx-auto bg-white text-black p-4 font-mono">
      <div className="text-center space-y-2">
        {!isKitchen && <FastChickenLogo className="justify-center" />}
        <h2 className="text-xl font-bold">{isKitchen ? 'COCINA' : `ORDEN #${orderId}`}</h2>
      </div>
      <Separator className="my-2 border-dashed border-black" />
      <div className="space-y-2">
        {order.items.map(renderItem)}
      </div>
      <Separator className="my-2 border-dashed border-black" />
      {!isKitchen && (
          <div className="space-y-1 text-sm">
            {order.discount > 0 && (
                <>
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Descuento:</span>
                        <span>-${order.discount.toLocaleString('es-AR')}</span>
                    </div>
                </>
            )}
            <div className="flex justify-between font-bold text-lg">
                <span>TOTAL:</span>
                <span>${order.total.toLocaleString('es-AR')}</span>
            </div>
          </div>
      )}
      <Separator className="my-2 border-dashed border-black" />
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
            <DeliveryIcon type={order.deliveryType} className="w-5 h-5" />
            <span>{deliveryText[order.deliveryType]}</span>
        </div>
        <div className="flex flex-col items-end">
            <span>{getOrderDate().toLocaleDateString('es-AR')}</span>
            <span>{getOrderDate().toLocaleTimeString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
};

export function CheckoutDialog({ order, onClose }: CheckoutDialogProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pedido Confirmado</DialogTitle>
          <DialogDescription>
            El pedido se ha registrado. Imprimiendo tickets...
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="customer">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">Ticket Cliente</TabsTrigger>
            <TabsTrigger value="kitchen">Ticket Cocina</TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <div className="bg-gray-200 p-2 rounded-md">
              <TicketLayout order={order} isKitchen={false} />
            </div>
          </TabsContent>
          <TabsContent value="kitchen">
            <div className="bg-gray-200 p-2 rounded-md">
              <TicketLayout order={order} isKitchen={true} />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={onClose}>Nuevo Pedido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    