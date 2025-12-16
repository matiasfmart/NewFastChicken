/**
 * Combo Service - Domain Service
 *
 * 🟦 DOMAIN LAYER - Pure Business Logic
 * - Lógica de negocio pura para gestión de combos
 * - Funciones puras sin dependencias externas
 * - 100% portable y testeable
 * - ✅ Sistema completamente genérico: soporta múltiples productos por categoría
 */

import type { Combo, ComboProduct, InventoryItem, InventoryCategory } from '@/lib/types';

/**
 * Grupo de selección: productos elegibles del mismo tipo
 * - type: categoría del inventario ('product', 'drink', 'side')
 * - products: productos elegibles de esta categoría
 * - requiredCount: cuántos productos debe seleccionar el usuario (siempre 1 por ahora)
 */
export interface SelectionGroup {
  type: InventoryCategory;
  label: string;
  products: ComboProduct[];
  inventoryItems: InventoryItem[];
  requiredCount: number; // Cuántos productos debe elegir el usuario (futuro: puede ser > 1)
}

/**
 * Estructura analizada de un combo
 */
export interface ComboStructure {
  fixedProducts: ComboProduct[];
  selectableByType: Map<InventoryCategory, ComboProduct[]>;
}

/**
 * Resultado de validación de selecciones
 */
export interface ValidatedComboSelection {
  isValid: boolean;
  errors: string[];
  selectedProducts: InventoryItem[];
  allProducts: InventoryItem[]; // Fixed + Selected
  allComboProducts: Array<{ // Para construir OrderItem.comboProducts
    productId: string;
    name: string;
    type: InventoryCategory;
    quantity: number;
    isFixed: boolean;
  }>;
}

export class ComboService {
  /**
   * Analiza la estructura de un combo separando productos fijos vs elegibles
   * ✅ 100% genérico: funciona con cualquier cantidad de productos por categoría
   *
   * @example
   * Combo con:
   * - 2 piezas de pollo (fijo)
   * - 1 hamburguesa (fijo)
   * - Papas fritas (fijo)
   * - Ensalada (elegible) O Arroz (elegible)
   * - Coca Cola (elegible) O Sprite (elegible)
   *
   * Retorna:
   * {
   *   fixedProducts: [pollo, pollo, hamburguesa, papas],
   *   selectableByType: Map {
   *     'side' => [ensalada, arroz],
   *     'drink' => [coca, sprite]
   *   }
   * }
   */
  static analyzeComboStructure(
    combo: Combo,
    allInventory: InventoryItem[]
  ): ComboStructure {
    // Productos fijos (isFixed: true o undefined por retrocompatibilidad)
    const fixedProducts = combo.products.filter(p => p.isFixed ?? true);

    // Productos elegibles (isFixed: false)
    const selectableProducts = combo.products.filter(p => !(p.isFixed ?? true));

    // ✅ Agrupar productos elegibles por tipo de inventario
    const selectableByType = new Map<InventoryCategory, ComboProduct[]>();

    selectableProducts.forEach(p => {
      const inventoryItem = allInventory.find(inv => inv.id === p.productId);
      if (!inventoryItem) return;

      const type = inventoryItem.type;
      if (!selectableByType.has(type)) {
        selectableByType.set(type, []);
      }
      selectableByType.get(type)!.push(p);
    });

    return { fixedProducts, selectableByType };
  }

  /**
   * Valida que las selecciones del usuario sean completas
   * ✅ Valida por categoría completa, no asume solo 1 producto
   *
   * @param combo - El combo que se está configurando
   * @param structure - Estructura analizada del combo
   * @param selections - Mapa de selecciones del usuario: Map<tipo, productId>
   * @param allInventory - Inventario completo para resolver productIds
   *
   * @returns Resultado de validación con productos seleccionados y errores
   */
  static validateComboSelections(
    combo: Combo,
    structure: ComboStructure,
    selections: Map<InventoryCategory, string>, // type -> productId seleccionado
    allInventory: InventoryItem[]
  ): ValidatedComboSelection {
    const errors: string[] = [];

    // ✅ Validar que se haya seleccionado UN producto por cada tipo elegible
    // (en el futuro se puede extender para requerir múltiples selecciones)
    structure.selectableByType.forEach((products, type) => {
      if (!selections.has(type)) {
        const label = this.getTypeLabel(type);
        errors.push(`Debe seleccionar una opción para ${label}`);
      }
    });

    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        selectedProducts: [],
        allProducts: [],
        allComboProducts: []
      };
    }

    // ✅ Obtener productos fijos del inventario (pueden ser múltiples del mismo tipo)
    const fixedInventoryItems = structure.fixedProducts
      .map(p => allInventory.find(inv => inv.id === p.productId))
      .filter(Boolean) as InventoryItem[];

    // ✅ Obtener productos seleccionados del inventario
    const selectedProducts = Array.from(selections.values())
      .map(productId => allInventory.find(p => p.id === productId))
      .filter(Boolean) as InventoryItem[];

    // ✅ Combinar todos los productos (fijos + seleccionados)
    const allProducts = [...fixedInventoryItems, ...selectedProducts];

    // ✅ Construir array para OrderItem.comboProducts (incluye quantity de cada producto)
    const fixedProductIds = structure.fixedProducts.map(p => p.productId);
    const allComboProducts = this.buildComboProductsArray(
      combo,
      allProducts,
      fixedProductIds,
      allInventory
    );

    return {
      isValid: true,
      errors: [],
      selectedProducts,
      allProducts,
      allComboProducts
    };
  }

  /**
   * Construye el array de productos del combo para OrderItem.comboProducts
   * ✅ Incluye quantity de cada producto (crítico para combos con 2x pollo, etc.)
   *
   * @param combo - Combo completo (para obtener quantities)
   * @param allProducts - Productos fijos + seleccionados (InventoryItem[])
   * @param fixedProductIds - IDs de productos fijos (para marcar isFixed)
   * @param allInventory - Inventario completo (para resolver metadata)
   *
   * @returns Array para OrderItem.comboProducts con metadata completa
   */
  static buildComboProductsArray(
    combo: Combo,
    allProducts: InventoryItem[],
    fixedProductIds: string[],
    allInventory: InventoryItem[]
  ): Array<{
    productId: string;
    name: string;
    type: InventoryCategory;
    quantity: number;
    isFixed: boolean;
  }> {
    return allProducts.map(item => {
      // ✅ Buscar el ComboProduct original para obtener quantity
      const comboProduct = combo.products.find(p => p.productId === item.id);
      const quantity = comboProduct?.quantity ?? 1;

      return {
        productId: item.id,
        name: item.name,
        type: item.type,
        quantity,
        isFixed: fixedProductIds.includes(item.id)
      };
    });
  }

  /**
   * Obtiene la etiqueta legible de un tipo de inventario
   * ✅ Centralizado para consistencia en toda la app
   */
  static getTypeLabel(type: InventoryCategory): string {
    const labels: Record<InventoryCategory, string> = {
      'product': 'Producto Principal',
      'drink': 'Bebida',
      'side': 'Guarnición'
    };
    return labels[type] || type;
  }

  /**
   * Agrupa productos elegibles por tipo para renderizado en UI
   * ✅ Helper para componentes React
   */
  static getSelectionGroups(
    structure: ComboStructure,
    allInventory: InventoryItem[]
  ): SelectionGroup[] {
    const groups: SelectionGroup[] = [];

    structure.selectableByType.forEach((products, type) => {
      const inventoryItems = products
        .map(p => allInventory.find(inv => inv.id === p.productId))
        .filter(Boolean) as InventoryItem[];

      groups.push({
        type,
        label: this.getTypeLabel(type),
        products,
        inventoryItems,
        requiredCount: 1 // Por ahora siempre 1, pero preparado para futuro
      });
    });

    return groups;
  }
}
