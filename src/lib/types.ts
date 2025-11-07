
import type { Timestamp } from 'firebase/firestore';

export type InventoryCategory = 'product' | 'drink' | 'side';

export interface InventoryItem {
  id: string;
  type: 'product' | 'drink' | 'side';
  name: string;
  price: number;
  stock: number;
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
  combo: Combo | null; // null para productos individuales
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
  shiftId?: string; // Vincula la orden con una jornada
  items: OrderItem[];
  deliveryType: DeliveryType;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: Date | Timestamp;
}

export interface Employee {
  id: string;
  name: string;
  role: 'cashier' | 'admin';
  active: boolean;
  createdAt: Date | Timestamp;
}

export interface Shift {
  id: string;
  employeeId: string; // ✅ Referencia al empleado
  employeeName: string; // ✅ Desnormalizado para reportes rápidos
  startedAt: Date | Timestamp;
  endedAt?: Date | Timestamp;
  status: 'open' | 'closed';
  initialCash: number; // Fondo inicial en caja
  totalOrders: number;
  totalRevenue: number;
  actualCash?: number; // Efectivo real contado al cerrar
  cashDifference?: number; // Diferencia entre esperado y real
}

    