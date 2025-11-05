"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrder } from "@/context/OrderContext";
import { useShift } from "@/context/ShiftContext";
import { useState } from "react";
import { Timestamp } from "firebase/firestore";

interface EndShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EndShiftDialog({ isOpen, onClose }: EndShiftDialogProps) {
  const { startNewShift } = useOrder();
  const { currentShift, endShift } = useShift();
  const [actualCash, setActualCash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>CIERRE DE JORNADA</DialogTitle>
          <DialogDescription>Resumen y arqueo de caja</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
