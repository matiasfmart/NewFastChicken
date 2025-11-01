
"use client";

import React, { useMemo } from 'react';
import type { Combo, InventoryItem } from '@/lib/types';
import { MenuItemCard } from './MenuItemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { useOrder } from '@/context/OrderContext';


export function MenuCatalog({ onSelectItem }: { onSelectItem: (item: Combo | InventoryItem) => void; }) {
  const { combos, inventory, isLoading } = useOrder();
  
  const { products, drinks, sides } = useMemo(() => {
    return {
        products: inventory.filter(i => i.type === 'product'),
        drinks: inventory.filter(i => i.type === 'drink'),
        sides: inventory.filter(i => i.type === 'side'),
    }
  }, [inventory]);

  const renderGrid = (items: (Combo | InventoryItem)[]) => {
      if (isLoading) {
          return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          )
      }

      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(item => (
            <MenuItemCard key={item.id} item={item} onSelect={() => onSelectItem(item)} />
        ))}
        </div>
      )
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <Tabs defaultValue="combos" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="shrink-0">
          <TabsTrigger value="combos">Combos</TabsTrigger>
          <TabsTrigger value="products">Pollo y Hamburguesas</TabsTrigger>
          <TabsTrigger value="sides">Guarniciones</TabsTrigger>
          <TabsTrigger value="drinks">Bebidas</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
            <TabsContent value="combos" className="p-1 pt-4">
                {renderGrid(combos)}
            </TabsContent>
            <TabsContent value="products" className="p-1 pt-4">
                {renderGrid(products)}
            </TabsContent>
            <TabsContent value="sides" className="p-1 pt-4">
                {renderGrid(sides)}
            </TabsContent>
            <TabsContent value="drinks" className="p-1 pt-4">
                {renderGrid(drinks)}
            </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
