
"use client";

import React, { useState, useEffect } from 'react';
import { InventoryTabs } from "@/components/admin/InventoryTabs";
import type { InventoryItem } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { InventoryAPI } from '@/api';

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [drinks, setDrinks] = useState<InventoryItem[]>([]);
  const [sides, setSides] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; category: 'products' | 'drinks' | 'sides' } | null>(null);

  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
        // ✅ Usando API interna - sin Firebase directo
        const items = await InventoryAPI.getAll();
        setProducts(items.filter(item => item.type === 'product'));
        setDrinks(items.filter(item => item.type === 'drink'));
        setSides(items.filter(item => item.type === 'side'));
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleSaveInventory = async (item: Partial<InventoryItem>) => {
    const { id, ...data } = item;

    try {
      if (id) {
        // ✅ Actualizar item existente
        await InventoryAPI.update(id, data as Omit<InventoryItem, 'id'>);
      } else {
        // ✅ Crear nuevo item
        await InventoryAPI.create(data as Omit<InventoryItem, 'id'>);
      }
      await fetchData(false); // Refetch data after saving WITHOUT showing loading
    } catch (error) {
      console.error("Failed to save inventory item:", error);
      throw error; // Re-throw to let the component know it failed
    }
  }

  const confirmDeleteItem = (id: string, category: 'products' | 'drinks' | 'sides') => {
    setItemToDelete({ id, category });
    setDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        // ✅ Eliminar item usando API interna
        await InventoryAPI.delete(itemToDelete.id);
        setDeleteAlertOpen(false);
        setItemToDelete(null);
        await fetchData(); // Refetch data after deleting
      } catch (error) {
        console.error("Failed to delete inventory item:", error);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Gestión de Inventario</h1>
      {isLoading ? (
        <div className="space-y-4">
            <div className="flex space-x-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
            </div>
            <Skeleton className="h-10 w-40 ml-auto" />
            <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <InventoryTabs 
          products={products} 
          drinks={drinks} 
          sides={sides}
          onDeleteItem={confirmDeleteItem}
          onSaveItem={handleSaveInventory}
        />
      )}

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
