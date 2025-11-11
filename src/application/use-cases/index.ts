/**
 * Use Cases - Exportaciones centrales
 *
 * Los Use Cases representan los casos de uso de la aplicación.
 * Cada Use Case orquesta repositorios y servicios de dominio
 * para cumplir un objetivo específico del negocio.
 */

export { FinalizeOrderUseCase } from './FinalizeOrderUseCase';
export type { FinalizeOrderInput } from './FinalizeOrderUseCase';

export { StartShiftUseCase } from './StartShiftUseCase';
export type { StartShiftInput } from './StartShiftUseCase';

export { EndShiftUseCase } from './EndShiftUseCase';
export type { EndShiftInput } from './EndShiftUseCase';

export { CreateDiscountUseCase } from './CreateDiscountUseCase';
export type { CreateDiscountInput } from './CreateDiscountUseCase';

export { UpdateDiscountUseCase } from './UpdateDiscountUseCase';
export type { UpdateDiscountInput } from './UpdateDiscountUseCase';

export { DeleteDiscountUseCase } from './DeleteDiscountUseCase';
export type { DeleteDiscountInput } from './DeleteDiscountUseCase';

export { AssignDiscountToComboUseCase } from './AssignDiscountToComboUseCase';
export type { AssignDiscountToComboInput } from './AssignDiscountToComboUseCase';
