/**
 * API Client para usar desde Client Components
 *
 * ⚠️ IMPORTANTE: En producción (standalone build), los Client Components
 * NO pueden importar APIs internas directamente. Deben usar HTTP fetch.
 *
 * Este cliente funciona tanto en dev como en producción.
 */

import type { Combo, InventoryItem, DiscountRule, Order, Shift, Employee } from '@/lib/types';
import type { CreateComboDTO, UpdateComboDTO, CreateInventoryDTO, UpdateInventoryDTO } from '@/dtos';

/**
 * Obtiene la URL base de la API
 * En desarrollo y producción usa rutas relativas
 */
function getApiUrl(path: string): string {
  return `/api${path}`;
}

/**
 * Cliente HTTP para Combos
 */
export const CombosClient = {
  async getAll(): Promise<Combo[]> {
    const res = await fetch(getApiUrl('/combos'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch combos: ${res.statusText}`);
    }

    return res.json();
  },

  async create(dto: CreateComboDTO): Promise<Combo> {
    const res = await fetch(getApiUrl('/combos'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      throw new Error(`Failed to create combo: ${res.statusText}`);
    }

    return res.json();
  },

  async update(id: string, updates: UpdateComboDTO): Promise<void> {
    const res = await fetch(getApiUrl('/combos'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update combo: ${res.statusText}`);
    }
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(getApiUrl(`/combos?id=${id}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete combo: ${res.statusText}`);
    }
  },
};

/**
 * Cliente HTTP para Inventory
 */
export const InventoryClient = {
  async getAll(): Promise<InventoryItem[]> {
    const res = await fetch(getApiUrl('/inventory'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch inventory: ${res.statusText}`);
    }

    return res.json();
  },

  async create(dto: CreateInventoryDTO): Promise<InventoryItem> {
    const res = await fetch(getApiUrl('/inventory'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      throw new Error(`Failed to create inventory item: ${res.statusText}`);
    }

    return res.json();
  },

  async update(id: string, updates: UpdateInventoryDTO): Promise<void> {
    const res = await fetch(getApiUrl('/inventory'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update inventory item: ${res.statusText}`);
    }
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(getApiUrl(`/inventory?id=${id}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete inventory item: ${res.statusText}`);
    }
  },
};

/**
 * Cliente HTTP para Discounts
 */
export const DiscountsClient = {
  async getAll(): Promise<DiscountRule[]> {
    const res = await fetch(getApiUrl('/discounts'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch discounts: ${res.statusText}`);
    }

    return res.json();
  },
};

/**
 * Cliente HTTP para Orders
 */
export const OrdersClient = {
  async getAll(): Promise<Order[]> {
    const res = await fetch(getApiUrl('/orders'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.statusText}`);
    }

    return res.json();
  },
};

/**
 * Cliente HTTP para Shifts
 */
export const ShiftsClient = {
  async getAll(): Promise<Shift[]> {
    const res = await fetch(getApiUrl('/shifts'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch shifts: ${res.statusText}`);
    }

    return res.json();
  },

  async getByDateRange(from: Date, to: Date): Promise<Shift[]> {
    const res = await fetch(getApiUrl(`/shifts?from=${from.toISOString()}&to=${to.toISOString()}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch shifts by date range: ${res.statusText}`);
    }

    return res.json();
  },
};

/**
 * Cliente HTTP para Employees
 */
export const EmployeesClient = {
  async getAll(): Promise<Employee[]> {
    const res = await fetch(getApiUrl('/employees'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch employees: ${res.statusText}`);
    }

    return res.json();
  },

  async create(dto: Omit<Employee, 'id'>): Promise<Employee> {
    const res = await fetch(getApiUrl('/employees'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      throw new Error(`Failed to create employee: ${res.statusText}`);
    }

    return res.json();
  },

  async update(id: string, updates: Partial<Employee>): Promise<void> {
    const res = await fetch(getApiUrl('/employees'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update employee: ${res.statusText}`);
    }
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(getApiUrl(`/employees?id=${id}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete employee: ${res.statusText}`);
    }
  },
};
