"use client";

import React, { useState, useMemo } from 'react';
import type { Combo, InventoryItem, OrderItem } from '@/lib/types';
import { useOrder } from '@/context/OrderContext';
import { drinks as allDrinks, sides as allSides, products as allProducts } from '@/lib/data';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: Combo | InventoryItem;
}

export function CustomizationDialog({ isOpen, onClose, item }: CustomizationDialogProps) {
  const { addItemToOrder, getInventoryStock } = useOrder();
  const { toast } = useToast();

  const isBaseItem = !('type' in item);
  const combo = isBaseItem ? null : (item as Combo);
  
  const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);
  const [selectedSideId, setSelectedSideId] = useState<string | null>(null);
  const [withIce, setWithIce] = useState(true);
  const [isSpicy, setIsSpicy] = useState(false);

  const availableDrinks = useMemo(() => {
    if (!combo || !combo.drinkOptions) return [];
    if(combo.type === 'E') {
        const category = combo.id === 'D' ? 'chica' : 'grande';
        return allDrinks.filter(d => d.category === category);
    }
    if (combo.drinkOptions.allowed === 'any') return allDrinks.filter(d => d.category === 'chica');
    return allDrinks.filter(d => combo.drinkOptions!.allowed.includes(d.id));
  }, [combo]);

  const availableSides = useMemo(() => {
    if (!combo || !combo.sideOptions) return [];
    if (combo.sideOptions.allowed === 'any') return allSides;
    return allSides.filter(s => combo.sideOptions!.allowed.includes(s.id));
  }, [combo]);

  const handleSubmit = () => {
    if(!combo) { // Should not happen
        onClose();
        return;
    }
    
    // Validations
    if(combo.drinkOptions && !selectedDrinkId) {
        toast({ variant: 'destructive', title: "Error", description: 'Por favor, seleccione una bebida.' });
        return;
    }
    if(combo.sideOptions && !selectedSideId) {
        toast({ variant: 'destructive', title: "Error", description: 'Por favor, seleccione una guarnición.' });
        return;
    }
    
    const selectedDrink = allDrinks.find(d => d.id === selectedDrinkId);
    const selectedSide = allSides.find(s => s.id === selectedSideId);
    const selectedProduct = combo.type === 'EP' ? allProducts.find(p => combo.id.includes(p.id)) : undefined;

    let price = combo.price;
    if(combo.type === 'E' && selectedDrink){
        price = selectedDrink.price;
    }
    
    const discount = combo.discount || 0;
    const finalPrice = price * (1 - discount / 100);

    const customizations = {
        drink: selectedDrink,
        side: selectedSide,
        product: selectedProduct,
        withIce: combo.type === 'PO' || combo.type === 'BG' || combo.type === 'E' ? withIce : undefined,
        isSpicy: combo.type === 'PO' ? isSpicy : undefined
    }

    const orderItem: OrderItem = {
      id: `${combo.id}-${selectedDrinkId}-${selectedSideId}-${isSpicy}-${withIce}`,
      combo: combo,
      quantity: 1,
      unitPrice: price,
      finalUnitPrice: finalPrice,
      customizations
    };

    addItemToOrder(orderItem);
    onClose();
  };
  
  const getStockStatus = (itemId: string) => {
      const stock = getInventoryStock(itemId);
      if (stock <= 0) return <span className="ml-2 text-xs text-destructive">(Sin Stock)</span>;
      if (stock < 10) return <span className="ml-2 text-xs text-yellow-600">(Stock bajo)</span>;
      return null;
  }

  const overallStockWarning = useMemo(() => {
      if(!combo || !combo.products) return null;
      const lowStockItems = combo.products
        .filter(p => getInventoryStock(p.productId) < p.quantity)
        .map(p => allProducts.find(prod => prod.id === p.productId)?.name)
        .filter(Boolean);
      
      if(lowStockItems.length > 0) {
          return `Atención: No hay stock suficiente para: ${lowStockItems.join(', ')}`;
      }
      return null;
  }, [combo, getInventoryStock])

  const renderOptions = (title: string, items: InventoryItem[], selectedId: string | null, onSelect: (id: string) => void) => (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <RadioGroup value={selectedId || undefined} onValueChange={onSelect}>
          {items.map(i => (
            <div key={i.id} className="flex items-center space-x-2">
              <RadioGroupItem value={i.id} id={i.id} />
              <Label htmlFor={i.id} className="flex-1">{i.name} {i.price !== combo?.price && combo?.type === 'E' && `($${i.price})`}</Label>
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
                {availableDrinks.length > 0 && renderOptions('Bebida', availableDrinks, selectedDrinkId, setSelectedDrinkId)}
                {availableSides.length > 0 && renderOptions('Guarnición', availableSides, selectedSideId, setSelectedSideId)}
                {(combo.type === 'PO' || combo.type === 'BG' || combo.type === 'E') && (
                    <div className="flex items-center justify-between">
                        <Label htmlFor="with-ice" className="font-semibold">¿Con hielo?</Label>
                        <Switch id="with-ice" checked={withIce} onCheckedChange={setWithIce} />
                    </div>
                )}
                {combo.type === 'PO' && (
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
          <Button onClick={handleSubmit}>Agregar al Pedido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
