"use client";

import React, { useState, useMemo } from 'react';
import { combos, products, drinks, sides } from '@/lib/data';
import type { Combo, InventoryItem } from '@/lib/types';
import { MenuItemCard } from './MenuItemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MenuCatalogProps {
  onSelectItem: (item: Combo | InventoryItem) => void;
}

const allMenuItems = [
    ...combos,
    ...products.filter(p => !combos.some(c => c.type === 'EP' && c.id.includes(p.id))),
    ...drinks.filter(d => !combos.some(c => c.type === 'E' && c.id.includes(d.category || ''))),
    ...sides.filter(s => !combos.some(c => c.type === 'ES' && c.id.includes(s.id))),
];

export function MenuCatalog({ onSelectItem }: MenuCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return { combos, products, drinks, sides };
    const lowercasedFilter = searchTerm.toLowerCase();
    
    const filter = (items: (Combo | InventoryItem)[]) => items.filter(item => item.name.toLowerCase().includes(lowercasedFilter));

    return {
      combos: filter(combos),
      products: filter(products),
      drinks: filter(drinks),
      sides: filter(sides),
    };
  }, [searchTerm]);

  const renderGrid = (items: (Combo | InventoryItem)[]) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(item => (
        <MenuItemCard key={item.id} item={item} onSelect={() => onSelectItem(item)} />
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar producto o combo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <Tabs defaultValue="combos" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="shrink-0">
          <TabsTrigger value="combos">Combos</TabsTrigger>
          <TabsTrigger value="products">Pollo y Hamburguesas</TabsTrigger>
          <TabsTrigger value="sides">Guarniciones</TabsTrigger>
          <TabsTrigger value="drinks">Bebidas</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
            <TabsContent value="combos" className="p-1 pt-4">
                {renderGrid(filteredItems.combos)}
            </TabsContent>
            <TabsContent value="products" className="p-1 pt-4">
                {renderGrid(filteredItems.products.filter(p => !combos.some(c => c.type === 'EP' && c.id.includes(p.id))))}
            </TabsContent>
            <TabsContent value="sides" className="p-1 pt-4">
                {renderGrid(filteredItems.sides.filter(s => !combos.some(c => c.type === 'ES' && c.id.includes(s.id))))}
            </TabsContent>
            <TabsContent value="drinks" className="p-1 pt-4">
                {renderGrid(filteredItems.drinks)}
            </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
