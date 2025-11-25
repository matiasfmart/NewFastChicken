import type { OrderItem, DeliveryType, OrderStatus } from '@/lib/types';

/**
 * DTO para crear una orden
 * Usa Date nativo, NO Timestamp de Firebase
 */
export interface CreateOrderDTO {
  shiftId?: string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface UpdateOrderDTO {
  items?: OrderItem[];
  deliveryType?: DeliveryType;
  subtotal?: number;
  discount?: number;
  total?: number;
}
