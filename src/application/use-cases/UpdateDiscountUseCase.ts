/**
 * Update Discount Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta la actualización de un descuento
 * - Valida que el descuento existe
 * - Valida datos de entrada
 */

import type { DiscountRule } from '@/lib/types';
import type { IDiscountRepository } from '@/domain/repositories/IDiscountRepository';

export interface UpdateDiscountInput {
  id: string;
  type?: 'quantity' | 'cross-promotion' | 'simple';  // Tipo de descuento
  percentage?: number;
  appliesTo?: 'order' | 'combos';  // Alcance del descuento
  comboIds?: string[];             // Combos específicos (cuando appliesTo === 'combos')

  // ✅ Condición temporal
  temporalType?: 'weekday' | 'date';  // Tipo temporal
  value?: string;                     // Día (0-6) o Fecha (YYYY-MM-DD)

  // ✅ Rango horario (opcional)
  timeRange?: {
    start: string;
    end: string;
  };

  // Para tipo 'quantity'
  requiredQuantity?: number;
  discountedQuantity?: number;

  // Para tipo 'cross-promotion'
  triggerComboId?: string;
  targetComboId?: string;
}

export class UpdateDiscountUseCase {
  constructor(private discountRepository: IDiscountRepository) {}

  /**
   * Ejecuta el caso de uso de actualizar descuento
   *
   * @param input - Datos del descuento a actualizar
   * @returns El descuento actualizado
   * @throws Error si el descuento no existe o los datos son inválidos
   */
  async execute(input: UpdateDiscountInput): Promise<DiscountRule> {
    // Verificar que existe
    const existing = await this.discountRepository.getById(input.id);
    if (!existing) {
      throw new Error(`Descuento con id ${input.id} no encontrado`);
    }

    // Determinar el tipo (puede venir en el input o usar el existente)
    const type = input.type || existing.type;

    // Validaciones básicas
    if (input.percentage !== undefined && (input.percentage <= 0 || input.percentage > 100)) {
      throw new Error('El porcentaje debe estar entre 1 y 100');
    }

    // ✅ Validación de alcance
    if (input.appliesTo === 'combos' && (!input.comboIds || input.comboIds.length === 0)) {
      throw new Error('Cuando el descuento aplica a combos específicos, debe seleccionar al menos un combo');
    }

    // ✅ Validación de condición temporal (si se proporciona)
    if (input.temporalType !== undefined && !input.value) {
      throw new Error('Debe especificar el valor temporal (día de semana 0-6 o fecha YYYY-MM-DD)');
    }

    // Validación específica del valor temporal
    if (input.temporalType === 'weekday' && input.value !== undefined) {
      const day = parseInt(input.value);
      if (isNaN(day) || day < 0 || day > 6) {
        throw new Error('El día de semana debe ser un número entre 0 (Domingo) y 6 (Sábado)');
      }
    }

    if (input.temporalType === 'date' && input.value !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(input.value)) {
        throw new Error('La fecha debe tener el formato YYYY-MM-DD');
      }
    }

    // ✅ Validaciones específicas por tipo de descuento (solo si el tipo es 'quantity')
    if (type === 'quantity') {
      if (input.requiredQuantity !== undefined && input.requiredQuantity < 1) {
        throw new Error('La cantidad requerida debe ser mayor a 0');
      }

      if (input.discountedQuantity !== undefined && input.discountedQuantity < 1) {
        throw new Error('La cantidad con descuento debe ser mayor a 0');
      }
    }

    // Actualizar
    await this.discountRepository.update(input.id, input);

    // Retornar actualizado
    const updated = await this.discountRepository.getById(input.id);
    if (!updated) {
      throw new Error('Error al obtener el descuento actualizado');
    }

    return updated;
  }
}
