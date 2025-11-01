
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

export interface Combo {
  id: string;
  type: 'PO' | 'BG' | 'E' | 'ES' | 'EP';
  name: string;
  description: string;
  price: number;
  discount?: number;
  products?: ComboProduct[];
  drinkOptions?: {
    allowed: string[] | 'any';
    quantity: number;
  };
  sideOptions?: {
    allowed: string[] | 'any';
    quantity: number;
  };
}

export interface OrderItem {
  id: string; // comboId + customizations
  combo: Combo;
  quantity: number;
  unitPrice: number;
  finalUnitPrice: number;
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
  id: number;
  items: OrderItem[];
  deliveryType: DeliveryType;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: Date;
}

export interface Shift {
    id: string;
    start: Date;
    end?: Date;
    orders: Order[];
    totalRevenue: number;
}
