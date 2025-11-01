
"use client";

import * as React from "react";
import { OrderProvider } from "@/context/OrderContext";
import { CashierHeader } from "@/components/cashier/CashierHeader";
import { MenuCatalog } from "@/components/cashier/MenuCatalog";
import { OrderPanel } from "@/components/cashier/OrderPanel";
import { CustomizationDialog } from "@/components/cashier/CustomizationDialog";
import type { Combo, InventoryItem } from "@/lib/types";

export function CashierClientPage({ combos, inventory }: { combos: Combo[], inventory: InventoryItem[]}) {
  const [selectedItem, setSelectedItem] = React.useState<Combo | InventoryItem | null>(null);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  
  const handleSelectItem = (item: Combo | InventoryItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

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
