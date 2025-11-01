
"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InventoryItem } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InventoryTabsProps {
  products: InventoryItem[];
  drinks: InventoryItem[];
  sides: InventoryItem[];
  onDeleteItem: (id: string, category: 'products' | 'drinks' | 'sides') => void;
  onSaveItem: (item: InventoryItem, category: 'products' | 'drinks' | 'sides') => void;
}

const ItemForm = ({ item, categoryKey, onSave, onCancel }: { item: Partial<InventoryItem> | null, categoryKey: 'products' | 'drinks' | 'sides', onSave: (item: InventoryItem) => void, onCancel: () => void }) => {

    const getBaseItem = (): Partial<InventoryItem> => {
        let type: 'product' | 'drink' | 'side' = 'product';
        if (categoryKey === 'drinks') type = 'drink';
        if (categoryKey === 'sides') type = 'side';
        return {
            id: `new-${Date.now()}`,
            name: '',
            price: 0,
            stock: 0,
            type: type,
        }
    }
    
    const [data, setData] = useState<Partial<InventoryItem>>(item || getBaseItem());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    }

    const handleSelectChange = (value: string) => {
        setData(prev => ({...prev, category: value as 'chica' | 'grande'}));
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...data };
        if (dataToSave.id?.startsWith('new-')) {
            delete dataToSave.id;
        }
        onSave(dataToSave as InventoryItem);
    }

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{item?.id && !item.id.startsWith('new-') ? 'Editar' : 'Añadir'} Ítem</DialogTitle>
                    <DialogDescription>Completa la información del ítem de inventario.</DialogDescription>
                </DialogHeader>
                <form id="item-form" onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" name="name" value={data.name} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio</Label>
                                <Input id="price" name="price" type="number" value={data.price} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input id="stock" name="stock" type="number" value={data.stock} onChange={handleChange} required />
                            </div>
                        </div>
                        {categoryKey === 'drinks' && (
                             <div className="space-y-2">
                                <Label htmlFor="category">Categoría</Label>
                                <Select name="category" value={data.category} onValueChange={handleSelectChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chica">Chica</SelectItem>
                                        <SelectItem value="grande">Grande</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </form>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" form="item-form">Guardar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const InventoryTable = ({ items, categoryName, categoryKey, onDeleteItem, onSaveItem }: { items: InventoryItem[], categoryName: string, categoryKey: 'products' | 'drinks' | 'sides', onDeleteItem: (id: string, category: 'products' | 'drinks' | 'sides') => void, onSaveItem: (item: InventoryItem, category: 'products' | 'drinks' | 'sides') => void }) => {

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

    const handleSave = (item: InventoryItem) => {
        onSaveItem(item, categoryKey);
        setFormOpen(false);
        setEditingItem(null);
    }


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
        {isFormOpen && (
            <ItemForm 
                item={editingItem} 
                categoryKey={categoryKey} 
                onSave={handleSave} 
                onCancel={() => setFormOpen(false)} 
            />
        )}
    </>
    )
};

export function InventoryTabs({ products, drinks, sides, onDeleteItem, onSaveItem }: InventoryTabsProps) {
  return (
    <Tabs defaultValue="products">
      <TabsList>
        <TabsTrigger value="products">Pollo y Hamburguesas</TabsTrigger>
        <TabsTrigger value="drinks">Bebidas</TabsTrigger>
        <TabsTrigger value="sides">Guarniciones</TabsTrigger>
      </TabsList>
      <TabsContent value="products">
          <InventoryTable items={products} categoryName="Producto" categoryKey="products" onDeleteItem={onDeleteItem} onSaveItem={onSaveItem} />
      </TabsContent>
      <TabsContent value="drinks">
          <InventoryTable items={drinks} categoryName="Bebida" categoryKey="drinks" onDeleteItem={onDeleteItem} onSaveItem={onSaveItem} />
      </TabsContent>
      <TabsContent value="sides">
          <InventoryTable items={sides} categoryName="Guarnición" categoryKey="sides" onDeleteItem={onDeleteItem} onSaveItem={onSaveItem} />
      </TabsContent>
    </Tabs>
  );
}

    