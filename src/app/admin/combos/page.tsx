
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { combos as initialCombos } from "@/lib/data";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Combo } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>(initialCombos.filter(c => ['PO', 'BG', 'E'].includes(c.type)));
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
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

    