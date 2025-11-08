/**
 * Discount Service - Servicio de Dominio
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE DOMINIO:
 * - Contiene lógica de negocio PURA sobre descuentos
 * - No depende de infrastructure (DB, APIs, React, etc)
 * - Solo usa entidades de dominio (tipos)
 * - 100% portable entre backend y frontend
 * - Fácil de testear (funciones puras)
 */

import type { Combo, DiscountRule, OrderItem } from '@/lib/types';
import { format } from 'date-fns';

export class DiscountService {
  /**
   * Verifica si una regla de descuento está activa en este momento
   */
  static isDiscountRuleActive(rule: DiscountRule, currentDate: Date = new Date()): boolean {
    // Validar día/fecha si aplica
    if (rule.type === 'weekday' && rule.value) {
      const currentWeekday = currentDate.getDay().toString();
      if (currentWeekday !== rule.value) {
        return false;
      }
    }

    if (rule.type === 'date' && rule.value) {
      const currentDateString = format(currentDate, 'yyyy-MM-dd');
      if (currentDateString !== rule.value) {
        return false;
      }
    }

    // Validar horario si está definido
    if (rule.timeRange) {
      const currentTime = format(currentDate, 'HH:mm');
      const { start, end } = rule.timeRange;

      // Comparación de strings funciona para formato HH:MM
      if (currentTime < start || currentTime > end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtiene el descuento activo para un combo individual
   * Considera descuentos de tipo 'weekday' y 'date' con validación de horario
   */
  static getActiveDiscountForCombo(combo: Combo, currentDate: Date = new Date()): { rule: DiscountRule; percentage: number } | null {
    if (!combo.discounts || combo.discounts.length === 0) {
      return null;
    }

    // Buscar descuentos por día/fecha que estén activos
    for (const rule of combo.discounts) {
      if ((rule.type === 'weekday' || rule.type === 'date') && this.isDiscountRuleActive(rule, currentDate)) {
        return { rule, percentage: rule.percentage };
      }
    }

    return null;
  }

  /**
   * Calcula descuentos promocionales en todo el carrito
   * Considera descuentos de tipo 'quantity' y 'cross-promotion'
   *
   * @param orderItems - Items actuales en el carrito
   * @param allCombos - Todos los combos disponibles (para obtener reglas de descuento)
   * @returns Array de items con descuentos aplicados
   */
  static applyPromotionalDiscounts(
    orderItems: OrderItem[],
    allCombos: Combo[],
    currentDate: Date = new Date()
  ): OrderItem[] {
    const updatedItems = [...orderItems];

    // Mapa de combos por ID para acceso rápido
    const comboMap = new Map<string, Combo>();
    allCombos.forEach(combo => comboMap.set(combo.id, combo));

    // 1. Aplicar descuentos por cantidad
    updatedItems.forEach((item, index) => {
      if (!item.combo) return;

      const combo = comboMap.get(item.combo.id);
      if (!combo || !combo.discounts) return;

      // Buscar reglas de descuento por cantidad activas
      const quantityRule = combo.discounts.find(
        rule => rule.type === 'quantity' && this.isDiscountRuleActive(rule, currentDate)
      );

      if (quantityRule && quantityRule.requiredQuantity && quantityRule.discountedQuantity) {
        // Calcular cuántos grupos de descuento hay
        const groups = Math.floor(item.quantity / quantityRule.requiredQuantity);
        const discountedUnits = groups * quantityRule.discountedQuantity;

        if (discountedUnits > 0) {
          // Calcular nuevo precio promedio
          const normalUnits = item.quantity - discountedUnits;
          const normalPrice = item.unitPrice * normalUnits;
          const discountedPrice = item.unitPrice * (1 - quantityRule.percentage / 100) * discountedUnits;
          const averagePrice = (normalPrice + discountedPrice) / item.quantity;

          updatedItems[index] = {
            ...item,
            finalUnitPrice: averagePrice,
            appliedDiscount: {
              percentage: quantityRule.percentage,
              rule: quantityRule
            }
          };
        }
      }
    });

    // 2. Aplicar descuentos cruzados (cross-promotion)
    // Primero, contar cuántos de cada combo trigger hay en el carrito
    const triggerCounts = new Map<string, number>();
    orderItems.forEach(item => {
      if (item.combo) {
        const currentCount = triggerCounts.get(item.combo.id) || 0;
        triggerCounts.set(item.combo.id, currentCount + item.quantity);
      }
    });

    // Buscar todas las reglas de cross-promotion activas
    allCombos.forEach(combo => {
      if (!combo.discounts) return;

      combo.discounts.forEach(rule => {
        if (rule.type === 'cross-promotion' && this.isDiscountRuleActive(rule, currentDate)) {
          const triggerComboId = rule.triggerComboId || combo.id;
          const targetComboId = rule.targetComboId || combo.id;

          // Verificar si el combo trigger está en el carrito
          const triggerCount = triggerCounts.get(triggerComboId) || 0;
          if (triggerCount === 0) return;

          // Aplicar descuento al combo target
          updatedItems.forEach((item, index) => {
            if (item.combo && item.combo.id === targetComboId) {
              // Si ya tiene descuento, comparar y aplicar el mayor
              const currentDiscount = item.appliedDiscount?.percentage || 0;
              if (rule.percentage > currentDiscount) {
                const discountedPrice = item.unitPrice * (1 - rule.percentage / 100);
                updatedItems[index] = {
                  ...item,
                  finalUnitPrice: discountedPrice,
                  appliedDiscount: {
                    percentage: rule.percentage,
                    rule
                  }
                };
              }
            }
          });
        }
      });
    });

    return updatedItems;
  }

  /**
   * Calcula el descuento total de un item considerando todas las reglas
   *
   * @param item - Item del carrito
   * @param allOrderItems - Todos los items del carrito (para cross-promotion)
   * @param allCombos - Todos los combos disponibles
   * @returns Item con el descuento aplicado
   */
  static calculateItemDiscount(
    item: OrderItem,
    allOrderItems: OrderItem[],
    allCombos: Combo[],
    currentDate: Date = new Date()
  ): OrderItem {
    if (!item.combo) {
      return item;
    }

    // 1. Primero verificar descuentos simples (weekday/date)
    const simpleDiscount = this.getActiveDiscountForCombo(item.combo, currentDate);

    let bestDiscount: { percentage: number; rule: DiscountRule } | null = simpleDiscount;

    // 2. Aplicar lógica promocional y obtener el mejor descuento
    const itemsWithPromotions = this.applyPromotionalDiscounts([item], allCombos, currentDate);
    const promotionalDiscount = itemsWithPromotions[0].appliedDiscount;

    if (promotionalDiscount && (!bestDiscount || promotionalDiscount.percentage > bestDiscount.percentage)) {
      bestDiscount = promotionalDiscount;
    }

    // Aplicar el mejor descuento encontrado
    if (bestDiscount) {
      const finalPrice = item.unitPrice * (1 - bestDiscount.percentage / 100);
      return {
        ...item,
        finalUnitPrice: finalPrice,
        appliedDiscount: bestDiscount
      };
    }

    return item;
  }
}
