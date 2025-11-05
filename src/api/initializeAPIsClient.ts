import { OrderAPI } from './orders';
import { ComboAPI } from './combos';
import { InventoryAPI } from './inventory';
import { ShiftAPI } from './shifts';
import { EmployeeAPI } from './employees';
import {
  HttpInventoryRepository,
  HttpComboRepository,
  HttpOrderRepository,
  HttpShiftRepository,
  HttpEmployeeRepository
} from '@/infrastructure/repositories/http';

/**
 * Inicializa todas las APIs con HTTP repositories
 *
 * ✅ ARQUITECTURA PARA CLIENT COMPONENTS:
 * - Los HTTP repositories llaman a API Routes
 * - Las API Routes se ejecutan en el servidor con MongoDB
 * - Los Contexts pueden usar las APIs sin conocer HTTP
 *
 * ✅ CUANDO SEPARES BACKEND:
 * - Solo cambias la baseUrl en los HTTP repositories
 * - Los Contexts NO cambian (siguen usando ShiftAPI, OrderAPI, etc)
 *
 * ⚠️ IMPORTANTE:
 * - Este archivo NO importa MongoDB ni Firebase
 * - Seguro para usar en Client Components
 *
 * Llamar esto una vez en Client Components (useEffect inicial)
 */
export function initializeAPIsWithHttp(baseUrl: string = '') {
  // Crear instancias de los HTTP repositories
  const inventoryRepository = new HttpInventoryRepository(baseUrl ? `${baseUrl}/api/inventory` : '/api/inventory');
  const comboRepository = new HttpComboRepository(baseUrl ? `${baseUrl}/api/combos` : '/api/combos');
  const orderRepository = new HttpOrderRepository(baseUrl ? `${baseUrl}/api/orders` : '/api/orders');
  const shiftRepository = new HttpShiftRepository(baseUrl ? `${baseUrl}/api/shifts` : '/api/shifts');
  const employeeRepository = new HttpEmployeeRepository(baseUrl ? `${baseUrl}/api/employees` : '/api/employees');

  // Inyectar repositories en las APIs
  InventoryAPI.setRepository(inventoryRepository);
  ComboAPI.setRepository(comboRepository);
  OrderAPI.setRepository(orderRepository);
  ShiftAPI.setRepository(shiftRepository);
  EmployeeAPI.setRepository(employeeRepository);
}
