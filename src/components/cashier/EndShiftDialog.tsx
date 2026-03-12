"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrder } from "@/context/OrderContext";
import { useShift } from "@/context/ShiftContext";
import { useState, useCallback, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { browserPrinter } from "@/infrastructure/printers";
import { TicketFormatter } from "@/domain/services/TicketFormatter";
import { Printer } from "lucide-react";

interface EndShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EndShiftDialog({ isOpen, onClose }: EndShiftDialogProps) {
  const { startNewShift, loadCurrentShiftOrders } = useOrder();
  const { currentShift, endShift, refreshShift } = useShift();
  const [actualCash, setActualCash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // ✅ Refrescar shift cuando se abre el diálogo para obtener totales actualizados
  useEffect(() => {
    if (isOpen) {
      refreshShift();
    }
  }, [isOpen, refreshShift]);

  // ✅ IMPORTANTE: useCallback debe estar ANTES de cualquier early return
  const handlePrintSummary = useCallback(async () => {
    if (!currentShift) return;

    // ✅ Validar que se haya ingresado el efectivo contado
    const cashAmount = parseFloat(actualCash) || 0;
    if (!actualCash || cashAmount <= 0) {
      alert('Debe ingresar el efectivo real contado antes de imprimir el resumen');
      return;
    }

    if (!browserPrinter.isAvailable()) {
      alert('La impresión no está disponible en este navegador');
      return;
    }

    setIsPrinting(true);
    try {
      // ✅ Refrescar shift antes de imprimir para garantizar datos actualizados
      await refreshShift();
      
      // Cargar órdenes de la jornada para incluir detalle de canceladas
      const orders = await loadCurrentShiftOrders();

      // ✅ Formatear ticket pasando el efectivo contado como parámetro
      const ticketContent = TicketFormatter.formatShiftSummaryTicket(currentShift, orders, cashAmount);

      // Imprimir
      await browserPrinter.print(ticketContent);
    } catch (error) {
      console.error('Error printing shift summary:', error);
      alert('Error al imprimir. Por favor, intente nuevamente.');
    } finally {
      setIsPrinting(false);
    }
  }, [currentShift, loadCurrentShiftOrders, actualCash, refreshShift]);

  // ✅ Early return DESPUÉS de todos los hooks
  if (!currentShift) return null;

  const expectedCash = currentShift.initialCash + currentShift.totalRevenue;
  const cashAmount = parseFloat(actualCash) || 0;
  const difference = cashAmount - expectedCash;

  const handleEndShift = async () => {
    try {
      setIsSubmitting(true);
      await endShift(cashAmount);
      startNewShift();
      setActualCash("");
      onClose();
    } catch (error) {
      // Error handled by ShiftContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setActualCash("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>CIERRE DE JORNADA</DialogTitle>
          <DialogDescription>Resumen y arqueo de caja</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Información de la jornada */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cajero:</span>
              <span className="font-medium">{currentShift.employeeName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hora de inicio:</span>
              <span className="font-medium">
                {(() => {
                  const date = currentShift.startedAt instanceof Date
                    ? currentShift.startedAt
                    : currentShift.startedAt instanceof Timestamp
                    ? currentShift.startedAt.toDate()
                    : new Date(currentShift.startedAt);
                  return date.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                })()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Resumen de ventas */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de órdenes:</span>
              <span className="font-bold">{currentShift.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total recaudado:</span>
              <span className="font-bold">${currentShift.totalRevenue.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <Separator />

          {/* Arqueo de caja */}
          <div className="space-y-3">
            <h4 className="font-semibold">Arqueo de Caja</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fondo inicial:</span>
                <span>${currentShift.initialCash.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efectivo esperado:</span>
                <span className="font-medium">${expectedCash.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualCash">Efectivo real contado (ARS)</Label>
              <Input
                id="actualCash"
                type="number"
                placeholder="Ingrese el efectivo contado"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                min="0"
                step="0.01"
                autoFocus
              />
            </div>

            {actualCash && (
              <div className={`flex justify-between font-bold ${difference === 0 ? 'text-green-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                <span>Diferencia:</span>
                <span>
                  {difference >= 0 ? '+' : ''}${difference.toLocaleString('es-AR')}
                </span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handlePrintSummary}
            disabled={!actualCash || isPrinting || isSubmitting}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? "Imprimiendo..." : "Imprimir Resumen"}
          </Button>
          <div className="flex gap-2 sm:gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndShift}
              disabled={!actualCash || isSubmitting}
            >
              {isSubmitting ? "Cerrando..." : "Cerrar Jornada"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
