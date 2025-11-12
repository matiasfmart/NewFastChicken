
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Combo, InventoryItem, OrderItem, ComboProduct } from '@/lib/types';
import { useOrder } from '@/context/OrderContext';
import { useDiscounts } from '@/context/DiscountContext';
import { DiscountService } from '@/domain/services/DiscountService';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Flame, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CustomizationDialog({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void; item: Combo | InventoryItem; }) {
  const { addItemToOrder, getAvailableStock, checkStockForNewItem, inventory: allInventory } = useOrder();
  const { discounts } = useDiscounts();
  const { toast } = useToast();

  const isCombo = 'products' in item;
  const combo = isCombo ? (item as Combo) : null;

  // Estado para productos individuales
  const [withIce, setWithIce] = useState(true);
  const [isSpicy, setIsSpicy] = useState(false);

  // Estado para selecciones de combo (por tipo de inventario: product, drink, side)
  const [selections, setSelections] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Reset state when item changes
    setWithIce(true);
    setIsSpicy(false);
    setSelections(new Map());
  }, [item]);

  // Estructura del combo agrupada por tipo de inventario
  const comboStructure = useMemo(() => {
    if (!combo) return { fixedProducts: [], selectableByType: new Map<string, ComboProduct[]>() };

    const fixedProducts = combo.products.filter(p => p.isFixed);
    const selectableProducts = combo.products.filter(p => !p.isFixed);

    // Agrupar productos elegibles por tipo de inventario
    const selectableByType = new Map<string, ComboProduct[]>();
    selectableProducts.forEach(p => {
      const inventoryItem = allInventory.find(inv => inv.id === p.productId);
      if (!inventoryItem) return;

      const type = inventoryItem.type;
      if (!selectableByType.has(type)) {
        selectableByType.set(type, []);
      }
      selectableByType.get(type)!.push(p);
    });

    return { fixedProducts, selectableByType };
  }, [combo, allInventory]);

  // Obtener inventario de productos fijos
  const fixedInventoryItems = useMemo(() => {
    if (!combo) return [];
    return comboStructure.fixedProducts
      .map(p => allInventory.find(inv => inv.id === p.productId))
      .filter(Boolean) as InventoryItem[];
  }, [comboStructure.fixedProducts, allInventory, combo]);

  // Traducción de tipos a texto legible
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'product': return 'Producto Principal';
      case 'drink': return 'Bebida';
      case 'side': return 'Guarnición';
      default: return type;
    }
  };

  const handleSubmit = () => {
    // Manejar productos individuales (sin combo)
    if (!combo) {
      const inventoryItem = item as InventoryItem;

      const orderItem: OrderItem = {
        id: `inv-${inventoryItem.id}-${isSpicy}-${withIce}-${Date.now()}`,
        combo: null,
        quantity: 1,
        unitPrice: inventoryItem.price,
        finalUnitPrice: inventoryItem.price,
        customizations: {
          drink: inventoryItem.type === 'drink' ? inventoryItem : undefined,
          side: inventoryItem.type === 'side' ? inventoryItem : undefined,
          product: inventoryItem.type === 'product' ? inventoryItem : undefined,
          withIce: inventoryItem.type === 'drink' ? withIce : false,
          isSpicy: inventoryItem.type === 'product' ? isSpicy : false,
        }
      };

      const stockCheck = checkStockForNewItem(orderItem);
      if (!stockCheck.hasStock) {
        toast({
          variant: 'destructive',
          title: "Stock insuficiente",
          description: stockCheck.missingProducts.join('\n')
        });
        return;
      }

      addItemToOrder(orderItem);
      onClose();
      return;
    }

    // LÓGICA DE COMBOS CON ESTRUCTURA SIMPLIFICADA

    // Validar que se haya seleccionado un producto por cada tipo elegible
    const errors: string[] = [];
    comboStructure.selectableByType.forEach((_, type) => {
      if (!selections.has(type)) {
        errors.push(`Debe seleccionar una opción para ${getTypeLabel(type)}`);
      }
    });

    if (errors.length > 0) {
      toast({
        variant: 'destructive',
        title: "Selección incompleta",
        description: errors.join('\n')
      });
      return;
    }

    // Obtener productos finales (fixed + selecciones)
    const selectedProducts = Array.from(selections.values())
      .map(productId => allInventory.find(p => p.id === productId))
      .filter(Boolean) as InventoryItem[];

    const finalProducts = [...fixedInventoryItems, ...selectedProducts];

    // Construir customizations para compatibilidad con el sistema actual
    const selectedProduct = finalProducts.find(p => p.type === 'product');
    const selectedDrink = finalProducts.find(p => p.type === 'drink');
    const selectedSide = finalProducts.find(p => p.type === 'side');

    const price = combo.price;

    // Aplicar descuentos
    const activeDiscount = DiscountService.getActiveDiscountForCombo(combo, discounts);
    const finalPrice = activeDiscount ? price * (1 - activeDiscount.percentage / 100) : price;

    const customizations = {
      drink: selectedDrink,
      side: selectedSide,
      product: selectedProduct,
      withIce: withIce,
      isSpicy: isSpicy,
    };

    const orderItem: OrderItem = {
      id: `${combo.id}-${Array.from(selections.values()).join('-')}-${isSpicy}-${withIce}-${Date.now()}`,
      combo: combo,
      quantity: 1,
      unitPrice: price,
      finalUnitPrice: finalPrice,
      appliedDiscount: activeDiscount ? { percentage: activeDiscount.percentage, rule: activeDiscount.rule } : undefined,
      customizations
    };

    // Verificar stock
    const stockCheck = checkStockForNewItem(orderItem);
    if (!stockCheck.hasStock) {
      toast({
        variant: 'destructive',
        title: "Stock insuficiente",
        description: stockCheck.missingProducts.join('\n')
      });
      return;
    }

    addItemToOrder(orderItem);
    onClose();
  };

  const getStockStatus = (itemId: string) => {
    const stock = getAvailableStock(itemId);
    if (stock === undefined) return null;
    if (stock <= 0) return <span className="ml-2 text-xs text-destructive">(Sin Stock)</span>;
    if (stock < 10) return <span className="ml-2 text-xs text-yellow-600">(Stock: {stock})</span>;
    return null;
  };

  const overallStockWarning = useMemo(() => {
    if (!combo || !combo.products || allInventory.length === 0) return null;

    const lowStockItems = combo.products
      .map(p => ({ item: allInventory.find(i => i.id === p.productId), requiredQty: p.quantity }))
      .filter(data => data.item && getAvailableStock(data.item.id) < data.requiredQty)
      .map(data => data.item!.name)
      .filter(Boolean);

    if (lowStockItems.length > 0) {
      return `Atención: No hay stock suficiente para: ${lowStockItems.join(', ')}`;
    }
    return null;
  }, [combo, getAvailableStock, allInventory]);

  // Renderizar grupo de selección (productos del mismo tipo)
  const renderSelectableGroup = (type: string, products: ComboProduct[]) => {
    const inventoryItems = products
      .map(p => allInventory.find(inv => inv.id === p.productId))
      .filter(Boolean) as InventoryItem[];

    return (
      <div key={type} className="space-y-2">
        <h3 className="font-semibold">
          {getTypeLabel(type)} <span className="text-sm text-muted-foreground">(Elige una opción)</span>
        </h3>
        <RadioGroup
          value={selections.get(type) || undefined}
          onValueChange={(value) => {
            const newSelections = new Map(selections);
            newSelections.set(type, value);
            setSelections(newSelections);
          }}
        >
          {inventoryItems.map(i => (
            <div key={i.id} className="flex items-center space-x-2">
              <RadioGroupItem value={i.id} id={`${type}-${i.id}`} disabled={getAvailableStock(i.id) <= 0} />
              <Label htmlFor={`${type}-${i.id}`} className="flex-1 has-[:disabled]:text-muted-foreground">
                {i.name}
              </Label>
              {getStockStatus(i.id)}
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  // Renderizar productos fijos
  const renderFixedProducts = () => {
    if (fixedInventoryItems.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className="font-semibold">Incluido en el combo</h3>
        <div className="space-y-1">
          {fixedInventoryItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{item.name}</span>
              {getStockStatus(item.id)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizado para productos individuales (no combos)
  if (!combo) {
    const inventoryItem = item as InventoryItem;
    const availableStock = getAvailableStock(inventoryItem.id);
    const noStock = availableStock <= 0;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{inventoryItem.name}</DialogTitle>
          </DialogHeader>
          {noStock && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sin Stock</AlertTitle>
              <AlertDescription>Este producto no tiene stock disponible en este momento.</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Precio:</span>
              <span className="text-lg font-bold">${inventoryItem.price}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Stock disponible:</span>
              <span className={availableStock < 10 ? 'text-yellow-600 font-medium' : ''}>{availableStock} unidades</span>
            </div>

            {inventoryItem.type === 'product' && (
              <div className="flex items-center justify-between pt-2 border-t">
                <Label htmlFor="is-spicy-individual" className="flex items-center gap-2 font-semibold text-destructive">
                  <Flame className="h-4 w-4" /> ¿Con picante?
                </Label>
                <Switch id="is-spicy-individual" checked={isSpicy} onCheckedChange={setIsSpicy} />
              </div>
            )}

            {inventoryItem.type === 'drink' && (
              <div className="flex items-center justify-between pt-2 border-t">
                <Label htmlFor="with-ice-individual" className="font-semibold">¿Con hielo?</Label>
                <Switch id="with-ice-individual" checked={withIce} onCheckedChange={setWithIce} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={noStock}>Agregar al Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Renderizado para combos con estructura simplificada
  const hasDrinks = fixedInventoryItems.some(i => i.type === 'drink') ||
                    Array.from(comboStructure.selectableByType.keys()).includes('drink');
  const hasProducts = fixedInventoryItems.some(i => i.type === 'product') ||
                      Array.from(comboStructure.selectableByType.keys()).includes('product');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar: {item.name}</DialogTitle>
        </DialogHeader>
        {overallStockWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Stock Insuficiente</AlertTitle>
            <AlertDescription>{overallStockWarning}</AlertDescription>
          </Alert>
        )}
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-6 pr-4">
            {/* Mostrar productos fijos */}
            {renderFixedProducts()}

            {/* Mostrar grupos de selección por tipo */}
            {Array.from(comboStructure.selectableByType.entries()).map(([type, products]) =>
              renderSelectableGroup(type, products)
            )}

            {/* Opciones de hielo y picante */}
            {hasDrinks && (
              <div className="flex items-center justify-between">
                <Label htmlFor="with-ice" className="font-semibold">¿Con hielo?</Label>
                <Switch id="with-ice" checked={withIce} onCheckedChange={setWithIce} />
              </div>
            )}

            {hasProducts && (
              <div className="flex items-center justify-between">
                <Label htmlFor="is-spicy" className="flex items-center gap-2 font-semibold text-destructive">
                  <Flame className="h-4 w-4" /> ¿Con picante?
                </Label>
                <Switch id="is-spicy" checked={isSpicy} onCheckedChange={setIsSpicy} />
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!!overallStockWarning}>Agregar al Pedido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
