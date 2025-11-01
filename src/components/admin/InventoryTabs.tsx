
"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InventoryItem } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import React, { useState } from 'react';

interface InventoryTabsProps {
  products: InventoryItem[];
  drinks: InventoryItem[];
  sides: InventoryItem[];
  onDeleteItem: (id: string, category: 'products' | 'drinks' | 'sides') => void;
}

const InventoryTable = ({ items, categoryName, categoryKey, onDeleteItem }: { items: InventoryItem[], categoryName: string, categoryKey: 'products' | 'drinks' | 'sides', onDeleteItem: (id: string, category: 'products' | 'drinks' | 'sides') => void }) => {

    const [isFormOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const openCreateForm = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const openEditForm = (item: InventoryItem) => {
        setEditingItem(item);
        setFormOpen(true);
    };


    return (
    <>
        <div className="text-right mb-4">
            <Button onClick={openCreateForm}>Añadir {categoryName}</Button>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nombre</TableHead>
                {categoryName === 'Bebida' && <TableHead>Categoría</TableHead>}
                <TableHead>Stock</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>
                    <span className="sr-only">Acciones</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    {categoryName === 'Bebida' && <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>}
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>${item.price.toLocaleString('es-AR')}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditForm(item)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteItem(item.id, categoryKey)} className="text-destructive">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    </>
    )
};

export function InventoryTabs({ products, drinks, sides, onDeleteItem }: InventoryTabsProps) {
  return (
    <Tabs defaultValue="products">
      <TabsList>
        <TabsTrigger value="products">Pollo y Hamburguesas</TabsTrigger>
        <TabsTrigger value="drinks">Bebidas</TabsTrigger>
        <TabsTrigger value="sides">Guarniciones</TabsTrigger>
      </TabsList>
      <TabsContent value="products">
          <InventoryTable items={products} categoryName="Producto" categoryKey="products" onDeleteItem={onDeleteItem} />
      </TabsContent>
      <TabsContent value="drinks">
          <InventoryTable items={drinks} categoryName="Bebida" categoryKey="drinks" onDeleteItem={onDeleteItem} />
      </TabsContent>
      <TabsContent value="sides">
          <InventoryTable items={sides} categoryName="Guarnición" categoryKey="sides" onDeleteItem={onDeleteItem} />
      </TabsContent>
    </Tabs>
  );
}

    