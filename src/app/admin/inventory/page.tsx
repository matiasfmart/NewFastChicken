import { InventoryTabs } from "@/components/admin/InventoryTabs";
import { products, drinks, sides } from "@/lib/data";

export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Gestión de Inventario</h1>
      <InventoryTabs products={products} drinks={drinks} sides={sides} />
    </div>
  );
}
