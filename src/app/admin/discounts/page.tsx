"use client";

import React, { useEffect, useState, useRef } from "react";
import { DiscountManagement, type DiscountManagementRef } from "@/components/admin/DiscountManagement";
import { DiscountProvider } from "@/context/DiscountContext";
import type { Combo, DiscountRule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DiscountsPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const discountManagementRef = useRef<DiscountManagementRef>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch combos (needed for cross-promotion discounts)
        const combosResponse = await fetch('/api/combos');
        if (combosResponse.ok) {
          const combosData = await combosResponse.json();
          setCombos(combosData);
        }

        // Fetch discounts
        const discountsResponse = await fetch('/api/discounts');
        if (discountsResponse.ok) {
          const discountsData = await discountsResponse.json();
          setDiscounts(discountsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando descuentos...</div>
      </div>
    );
  }

  return (
    <DiscountProvider initialDiscounts={discounts}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Descuentos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administra todos los tipos de descuentos: por día, por fecha y promociones cruzadas
            </p>
          </div>
          <Button onClick={() => discountManagementRef.current?.openCreateDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Descuento
          </Button>
        </div>

        <DiscountManagement ref={discountManagementRef} combos={combos} />
      </div>
    </DiscountProvider>
  );
}
