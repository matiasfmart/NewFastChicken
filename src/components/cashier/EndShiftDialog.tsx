"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/context/OrderContext";

interface EndShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EndShiftDialog({ isOpen, onClose }: EndShiftDialogProps) {
  const { completedOrders, startNewShift } = useOrder();
  
  const totalOrders = completedOrders.length;
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const firstOrderNum = totalOrders > 0 ? completedOrders[0].id : 0;
  const lastOrderNum = totalOrders > 0 ? completedOrders[totalOrders - 1].id : 0;
  
  const handleEndShift = () => {
    startNewShift();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>CIERRE DE JORNADA</DialogTitle>
          <DialogDescription>Resumen de la jornada actual.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de órdenes:</span>
                    <span className="font-bold">{totalOrders}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Rango de órdenes:</span>
                    <span className="font-bold">{totalOrders > 0 ? `${firstOrderNum} - ${lastOrderNum}` : 'N/A'}</span>
                </div>
            </div>
            <Separator />
            <div className="flex justify-between text-2xl font-bold">
                <span>Total recaudado:</span>
                <span>${totalRevenue.toLocaleString('es-AR')}</span>
            </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={handleEndShift}>Cerrar y Empezar Nueva Jornada</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
