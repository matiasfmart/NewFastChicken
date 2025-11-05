"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useShift } from "@/context/ShiftContext";
import { EmployeeAPI } from "@/api";
import type { Employee } from "@/lib/types";
import { User, Loader2 } from "lucide-react";

interface StartShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StartShiftDialog({ isOpen, onClose }: StartShiftDialogProps) {
  const { startShift } = useShift();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [initialCash, setInitialCash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const activeEmployees = await EmployeeAPI.getActive();
      setEmployees(activeEmployees.filter(e => e.role === 'cashier'));
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    const cashAmount = parseFloat(initialCash) || 0;

    try {
      setIsSubmitting(true);
      await startShift(selectedEmployee.id, selectedEmployee.name, cashAmount);
      setSelectedEmployee(null);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>INICIAR JORNADA</DialogTitle>
          <DialogDescription>
            Selecciona tu nombre y el fondo inicial de caja
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Selección de cajero */}
          <div className="space-y-3">
            <Label>Selecciona tu nombre</Label>
            {isLoadingEmployees ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay cajeros activos registrados.</p>
                <p className="text-sm mt-2">Contacta al administrador.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {employees.map((employee) => (
                  <Button
                    key={employee.id}
                    type="button"
                    variant={selectedEmployee?.id === employee.id ? "default" : "outline"}
                    className="h-20 text-lg flex items-center justify-center gap-2"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <User className="h-5 w-5" />
                    {employee.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Fondo inicial */}
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
              className="text-lg h-12"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedEmployee} className="min-w-[140px]">
              {isSubmitting ? "Iniciando..." : "Iniciar Jornada"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
