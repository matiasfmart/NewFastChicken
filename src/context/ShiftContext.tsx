"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Shift } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ShiftAPI } from "@/api";

interface ShiftContextType {
  currentShift: Shift | null;
  isLoading: boolean;
  startShift: (employeeId: string, employeeName: string, initialCash: number) => Promise<void>;
  endShift: (actualCash: number) => Promise<void>;
  refreshShift: () => Promise<void>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Cargar jornada activa al montar el componente
  const loadActiveShift = useCallback(async () => {
    try {
      setIsLoading(true);
      const activeShift = await ShiftAPI.getActiveShift();
      setCurrentShift(activeShift);
    } catch (error) {
      console.error("Error loading active shift:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la jornada activa"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadActiveShift();
  }, [loadActiveShift]);

  const startShift = useCallback(async (employeeId: string, employeeName: string, initialCash: number) => {
    try {
      const newShift: Omit<Shift, 'id'> = {
        employeeId,
        employeeName,
        startedAt: new Date(),
        status: 'open',
        initialCash,
        totalOrders: 0,
        totalRevenue: 0
      };

      const createdShift = await ShiftAPI.create(newShift);
      setCurrentShift(createdShift);

      toast({
        title: "Jornada iniciada",
        description: `Jornada iniciada por ${employeeName}`
      });
    } catch (error) {
      console.error("Error starting shift:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar la jornada"
      });
      throw error;
    }
  }, [toast]);

  const endShift = useCallback(async (actualCash: number) => {
    if (!currentShift) {
      throw new Error("No hay jornada activa");
    }

    try {
      const cashDifference = actualCash - (currentShift.initialCash + currentShift.totalRevenue);

      await ShiftAPI.update(currentShift.id, {
        endedAt: new Date(),
        status: 'closed',
        actualCash,
        cashDifference
      });

      setCurrentShift(null);

      toast({
        title: "Jornada cerrada",
        description: "La jornada se ha cerrado exitosamente"
      });
    } catch (error) {
      console.error("Error ending shift:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la jornada"
      });
      throw error;
    }
  }, [currentShift, toast]);

  const refreshShift = useCallback(async () => {
    await loadActiveShift();
  }, [loadActiveShift]);

  return (
    <ShiftContext.Provider
      value={{
        currentShift,
        isLoading,
        startShift,
        endShift,
        refreshShift
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
};
