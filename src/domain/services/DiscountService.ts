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
    // Validar día/fecha según temporalType (todos los descuentos tienen temporalType)
    if (rule.temporalType === 'weekday' && rule.value) {
      const currentWeekday = currentDate.getDay().toString();
      if (currentWeekday !== rule.value) {
        return false;
      }
    }

    if (rule.temporalType === 'date' && rule.value) {
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
   * Considera descuentos simples con validación temporal y de horario
   *
   * ✅ REFACTORIZADO: Ahora recibe allDiscounts como parámetro (colección separada)
   *
   * @param combo - Combo para el cual buscar descuentos
   * @param allDiscounts - Todos los descuentos disponibles (desde colección discounts)
   * @param currentDate - Fecha actual para validar descuentos temporales
   * @returns Descuento activo con mayor porcentaje, o null si no hay ninguno
   */
  static getActiveDiscountForCombo(
    combo: Combo,
    allDiscounts: DiscountRule[],
    currentDate: Date = new Date()
  ): { rule: DiscountRule; percentage: number } | null {
    // Filtrar descuentos que aplican a este combo específico
    const applicableDiscounts = allDiscounts.filter(discount => {
      // Solo descuentos simples (cross-promotion se maneja en applyPromotionalDiscounts)
      if (discount.type !== 'simple') return false;

      // Verificar alcance del descuento
      if (discount.appliesTo === 'order') {
        // Descuentos sobre el total no aplican a combos individuales
        return false;
      }

      if (discount.appliesTo === 'combos') {
        // Debe estar en la lista de combos permitidos
        if (!discount.comboIds || !discount.comboIds.includes(combo.id)) {
          return false;
        }
      }

      // Validar condiciones temporales (día/fecha y horario)
      return this.isDiscountRuleActive(discount, currentDate);
    });

    // Si no hay descuentos aplicables
    if (applicableDiscounts.length === 0) return null;

    // Retornar el descuento con mayor porcentaje
    const bestDiscount = applicableDiscounts.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );

    return { rule: bestDiscount, percentage: bestDiscount.percentage };
  }

  /**
   * Calcula descuentos promocionales en todo el carrito
   * Considera descuentos de tipo 'cross-promotion'
   *
   * @param orderItems - Items actuales en el carrito
   * @param allCombos - Todos los combos disponibles (para validaciones)
   * @param allDiscounts - Todas las reglas de descuento activas (colección separada)
   * @param currentDate - Fecha actual para validar descuentos temporales
   * @returns Array de items con descuentos aplicados
   */
  static applyPromotionalDiscounts(
    orderItems: OrderItem[],
    allCombos: Combo[],
    allDiscounts: DiscountRule[],
    currentDate: Date = new Date()
  ): OrderItem[] {
    const updatedItems = [...orderItems];

    // Filtrar solo descuentos activos
    const activeDiscounts = allDiscounts.filter(rule => this.isDiscountRuleActive(rule, currentDate));

    // Aplicar descuentos cruzados (cross-promotion)
    // Primero, contar cuántos de cada combo trigger hay en el carrito
    const triggerCounts = new Map<string, number>();
    orderItems.forEach(item => {
      if (item.combo) {
        const currentCount = triggerCounts.get(item.combo.id) || 0;
        triggerCounts.set(item.combo.id, currentCount + item.quantity);
      }
    });

    // Filtrar descuentos de tipo 'cross-promotion'
    const crossPromotionDiscounts = activeDiscounts.filter(rule => rule.type === 'cross-promotion');

    // Aplicar cada descuento cruzado
    crossPromotionDiscounts.forEach(rule => {
      if (!rule.triggerComboId || !rule.targetComboId) return;

      // Verificar si el combo trigger está en el carrito
      const triggerCount = triggerCounts.get(rule.triggerComboId) || 0;
      if (triggerCount === 0) return;

      // ✅ Validar restricción de appliesTo y comboIds
      if (rule.appliesTo === 'combos' && rule.comboIds && rule.comboIds.length > 0) {
        if (!rule.comboIds.includes(rule.targetComboId)) {
          return;
        }
      }

      // ✅ NUEVO: Lógica correcta para cross-promotion con soporte para 2x1
      const is2x1 = rule.triggerComboId === rule.targetComboId;

      if (is2x1) {
        // ✅ CASO ESPECIAL: Promoción 2x1 (trigger === target)
        // Lógica: Por cada 2 unidades, aplicar descuento a 1 (la más barata si hay diferencia de precio)

        // Obtener todos los items del combo (expandiendo quantity)
        const comboItems = updatedItems
          .map((item, idx) => {
            if (item.combo?.id === rule.targetComboId) {
              // Expandir quantity a items individuales
              return Array(item.quantity).fill(null).map(() => ({ item, idx }));
            }
            return [];
          })
          .flat()
          .sort((a, b) => a.item.unitPrice - b.item.unitPrice); // Ordenar por precio (más barato primero)

        // Aplicar descuento a items pares (2do, 4to, 6to...) = posiciones impares (1, 3, 5...)
        const totalItems = comboItems.length;
        const discountsToApply = Math.floor(totalItems / 2);

        // Track de cuántas unidades con descuento por cada item del carrito
        const discountCountPerItem = new Map<number, number>();

        // Aplicar descuentos: items en posición 1, 3, 5, 7... (0-indexed)
        for (let i = 1; i < totalItems && discountCountPerItem.size < discountsToApply; i += 2) {
          const { idx } = comboItems[i];
          const currentCount = discountCountPerItem.get(idx) || 0;
          discountCountPerItem.set(idx, currentCount + 1);
        }

        // Actualizar items con descuentos calculados
        discountCountPerItem.forEach((discountedQty, itemIndex) => {
          const item = updatedItems[itemIndex];
          const currentDiscount = item.appliedDiscount?.percentage || 0;

          if (rule.percentage > currentDiscount) {
            // Calcular precio promedio considerando unidades con y sin descuento
            const normalQty = item.quantity - discountedQty;
            const discountedPrice = item.unitPrice * (1 - rule.percentage / 100);
            const averagePrice = (normalQty * item.unitPrice + discountedQty * discountedPrice) / item.quantity;

            updatedItems[itemIndex] = {
              ...item,
              finalUnitPrice: averagePrice,
              appliedDiscount: {
                percentage: rule.percentage,
                rule,
              }
            };
          }
        });
      } else {
        // ✅ CASO NORMAL: Cross-promotion A→B
        // Por cada trigger en el carrito, aplicar descuento a UN target

        let discountsApplied = 0;
        const maxDiscounts = triggerCount;

        updatedItems.forEach((item, index) => {
          if (item.combo?.id === rule.targetComboId && discountsApplied < maxDiscounts) {
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
              discountsApplied += item.quantity; // Contar todas las unidades del item
            }
          }
        });
      }
    });

    return updatedItems;
  }

  /**
   * Obtiene el descuento activo sobre el total de la orden
   * Considera descuentos de tipo 'simple' con appliesTo === 'order'
   *
   * @param allDiscounts - Todos los descuentos disponibles
   * @param currentDate - Fecha actual para validar descuentos temporales
   * @returns Descuento activo con mayor porcentaje, o null si no hay ninguno
   */
  static getActiveOrderDiscount(
    allDiscounts: DiscountRule[],
    currentDate: Date = new Date()
  ): { rule: DiscountRule; percentage: number } | null {
    // Filtrar descuentos que aplican al total de la orden
    const applicableDiscounts = allDiscounts.filter(discount => {
      // Solo descuentos simples
      if (discount.type !== 'simple') return false;

      // Solo descuentos sobre el total
      if (discount.appliesTo !== 'order') return false;

      // Validar condiciones temporales (día/fecha y horario)
      return this.isDiscountRuleActive(discount, currentDate);
    });

    // Si no hay descuentos aplicables
    if (applicableDiscounts.length === 0) return null;

    // Retornar el descuento con mayor porcentaje
    const bestDiscount = applicableDiscounts.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );

    return { rule: bestDiscount, percentage: bestDiscount.percentage };
  }

  /**
   * Calcula el descuento total de un item considerando todas las reglas
   *
   * @param item - Item del carrito
   * @param allOrderItems - Todos los items del carrito (para cross-promotion)
   * @param allCombos - Todos los combos disponibles
   * @param allDiscounts - Todas las reglas de descuento activas
   * @param currentDate - Fecha actual para validar descuentos temporales
   * @returns Item con el descuento aplicado
   */
  static calculateItemDiscount(
    item: OrderItem,
    allOrderItems: OrderItem[],
    allCombos: Combo[],
    allDiscounts: DiscountRule[],
    currentDate: Date = new Date()
  ): OrderItem {
    if (!item.combo) {
      return item;
    }

    // 1. Primero verificar descuentos simples (weekday/date)
    const simpleDiscount = this.getActiveDiscountForCombo(item.combo, allDiscounts, currentDate);

    let bestDiscount: { percentage: number; rule: DiscountRule } | null = simpleDiscount;

    // 2. Aplicar lógica promocional y obtener el mejor descuento
    const itemsWithPromotions = this.applyPromotionalDiscounts([item], allCombos, allDiscounts, currentDate);
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
