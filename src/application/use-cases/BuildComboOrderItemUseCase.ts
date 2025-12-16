/**
 * Build Combo Order Item Use Case
 *
 * 🟩 APPLICATION LAYER - Orchestration
 * - Orquesta la creación de un OrderItem desde un Combo
 * - Coordina domain services (ComboService, DiscountService)
 * - No contiene lógica de negocio, solo orquestación
 */

import type { Combo, OrderItem, InventoryItem, InventoryCategory, DiscountRule } from '@/lib/types';
import { ComboService } from '@/domain/services/ComboService';
import { DiscountService } from '@/domain/services/DiscountService';

export interface BuildComboOrderItemInput {
  combo: Combo;
  selections: Map<InventoryCategory, string>; // type -> productId seleccionado
  allInventory: InventoryItem[];
  discounts: DiscountRule[];
  withIce: boolean;
  isSpicy: boolean;
}

export interface BuildComboOrderItemOutput {
  success: boolean;
  errors: string[];
  orderItem?: OrderItem;
}

export class BuildComboOrderItemUseCase {
  /**
   * Construye un OrderItem completo desde la configuración de un combo
   * ✅ Orquesta múltiples domain services
   * ✅ No contiene lógica de negocio directa
   */
  static execute(input: BuildComboOrderItemInput): BuildComboOrderItemOutput {
    const { combo, selections, allInventory, discounts, withIce, isSpicy } = input;

    // 1. Analizar estructura del combo (domain logic)
    const structure = ComboService.analyzeComboStructure(combo, allInventory);

    // 2. Validar selecciones del usuario (domain logic)
    const validation = ComboService.validateComboSelections(
      combo,
      structure,
      selections,
      allInventory
    );

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    // 3. Aplicar descuentos (domain logic)
    const price = combo.price;
    const activeDiscount = DiscountService.getActiveDiscountForCombo(combo, discounts);
    const finalPrice = activeDiscount
      ? price * (1 - activeDiscount.percentage / 100)
      : price;

    // 4. Construir customizations (backward compatibility)
    // ⚠️ IMPORTANTE: Solo toma el PRIMER producto de cada tipo para customizations
    // El array completo va en comboProducts[]
    const selectedProduct = validation.allProducts.find(p => p.type === 'product');
    const selectedDrink = validation.allProducts.find(p => p.type === 'drink');
    const selectedSide = validation.allProducts.find(p => p.type === 'side');

    // 5. Construir OrderItem completo
    const orderItem: OrderItem = {
      id: `${combo.id}-${Array.from(selections.values()).join('-')}-${isSpicy}-${withIce}-${Date.now()}`,
      combo: combo,
      quantity: 1,
      unitPrice: price,
      finalUnitPrice: finalPrice,
      appliedDiscount: activeDiscount
        ? { percentage: activeDiscount.percentage, rule: activeDiscount.rule }
        : undefined,

      // ✅ NUEVO: Array completo de productos (soporta múltiples por categoría)
      comboProducts: validation.allComboProducts,

      // ✅ Backward compatibility (solo primer producto de cada tipo)
      customizations: {
        product: selectedProduct,
        side: selectedSide,
        drink: selectedDrink,
        withIce,
        isSpicy,
      }
    };

    return {
      success: true,
      errors: [],
      orderItem
    };
  }
}
