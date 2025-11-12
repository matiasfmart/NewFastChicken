
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Trash2, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Combo, ComboProduct, InventoryItem } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ComboAPI, InventoryAPI } from '@/api';

function ComboForm({ combo, onSave, onCancel, inventoryItems }: { combo: Partial<Combo> | null, onSave: (combo: Partial<Combo>) => Promise<void>, onCancel: () => void, inventoryItems: InventoryItem[] }) {
  const [formData, setFormData] = useState<Partial<Combo> | null>(null);

  useEffect(() => {
    if(combo) {
        setFormData(JSON.parse(JSON.stringify(combo)));
    }
  }, [combo]);

  // Analizar estructura del combo para mostrar feedback visual
  const comboAnalysis = useMemo(() => {
    if (!formData?.products) return { selectableGroups: new Map(), fixedProducts: [] };

    const productsByType = new Map<string, { fixed: number; selectable: number; items: ComboProduct[] }>();

    formData.products.forEach(p => {
      const invItem = inventoryItems.find(i => i.id === p.productId);
      if (!invItem) return;

      const type = invItem.type;
      if (!productsByType.has(type)) {
        productsByType.set(type, { fixed: 0, selectable: 0, items: [] });
      }

      const group = productsByType.get(type)!;
      if (p.isFixed ?? true) {
        group.fixed++;
      } else {
        group.selectable++;
      }
      group.items.push(p);
    });

    const selectableGroups = new Map<string, number>();
    productsByType.forEach((data, type) => {
      if (data.selectable >= 2) {
        selectableGroups.set(type, data.selectable);
      }
    });

    return { selectableGroups, productsByType };
  }, [formData?.products, inventoryItems]);

  // Helper para obtener etiqueta legible del tipo
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'product': return 'Producto';
      case 'drink': return 'Bebida';
      case 'side': return 'Guarnición';
      default: return type;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }) : null);
  };

  const handleProductChange = (index: number, field: 'productId' | 'quantity' | 'isFixed', value: string | boolean) => {
    if (!formData) return;
    const updatedProducts = [...(formData.products || [])];

    if (field === 'quantity') {
      updatedProducts[index] = { ...updatedProducts[index], quantity: parseInt(value as string, 10) || 1 };
    } else if (field === 'isFixed') {
      updatedProducts[index] = { ...updatedProducts[index], isFixed: value as boolean };
    } else {
      updatedProducts[index] = { ...updatedProducts[index], productId: value as string };
    }
    setFormData(prev => prev ? ({ ...prev, products: updatedProducts }) : null);
  };

  const addProduct = () => {
    if (inventoryItems.length === 0) return;
    const newProduct: ComboProduct = {
      productId: inventoryItems[0].id,
      quantity: 1,
      isFixed: true // Default: producto fijo
    };
    setFormData(prev => prev ? ({ ...prev, products: [...(prev.products || []), newProduct] }) : null);
  };

  const removeProduct = (index: number) => {
    if (!formData) return;
    setFormData(prev => prev ? ({...prev, products: formData.products?.filter((_, i) => i !== index)}) : null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(formData) {
        await onSave(formData);
    }
  };
  
  if (!formData) return null;

  return (
    <>
    <Dialog open={true} onOpenChange={(open) => { if (!open) onCancel() }}>
    <DialogContent className="sm:max-w-[625px] grid-rows-[auto_1fr_auto] max-h-[90vh]">
        <form id="combo-form" onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{combo?.id && combo.name ? 'Editar Combo' : 'Crear Nuevo Combo'}</DialogTitle>
                <DialogDescription>
                    Complete los detalles y seleccione los productos para el combo.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="overflow-auto -mx-6 px-6 h-[60vh]">
                <div className="p-1 pr-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Precio Base</Label>
                    <Input id="price" name="price" type="number" value={formData.price || 0} onChange={handleChange} required />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Productos del Combo</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addProduct}><PlusCircle className="mr-2 h-4 w-4" />Añadir Producto</Button>
                    </div>

                    <div className="space-y-3">
                        {formData.products?.map((p, index) => {
                            const invItem = inventoryItems.find(i => i.id === p.productId);
                            const productType = invItem?.type;
                            const isFixed = p.isFixed ?? true;

                            // Contar productos del mismo tipo
                            const sameTypeProducts = formData.products?.filter(prod => {
                                const item = inventoryItems.find(i => i.id === prod.productId);
                                return item?.type === productType;
                            }) || [];

                            const sameTypeSelectable = sameTypeProducts.filter(prod => !(prod.isFixed ?? true)).length;
                            const willBeSelectable = sameTypeSelectable >= 2;

                            return (
                                <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Select value={p.productId} onValueChange={(value) => handleProductChange(index, 'productId', value)}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Seleccione un producto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {inventoryItems.map(item => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.name} <span className="text-xs text-muted-foreground">({getTypeLabel(item.type)})</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={p.quantity}
                                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                            className="w-20"
                                            placeholder="Cant."
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProduct(index)} className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={`fixed-${index}`}
                                                checked={isFixed}
                                                onCheckedChange={(checked) => handleProductChange(index, 'isFixed', checked as boolean)}
                                            />
                                            <Label htmlFor={`fixed-${index}`} className="text-sm cursor-pointer">
                                                Producto fijo
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {productType && (
                                                <Badge variant="outline" className="text-xs">
                                                    {getTypeLabel(productType)}
                                                </Badge>
                                            )}
                                            {!isFixed && willBeSelectable && (
                                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                                    Elegible ({sameTypeSelectable} opciones)
                                                </Badge>
                                            )}
                                            {!isFixed && !willBeSelectable && sameTypeSelectable === 1 && (
                                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                                    ⚠️ Requiere 2+ para elegir
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Resumen visual del combo */}
                    {formData.products && formData.products.length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                            <Label className="text-sm font-semibold">Vista previa del combo:</Label>
                            <div className="space-y-2 text-sm">
                                {/* Productos fijos */}
                                {Array.from(comboAnalysis.productsByType.entries())
                                    .filter(([_, data]) => data.fixed > 0)
                                    .map(([type, data]) => (
                                        <div key={`fixed-${type}`} className="flex items-center gap-2">
                                            <Badge variant="default" className="text-xs">Incluido</Badge>
                                            <span className="text-muted-foreground">
                                                {data.fixed}x {getTypeLabel(type)} {data.fixed > 1 ? '(fijos)' : '(fijo)'}
                                            </span>
                                        </div>
                                    ))}

                                {/* Grupos elegibles */}
                                {Array.from(comboAnalysis.selectableGroups.entries()).map(([type, count]) => (
                                    <div key={`selectable-${type}`} className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Elegir 1</Badge>
                                        <span className="text-muted-foreground">
                                            Entre {count} opciones de {getTypeLabel(type)}
                                        </span>
                                    </div>
                                ))}

                                {/* Advertencias */}
                                {Array.from(comboAnalysis.productsByType.entries())
                                    .filter(([_, data]) => data.selectable === 1)
                                    .map(([type, _]) => (
                                        <div key={`warning-${type}`} className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">⚠️ Advertencia</Badge>
                                            <span className="text-xs text-yellow-700">
                                                Solo 1 {getTypeLabel(type)} sin fijar. Necesitas mínimo 2 para crear grupo de elección.
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </ScrollArea>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" form="combo-form">Guardar Combo</Button>
            </DialogFooter>
        </form>
    </DialogContent>
    </Dialog>
    </>
  );
}


export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Partial<Combo> | null>(null);

  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deletingComboId, setDeletingComboId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        // ✅ Usando APIs internas - sin Firebase directo
        const [comboData, inventoryData] = await Promise.all([
            ComboAPI.getAll(),
            InventoryAPI.getAll()
        ]);
        setCombos(comboData);
        setInventoryItems(inventoryData);
    } catch (error) {
        console.error("Failed to fetch data:", error);
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);


  const openCreateForm = () => {
    setEditingCombo({
      name: '',
      description: '',
      price: 0,
      products: [],
    });
    setFormOpen(true);
  };

  const openEditForm = (combo: Combo) => {
    setEditingCombo(combo);
    setFormOpen(true);
  };
  
  const handleSaveCombo = async (comboData: Partial<Combo>) => {
    const { id, ...data } = comboData;

    try {
      if (id) {
        // ✅ Actualizar combo existente
        await ComboAPI.update(id, data);
      } else {
        // ✅ Crear nuevo combo
        await ComboAPI.create(data as Omit<Combo, 'id'>);
      }

      setFormOpen(false);
      setEditingCombo(null);
      await fetchData(); // Refetch data
    } catch (error) {
      console.error("Failed to save combo:", error);
    }
  }

  const confirmDelete = (comboId: string) => {
    setDeletingComboId(comboId);
    setDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (deletingComboId) {
      try {
        // ✅ Eliminar combo usando API interna
        await ComboAPI.delete(deletingComboId);
        setDeleteAlertOpen(false);
        setDeletingComboId(null);
        await fetchData(); // Refetch data
      } catch (error) {
        console.error("Failed to delete combo:", error);
      }
    }
  };

  const handleCloseForms = () => {
    setFormOpen(false);
    setEditingCombo(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Combos</h1>
          <p className="text-sm text-muted-foreground mt-1">Cree, edite y elimine los combos del menú</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Nuevo Combo
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>
                    <span className="sr-only">Acciones</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {combos.map((combo) => (
                <TableRow key={combo.id}>
                    <TableCell className="font-medium">{combo.name}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            {combo.products?.map(p => (
                                <span key={p.productId} className="text-xs text-muted-foreground">
                                    {p.quantity}x {inventoryItems.find(i => i.id === p.productId)?.name || p.productId}
                                </span>
                            ))}
                        </div>
                    </TableCell>
                    <TableCell>${combo.price.toLocaleString('es-AR')}</TableCell>
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
      )}

      {isFormOpen && editingCombo && (
        <ComboForm
          combo={editingCombo}
          onSave={handleSaveCombo}
          onCancel={handleCloseForms}
          inventoryItems={inventoryItems}
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
