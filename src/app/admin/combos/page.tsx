
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { combos as initialCombos, products, sides, drinks } from "@/lib/data";
import { MoreHorizontal, PlusCircle, Trash2, Tag, Calendar as CalendarIcon, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Combo, ComboProduct, DiscountRule, DiscountRuleType } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const allInventory = [...products, ...sides, ...drinks];

const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function DiscountRuleForm({ rule, onSave, onCancel }: { rule: Partial<DiscountRule> | null, onSave: (rule: DiscountRule) => void, onCancel: () => void}) {
    const [type, setType] = useState<DiscountRuleType>(rule?.type || 'weekday');
    const [value, setValue] = useState(rule?.value || '0');
    const [percentage, setPercentage] = useState(rule?.percentage || 10);
    const [date, setDate] = useState<Date | undefined>(rule?.type === 'date' && rule.value ? new Date(rule.value) : undefined);

    const handleSave = () => {
        const finalValue = type === 'date' ? format(date!, 'yyyy-MM-dd') : value;
        onSave({ id: rule?.id || `dr-${Date.now()}`, type, value: finalValue, percentage });
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{rule?.id ? 'Editar' : 'Nueva'} Regla de Descuento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo de Regla</Label>
                        <Select value={type} onValueChange={(v) => setType(v as DiscountRuleType)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekday">Día de la semana</SelectItem>
                                <SelectItem value="date">Fecha específica</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {type === 'weekday' && (
                        <div className="space-y-2">
                            <Label>Día</Label>
                            <Select value={value} onValueChange={setValue}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {weekdays.map((day, i) => <SelectItem key={i} value={String(i)}>{day}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {type === 'date' && (
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Elija una fecha</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Porcentaje de Descuento (%)</Label>
                        <Input type="number" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} min="1" max="100"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={type === 'date' && !date}>Guardar Regla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ComboForm({ combo, onSave, onCancel }: { combo: Partial<Combo> | null, onSave: (combo: Partial<Combo>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<Combo>>(
    combo || {
      id: `C${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      type: 'BG', // Default type, can be changed
      products: [],
      discounts: [],
    }
  );
  
  const [isRuleFormOpen, setRuleFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<DiscountRule> | null>(null);

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
  
  const getDiscountDisplay = (rule: DiscountRule) => {
    if (rule.type === 'weekday') {
        return `Día: ${weekdays[Number(rule.value)]}`;
    }
    if (rule.type === 'date') {
        try {
            return `Fecha: ${format(new Date(rule.value), "PPP")}`;
        } catch {
            return `Fecha: ${rule.value}`
        }
    }
    return '';
  }

  const openNewRuleForm = () => {
      setEditingRule(null);
      setRuleFormOpen(true);
  }

  const openEditRuleForm = (rule: DiscountRule) => {
      setEditingRule(rule);
      setRuleFormOpen(true);
  }

  const handleSaveRule = (rule: DiscountRule) => {
      setFormData(prev => {
          const discounts = prev.discounts || [];
          const existing = discounts.find(d => d.id === rule.id);
          if (existing) {
              return {...prev, discounts: discounts.map(d => d.id === rule.id ? rule : d)}
          }
          return {...prev, discounts: [...discounts, rule]};
      })
      setRuleFormOpen(false);
      setEditingRule(null);
  }

  const removeRule = (ruleId: string) => {
    setFormData(prev => ({...prev, discounts: prev.discounts?.filter(d => d.id !== ruleId)}));
  }

  return (
    <>
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-[625px] grid-rows-[auto_1fr_auto] max-h-[90vh]">
            <DialogHeader>
            <DialogTitle>{combo?.id && combo.name ? 'Editar Combo' : 'Crear Nuevo Combo'}</DialogTitle>
            <DialogDescription>
                Complete los detalles, seleccione los productos y gestione los descuentos para el combo.
            </DialogDescription>
            </DialogHeader>
            <ScrollArea className="overflow-auto -mx-6 px-6">
                <form id="combo-form" onSubmit={handleSubmit} className="p-1 pr-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Precio Base</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Productos del Combo</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addProduct}><PlusCircle className="mr-2 h-4 w-4" />Añadir Producto</Button>
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
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Reglas de Descuento</Label>
                        <Button type="button" size="sm" variant="outline" onClick={openNewRuleForm}><Tag className="mr-2 h-4 w-4" />Añadir Regla</Button>
                    </div>
                     <div className="space-y-2">
                        {formData.discounts?.map((rule) => (
                            <div key={rule.id} className="flex items-center gap-2 p-2 border rounded-md">
                            <div className="flex-1">
                                <p className="font-semibold">{rule.percentage}% OFF</p>
                                <p className="text-sm text-muted-foreground">{getDiscountDisplay(rule)}</p>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => openEditRuleForm(rule)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                             <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(rule.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </div>
                        ))}
                        {(!formData.discounts || formData.discounts.length === 0) && (
                            <p className="text-sm text-muted-foreground">No hay reglas de descuento para este combo.</p>
                        )}
                    </div>
                </div>
                </form>
            </ScrollArea>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" form="combo-form">Guardar Combo</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
        {isRuleFormOpen && (
            <DiscountRuleForm 
                rule={editingRule} 
                onSave={handleSaveRule}
                onCancel={() => setRuleFormOpen(false)}
            />
        )}
    </>
  );
}

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>(initialCombos.filter(c => ['PO', 'BG', 'E'].includes(c.type)));
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Partial<Combo> | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deletingComboId, setDeletingComboId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditingCombo({
      id: `C${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      type: 'BG',
      products: [],
      discounts: [],
    });
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

  const handleCloseForms = () => {
    setFormOpen(false);
    setEditingCombo(null);
  }
  
  const getDiscountDisplay = (rule: DiscountRule) => {
    if (rule.type === 'weekday') {
        return `${rule.percentage}% los ${weekdays[Number(rule.value)]}`;
    }
    if (rule.type === 'date') {
        try {
            return `${rule.percentage}% el ${format(new Date(rule.value), "dd/MM/yy")}`;
        } catch {
            return `${rule.percentage}% el ${rule.value}`;
        }
    }
    return `${rule.percentage}%`;
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Combos</CardTitle>
        <CardDescription>Cree, edite y elimine los combos del menú y sus descuentos.</CardDescription>
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
              <TableHead>Precio Base</TableHead>
              <TableHead>Descuentos</TableHead>
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
                <TableCell>
                    <div className="flex flex-col gap-1">
                        {combo.discounts?.map(d => (
                            <Badge key={d.id} variant="secondary">{getDiscountDisplay(d)}</Badge>
                        ))}
                    </div>
                </TableCell>
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

    {isFormOpen && editingCombo && (
        <ComboForm
          combo={editingCombo}
          onSave={handleSaveCombo}
          onCancel={handleCloseForms}
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
