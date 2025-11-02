
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Combo, InventoryItem, OrderItem, DiscountRule } from '@/lib/types';
import { useOrder } from '@/context/OrderContext';
import { format } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getActiveDiscount = (combo: Combo): { rule: DiscountRule, percentage: number} | null => {
    if (!combo.discounts || combo.discounts.length === 0) return null;

    const today = new Date();
    const todayWeekday = today.getDay().toString();
    const todayDate = format(today, 'yyyy-MM-dd');

    for (const rule of combo.discounts) {
        if (rule.type === 'weekday' && rule.value === todayWeekday) {
            return { rule, percentage: rule.percentage };
        }
        if (rule.type === 'date' && rule.value === todayDate) {
            return { rule, percentage: rule.percentage };
        }
    }
    return null;
}

export function CustomizationDialog({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void; item: Combo | InventoryItem; }) {
  const { addItemToOrder, getInventoryStock, inventory: allInventory } = useOrder();
  const { toast } = useToast();

  const isCombo = 'products' in item;
  const combo = isCombo ? (item as Combo) : null;
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);
  const [selectedSideId, setSelectedSideId] = useState<string | null>(null);
  const [withIce, setWithIce] = useState(true);
  const [isSpicy, setIsSpicy] = useState(false);

  useEffect(() => {
    // Reset state when item changes
    setSelectedProductId(null);
    setSelectedDrinkId(null);
    setSelectedSideId(null);
    setWithIce(true);
    setIsSpicy(false);
  }, [item]);

  const { availableProducts, availableDrinks, availableSides } = useMemo(() => {
    if (!combo || allInventory.length === 0) return { availableProducts: [], availableDrinks: [], availableSides: [] };

    const comboProductItems = combo.products.map(p => allInventory.find(i => i.id === p.productId)).filter(Boolean) as InventoryItem[];

    return {
      availableProducts: comboProductItems.filter(i => i.type === 'product'),
      availableDrinks: comboProductItems.filter(i => i.type === 'drink'),
      availableSides: comboProductItems.filter(i => i.type === 'side'),
    }
  }, [combo, allInventory]);

  // Set default product if only one option
  useEffect(() => {
    if (availableProducts.length === 1 && !selectedProductId) {
      setSelectedProductId(availableProducts[0].id);
    }
  }, [availableProducts, selectedProductId]);

  // Special handling for old generic drink/side combos
  const genericDrinkType = combo?.type === 'E' ? (combo.id === 'D' ? 'chica' : 'grande') : null;
  const allDrinks = useMemo(() => allInventory.filter(i => i.type === 'drink'), [allInventory]);
  const genericDrinks = useMemo(() => genericDrinkType ? allDrinks.filter(d => d.category === genericDrinkType) : [], [genericDrinkType, allDrinks]);


  const handleSubmit = () => {
    if(!combo) {
        onClose();
        return;
    }

    const isGenericDrinkCombo = combo.type === 'E';

    // Validations
    if (availableProducts.length > 0 && !selectedProductId) {
        toast({ variant: 'destructive', title: "Error", description: 'Por favor, seleccione un producto principal.' });
        return;
    }
    if(availableDrinks.length > 0 && !selectedDrinkId) {
        toast({ variant: 'destructive', title: "Error", description: 'Por favor, seleccione una bebida.' });
        return;
    }
     if(isGenericDrinkCombo && !selectedDrinkId) {
        toast({ variant: 'destructive', title: "Error", description: 'Por favor, seleccione una bebida.' });
        return;
    }
    if(availableSides.length > 0 && !selectedSideId) {
        toast({ variant: 'destructive', title: "Error", description: 'Por favor, seleccione una guarnición.' });
        return;
    }
    
    const selectedProduct = allInventory.find(p => p.id === selectedProductId);
    const selectedDrink = allInventory.find(d => d.id === selectedDrinkId);
    const selectedSide = allInventory.find(s => s.id === selectedSideId);

    let price = combo.price;
    if(isGenericDrinkCombo && selectedDrink){
        price = selectedDrink.price;
    }
    
    const activeDiscount = getActiveDiscount(combo);
    const finalPrice = activeDiscount ? price * (1 - activeDiscount.percentage / 100) : price;

    const customizations = {
        drink: selectedDrink,
        side: selectedSide,
        product: selectedProduct,
        withIce: withIce,
        isSpicy: isSpicy,
    }

    const orderItem: OrderItem = {
      id: `${combo.id}-${selectedProductId}-${selectedDrinkId}-${selectedSideId}-${isSpicy}-${withIce}`,
      combo: combo,
      quantity: 1,
      unitPrice: price,
      finalUnitPrice: finalPrice,
      appliedDiscount: activeDiscount ? { percentage: activeDiscount.percentage, rule: activeDiscount.rule } : undefined,
      customizations
    };

    addItemToOrder(orderItem);
    onClose();
  };
  
  const getStockStatus = (itemId: string) => {
      const stock = getInventoryStock(itemId);
      if (stock === undefined) return null; // Still loading
      if (stock <= 0) return <span className="ml-2 text-xs text-destructive">(Sin Stock)</span>;
      if (stock < 10) return <span className="ml-2 text-xs text-yellow-600">(Stock bajo)</span>;
      return null;
  }

  const overallStockWarning = useMemo(() => {
      if(!combo || !combo.products || allInventory.length === 0) return null;
      const lowStockItems = combo.products
        .map(p => ({ item: allInventory.find(i => i.id === p.productId), requiredQty: p.quantity }))
        .filter(data => data.item && getInventoryStock(data.item.id) < data.requiredQty)
        .map(data => data.item!.name)
        .filter(Boolean);
      
      if(lowStockItems.length > 0) {
          return `Atención: No hay stock suficiente para: ${lowStockItems.join(', ')}`;
      }
      return null;
  }, [combo, getInventoryStock, allInventory])

  const renderOptions = (title: string, items: InventoryItem[], selectedId: string | null, onSelect: (id: string) => void) => (
    items.length > 0 && <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <RadioGroup value={selectedId || undefined} onValueChange={onSelect}>
          {items.map(i => (
            <div key={i.id} className="flex items-center space-x-2">
              <RadioGroupItem value={i.id} id={i.id} disabled={getInventoryStock(i.id) <= 0} />
              <Label htmlFor={i.id} className="flex-1 has-[:disabled]:text-muted-foreground">{i.name} {i.price !== combo?.price && combo?.type === 'E' && `($${i.price})`}</Label>
              {getStockStatus(i.id)}
            </div>
          ))}
      </RadioGroup>
    </div>
  )

  if (!combo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar: {item.name}</DialogTitle>
        </DialogHeader>
        {overallStockWarning && <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Stock Insuficiente</AlertTitle>
            <AlertDescription>{overallStockWarning}</AlertDescription>
        </Alert>}
        <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-6 pr-4">
                {renderOptions('Producto Principal', availableProducts, selectedProductId, setSelectedProductId)}
                {renderOptions('Guarnición', availableSides, selectedSideId, setSelectedSideId)}
                {renderOptions('Bebida', availableDrinks, selectedDrinkId, setSelectedDrinkId)}
                {renderOptions('Bebida', genericDrinks, selectedDrinkId, setSelectedDrinkId)}
                
                { (availableDrinks.length > 0 || genericDrinks.length > 0) && (
                    <div className="flex items-center justify-between">
                        <Label htmlFor="with-ice" className="font-semibold">¿Con hielo?</Label>
                        <Switch id="with-ice" checked={withIce} onCheckedChange={setWithIce} />
                    </div>
                )}
                { availableProducts.length > 0 && (
                    <div className="flex items-center justify-between">
                        <Label htmlFor="is-spicy" className="flex items-center gap-2 font-semibold text-destructive">
                            <Flame className="h-4 w-4"/> ¿Con picante?
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
