
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

export type DiscountRuleType = 'weekday' | 'date' | 'quantity' | 'cross-promotion';

export interface DiscountRule {
    id: string;
    type: DiscountRuleType;
    percentage: number;

    // Para descuentos por día de la semana o fecha específica
    value?: string; // e.g., '1' for Monday, or '2024-12-25' for a specific date

    // Restricción de horario (opcional) - formato "HH:MM-HH:MM" e.g., "18:00-22:00"
    timeRange?: {
        start: string; // "HH:MM"
        end: string;   // "HH:MM"
    };

    // Para descuentos por cantidad: "Compra 2, el 2do tiene X% descuento"
    requiredQuantity?: number;      // Cantidad mínima para activar descuento
    discountedQuantity?: number;    // Cuántas unidades reciben descuento (por cada grupo de requiredQuantity)

    // Para promociones cruzadas: "Compra combo A, el combo B tiene descuento"
    triggerComboId?: string;        // ID del combo que activa el descuento
    targetComboId?: string;         // ID del combo que recibe el descuento (si no se especifica, aplica al mismo combo)
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

    