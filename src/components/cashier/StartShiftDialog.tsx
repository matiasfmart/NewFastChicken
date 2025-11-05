"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useShift } from "@/context/ShiftContext";

interface StartShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StartShiftDialog({ isOpen, onClose }: StartShiftDialogProps) {
  const { startShift } = useShift();
  const [employeeName, setEmployeeName] = useState("");
  const [initialCash, setInitialCash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeName.trim()) {
      return;
    }

    const cashAmount = parseFloat(initialCash) || 0;

    try {
      setIsSubmitting(true);
      await startShift(employeeName.trim(), cashAmount);
      setEmployeeName("");
      setInitialCash("");
      onClose();
    } catch (error) {
      // Error is handled by ShiftContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>INICIAR JORNADA</DialogTitle>
          <DialogDescription>
            Ingresa los datos para comenzar una nueva jornada de trabajo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employeeName">Nombre del cajero</Label>
            <Input
              id="employeeName"
              placeholder="Ej: Juan Pérez"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialCash">Fondo inicial en caja (ARS)</Label>
            <Input
              id="initialCash"
              type="number"
              placeholder="Ej: 10000"
              value={initialCash}
              onChange={(e) => setInitialCash(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !employeeName.trim()}>
              {isSubmitting ? "Iniciando..." : "Iniciar Jornada"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
