/**
 * End Shift Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta el proceso de cerrar una jornada
 * - Calcula diferencias de caja
 * - Actualiza estado de la jornada
 */

import type { Shift } from '@/lib/types';
import type { IShiftRepository } from '@/domain/repositories/IShiftRepository';

export interface EndShiftInput {
  shiftId: string;
  actualCash: number;
}

export class EndShiftUseCase {
  constructor(private shiftRepository: IShiftRepository) {}

  /**
   * Ejecuta el caso de uso de cerrar jornada
   *
   * @param input - Datos para cerrar la jornada
   * @returns La jornada actualizada
   * @throws Error si no existe la jornada o ya está cerrada
   */
  async execute(input: EndShiftInput): Promise<Shift> {
    // 1. Obtener jornada actual
    const shift = await this.shiftRepository.getById(input.shiftId);
    if (!shift) {
      throw new Error('No se encontró la jornada especificada');
    }

    if (shift.status === 'closed') {
      throw new Error('Esta jornada ya ha sido cerrada');
    }

    // 2. Calcular diferencia de caja
    const expectedCash = shift.initialCash + shift.totalRevenue;
    const cashDifference = input.actualCash - expectedCash;

    // 3. Actualizar jornada
    const updatedShiftData = {
      endedAt: new Date(),
      status: 'closed' as const,
      actualCash: input.actualCash,
      cashDifference: cashDifference,
    };

    await this.shiftRepository.update(input.shiftId, updatedShiftData);

    // 4. Retornar jornada actualizada
    const updatedShift = await this.shiftRepository.getById(input.shiftId);
    if (!updatedShift) {
      throw new Error('Error al obtener la jornada actualizada');
    }

    return updatedShift;
  }
}
