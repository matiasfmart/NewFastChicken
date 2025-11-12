/**
 * Create Discount Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta la creación de un nuevo descuento
 * - Valida datos de entrada
 * - Coordina con el repositorio
 */

import type { DiscountRule } from '@/lib/types';
import type { IDiscountRepository } from '@/domain/repositories/IDiscountRepository';

export interface CreateDiscountInput {
  type: 'cross-promotion' | 'simple';  // Tipo de descuento
  percentage: number;
  appliesTo: 'order' | 'combos';  // Alcance del descuento
  comboIds?: string[];            // Combos específicos (cuando appliesTo === 'combos')

  // ✅ OBLIGATORIO: Condición temporal
  temporalType: 'weekday' | 'date';  // Tipo temporal
  value: string;                     // Día (0-6) o Fecha (YYYY-MM-DD)

  // ✅ OPCIONAL: Rango horario
  timeRange?: {
    start: string;
    end: string;
  };

  // Para tipo 'cross-promotion'
  // ✅ NOTA: triggerComboId puede ser igual a targetComboId para simular "2x1"
  triggerComboId?: string;
  targetComboId?: string;
}

export class CreateDiscountUseCase {
  constructor(private discountRepository: IDiscountRepository) {}

  /**
   * Ejecuta el caso de uso de crear descuento
   *
   * @param input - Datos del descuento a crear
   * @returns El descuento creado
   * @throws Error si los datos son inválidos
   */
  async execute(input: CreateDiscountInput): Promise<DiscountRule> {
    // Validaciones básicas
    if (input.percentage <= 0 || input.percentage > 100) {
      throw new Error('El porcentaje debe estar entre 1 y 100');
    }

    // ✅ Validación de alcance
    if (input.appliesTo === 'combos' && (!input.comboIds || input.comboIds.length === 0)) {
      throw new Error('Cuando el descuento aplica a combos específicos, debe seleccionar al menos un combo');
    }

    // ✅ Validación de condición temporal (OBLIGATORIA)
    if (!input.temporalType) {
      throw new Error('Debe especificar el tipo temporal (weekday o date)');
    }

    if (!input.value) {
      throw new Error('Debe especificar el valor temporal (día de semana 0-6 o fecha YYYY-MM-DD)');
    }

    // Validación específica del valor temporal
    if (input.temporalType === 'weekday') {
      const day = parseInt(input.value);
      if (isNaN(day) || day < 0 || day > 6) {
        throw new Error('El día de semana debe ser un número entre 0 (Domingo) y 6 (Sábado)');
      }
    }

    if (input.temporalType === 'date') {
      // Validar formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(input.value)) {
        throw new Error('La fecha debe tener el formato YYYY-MM-DD');
      }
    }

    // Validaciones específicas por tipo de descuento
    if (input.type === 'cross-promotion') {
      if (!input.triggerComboId || !input.targetComboId) {
        throw new Error('El descuento por promoción cruzada requiere especificar triggerComboId y targetComboId');
      }
      // ✅ PERMITIDO: triggerComboId === targetComboId (para simular 2x1)
    }

    // Crear descuento
    const discount = await this.discountRepository.create(input);

    return discount;
  }
}
