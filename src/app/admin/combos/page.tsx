
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { combos as initialCombos, products, sides, drinks } from "@/lib/data";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Combo } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

function ComboForm({ combo, onSave, onCancel }: { combo: Partial<Combo> | null, onSave: (combo: Partial<Combo>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<Combo>>(
    combo || {
      id: `C${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      discount: 0,
      type: 'PO',
      products: [],
      drinkOptions: { allowed: 'any', quantity: 1 },
      sideOptions: { allowed: 'any', quantity: 1 },
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
            Complete los detalles del combo.
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
               <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PO">Pollo</SelectItem>
                        <SelectItem value="BG">Hamburguesa</SelectItem>
                        <SelectItem value="E">Bebida Individual</SelectItem>
                        <SelectItem value="ES">Guarnición Individual</SelectItem>
                        <SelectItem value="EP">Producto Individual</SelectItem>
                    </SelectContent>
                </Select>
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
              <TableHead>Tipo</TableHead>
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
                <TableCell><Badge variant="outline">{combo.type}</Badge></TableCell>
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

    