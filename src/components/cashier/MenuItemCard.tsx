"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Combo, InventoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: Combo | InventoryItem;
  onSelect: () => void;
}

export function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const isCombo = 'type' in item && ['PO', 'BG', 'E', 'ES', 'EP'].includes(item.type);
  const combo = isCombo ? (item as Combo) : null;
  const discount = combo?.discount;
  const finalPrice = discount ? item.price * (1 - discount / 100) : item.price;

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
}
