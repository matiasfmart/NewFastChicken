
"use client";

import { useState, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

// ✅ Memoizar TicketLayout para evitar re-renders innecesarios
// ✅ Ticket unificado - mismo formato para cliente y cocina
const TicketLayout = memo(({ order, className }: { order: Order; className?: string }) => {

  const deliveryText = {
      local: 'Para comer acá',
      takeaway: 'Para llevar',
      delivery: 'Delivery'
  };

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
  };

  const renderItem = (item: OrderItem) => {
    // Determinar el nombre del ítem
    const itemName = item.combo
      ? item.combo.name
      : (item.customizations.product?.name || item.customizations.drink?.name || item.customizations.side?.name || 'Producto');

    return (
      <div key={item.id} className="text-xs">
          <div className="flex justify-between gap-2">
              <span className="font-bold truncate flex-1">{item.quantity}x {itemName}</span>
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
          </div>
          {item.appliedDiscount && <Badge variant="outline" className="text-[10px] text-accent-foreground bg-accent mb-1 py-0 px-1">{item.appliedDiscount.percentage}% OFF</Badge>}

          {/* ✅ NUEVO: Mostrar TODOS los productos del combo desde comboProducts[] */}
          {item.combo && item.comboProducts && item.comboProducts.length > 0 && (
            <div className="pl-3 text-[11px] text-muted-foreground">
                {item.comboProducts.map((product, idx) => {
                  const quantityPrefix = product.quantity > 1 ? `${product.quantity}x ` : '';
                  const prefix = idx === 0 ? '' : '+ ';
                  const iceText = product.type === 'drink' && item.customizations.withIce !== undefined
                    ? ` ${item.customizations.withIce ? '(con hielo)' : '(sin hielo)'}`
                    : '';

                  return (
                    <div key={idx} className="truncate">
                      {prefix}{quantityPrefix}{product.name}{iceText}
                    </div>
                  );
                })}
                {item.customizations.isSpicy && <div className="font-semibold text-destructive">CON PICANTE</div>}
            </div>
          )}

          {/* ⚠️ FALLBACK: Sistema viejo para ordenes antiguas sin comboProducts[] */}
          {item.combo && (!item.comboProducts || item.comboProducts.length === 0) && (
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
  };

  // ✅ Usar el número de orden secuencial formateado del domain layer
  const orderNumber = TicketFormatter.formatOrderNumber(order.orderNumber);

  return (
    <div className={`ticket-layout w-full bg-white text-black p-4 font-mono text-xs ${className || ''}`}>
      <div className="text-center space-y-1">
        <FastChickenLogo className="justify-center scale-75" />
        <h2 className="text-base font-bold">ORDEN #{orderNumber}</h2>
      </div>
      <Separator className="separator my-2 border-dashed border-black" />
      <div className="space-y-2">
        {order.items.map((item, index) => {
          const currentComboId = item.combo?.id || item.id;
          const nextComboId = index < order.items.length - 1 
            ? (order.items[index + 1].combo?.id || order.items[index + 1].id)
            : null;
          
          const showSeparator = nextComboId && currentComboId !== nextComboId;
          
          return (
            <div key={item.id}>
              {renderItem(item)}
              {/* Línea separadora entre combos diferentes */}
              {showSeparator && (
                <Separator className="my-2 border-dashed border-gray-300" />
              )}
            </div>
          );
        })}
      </div>
      <Separator className="separator my-1 border-dashed border-black" />
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
});

TicketLayout.displayName = 'TicketLayout';

export function CheckoutDialog({ order, onClose }: CheckoutDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintBoth = async () => {
    if (!browserPrinter.isAvailable()) {
      alert('La impresión no está disponible en este navegador');
      return;
    }

    setIsPrinting(true);
    try {
      // ✅ Imprimir primer ticket (para cliente)
      const ticketContent = TicketFormatter.formatOrderTicket(order);
      await browserPrinter.print(ticketContent);

      // Pequeña pausa entre impresiones
      await new Promise(resolve => setTimeout(resolve, 500));

      // ✅ Imprimir segundo ticket (para cocina) - mismo contenido
      await browserPrinter.print(ticketContent);
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-gray-200 p-2 rounded-md">
            <TicketLayout order={order} className="print-content" />
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t">
          <div className="grid grid-cols-3 gap-2">
            <Button
              // variant="outline" // se quito la opcion para que figure como la accion principal
              // se quitaron los otros botones ya que el usuario pidio que solo quede la opcion de imprimir ambos tickets juntos
              onClick={handlePrintBoth}
              disabled={isPrinting}
              size="sm"
              className="col-start-3"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              <span className="truncate text-xs">Imprimir</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}