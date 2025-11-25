/**
 * Combo Validation Service - Domain Service
 *
 * 🟦 DOMAIN LAYER - Pure Business Logic
 * - Valida configuración de combos (productos fixed vs choice)
 * - Valida selecciones de usuario al ordenar combos
 * - Funciones puras sin dependencias externas
 * - 100% portable y testeable
 */

import type { Combo, ComboProduct, InventoryItem } from '@/lib/types';

/**
 * Resultado de validación de combo
 */
export interface ComboValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Selección de producto por el usuario
 */
export interface UserProductSelection {
  productId: string;
  choiceGroup?: string; // Para productos de tipo 'choice'
}

export class ComboValidationService {
  /**
   * Valida que un combo esté bien configurado
   * - Verifica que productos 'choice' tengan choiceGroup
   * - Verifica que haya al menos una opción por choiceGroup
   * - Verifica que no haya choiceGroups vacíos
   */
  static validateComboConfiguration(combo: Combo): ComboValidationResult {
    const errors: string[] = [];

    if (!combo.products || combo.products.length === 0) {
      errors.push('El combo debe tener al menos un producto');
      return { isValid: false, errors };
    }

    // Validar que productos 'choice' tengan choiceGroup
    const choiceProductsWithoutGroup = combo.products.filter(
      p => p.selectionType === 'choice' && !p.choiceGroup
    );
    if (choiceProductsWithoutGroup.length > 0) {
      errors.push('Todos los productos de selección deben tener un grupo de elección (choiceGroup)');
    }

    // Verificar que cada choiceGroup tenga al menos una opción
    const choiceGroups = new Set(
      combo.products
        .filter(p => p.selectionType === 'choice' && p.choiceGroup)
        .map(p => p.choiceGroup!)
    );

    choiceGroups.forEach(group => {
      const optionsInGroup = combo.products.filter(
        p => p.selectionType === 'choice' && p.choiceGroup === group
      );
      if (optionsInGroup.length < 2) {
        errors.push(`El grupo de elección "${group}" debe tener al menos 2 opciones`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene todos los grupos de elección (choice groups) de un combo
   */
  static getChoiceGroups(combo: Combo): string[] {
    const groups = new Set<string>();
    combo.products.forEach(p => {
      if (p.selectionType === 'choice' && p.choiceGroup) {
        groups.add(p.choiceGroup);
      }
    });
    return Array.from(groups);
  }

  /**
   * Obtiene productos fijos de un combo
   */
  static getFixedProducts(combo: Combo): ComboProduct[] {
    return combo.products.filter(p => p.selectionType === 'fixed');
  }

  /**
   * Obtiene productos de un grupo de elección específico
   */
  static getProductsByChoiceGroup(combo: Combo, choiceGroup: string): ComboProduct[] {
    return combo.products.filter(
      p => p.selectionType === 'choice' && p.choiceGroup === choiceGroup
    );
  }

  /**
   * Valida que las selecciones del usuario cumplan con las reglas del combo
   * - Verifica que se haya seleccionado exactamente UN producto por cada choiceGroup
   * - Verifica que los productos seleccionados existan en el combo
   * - Verifica que no se hayan seleccionado productos de tipo 'fixed' (se incluyen automáticamente)
   */
  static validateUserSelections(
    combo: Combo,
    selections: UserProductSelection[]
  ): ComboValidationResult {
    const errors: string[] = [];
    const choiceGroups = this.getChoiceGroups(combo);

    // Validar que se haya seleccionado un producto por cada choiceGroup
    choiceGroups.forEach(group => {
      const selectionsForGroup = selections.filter(s => s.choiceGroup === group);

      if (selectionsForGroup.length === 0) {
        errors.push(`Debe seleccionar una opción para "${group}"`);
      } else if (selectionsForGroup.length > 1) {
        errors.push(`Solo puede seleccionar una opción para "${group}"`);
      } else {
        // Validar que el producto seleccionado existe en ese grupo
        const selectedProductId = selectionsForGroup[0].productId;
        const validProducts = this.getProductsByChoiceGroup(combo, group);
        const isValidProduct = validProducts.some(p => p.productId === selectedProductId);

        if (!isValidProduct) {
          errors.push(`El producto seleccionado no es válido para el grupo "${group}"`);
        }
      }
    });

    // Validar que no se hayan seleccionado productos fijos (no deben estar en selections)
    const fixedProductIds = this.getFixedProducts(combo).map(p => p.productId);
    const invalidFixedSelections = selections.filter(s =>
      fixedProductIds.includes(s.productId)
    );
    if (invalidFixedSelections.length > 0) {
      errors.push('Los productos fijos se incluyen automáticamente, no deben seleccionarse');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene la lista completa de productos finales de un combo
   * incluyendo productos fijos + selecciones del usuario
   */
  static getFinalComboProducts(
    combo: Combo,
    selections: UserProductSelection[],
    allInventory: InventoryItem[]
  ): { products: InventoryItem[]; validation: ComboValidationResult } {
    // Validar selecciones
    const validation = this.validateUserSelections(combo, selections);
    if (!validation.isValid) {
      return { products: [], validation };
    }

    // Obtener productos fijos
    const fixedProducts = this.getFixedProducts(combo);
    const fixedInventoryItems = fixedProducts
      .map(fp => allInventory.find(item => item.id === fp.productId))
      .filter(Boolean) as InventoryItem[];

    // Obtener productos seleccionados
    const selectedInventoryItems = selections
      .map(s => allInventory.find(item => item.id === s.productId))
      .filter(Boolean) as InventoryItem[];

    return {
      products: [...fixedInventoryItems, ...selectedInventoryItems],
      validation
    };
  }

  /**
   * Verifica si un combo requiere selecciones del usuario
   * (tiene al menos un grupo de elección)
   */
  static requiresUserSelection(combo: Combo): boolean {
    return this.getChoiceGroups(combo).length > 0;
  }

  /**
   * Obtiene descripción legible de las reglas de selección de un combo
   */
  static getComboSelectionDescription(combo: Combo): string {
    const fixed = this.getFixedProducts(combo);
    const choiceGroups = this.getChoiceGroups(combo);

    let description = '';

    if (fixed.length > 0) {
      description += 'Incluye: ';
      // Aquí necesitarías nombres de productos, pero como es domain layer
      // solo trabajamos con IDs. La UI puede enriquecer esto.
      description += `${fixed.length} productos fijos`;
    }

    if (choiceGroups.length > 0) {
      if (description) description += '. ';
      description += `Debes elegir ${choiceGroups.length} opciones`;
    }

    return description;
  }
}
