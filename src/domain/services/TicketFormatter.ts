/**
 * Ticket Formatter - Domain Service
 *
 * 🟦 DOMAIN LAYER - Pure Business Logic
 * - Formatea tickets para impresión térmica (80mm)
 * - Funciones puras sin dependencias externas
 * - 100% portable y testeable
 */

import type { Order, OrderItem } from '@/lib/types';

export class TicketFormatter {
  /**
   * Formatea un ticket de cliente para impresión
   */
  static formatCustomerTicket(order: Order): string {
    const orderId = this.formatOrderId(order.id);
    const date = this.formatDate(order.createdAt);
    const time = this.formatTime(order.createdAt);
    const deliveryText = this.getDeliveryText(order.deliveryType);

    let ticket = '';
    ticket += this.centerText('FAST CHICKEN') + '\n';
    ticket += this.centerText('================================') + '\n';
    ticket += this.centerText(`ORDEN #${orderId}`) + '\n';
    ticket += this.centerText('================================') + '\n';
    ticket += '\n';
    ticket += `Fecha: ${date}\n`;
    ticket += `Hora: ${time}\n`;
    ticket += `Tipo: ${deliveryText}\n`;
    ticket += '\n';
    ticket += '--------------------------------\n';
    ticket += 'ITEMS\n';
    ticket += '--------------------------------\n';

    order.items.forEach(item => {
      ticket += this.formatItem(item, false);
    });

    ticket += '--------------------------------\n';

    if (order.discount > 0) {
      ticket += `Subtotal:        $${order.subtotal.toLocaleString('es-AR')}\n`;
      ticket += `Descuento:      -$${order.discount.toLocaleString('es-AR')}\n`;
      ticket += '--------------------------------\n';
    }

    ticket += `TOTAL:           $${order.total.toLocaleString('es-AR')}\n`;
    ticket += '================================\n';
    ticket += '\n';
    ticket += this.centerText('¡GRACIAS POR SU COMPRA!') + '\n';
    ticket += '\n';

    return ticket;
  }

  /**
   * Formatea un ticket de cocina para impresión
   */
  static formatKitchenTicket(order: Order): string {
    const orderId = this.formatOrderId(order.id);
    const time = this.formatTime(order.createdAt);
    const deliveryText = this.getDeliveryText(order.deliveryType);

    let ticket = '';
    ticket += this.centerText('***** COCINA *****') + '\n';
    ticket += this.centerText('================================') + '\n';
    ticket += this.centerText(`ORDEN #${orderId}`) + '\n';
    ticket += this.centerText('================================') + '\n';
    ticket += '\n';
    ticket += `Hora: ${time}\n`;
    ticket += `Tipo: ${deliveryText}\n`;
    ticket += '\n';
    ticket += '--------------------------------\n';
    ticket += 'PREPARAR:\n';
    ticket += '--------------------------------\n';

    order.items.forEach(item => {
      ticket += this.formatItem(item, true);
    });

    ticket += '================================\n';
    ticket += '\n';

    return ticket;
  }

  /**
   * Formatea un item del pedido
   */
  private static formatItem(item: OrderItem, isKitchen: boolean): string {
    const itemName = item.combo
      ? item.combo.name
      : (item.customizations.product?.name ||
         item.customizations.drink?.name ||
         item.customizations.side?.name ||
         'Producto');

    let formatted = '';
    formatted += `${item.quantity}x ${itemName}`;

    if (!isKitchen) {
      if (item.appliedDiscount) {
        formatted += `\n   $${item.unitPrice.toLocaleString('es-AR')} -> $${item.finalUnitPrice.toLocaleString('es-AR')} c/u`;
        formatted += ` (${item.appliedDiscount.percentage}% OFF)`;
      } else {
        formatted += ` - $${item.unitPrice.toLocaleString('es-AR')} c/u`;
      }
    }

    formatted += '\n';

    // Detalles de customización para combos
    if (item.combo) {
      if (item.customizations.product) {
        formatted += `   • ${item.customizations.product.name}\n`;
      }
      if (item.customizations.side) {
        formatted += `   • ${item.customizations.side.name}\n`;
      }
      if (item.customizations.drink) {
        formatted += `   • ${item.customizations.drink.name}`;
        formatted += item.customizations.withIce ? ' (con hielo)\n' : ' (sin hielo)\n';
      }
    }

    // Opciones especiales
    if (item.customizations.isSpicy) {
      formatted += '   *** CON PICANTE ***\n';
    }

    // Para productos individuales (bebidas)
    if (!item.combo && item.customizations.withIce !== undefined) {
      formatted += item.customizations.withIce ? '   (con hielo)\n' : '   (sin hielo)\n';
    }

    formatted += '\n';
    return formatted;
  }

  /**
   * Formatea el ID de la orden
   */
  private static formatOrderId(id: string | number): string {
    if (typeof id === 'string') {
      return id.substring(0, 6).toUpperCase();
    }
    return id.toString().padStart(6, '0');
  }

  /**
   * Formatea la fecha
   */
  private static formatDate(date: Date | any): string {
    try {
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'object' && 'seconds' in date) {
        dateObj = new Date((date as any).seconds * 1000);
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = new Date();
      }

      return dateObj.toLocaleDateString('es-AR');
    } catch {
      return new Date().toLocaleDateString('es-AR');
    }
  }

  /**
   * Formatea la hora
   */
  private static formatTime(date: Date | any): string {
    try {
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'object' && 'seconds' in date) {
        dateObj = new Date((date as any).seconds * 1000);
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = new Date();
      }

      return dateObj.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  /**
   * Obtiene el texto del tipo de entrega
   */
  private static getDeliveryText(type: string): string {
    const deliveryTexts: Record<string, string> = {
      local: 'Para comer acá',
      takeaway: 'Para llevar',
      delivery: 'Delivery'
    };
    return deliveryTexts[type] || type;
  }

  /**
   * Centra un texto (ancho 32 caracteres para ticket 80mm)
   */
  private static centerText(text: string): string {
    const width = 32;
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }
}
