/**
 * Ticket Formatter - Domain Service
 *
 * 🟦 DOMAIN LAYER - Pure Business Logic
 * - Formatea tickets para impresión térmica (80mm)
 * - Funciones puras sin dependencias externas
 * - 100% portable y testeable
 */

import type { Order, OrderItem, Shift } from '@/lib/types';

export class TicketFormatter {
  /**
   * Formatea un ticket de pedido para impresión
   * ✅ Ticket unificado - mismo formato para cliente y cocina
   */
  static formatOrderTicket(order: Order): string {
    const orderNumber = this.formatOrderNumber(order.orderNumber);
    const date = this.formatDate(order.createdAt);
    const time = this.formatTime(order.createdAt);
    const deliveryText = this.getDeliveryText(order.deliveryType);

    let ticket = '';
    ticket += this.centerText('{{BRAND:FAST CHICKEN}}') + '\n';
    ticket += this.centerText('================================') + '\n';
    ticket += this.centerText(`### ORDEN #${orderNumber} ###`) + '\n';
    ticket += this.centerText('================================') + '\n';
    ticket += this.centerText(`*** ${deliveryText.toUpperCase()} ***`) + '\n';
    ticket += `${date} - ${time}\n`;
    ticket += '--------------------------------\n';

    // ✅ Agrupar items y agregar separadores entre diferentes combos
    order.items.forEach((item, index) => {
      ticket += this.formatItem(item);
      
      // Agregar línea separadora entre diferentes combos
      // (no agregar después del último item)
      if (index < order.items.length - 1) {
        const currentComboId = item.combo?.id || item.id;
        const nextComboId = order.items[index + 1].combo?.id || order.items[index + 1].id;
        
        // Si el siguiente item es un combo diferente, agregar separador
        if (currentComboId !== nextComboId) {
          ticket += '   ---------------------------\n';
        }
      }
    });

    ticket += '--------------------------------\n';

    if (order.discount > 0) {
      ticket += `Subtotal:  $${order.subtotal.toLocaleString('es-AR')}\n`;
      ticket += `Descuento: -$${order.discount.toLocaleString('es-AR')}\n`;
      ticket += '--------------------------------\n';
    }

    ticket += `TOTAL: $${order.total.toLocaleString('es-AR')}\n`;
    ticket += '================================\n';
    ticket += this.centerText('¡GRACIAS POR SU COMPRA!') + '\n';

    return ticket;
  }

  /**
   * @deprecated Usar formatOrderTicket() - Ambos tickets ahora son idénticos
   * Mantenido para backward compatibility
   */
  static formatCustomerTicket(order: Order): string {
    return this.formatOrderTicket(order);
  }

  /**
   * @deprecated Usar formatOrderTicket() - Ambos tickets ahora son idénticos
   * Mantenido para backward compatibility
   */
  static formatKitchenTicket(order: Order): string {
    return this.formatOrderTicket(order);
  }

  /**
   * Formatea un item del pedido
   * ✅ Soporta comboProducts[] para mostrar TODOS los productos
   * ✅ Backward compatible con customizations para órdenes antiguas
   * ✅ Siempre muestra precios (formato unificado)
   */
  private static formatItem(item: OrderItem): string {
    const itemName = item.combo
      ? item.combo.name
      : (item.customizations.product?.name ||
         item.customizations.drink?.name ||
         item.customizations.side?.name ||
         'Producto');

    let formatted = '';
    // ✅ Destacar nombre del combo en MAYÚSCULAS
    const displayName = item.combo ? itemName.toUpperCase() : itemName;
    formatted += `${item.quantity}x ${displayName}`;

    // ✅ Siempre mostrar precios (ticket unificado)
    if (item.appliedDiscount) {
      formatted += ` - $${item.unitPrice.toLocaleString('es-AR')} -> $${item.finalUnitPrice.toLocaleString('es-AR')} (${item.appliedDiscount.percentage}% OFF)`;
    } else {
      formatted += ` - $${item.unitPrice.toLocaleString('es-AR')}`;
    }

    formatted += '\n';

    // ✅ NUEVO: Mostrar TODOS los productos del combo desde comboProducts[]
    if (item.combo && item.comboProducts && item.comboProducts.length > 0) {
      item.comboProducts.forEach(product => {
        // Mostrar cantidad si es > 1 (ej: "2x Pollo Frito")
        const quantityPrefix = product.quantity > 1 ? `${product.quantity}x ` : '';
        formatted += `  ${quantityPrefix}${product.name}`;

        // Añadir opciones especiales solo a bebidas
        if (product.type === 'drink' && item.customizations.withIce !== undefined) {
          formatted += item.customizations.withIce ? ' +hielo' : ' -hielo';
        }

        formatted += '\n';
      });
    }
    // ⚠️ FALLBACK: Si no tiene comboProducts[] (orden antigua), usar customizations
    else if (item.combo) {
      if (item.customizations.product) {
        formatted += `  ${item.customizations.product.name}\n`;
      }
      if (item.customizations.side) {
        formatted += `  ${item.customizations.side.name}\n`;
      }
      if (item.customizations.drink) {
        formatted += `  ${item.customizations.drink.name}`;
        formatted += item.customizations.withIce ? ' +hielo\n' : ' -hielo\n';
      }
    }

    // Opciones especiales
    if (item.customizations.isSpicy) {
      formatted += '  *** PICANTE ***\n';
    }

    // Para productos individuales (bebidas)
    if (!item.combo && item.customizations.withIce !== undefined) {
      formatted += item.customizations.withIce ? '  +hielo\n' : '  -hielo\n';
    }

    return formatted;
  }

  /**
   * Formatea el número de orden para mostrar en tickets
   * Convierte números secuenciales en formato con padding (ej: 1 -> 001)
   *
   * ✅ Método público para poder ser usado también en UI components
   */
  static formatOrderNumber(orderNumber?: number): string {
    if (!orderNumber) return '---'; // Fallback para órdenes antiguas sin orderNumber
    return orderNumber.toString().padStart(3, '0');
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

  /**
   * Formatea un ticket de resumen de jornada para impresión
   * ✅ Función pura - solo formateo de texto
   *
   * @param shift - La jornada con todos sus datos
   * @param orders - Órdenes de la jornada para mostrar detalle (opcional)
   * @param actualCashAmount - Efectivo contado manualmente (antes de cerrar) (opcional)
   * @returns String formateado para impresión térmica
   */
  static formatShiftSummaryTicket(shift: Shift, orders?: Order[], actualCashAmount?: number): string {
    let ticket = '';
    ticket += '\n';
    ticket += this.centerText('{{BRAND:FAST CHICKEN}}') + '\n';
    ticket += '\n';
    ticket += this.centerText('================================') + '\n';
    ticket += this.centerText('RESUMEN DE JORNADA') + '\n';
    ticket += this.centerText('================================') + '\n';
    ticket += '\n';

    // Información de la jornada
    ticket += `Cajero: ${shift.employeeName}\n`;
    ticket += `Inicio: ${this.formatDateTime(shift.startedAt)}\n`;
    if (shift.endedAt) {
      ticket += `Cierre: ${this.formatDateTime(shift.endedAt)}\n`;
    }
    ticket += '\n';
    ticket += '--------------------------------\n';
    ticket += 'RESUMEN DE VENTAS\n';
    ticket += '--------------------------------\n';

    // Totales
    ticket += `Total ordenes:   ${shift.totalOrders}\n`;
    ticket += `Ingresos:        $${shift.totalRevenue.toLocaleString('es-AR')}\n`;

    // Si hay órdenes, mostrar detalle de canceladas
    if (orders && orders.length > 0) {
      const cancelledOrders = orders.filter(o => o.status === 'cancelled');
      if (cancelledOrders.length > 0) {
        const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + o.total, 0);
        ticket += '\n';
        ticket += `Ordenes canceladas: ${cancelledOrders.length}\n`;
        ticket += `Total cancelado: $${cancelledRevenue.toLocaleString('es-AR')}\n`;
      }
    }

    ticket += '\n';
    ticket += '--------------------------------\n';
    ticket += 'ARQUEO DE CAJA\n';
    ticket += '--------------------------------\n';

    const expectedCash = shift.initialCash + shift.totalRevenue;

    ticket += `Fondo inicial:   $${shift.initialCash.toLocaleString('es-AR')}\n`;
    ticket += `+ Ventas:        $${shift.totalRevenue.toLocaleString('es-AR')}\n`;
    ticket += `= Esperado:      $${expectedCash.toLocaleString('es-AR')}\n`;

    // ✅ Priorizar actualCashAmount (pasado como parámetro) sobre shift.actualCash
    const cashCounted = actualCashAmount !== undefined ? actualCashAmount : shift.actualCash;

    if (cashCounted !== undefined) {
      const cashDiff = cashCounted - expectedCash;
      ticket += `\n`;
      ticket += `Efectivo real:   $${cashCounted.toLocaleString('es-AR')}\n`;

      const diffSign = cashDiff >= 0 ? '+' : '';
      const diffLabel = cashDiff === 0 ? 'CUADRADO' :
                        cashDiff > 0 ? 'SOBRANTE' : 'FALTANTE';

      ticket += `Diferencia:      ${diffSign}$${cashDiff.toLocaleString('es-AR')}\n`;
      ticket += `\n`;
      ticket += this.centerText(`*** ${diffLabel} ***`) + '\n';
    }

    ticket += '\n';
    ticket += '================================\n';
    ticket += this.centerText(shift.status === 'closed' ? 'Jornada cerrada exitosamente' : 'Resumen de jornada') + '\n';
    ticket += '================================\n';
    ticket += '\n';

    return ticket;
  }

  /**
   * Formatea fecha y hora juntas
   * Helper para resumen de jornada
   */
  private static formatDateTime(date: Date | any): string {
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

      const dateStr = dateObj.toLocaleDateString('es-AR');
      const timeStr = dateObj.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      return `${dateStr} ${timeStr}`;
    } catch {
      return new Date().toLocaleDateString('es-AR');
    }
  }
}
