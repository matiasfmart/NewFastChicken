"use client";

import React, { useEffect, useState } from "react";
import { DiscountManagement } from "@/components/admin/DiscountManagement";
import { DiscountProvider } from "@/context/DiscountContext";
import type { Combo, DiscountRule } from "@/lib/types";

export default function DiscountsPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestión de Descuentos</h1>
          <p className="text-muted-foreground mt-2">
            Administra todos los tipos de descuentos: por día, por fecha, por cantidad y promociones cruzadas
          </p>
        </div>

        <DiscountManagement combos={combos} />
      </div>
    </DiscountProvider>
  );
}
