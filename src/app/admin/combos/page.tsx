
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { combos as initialCombos, products, sides, drinks } from "@/lib/data";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Combo, ComboProduct } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const allInventory = [...products, ...sides, ...drinks];

function ComboForm({ combo, onSave, onCancel }: { combo: Partial<Combo> | null, onSave: (combo: Partial<Combo>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<Combo>>(
    combo || {
      id: `C${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      discount: 0,
      type: 'BG', // Default type, can be changed
      products: [],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleProductChange = (index: number, field: 'productId' | 'quantity', value: string) => {
    const updatedProducts = [...(formData.products || [])];
    if (field === 'quantity') {
      updatedProducts[index] = { ...updatedProducts[index], quantity: parseInt(value, 10) || 1 };
    } else {
       updatedProducts[index] = { ...updatedProducts[index], productId: value };
    }
    setFormData(prev => ({ ...prev, products: updatedProducts }));
  };
  
  const addProduct = () => {
    const newProduct: ComboProduct = { productId: allInventory[0].id, quantity: 1 };
    setFormData(prev => ({ ...prev, products: [...(prev.products || []), newProduct] }));
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({...prev, products: formData.products?.filter((_, i) => i !== index)}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{combo?.id && combo.name ? 'Editar Combo' : 'Crear Nuevo Combo'}</DialogTitle>
          <DialogDescription>
            Complete los detalles y seleccione los productos para el combo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Descuento (%)</Label>
                  <Input id="discount" name="discount" type="number" value={formData.discount || 0} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Productos del Combo</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addProduct}><PlusCircle className="mr-2 h-4 w-4" />Añadir</Button>
                </div>
                <div className="space-y-2">
                    {formData.products?.map((p, index) => (
                        <div key={index} className="flex items-center gap-2">
                             <Select value={p.productId} onValueChange={(value) => handleProductChange(index, 'productId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allInventory.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                min="1"
                                value={p.quantity}
                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                className="w-20"
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeProduct(index)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar Combo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>(initialCombos.filter(c => ['PO', 'BG', 'E'].includes(c.type)));
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Partial<Combo> | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deletingComboId, setDeletingComboId] = useState<string | null>(null);


  const openCreateForm = () => {
    setEditingCombo(null);
    setFormOpen(true);
  };

  const openEditForm = (combo: Combo) => {
    setEditingCombo(combo);
    setFormOpen(true);
  };
  
  const handleSaveCombo = (comboData: Partial<Combo>) => {
    setCombos(prev => {
        const existingIndex = prev.findIndex(c => c.id === comboData.id);
        if (existingIndex > -1) {
            const updatedCombos = [...prev];
            updatedCombos[existingIndex] = { ...updatedCombos[existingIndex], ...comboData } as Combo;
            return updatedCombos;
        } else {
            return [...prev, comboData as Combo];
        }
    });
    setFormOpen(false);
    setEditingCombo(null);
  }

  const confirmDelete = (comboId: string) => {
    setDeletingComboId(comboId);
    setDeleteAlertOpen(true);
  };

  const handleDelete = () => {
    if (deletingComboId) {
      setCombos(prev => prev.filter(c => c.id !== deletingComboId));
      setDeleteAlertOpen(false);
      setDeletingComboId(null);
    }
  };


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Combos</CardTitle>
        <CardDescription>Cree, edite y elimine los combos del menú.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-right">
            <Button onClick={openCreateForm}>Crear Nuevo Combo</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combos.map((combo) => (
              <TableRow key={combo.id}>
                <TableCell className="font-medium">{combo.id}</TableCell>
                <TableCell>{combo.name}</TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        {combo.products?.map(p => (
                            <span key={p.productId} className="text-xs text-muted-foreground">
                                {p.quantity}x {allInventory.find(i => i.id === p.productId)?.name || p.productId}
                            </span>
                        ))}
                    </div>
                </TableCell>
                <TableCell>${combo.price.toLocaleString('es-AR')}</TableCell>
                <TableCell>{combo.discount ? `${combo.discount}%` : '-'}</TableCell>
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
                      <DropdownMenuItem onClick={() => openEditForm(combo)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => confirmDelete(combo.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {isFormOpen && (
        <ComboForm
          combo={editingCombo}
          onSave={handleSaveCombo}
          onCancel={() => setFormOpen(false)}
        />
    )}
      
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el combo.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
