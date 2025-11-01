
import type { Timestamp } from 'firebase/firestore';

export type InventoryCategory = 'product' | 'drink' | 'side';

export interface InventoryItem {
  id: string;
  type: 'product' | 'drink' | 'side';
  name: string;
  price: number;
  stock: number;
  category?: 'chica' | 'grande'; // for drinks
}

export interface ComboProduct {
  productId: string;
  quantity: number;
}

export type DiscountRuleType = 'weekday' | 'date';

export interface DiscountRule {
    id: string;
    type: DiscountRuleType;
    value: string; // e.g., '1' for Monday, or '2024-12-25' for a specific date
    percentage: number;
}

export interface Combo {
  id: string;
  type: 'PO' | 'BG' | 'E' | 'ES' | 'EP'; // Main category
  name: string;
  description: string;
  price: number;
  products: ComboProduct[]; // List of inventory items (products, sides, drinks)
  discounts?: DiscountRule[];
}

export interface OrderItem {
  id: string; // comboId + customizations
  combo: Combo;
  quantity: number;
  unitPrice: number;
  finalUnitPrice: number;
  appliedDiscount?: {
    percentage: number;
    rule: DiscountRule;
  };
  customizations: {
    drink?: InventoryItem;
    side?: InventoryItem;
    product?: InventoryItem;
    withIce?: boolean;
    isSpicy?: boolean;
  };
}

export type DeliveryType = 'local' | 'takeaway' | 'delivery';

export interface Order {
  id: number | string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: Date | Timestamp;
}

export interface Shift {
    id: string;
    start: Date;
    end?: Date;
    orders: Order[];
    totalRevenue: number;
}

    