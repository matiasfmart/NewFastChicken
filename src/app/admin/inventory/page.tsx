
"use client";

import React, { useState } from 'react';
import { InventoryTabs } from "@/components/admin/InventoryTabs";
import type { InventoryItem } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/hooks/use-firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { addInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/services/inventoryService';

export default function InventoryPage() {
  const firestore = useFirestore();

  const [productsCollection, productsLoading, productsError] = useCollection(
    firestore ? query(collection(firestore, 'inventory'), where('type', '==', 'product')) : null
  );
  const [drinksCollection, drinksLoading, drinksError] = useCollection(
    firestore ? query(collection(firestore, 'inventory'), where('type', '==', 'drink')) : null
  );
  const [sidesCollection, sidesLoading, sidesError] = useCollection(
    firestore ? query(collection(firestore, 'inventory'), where('type', '==', 'side')) : null
  );

  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; category: 'products' | 'drinks' | 'sides' } | null>(null);

  const products = productsCollection?.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)) || [];
  const drinks = drinksCollection?.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)) || [];
  const sides = sidesCollection?.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)) || [];

  const handleSaveInventory = async (item: InventoryItem, category: 'products' | 'drinks' | 'sides') => {
    if (!firestore) return;
    const { id, ...data } = item;
    if (id.startsWith('new-')) {
      await addInventoryItem(firestore, data as Omit<InventoryItem, 'id'>);
    } else {
      await updateInventoryItem(firestore, id, data);
    }
  }

  const confirmDeleteItem = (id: string, category: 'products' | 'drinks' | 'sides') => {
    setItemToDelete({ id, category });
    setDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete && firestore) {
      await deleteInventoryItem(firestore, itemToDelete.id);
      setDeleteAlertOpen(false);
      setItemToDelete(null);
    }
  };

  const isLoading = productsLoading || drinksLoading || sidesLoading;

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
