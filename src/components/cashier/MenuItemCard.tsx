
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Combo, InventoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

interface MenuItemCardProps {
  item: Combo | InventoryItem;
  onSelect: () => void;
}

const getActiveDiscount = (combo: Combo): number | null => {
    if (!combo.discounts || combo.discounts.length === 0) return null;

    const today = new Date();
    const todayWeekday = today.getDay().toString();
    const todayDate = format(today, 'yyyy-MM-dd');

    for (const rule of combo.discounts) {
        if (rule.type === 'weekday' && rule.value === todayWeekday) {
            return rule.percentage;
        }
        if (rule.type === 'date' && rule.value === todayDate) {
            return rule.percentage;
        }
    }
    return null;
}

// Memoizar el componente completo para evitar re-renders innecesarios
export const MenuItemCard = React.memo(function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const isCombo = 'products' in item;
  const combo = isCombo ? (item as Combo) : null;

  // Memoizar el cálculo de descuento que es costoso
  const discount = useMemo(() => {
    return combo ? getActiveDiscount(combo) : null;
  }, [combo]);

  const finalPrice = useMemo(() => {
    return discount ? item.price * (1 - discount / 100) : item.price;
  }, [discount, item.price]);

  return (
    <Card
      onClick={onSelect}
      className="flex h-full cursor-pointer flex-col overflow-hidden transition-all hover:shadow-lg hover:ring-2 hover:ring-primary"
    >
      <CardHeader>
        <CardTitle className="text-lg">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {'description' in item && <p className="text-sm text-muted-foreground">{item.description}</p>}
      </CardContent>
      <CardFooter className="flex items-center justify-between font-semibold">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-xl", discount && "text-muted-foreground line-through")}>
            ${item.price.toLocaleString('es-AR')}
          </span>
          {discount && <span className="text-xl text-foreground">${finalPrice.toLocaleString('es-AR')}</span>}
        </div>
        {discount && (
          <Badge variant="destructive" className="bg-accent text-accent-foreground">{discount}% OFF</Badge>
        )}
      </CardFooter>
    </Card>
  );
});
