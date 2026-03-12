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
import { ShiftAPI } from "@/api";
import { Printer } from "lucide-react";
import type { Shift } from "@/lib/types";

interface EndShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EndShiftDialog({ isOpen, onClose }: EndShiftDialogProps) {
  const { startNewShift, loadCurrentShiftOrders } = useOrder();
  const { currentShift, endShift } = useShift();
  const [actualCash, setActualCash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [displayShift, setDisplayShift] = useState<Shift | null>(null);
  const [isLoadingShift, setIsLoadingShift] = useState(false);

  /**
   * ✅ Cargar shift fresco al abrir el diálogo para mostrar datos actualizados en la UI
   */
  useEffect(() => {
    const loadFreshShift = async () => {
      if (isOpen) {
        setIsLoadingShift(true);
        try {
          const freshShift = await ShiftAPI.getActiveShift();
          setDisplayShift(freshShift);
        } catch (error) {
          console.error('Error loading shift:', error);
          // Fallback al currentShift del contexto
          setDisplayShift(currentShift);
        } finally {
          setIsLoadingShift(false);
        }
      }
    };
    loadFreshShift();
  }, [isOpen, currentShift]);

  /**
   * ✅ OPTIMIZACIÓN: Consulta DB directamente para datos críticos del ticket
   * 
   * Rationale:
   * - Cierre de jornada ocurre 1 vez cada 8h → 1 query es trivial
   * - Garantiza datos frescos sin depender de sincronización de cache
   * - Elimina bug de closure completamente
   * - Respeta Clean Architecture: Presentation → API → Repository
   */
  const handlePrintSummary = useCallback(async () => {
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
      // ✅ Consultar DB directamente para garantizar datos actualizados
      const freshShift = await ShiftAPI.getActiveShift();
      if (!freshShift) {
        alert('No se pudo obtener la información de la jornada');
        return;
      }
      
      // Cargar órdenes de la jornada para incluir detalle de canceladas
      const orders = await loadCurrentShiftOrders();

      // Formatear ticket con datos frescos de la DB
      const ticketContent = TicketFormatter.formatShiftSummaryTicket(freshShift, orders, cashAmount);

      // Imprimir
      await browserPrinter.print(ticketContent);
    } catch (error) {
      console.error('Error printing shift summary:', error);
      alert('Error al imprimir. Por favor, intente nuevamente.');
    } finally {
      setIsPrinting(false);
    }
  }, [loadCurrentShiftOrders, actualCash]);

  // ✅ Early return DESPUÉS de todos los hooks
  if (!currentShift) return null;

  // Usar displayShift para mostrar datos en el UI, con fallback a currentShift
  const shiftToDisplay = displayShift || currentShift;
  
  const expectedCash = shiftToDisplay.initialCash + shiftToDisplay.totalRevenue;
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
              <span className="font-medium">{shiftToDisplay.employeeName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hora de inicio:</span>
              <span className="font-medium">
                {(() => {
                  const date = shiftToDisplay.startedAt instanceof Date
                    ? shiftToDisplay.startedAt
                    : shiftToDisplay.startedAt instanceof Timestamp
                    ? shiftToDisplay.startedAt.toDate()
                    : new Date(shiftToDisplay.startedAt);
                  return date.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                })()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hora de fin:</span>
              <span className="font-medium">
                {(() => {
                  // Si la jornada está cerrada usar endedAt, sino usar hora actual
                  const date = shiftToDisplay.endedAt
                    ? (shiftToDisplay.endedAt instanceof Date
                        ? shiftToDisplay.endedAt
                        : shiftToDisplay.endedAt instanceof Timestamp
                        ? shiftToDisplay.endedAt.toDate()
                        : new Date(shiftToDisplay.endedAt))
                    : new Date();
                  return date.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                })()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duración:</span>
              <span className="font-medium">
                {(() => {
                  const startDate = shiftToDisplay.startedAt instanceof Date
                    ? shiftToDisplay.startedAt
                    : shiftToDisplay.startedAt instanceof Timestamp
                    ? shiftToDisplay.startedAt.toDate()
                    : new Date(shiftToDisplay.startedAt);
                  const endDate = shiftToDisplay.endedAt
                    ? (shiftToDisplay.endedAt instanceof Date
                        ? shiftToDisplay.endedAt
                        : shiftToDisplay.endedAt instanceof Timestamp
                        ? shiftToDisplay.endedAt.toDate()
                        : new Date(shiftToDisplay.endedAt))
                    : new Date();
                  const diffMs = endDate.getTime() - startDate.getTime();
                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  return `${hours}h ${minutes}m`;
                })()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Resumen de ventas */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de órdenes:</span>
              <span className="font-bold">
                {isLoadingShift ? '...' : shiftToDisplay.totalOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total recaudado:</span>
              <span className="font-bold">
                {isLoadingShift ? '...' : `$${shiftToDisplay.totalRevenue.toLocaleString('es-AR')}`}
              </span>
            </div>
          </div>

          <Separator />

          {/* Arqueo de caja */}
          <div className="space-y-3">
            <h4 className="font-semibold">Arqueo de Caja</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fondo inicial:</span>
                <span>${shiftToDisplay.initialCash.toLocaleString('es-AR')}</span>
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
