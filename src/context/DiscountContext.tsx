"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { DiscountRule, Combo } from "@/lib/types";
import type { CreateDiscountInput, UpdateDiscountInput } from "@/application/use-cases";
import { useToast } from "@/hooks/use-toast";

interface DiscountContextType {
  discounts: DiscountRule[];
  isLoading: boolean;
  fetchDiscounts: () => Promise<void>;
  getDiscountById: (id: string) => DiscountRule | undefined;
  getDiscountsByComboId: (comboId: string) => DiscountRule[];
  createDiscount: (input: CreateDiscountInput) => Promise<DiscountRule | null>;
  updateDiscount: (id: string, updates: Omit<UpdateDiscountInput, 'id'>) => Promise<boolean>;
  deleteDiscount: (id: string) => Promise<boolean>;
  assignToCombo: (discountId: string, comboId: string) => Promise<boolean>;
  unassignFromCombo: (discountId: string, comboId: string) => Promise<boolean>;
}

const DiscountContext = createContext<DiscountContextType | undefined>(undefined);

/**
 * Provider del contexto de descuentos
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE PRESENTACIÓN:
 * - Maneja el estado de descuentos en la UI
 * - Interactúa con la API a través de fetch HTTP
 * - NO depende directamente de MongoDB ni Firebase
 * - Proporciona CRUD completo para descuentos
 */
export const DiscountProvider: React.FC<{
  children: React.ReactNode;
  initialDiscounts?: DiscountRule[];
}> = ({ children, initialDiscounts = [] }) => {
  const { toast } = useToast();

  const [discounts, setDiscounts] = useState<DiscountRule[]>(initialDiscounts);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Obtiene todos los descuentos desde el servidor
   */
  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/discounts');
      if (!response.ok) {
        throw new Error('Error al obtener descuentos');
      }
      const data: DiscountRule[] = await response.json();
      setDiscounts(data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los descuentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Obtiene un descuento por ID (del estado local)
   */
  const getDiscountById = useCallback((id: string): DiscountRule | undefined => {
    return discounts.find(d => d.id === id);
  }, [discounts]);

  /**
   * Obtiene descuentos asignados a un combo específico
   */
  const getDiscountsByComboId = useCallback((comboId: string): DiscountRule[] => {
    // Filtrar descuentos que tienen este comboId en su configuración
    return discounts.filter(d => {
      // Descuentos de tipo cross-promotion que usan este combo como trigger o target
      if (d.type === 'cross-promotion') {
        return d.triggerComboId === comboId || d.targetComboId === comboId;
      }
      return false;
    });
  }, [discounts]);

  /**
   * Crea un nuevo descuento
   */
  const createDiscount = useCallback(async (input: CreateDiscountInput): Promise<DiscountRule | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear descuento');
      }

      const newDiscount: DiscountRule = await response.json();
      setDiscounts(prev => [...prev, newDiscount]);

      toast({
        title: "Descuento creado",
        description: `Descuento del ${newDiscount.percentage}% creado exitosamente`,
      });

      return newDiscount;
    } catch (error) {
      console.error('Error creating discount:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el descuento",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Actualiza un descuento existente
   */
  const updateDiscount = useCallback(async (
    id: string,
    updates: Omit<UpdateDiscountInput, 'id'>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/discounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar descuento');
      }

      const updatedDiscount: DiscountRule = await response.json();

      setDiscounts(prev =>
        prev.map(d => d.id === id ? updatedDiscount : d)
      );

      toast({
        title: "Descuento actualizado",
        description: "El descuento se actualizó correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error updating discount:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el descuento",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Elimina un descuento
   */
  const deleteDiscount = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/discounts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar descuento');
      }

      setDiscounts(prev => prev.filter(d => d.id !== id));

      toast({
        title: "Descuento eliminado",
        description: "El descuento se eliminó correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el descuento",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Asigna un descuento a un combo
   */
  const assignToCombo = useCallback(async (
    discountId: string,
    comboId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/discounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          discountId,
          comboId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al asignar descuento');
      }

      // Recargar descuentos para reflejar cambios
      await fetchDiscounts();

      toast({
        title: "Descuento asignado",
        description: "El descuento se asignó al combo correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error assigning discount to combo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo asignar el descuento",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchDiscounts]);

  /**
   * Desasigna un descuento de un combo
   */
  const unassignFromCombo = useCallback(async (
    discountId: string,
    comboId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/discounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unassign',
          discountId,
          comboId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al desasignar descuento');
      }

      // Recargar descuentos para reflejar cambios
      await fetchDiscounts();

      toast({
        title: "Descuento desasignado",
        description: "El descuento se desasignó del combo correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error unassigning discount from combo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo desasignar el descuento",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchDiscounts]);

  // Cargar descuentos al montar el componente (si no hay iniciales)
  useEffect(() => {
    if (initialDiscounts.length === 0) {
      fetchDiscounts();
    }
  }, [initialDiscounts.length, fetchDiscounts]);

  const value: DiscountContextType = {
    discounts,
    isLoading,
    fetchDiscounts,
    getDiscountById,
    getDiscountsByComboId,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    assignToCombo,
    unassignFromCombo,
  };

  return (
    <DiscountContext.Provider value={value}>
      {children}
    </DiscountContext.Provider>
  );
};

/**
 * Hook para usar el contexto de descuentos
 */
export const useDiscounts = (): DiscountContextType => {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error('useDiscounts must be used within a DiscountProvider');
  }
  return context;
};
