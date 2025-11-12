
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Order, OrderItem } from "@/lib/types";
import { FastChickenLogo } from "../icons/FastChickenLogo";
import { DeliveryIcon } from "../icons/DeliveryIcons";
import { Badge } from "../ui/badge";
import { browserPrinter } from "@/infrastructure/printers";
import { TicketFormatter } from "@/domain/services/TicketFormatter";
import { Printer } from "lucide-react";

interface CheckoutDialogProps {
  order: Order;
  onClose: () => void;
}

const TicketLayout = ({ order, isKitchen, className }: { order: Order; isKitchen: boolean; className?: string }) => {

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
      <div key={item.id} className="text-xs">
          <div className="flex justify-between gap-2">
              <span className="font-bold truncate flex-1">{item.quantity}x {itemName}</span>
              {!isKitchen && (
                   <div className="flex flex-col items-end shrink-0">
                      {item.appliedDiscount ? (
                          <>
                             <span className="text-[10px] line-through text-muted-foreground">${item.unitPrice.toLocaleString('es-AR')}</span>
                             <span className="font-bold text-xs">${item.finalUnitPrice.toLocaleString('es-AR')} c/u</span>
                          </>
                      ) : (
                          <span className="font-bold text-xs">${item.unitPrice.toLocaleString('es-AR')} c/u</span>
                      )}
                   </div>
              )}
          </div>
          {!isKitchen && item.appliedDiscount && <Badge variant="outline" className="text-[10px] text-accent-foreground bg-accent mb-1 py-0 px-1">{item.appliedDiscount.percentage}% OFF</Badge>}

          {/* Solo mostrar detalles de customización para combos */}
          {item.combo && (
            <div className="pl-3 text-[11px] text-muted-foreground">
                {item.customizations.product && <div className="truncate">{item.customizations.product.name}</div>}
                {item.customizations.side && <div className="truncate">+ {item.customizations.side.name}</div>}
                {item.customizations.drink && <div className="truncate">+ {item.customizations.drink.name} {item.customizations.withIce ? '(con hielo)' : '(sin hielo)'}</div>}
                {item.customizations.isSpicy && <div className="font-semibold text-destructive">CON PICANTE</div>}
            </div>
          )}

          {/* Para productos individuales, mostrar opciones si las hay */}
          {!item.combo && (
            <div className="pl-3 text-[11px] text-muted-foreground">
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
    <div className={`ticket-layout w-full bg-white text-black p-4 font-mono text-xs ${className || ''}`}>
      <div className="text-center space-y-1">
        {!isKitchen && <FastChickenLogo className="justify-center scale-75" />}
        <h2 className="text-base font-bold">{isKitchen ? 'COCINA' : `ORDEN #${orderId}`}</h2>
      </div>
      <Separator className="separator my-2 border-dashed border-black" />
      <div className="space-y-2">
        {order.items.map(renderItem)}
      </div>
      <Separator className="separator my-1 border-dashed border-black" />
      {!isKitchen && (
          <div className="space-y-0.5 text-xs">
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
            <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>${order.total.toLocaleString('es-AR')}</span>
            </div>
          </div>
      )}
      <Separator className="separator my-1 border-dashed border-black" />
      <div className="flex justify-between items-center text-[11px]">
        <div className="flex items-center gap-1.5">
            <DeliveryIcon type={order.deliveryType} className="w-4 h-4" />
            <span className="truncate">{deliveryText[order.deliveryType]}</span>
        </div>
        <div className="flex flex-col items-end shrink-0">
            <span>{getOrderDate().toLocaleDateString('es-AR')}</span>
            <span>{getOrderDate().toLocaleTimeString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
};

export function CheckoutDialog({ order, onClose }: CheckoutDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'kitchen'>('customer');

  const handlePrint = async () => {
    if (!browserPrinter.isAvailable()) {
      alert('La impresión no está disponible en este navegador');
      return;
    }

    setIsPrinting(true);
    try {
      // Imprimir según la pestaña activa
      const content = activeTab === 'customer'
        ? TicketFormatter.formatCustomerTicket(order)
        : TicketFormatter.formatKitchenTicket(order);

      await browserPrinter.print(content);
    } catch (error) {
      console.error('Error printing:', error);
      alert('Error al imprimir. Por favor, intente nuevamente.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintBoth = async () => {
    if (!browserPrinter.isAvailable()) {
      alert('La impresión no está disponible en este navegador');
      return;
    }

    setIsPrinting(true);
    try {
      // Imprimir ticket de cliente
      const customerContent = TicketFormatter.formatCustomerTicket(order);
      await browserPrinter.print(customerContent);

      // Pequeña pausa entre impresiones
      await new Promise(resolve => setTimeout(resolve, 500));

      // Imprimir ticket de cocina
      const kitchenContent = TicketFormatter.formatKitchenTicket(order);
      await browserPrinter.print(kitchenContent);
    } catch (error) {
      console.error('Error printing:', error);
      alert('Error al imprimir. Por favor, intente nuevamente.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="shrink-0 p-6 pb-4">
          <DialogTitle>Pedido Confirmado</DialogTitle>
          <DialogDescription>
            El pedido se ha registrado correctamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <Tabs defaultValue="customer" value={activeTab} onValueChange={(v) => setActiveTab(v as 'customer' | 'kitchen')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="customer">Ticket Cliente</TabsTrigger>
              <TabsTrigger value="kitchen">Ticket Cocina</TabsTrigger>
            </TabsList>
            <TabsContent value="customer" className="mt-0">
              <div className="bg-gray-200 p-2 rounded-md">
                <TicketLayout order={order} isKitchen={false} className="print-content" />
              </div>
            </TabsContent>
            <TabsContent value="kitchen" className="mt-0">
              <div className="bg-gray-200 p-2 rounded-md">
                <TicketLayout order={order} isKitchen={true} className="print-content" />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="shrink-0 px-6 py-4 border-t">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isPrinting}
              size="sm"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              <span className="truncate text-xs">{activeTab === 'customer' ? 'Cliente' : 'Cocina'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintBoth}
              disabled={isPrinting}
              size="sm"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              <span className="truncate text-xs">Ambos</span>
            </Button>
            <Button onClick={onClose} size="sm">
              <span className="truncate text-xs">Nuevo Pedido</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    