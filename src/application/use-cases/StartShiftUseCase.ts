/**
 * Start Shift Use Case - Caso de Uso de Aplicación
 *
 * ✅ ARQUITECTURA LIMPIA - CAPA DE APLICACIÓN:
 * - Orquesta el proceso de iniciar una jornada
 * - Valida que no haya jornadas abiertas
 * - Crea nueva jornada con estado inicial
 */

import type { Shift } from '@/lib/types';
import type { IShiftRepository } from '@/domain/repositories/IShiftRepository';

export interface StartShiftInput {
  employeeId: string;
  employeeName: string;
  initialCash: number;
}

export class StartShiftUseCase {
  constructor(private shiftRepository: IShiftRepository) {}

  /**
   * Ejecuta el caso de uso de iniciar jornada
   *
   * @param input - Datos de la jornada a iniciar
   * @returns La jornada creada
   * @throws Error si ya hay una jornada abierta
   */
  async execute(input: StartShiftInput): Promise<Shift> {
    // 1. Verificar que no haya jornadas abiertas
    const activeShift = await this.shiftRepository.getActiveShift();
    if (activeShift) {
      throw new Error(
        `Ya existe una jornada activa iniciada por ${activeShift.employeeName}. Debe cerrar la jornada actual antes de iniciar una nueva.`
      );
    }

    // 2. Crear nueva jornada
    const newShiftData = {
      employeeId: input.employeeId,
      employeeName: input.employeeName,
      startedAt: new Date(),
      status: 'open' as const,
      initialCash: input.initialCash,
      totalOrders: 0,
      totalRevenue: 0,
    };

    const shift = await this.shiftRepository.create(newShiftData);
    return shift;
  }
}
