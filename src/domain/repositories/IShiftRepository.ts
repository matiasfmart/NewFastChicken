import type { Shift } from '@/lib/types';

/**
 * Interfaz para el repositorio de Jornadas (Shifts)
 * Define las operaciones para gestionar turnos de trabajo
 */
export interface IShiftRepository {
  /**
   * Obtiene la jornada actualmente abierta (si existe)
   */
  getActiveShift(): Promise<Shift | null>;

  /**
   * Crea una nueva jornada
   */
  create(shift: Omit<Shift, 'id'>): Promise<Shift>;

  /**
   * Actualiza una jornada existente
   */
  update(id: string, shift: Partial<Omit<Shift, 'id'>>): Promise<void>;

  /**
   * Obtiene todas las jornadas
   */
  getAll(): Promise<Shift[]>;

  /**
   * Obtiene jornadas por rango de fechas
   */
  getByDateRange(startDate: Date, endDate: Date): Promise<Shift[]>;

  /**
   * Obtiene una jornada por ID
   */
  getById(id: string): Promise<Shift | null>;
}
