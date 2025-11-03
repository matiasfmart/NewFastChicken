"use client";

import * as React from "react";
import type { Combo, InventoryItem } from "@/lib/types";
import { ComboAPI, InventoryAPI } from "@/api";
import { OrderProvider } from "@/context/OrderContext";
import { CashierHeader } from "@/components/cashier/CashierHeader";
import { MenuCatalog } from "@/components/cashier/MenuCatalog";
import { OrderPanel } from "@/components/cashier/OrderPanel";
import { CustomizationDialog } from "@/components/cashier/CustomizationDialog";

export default function Home() {
  const [combos, setCombos] = React.useState<Combo[]>([]);
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<Combo | InventoryItem | null>(null);
  const [isDialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Usando APIs internas - sin Firebase directo
        const [combosData, inventoryData] = await Promise.all([
          ComboAPI.getAll(),
          InventoryAPI.getAll()
        ]);
        setCombos(combosData);
        setInventory(inventoryData);
      } catch (error) {
        console.error("Failed to fetch menu data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSelectItem = (item: Combo | InventoryItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}
