"use client";

import * as React from "react";
import type { Combo, InventoryItem } from "@/lib/types";
import { ShiftProvider } from "@/context/ShiftContext";
import { OrderProvider } from "@/context/OrderContext";
import { CashierHeader } from "@/components/cashier/CashierHeader";
import { MenuCatalog } from "@/components/cashier/MenuCatalog";
import { OrderPanel } from "@/components/cashier/OrderPanel";
import { CustomizationDialog } from "@/components/cashier/CustomizationDialog";
import { initializeAPIsWithHttp } from "@/api/initializeAPIsClient";

/**
 * Client Shell - Componente Cliente que maneja la interactividad
 *
 * ✅ ARQUITECTURA OPTIMIZADA:
 * - Recibe datos pre-fetched del Server Component
 * - Inicializa APIs con HTTP repositories para Client Components
 * - Maneja todo el estado interactivo (contexts, dialogs, etc)
 * - Permite que la app sea escalable a backend separado
 */

interface ClientShellProps {
  combos: Combo[];
  inventory: InventoryItem[];
}

export function ClientShell({ combos, inventory }: ClientShellProps) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Combo | InventoryItem | null>(null);
  const [isDialogOpen, setDialogOpen] = React.useState(false);

  // Inicializar APIs con HTTP repositories una sola vez
  React.useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    initializeAPIsWithHttp(apiUrl);
    setIsInitialized(true);
  }, []);

  const handleSelectItem = (item: Combo | InventoryItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  // No renderizar hasta que las APIs estén inicializadas
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <ShiftProvider>
      <OrderProvider initialCombos={combos} initialInventory={inventory}>
        <div className="flex h-screen w-full flex-col bg-background">
          <CashierHeader />
          <main className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <MenuCatalog onSelectItem={handleSelectItem} />
            </div>
            <div className="w-full max-w-sm shrink-0 border-l border-border bg-card">
              <OrderPanel />
            </div>
          </main>
          {selectedItem && (
            <CustomizationDialog
              isOpen={isDialogOpen}
              onClose={handleDialogClose}
              item={selectedItem}
            />
          )}
        </div>
      </OrderProvider>
    </ShiftProvider>
  );
}
