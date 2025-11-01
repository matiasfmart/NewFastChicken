
"use client";

import React, { useState } from 'react';
import { InventoryTabs } from "@/components/admin/InventoryTabs";
import { products as initialProducts, drinks as initialDrinks, sides as initialSides } from "@/lib/data";
import type { InventoryItem } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryItem[]>(initialProducts);
  const [drinks, setDrinks] = useState<InventoryItem[]>(initialDrinks);
  const [sides, setSides] = useState<InventoryItem[]>(initialSides);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; category: 'products' | 'drinks' | 'sides' } | null>(null);

  const updateInventory = (item: InventoryItem, category: 'products' | 'drinks' | 'sides') => {
    const updater = (setter: React.Dispatch<React.SetStateAction<InventoryItem[]>>) => {
        setter(prev => {
            const index = prev.findIndex(i => i.id === item.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = item;
                return updated;
            }
            return [...prev, item];
        })
    }
    if (category === 'products') updater(setProducts);
    if (category === 'drinks') updater(setDrinks);
    if (category === 'sides') updater(setSides);
  }

  const confirmDeleteItem = (id: string, category: 'products' | 'drinks' | 'sides') => {
    setItemToDelete({ id, category });
    setDeleteAlertOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      const { id, category } = itemToDelete;
      switch(category) {
        case 'products':
          setProducts(prev => prev.filter(item => item.id !== id));
          break;
        case 'drinks':
          setDrinks(prev => prev.filter(item => item.id !== id));
          break;
        case 'sides':
          setSides(prev => prev.filter(item => item.id !== id));
          break;
      }
      setDeleteAlertOpen(false);
      setItemToDelete(null);
    }
  };


  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Gestión de Inventario</h1>
      <InventoryTabs 
        products={products} 
        drinks={drinks} 
        sides={sides}
        onDeleteItem={confirmDeleteItem}
        onSaveItem={updateInventory}
      />

    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el ítem del inventario.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}

    