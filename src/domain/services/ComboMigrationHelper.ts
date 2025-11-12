/**
 * Combo Migration Helper - Domain Service
 *
 * 🟦 DOMAIN LAYER - Pure Business Logic
 * - Migra combos antiguos sin selectionType a la nueva estructura
 * - Garantiza retrocompatibilidad
 * - Funciones puras sin efectos secundarios
 */

import type { Combo, ComboProduct } from '@/lib/types';

export class ComboMigrationHelper {
  /**
   * Migra un combo antiguo (sin selectionType) a la nueva estructura
   * Por defecto, asigna 'choice' a todos los productos del mismo tipo
   * y 'fixed' si es el único de su tipo
   */
  static migrateCombo(combo: Combo): Combo {
    // Si ya tiene selectionType definido, no migrar
    const hasNewStructure = combo.products.some(p => 'selectionType' in p);
    if (hasNewStructure) {
      return combo;
    }

    // Estrategia de migración:
    // - Agrupar productos por tipo (product, drink, side)
    // - Si hay > 1 del mismo tipo → 'choice' con choiceGroup = tipo
    // - Si hay = 1 del mismo tipo → 'fixed'

    const migratedProducts: ComboProduct[] = combo.products.map(p => {
      // Si ya tiene selectionType, mantenerlo
      if ('selectionType' in p) {
        return p as ComboProduct;
      }

      // Por defecto: todos los productos se marcan como 'choice' con su tipo como grupo
      // El admin luego puede ajustarlos manualmente
      return {
        ...p,
        selectionType: 'choice' as const,
        choiceGroup: 'producto' // Grupo genérico, el admin debe configurarlo
      };
    });

    return {
      ...combo,
      products: migratedProducts
    };
  }

  /**
   * Migra múltiples combos
   */
  static migrateCombos(combos: Combo[]): Combo[] {
    return combos.map(combo => this.migrateCombo(combo));
  }

  /**
   * Verifica si un combo necesita migración
   */
  static needsMigration(combo: Combo): boolean {
    return !combo.products.some(p => 'selectionType' in p);
  }

  /**
   * Estrategia inteligente de migración basada en análisis del combo
   * Analiza los productos y sugiere una configuración razonable
   */
  static smartMigration(combo: Combo, allInventory: Array<{ id: string; type: string }>): Combo {
    if (!this.needsMigration(combo)) {
      return combo;
    }

    // Agrupar productos por tipo
    const productsByType = new Map<string, ComboProduct[]>();

    combo.products.forEach(p => {
      const inventoryItem = allInventory.find(i => i.id === p.productId);
      if (!inventoryItem) return;

      const type = inventoryItem.type;
      if (!productsByType.has(type)) {
        productsByType.set(type, []);
      }
      productsByType.get(type)!.push(p);
    });

    // Aplicar estrategia:
    // - Si solo hay 1 producto de un tipo → 'fixed'
    // - Si hay > 1 del mismo tipo → 'choice' con choiceGroup = nombre del tipo
    const migratedProducts: ComboProduct[] = combo.products.map(p => {
      const inventoryItem = allInventory.find(i => i.id === p.productId);
      if (!inventoryItem) {
        return {
          ...p,
          selectionType: 'fixed' as const
        };
      }

      const type = inventoryItem.type;
      const productsOfSameType = productsByType.get(type) || [];

      if (productsOfSameType.length === 1) {
        // Único de su tipo → fixed
        return {
          ...p,
          selectionType: 'fixed' as const
        };
      } else {
        // Múltiples del mismo tipo → choice con grupo por tipo
        const groupName = type === 'product' ? 'principal' :
                         type === 'drink' ? 'bebida' :
                         type === 'side' ? 'guarnicion' : type;

        return {
          ...p,
          selectionType: 'choice' as const,
          choiceGroup: groupName
        };
      }
    });

    return {
      ...combo,
      products: migratedProducts
    };
  }
}
