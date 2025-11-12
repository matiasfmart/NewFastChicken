"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { DiscountRule, Combo } from "@/lib/types";
import type { CreateDiscountInput, UpdateDiscountInput } from "@/application/use-cases";
import { useDiscounts } from "@/context/DiscountContext";
import { MoreHorizontal, Plus, Percent, Link2, Info } from "lucide-react";

interface DiscountManagementProps {
  combos: Combo[];
}

export interface DiscountManagementRef {
  openCreateDialog: () => void;
}

/**
 * Componente principal de gestión de descuentos
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE PRESENTACIÓN:
 * - Permite crear, editar, eliminar y asignar descuentos
 * - Usa DiscountContext para operaciones
 * - Presenta UI amigable para configurar reglas de descuento
 */
export const DiscountManagement = React.forwardRef<DiscountManagementRef, DiscountManagementProps>(
  ({ combos }, ref) => {
    const {
      discounts,
      isLoading,
      createDiscount,
      updateDiscount,
      deleteDiscount,
    } = useDiscounts();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<DiscountRule | null>(null);

    const handleCreate = () => {
      setEditingDiscount(null);
      setIsDialogOpen(true);
    };

    // Exponer handleCreate al componente padre
    React.useImperativeHandle(ref, () => ({
      openCreateDialog: handleCreate
    }));

  const handleEdit = (discount: DiscountRule) => {
    setEditingDiscount(discount);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este descuento?')) {
      await deleteDiscount(id);
    }
  };

  const handleSave = async (data: CreateDiscountInput | (UpdateDiscountInput & { id: string })) => {
    if ('id' in data && data.id) {
      const { id, ...updates } = data;
      await updateDiscount(id, updates);
    } else {
      await createDiscount(data as CreateDiscountInput);
    }
    setIsDialogOpen(false);
    setEditingDiscount(null);
  };

  const getDiscountTypeLabel = (type: DiscountRule['type']): string => {
    const labels = {
      'simple': 'Descuento simple',
      'cross-promotion': 'Promoción'
    };
    return labels[type];
  };

  const getDiscountTypeIcon = (type: DiscountRule['type']) => {
    const icons = {
      'simple': Percent,
      'cross-promotion': Link2
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const formatTemporalCondition = (discount: DiscountRule): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    if (discount.temporalType === 'weekday') {
      return `${days[parseInt(discount.value)]} - ${discount.percentage}% desc.`;
    } else {
      return `${discount.value} - ${discount.percentage}% desc.`;
    }
  };

  const formatDiscountDescription = (discount: DiscountRule): string => {
    // Primero mostrar la condición temporal
    let description = formatTemporalCondition(discount);

    // Agregar detalles específicos del tipo
    if (discount.type === 'cross-promotion') {
      const trigger = combos.find(c => c.id === discount.triggerComboId);
      const target = combos.find(c => c.id === discount.targetComboId);
      description += ` | Compra "${trigger?.name || 'Combo'}" → obtén en "${target?.name || 'Combo'}"`;
    }

    return description;
  };

  const formatAppliesTo = (discount: DiscountRule): string => {
    if (discount.appliesTo === 'order') {
      return 'Total de la compra';
    }

    // ✅ NUEVO: Manejar descuentos de tipo cross-promotion
    if (discount.type === 'cross-promotion') {
      const trigger = combos.find(c => c.id === discount.triggerComboId);
      const target = combos.find(c => c.id === discount.targetComboId);
      return `${trigger?.name || 'N/A'} → ${target?.name || 'N/A'}`;
    }

    // Para descuentos simples y de cantidad (appliesTo === 'combos')
    if (discount.appliesTo === 'combos' && discount.comboIds && discount.comboIds.length > 0) {
      const comboNames = discount.comboIds.map(id => {
        const combo = combos.find(c => c.id === id);
        return combo?.name || id;
      });
      return comboNames.join(', ');
    }

    return 'Sin asignar';
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          {discounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay descuentos configurados. Crea uno para empezar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Aplica a</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDiscountTypeIcon(discount.type)}
                        <span className="text-sm">
                          {getDiscountTypeLabel(discount.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDiscountDescription(discount)}</TableCell>
                    <TableCell className="text-sm">{formatAppliesTo(discount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {discount.percentage}%
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {discount.timeRange
                        ? `${discount.timeRange.start} - ${discount.timeRange.end}`
                        : 'Todo el día'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(discount)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(discount.id)}
                            className="text-destructive"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isDialogOpen && (
        <DiscountFormDialog
          discount={editingDiscount}
          combos={combos}
          onSave={handleSave}
          onCancel={() => {
            setIsDialogOpen(false);
            setEditingDiscount(null);
          }}
        />
      )}
    </>
  );
});

/**
 * Formulario para crear/editar descuentos
 */
interface DiscountFormDialogProps {
  discount: DiscountRule | null;
  combos: Combo[];
  onSave: (data: CreateDiscountInput | (UpdateDiscountInput & { id: string })) => Promise<void>;
  onCancel: () => void;
}

const DiscountFormDialog: React.FC<DiscountFormDialogProps> = ({
  discount,
  combos,
  onSave,
  onCancel
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateDiscountInput & { id?: string }>>({
    id: discount?.id,
    type: discount?.type || 'simple',
    percentage: discount?.percentage || 10,
    appliesTo: discount?.appliesTo || 'order',  // ✅ Cambio: 'order' por defecto para evitar validación de combos vacíos
    comboIds: discount?.comboIds || [],
    temporalType: discount?.temporalType || 'weekday',
    value: discount?.value || '',
    timeRange: discount?.timeRange,
    triggerComboId: discount?.triggerComboId,
    targetComboId: discount?.targetComboId,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(formData as any);
    } catch (error) {
      console.error('Error saving discount:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {discount ? 'Editar Descuento' : 'Crear Nuevo Descuento'}
            </DialogTitle>
            <DialogDescription>
              Configura las reglas y condiciones del descuento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tipo de descuento */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Descuento</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Descuento simple</SelectItem>
                  <SelectItem value="cross-promotion">Promoción cruzada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Porcentaje de descuento */}
            <div className="space-y-2">
              <Label htmlFor="percentage">Porcentaje de Descuento (%)</Label>
              <Input
                id="percentage"
                type="number"
                min="1"
                max="100"
                value={formData.percentage}
                onChange={(e) => handleChange('percentage', parseInt(e.target.value))}
                required
              />
            </div>

            {/* ✅ Mensaje explicativo para promoción cruzada */}
            {formData.type === 'cross-promotion' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <strong>Promoción Cruzada:</strong> El descuento se aplicará automáticamente cuando
                  el cliente agregue al carrito el <strong>Combo Disparador</strong> y el <strong>Combo con Descuento</strong>.
                  {formData.triggerComboId === formData.targetComboId && formData.triggerComboId && (
                    <span className="block mt-1">
                      💡 <em>Ambos combos son iguales = promoción tipo "2x1" o "descuento por cantidad"</em>
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* ✅ Alcance del descuento - SOLO para tipo 'simple' */}
            {formData.type === 'simple' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="appliesTo">Aplica a</Label>
                  <Select
                    value={formData.appliesTo}
                    onValueChange={(value) => {
                      handleChange('appliesTo', value);
                      // Limpiar comboIds si cambia a 'order'
                      if (value === 'order') {
                        handleChange('comboIds', []);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Total de la compra</SelectItem>
                      <SelectItem value="combos">Combos específicos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selector de combos (solo si appliesTo === 'combos') */}
                {formData.appliesTo === 'combos' && (
                  <div className="space-y-2">
                    <Label htmlFor="comboIds">Combos</Label>
                    <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                      {combos.map((combo) => (
                        <div key={combo.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`combo-${combo.id}`}
                            checked={formData.comboIds?.includes(combo.id) || false}
                            onChange={(e) => {
                              const currentIds = formData.comboIds || [];
                              if (e.target.checked) {
                                handleChange('comboIds', [...currentIds, combo.id]);
                              } else {
                                handleChange('comboIds', currentIds.filter(id => id !== combo.id));
                              }
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`combo-${combo.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {combo.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ✅ OBLIGATORIO: Condición Temporal */}
            <div className="space-y-2">
              <Label htmlFor="temporalType">Cuándo aplica (obligatorio)</Label>
              <Select
                value={formData.temporalType}
                onValueChange={(value) => {
                  handleChange('temporalType', value);
                  handleChange('value', ''); // Limpiar valor al cambiar tipo
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekday">Día de semana específico</SelectItem>
                  <SelectItem value="date">Fecha específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selector del valor temporal */}
            {formData.temporalType === 'weekday' && (
              <div className="space-y-2">
                <Label htmlFor="value">Día de la Semana</Label>
                <Select
                  value={formData.value}
                  onValueChange={(value) => handleChange('value', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Domingo</SelectItem>
                    <SelectItem value="1">Lunes</SelectItem>
                    <SelectItem value="2">Martes</SelectItem>
                    <SelectItem value="3">Miércoles</SelectItem>
                    <SelectItem value="4">Jueves</SelectItem>
                    <SelectItem value="5">Viernes</SelectItem>
                    <SelectItem value="6">Sábado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.temporalType === 'date' && (
              <div className="space-y-2">
                <Label htmlFor="value">Fecha (YYYY-MM-DD)</Label>
                <Input
                  id="value"
                  type="date"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  required
                />
              </div>
            )}

            {/* ✅ Campos específicos por tipo de descuento */}

            {formData.type === 'cross-promotion' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="triggerComboId">Combo Disparador (compra esto...)</Label>
                  <Select
                    value={formData.triggerComboId}
                    onValueChange={(value) => handleChange('triggerComboId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona combo" />
                    </SelectTrigger>
                    <SelectContent>
                      {combos.map(combo => (
                        <SelectItem key={combo.id} value={combo.id}>
                          {combo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetComboId">Combo con Descuento (... y obtén descuento en esto)</Label>
                  <Select
                    value={formData.targetComboId}
                    onValueChange={(value) => handleChange('targetComboId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona combo" />
                    </SelectTrigger>
                    <SelectContent>
                      {combos.map(combo => (
                        <SelectItem key={combo.id} value={combo.id}>
                          {combo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Rango de horario (opcional) */}
            <div className="space-y-2">
              <Label>Horario de Aplicación (opcional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeStart" className="text-xs text-muted-foreground">
                    Hora Inicio
                  </Label>
                  <Input
                    id="timeStart"
                    type="time"
                    value={formData.timeRange?.start || ''}
                    onChange={(e) => handleChange('timeRange', {
                      ...formData.timeRange,
                      start: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeEnd" className="text-xs text-muted-foreground">
                    Hora Fin
                  </Label>
                  <Input
                    id="timeEnd"
                    type="time"
                    value={formData.timeRange?.end || ''}
                    onChange={(e) => handleChange('timeRange', {
                      ...formData.timeRange,
                      end: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
