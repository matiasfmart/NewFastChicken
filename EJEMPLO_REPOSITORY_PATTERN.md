# 🏗️ Ejemplo Práctico: Repository Pattern para NewFastChicken

## Implementación Paso a Paso

Este documento muestra cómo refactorizar tu aplicación de **Firebase acoplado** a **Repository Pattern desacoplado**.

---

## 📁 Nueva Estructura de Carpetas

```
src/
├── repositories/
│   ├── interfaces/
│   │   ├── IOrderRepository.ts
│   │   ├── IComboRepository.ts
│   │   └── IInventoryRepository.ts
│   ├── implementations/
│   │   ├── firebase/
│   │   │   ├── FirebaseOrderRepository.ts
│   │   │   ├── FirebaseComboRepository.ts
│   │   │   └── FirebaseInventoryRepository.ts
│   │   └── mock/  (para tests)
│   │       ├── MockOrderRepository.ts
│   │       └── ...
│   └── index.ts
├── dtos/  (Data Transfer Objects)
│   ├── CreateOrderDTO.ts
│   ├── UpdateOrderDTO.ts
│   └── ...
├── providers/
│   └── RepositoryProvider.tsx
└── hooks/
    └── useRepositories.ts
```

---

## 1️⃣ Definir Interfaces (Contratos)

### `src/repositories/interfaces/IOrderRepository.ts`

```typescript
import type { Order } from '@/lib/types';
import type { CreateOrderDTO, UpdateOrderDTO } from '@/dtos';

/**
 * Interfaz para el repositorio de Orders.
 * Define QUÉ operaciones se pueden hacer, NO CÓMO se hacen.
 */
export interface IOrderRepository {
  /**
   * Crea una nueva orden con actualización de stock
   */
  createWithStockUpdate(order: CreateOrderDTO): Promise<Order>;

  /**
   * Busca órdenes por rango de fechas
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;

  /**
   * Busca orden por ID
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Obtiene todas las órdenes
   */
  getAll(): Promise<Order[]>;

  /**
   * Actualiza una orden
   */
  update(id: string, data: UpdateOrderDTO): Promise<Order>;

  /**
   * Elimina una orden
   */
  delete(id: string): Promise<void>;
}
```

### `src/repositories/interfaces/IComboRepository.ts`

```typescript
import type { Combo } from '@/lib/types';
import type { CreateComboDTO, UpdateComboDTO } from '@/dtos';

export interface IComboRepository {
  getAll(): Promise<Combo[]>;
  getById(id: string): Promise<Combo | null>;
  create(combo: CreateComboDTO): Promise<Combo>;
  update(id: string, data: UpdateComboDTO): Promise<Combo>;
  delete(id: string): Promise<void>;
}
```

### `src/repositories/interfaces/IInventoryRepository.ts`

```typescript
import type { InventoryItem } from '@/lib/types';
import type { CreateInventoryDTO, UpdateInventoryDTO } from '@/dtos';

export interface IInventoryRepository {
  getAll(): Promise<InventoryItem[]>;
  getById(id: string): Promise<InventoryItem | null>;
  create(item: CreateInventoryDTO): Promise<InventoryItem>;
  update(id: string, data: UpdateInventoryDTO): Promise<InventoryItem>;
  updateStock(id: string, quantity: number): Promise<InventoryItem>;
  delete(id: string): Promise<void>;
}
```

---

## 2️⃣ Crear DTOs (Data Transfer Objects)

### `src/dtos/order.dto.ts`

```typescript
import type { OrderItem, DeliveryType } from '@/lib/types';

/**
 * DTO para crear una orden
 * Ya NO usa Timestamp de Firebase, solo Date nativo
 */
export interface CreateOrderDTO {
  items: OrderItem[];
  totalAmount: number;
  deliveryType: DeliveryType;
  createdAt: Date;  // ← Date, NO Timestamp
}

export interface UpdateOrderDTO {
  items?: OrderItem[];
  totalAmount?: number;
  deliveryType?: DeliveryType;
}
```

### `src/dtos/combo.dto.ts`

```typescript
import type { ComboProduct, DiscountRule } from '@/lib/types';

export interface CreateComboDTO {
  name: string;
  description: string;
  price: number;
  type?: string;
  products: ComboProduct[];
  discounts?: DiscountRule[];
}

export interface UpdateComboDTO extends Partial<CreateComboDTO> {}
```

---

## 3️⃣ Implementar Repositorio de Firebase

### `src/repositories/implementations/firebase/FirebaseOrderRepository.ts`

```typescript
import { IOrderRepository } from '@/repositories/interfaces/IOrderRepository';
import { CreateOrderDTO, UpdateOrderDTO } from '@/dtos';
import type { Order } from '@/lib/types';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  runTransaction
} from 'firebase/firestore';

/**
 * Implementación de IOrderRepository usando Firebase Firestore
 * TODA la lógica de Firebase está ENCAPSULADA aquí
 */
export class FirebaseOrderRepository implements IOrderRepository {
  private readonly collectionName = 'orders';

  constructor(private firestore: Firestore) {}

  /**
   * Crea orden con actualización de stock (transacción)
   */
  async createWithStockUpdate(orderDTO: CreateOrderDTO): Promise<Order> {
    return await runTransaction(this.firestore, async (transaction) => {
      // 1. Verificar stock
      for (const orderItem of orderDTO.items) {
        const { combo, quantity } = orderItem;

        if (combo.products) {
          for (const productInCombo of combo.products) {
            const itemRef = doc(this.firestore, "inventory", productInCombo.productId);
            const itemDoc = await transaction.get(itemRef);

            if (!itemDoc.exists()) {
              throw new Error(`Producto ${productInCombo.productId} no existe`);
            }

            const currentStock = itemDoc.data().stock;
            if (currentStock < productInCombo.quantity * quantity) {
              throw new Error(`Stock insuficiente para: ${itemDoc.data().name}`);
            }
          }
        }
      }

      // 2. Decrementar stock
      for (const orderItem of orderDTO.items) {
        const { combo, quantity } = orderItem;
        if (combo.products) {
          for (const productInCombo of combo.products) {
            const itemRef = doc(this.firestore, "inventory", productInCombo.productId);
            const itemDoc = await transaction.get(itemRef);
            const newStock = itemDoc.data()!.stock - productInCombo.quantity * quantity;
            transaction.update(itemRef, { stock: newStock });
          }
        }
      }

      // 3. Crear orden
      const orderRef = doc(collection(this.firestore, this.collectionName));

      // ✅ Convertir Date → Timestamp solo aquí (encapsulado)
      const firestoreData = {
        ...orderDTO,
        createdAt: Timestamp.fromDate(orderDTO.createdAt)
      };

      transaction.set(orderRef, firestoreData);

      // 4. Retornar Order con Date (NO Timestamp)
      return {
        ...orderDTO,
        id: orderRef.id,
        createdAt: orderDTO.createdAt  // ← Date, no Timestamp
      };
    });
  }

  /**
   * Busca órdenes por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    // ✅ Conversión Date → Timestamp encapsulada
    const q = query(
      collection(this.firestore, this.collectionName),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<', Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(q);

    // ✅ Conversión Timestamp → Date encapsulada
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate()  // ← Timestamp → Date
      } as Order;
    });
  }

  async findById(id: string): Promise<Order | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt.toDate()
    } as Order;
  }

  async getAll(): Promise<Order[]> {
    const snapshot = await getDocs(collection(this.firestore, this.collectionName));

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate()
      } as Order;
    });
  }

  async update(id: string, updateDTO: UpdateOrderDTO): Promise<Order> {
    const docRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(docRef, updateDTO as any);

    // Refetch para retornar actualizado
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Order ${id} not found after update`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
```

---

## 4️⃣ Crear Provider de Repositorios

### `src/providers/RepositoryProvider.tsx`

```typescript
"use client";

import React, { createContext, useMemo } from 'react';
import { useFirestore } from '@/hooks/use-firebase';
import { FirebaseOrderRepository } from '@/repositories/implementations/firebase/FirebaseOrderRepository';
import { FirebaseComboRepository } from '@/repositories/implementations/firebase/FirebaseComboRepository';
import { FirebaseInventoryRepository } from '@/repositories/implementations/firebase/FirebaseInventoryRepository';
import type { IOrderRepository } from '@/repositories/interfaces/IOrderRepository';
import type { IComboRepository } from '@/repositories/interfaces/IComboRepository';
import type { IInventoryRepository } from '@/repositories/interfaces/IInventoryRepository';

interface RepositoryContextType {
  orderRepository: IOrderRepository;
  comboRepository: IComboRepository;
  inventoryRepository: IInventoryRepository;
}

export const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export const RepositoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();

  // ✅ Crear repositorios solo una vez
  const repositories = useMemo(() => {
    if (!firestore) {
      // Puedes retornar mocks o null-objects aquí
      throw new Error('Firestore not initialized');
    }

    return {
      orderRepository: new FirebaseOrderRepository(firestore),
      comboRepository: new FirebaseComboRepository(firestore),
      inventoryRepository: new FirebaseInventoryRepository(firestore)
    };
  }, [firestore]);

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
};
```

---

## 5️⃣ Crear Hooks Personalizados

### `src/hooks/useRepositories.ts`

```typescript
"use client";

import { useContext } from 'react';
import { RepositoryContext } from '@/providers/RepositoryProvider';

/**
 * Hook para acceder al repositorio de Orders
 */
export const useOrderRepository = () => {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useOrderRepository must be used within RepositoryProvider');
  }
  return context.orderRepository;
};

/**
 * Hook para acceder al repositorio de Combos
 */
export const useComboRepository = () => {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useComboRepository must be used within RepositoryProvider');
  }
  return context.comboRepository;
};

/**
 * Hook para acceder al repositorio de Inventory
 */
export const useInventoryRepository = () => {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useInventoryRepository must be used within RepositoryProvider');
  }
  return context.inventoryRepository;
};
```

---

## 6️⃣ Actualizar Layout Principal

### `src/app/layout.tsx`

```typescript
import { FirebaseProvider } from '@/components/firebase-provider';
import { RepositoryProvider } from '@/providers/RepositoryProvider';  // ← Nuevo
import { OrderProvider } from '@/context/OrderContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <FirebaseProvider>
          <RepositoryProvider>  {/* ← Nuevo */}
            <OrderProvider>
              {children}
            </OrderProvider>
          </RepositoryProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
```

---

## 7️⃣ Refactorizar Dashboard (ANTES vs DESPUÉS)

### ❌ ANTES (Acoplado a Firebase)

```typescript
// src/app/admin/dashboard/page.tsx
'use client';
import { useFirestore } from '@/hooks/use-firebase';
import { collection, query, where, Timestamp, getDocs } from 'firebase/firestore';
import { getCombos } from '@/services/comboService';
import { getInventoryItems } from '@/services/inventoryService';

export default function AdminDashboardPage() {
  const firestore = useFirestore();  // ← Firestore directo

  useEffect(() => {
    const fetchData = async () => {
      if (!firestore) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // ❌ Query de Firebase en el componente
      const ordersQuery = query(
        collection(firestore, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(today)),  // ← Timestamp
        where('createdAt', '<', Timestamp.fromDate(tomorrow))
      );

      const [ordersSnapshot, combosData, inventoryData] = await Promise.all([
        getDocs(ordersQuery),  // ← Firebase directo
        getCombos(firestore),  // ← Firestore como parámetro
        getInventoryItems(firestore)
      ]);

      const orders = ordersSnapshot.docs.map(d => ({
        ...d.data(),
        id: d.id,
        createdAt: d.data().createdAt.toDate()  // ← Conversión manual
      } as Order));

      setOrders(orders);
      setCombos(combosData);
      setInventory(inventoryData);
    };

    fetchData();
  }, [firestore]);

  // ...
}
```

### ✅ DESPUÉS (Desacoplado con Repository)

```typescript
// src/app/admin/dashboard/page.tsx
'use client';
import { useOrderRepository, useComboRepository, useInventoryRepository } from '@/hooks/useRepositories';

export default function AdminDashboardPage() {
  // ✅ Repositorios en lugar de Firestore directo
  const orderRepo = useOrderRepository();
  const comboRepo = useComboRepository();
  const inventoryRepo = useInventoryRepository();

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // ✅ Sin Firebase imports, sin Timestamp, sin queries
      const [orders, combos, inventory] = await Promise.all([
        orderRepo.findByDateRange(today, tomorrow),  // ← Método del repo
        comboRepo.getAll(),
        inventoryRepo.getAll()
      ]);

      setOrders(orders);
      setCombos(combos);
      setInventory(inventory);
    };

    fetchData();
  }, [orderRepo, comboRepo, inventoryRepo]);

  // ...
}
```

**Beneficios:**
- ✅ Sin imports de Firebase
- ✅ Sin manejo de `Timestamp`
- ✅ Sin queries complejas
- ✅ Fácil de testear (mockear repositorios)
- ✅ Cambiar BD = cambiar implementación de repo solamente

---

## 8️⃣ Tests Unitarios (Fáciles con Mocks)

### `src/repositories/implementations/mock/MockOrderRepository.ts`

```typescript
import { IOrderRepository } from '@/repositories/interfaces/IOrderRepository';
import { CreateOrderDTO } from '@/dtos';
import type { Order } from '@/lib/types';

/**
 * Mock repository para tests
 * NO necesita Firebase, Firestore, ni nada externo
 */
export class MockOrderRepository implements IOrderRepository {
  private orders: Order[] = [];
  private nextId = 1;

  async createWithStockUpdate(orderDTO: CreateOrderDTO): Promise<Order> {
    const order: Order = {
      ...orderDTO,
      id: `mock-${this.nextId++}`
    };
    this.orders.push(order);
    return order;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return this.orders.filter(order =>
      order.createdAt >= startDate && order.createdAt < endDate
    );
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) || null;
  }

  async getAll(): Promise<Order[]> {
    return [...this.orders];
  }

  async update(id: string, data: any): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    this.orders[index] = { ...this.orders[index], ...data };
    return this.orders[index];
  }

  async delete(id: string): Promise<void> {
    this.orders = this.orders.filter(o => o.id !== id);
  }

  // Helper para tests
  clear() {
    this.orders = [];
  }
}
```

### Test de Dashboard

```typescript
// __tests__/admin/dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import { RepositoryContext } from '@/providers/RepositoryProvider';
import { MockOrderRepository } from '@/repositories/implementations/mock/MockOrderRepository';
import { MockComboRepository } from '@/repositories/implementations/mock/MockComboRepository';
import { MockInventoryRepository } from '@/repositories/implementations/mock/MockInventoryRepository';

describe('AdminDashboardPage', () => {
  it('should render dashboard with data', async () => {
    // ✅ Crear mocks
    const orderRepo = new MockOrderRepository();
    const comboRepo = new MockComboRepository();
    const inventoryRepo = new MockInventoryRepository();

    // ✅ Datos de prueba
    await orderRepo.createWithStockUpdate({
      items: [],
      totalAmount: 100,
      deliveryType: 'local',
      createdAt: new Date()
    });

    // ✅ Renderizar con mocks
    render(
      <RepositoryContext.Provider value={{ orderRepo, comboRepo, inventoryRepo }}>
        <AdminDashboardPage />
      </RepositoryContext.Provider>
    );

    // ✅ Verificar renderizado
    await waitFor(() => {
      expect(screen.getByText('Bienvenido, Administrador')).toBeInTheDocument();
    });
  });
});
```

**Beneficio:** Tests rápidos sin Firebase Emulator

---

## 9️⃣ Cambiar de Firebase a PostgreSQL (Ejemplo)

Si decides migrar a PostgreSQL, solo necesitas:

### `src/repositories/implementations/postgres/PostgresOrderRepository.ts`

```typescript
import { IOrderRepository } from '@/repositories/interfaces/IOrderRepository';
import { PrismaClient } from '@prisma/client';

export class PostgresOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async createWithStockUpdate(orderDTO: CreateOrderDTO): Promise<Order> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Verificar stock
      // 2. Decrementar stock
      // 3. Crear orden

      return await tx.order.create({
        data: {
          items: orderDTO.items,
          totalAmount: orderDTO.totalAmount,
          deliveryType: orderDTO.deliveryType,
          createdAt: orderDTO.createdAt
        }
      });
    });
  }

  // ... resto de métodos usando Prisma
}
```

### Cambiar en el Provider

```typescript
// src/providers/RepositoryProvider.tsx

// ❌ Antes
const repositories = {
  orderRepository: new FirebaseOrderRepository(firestore),
  // ...
};

// ✅ Después
const repositories = {
  orderRepository: new PostgresOrderRepository(prisma),  // ← Solo cambiar esto
  // ...
};
```

**Y listo.** Todos los componentes siguen funcionando sin cambios.

---

## 📊 Resumen de Beneficios

| Aspecto | Antes | Después |
|---------|-------|---------|
| Acoplamiento | Firebase en 13 archivos | Firebase en 3 archivos (repos) |
| Cambiar BD | 50-100h | 15-25h |
| Tests | Difícil (emulator) | Fácil (mocks) |
| Componentes | Conocen Firebase | Conocen interfaces |
| Mantenibilidad | Baja | Alta |

---

## ✅ Checklist de Implementación

- [ ] Crear carpeta `repositories/interfaces/`
- [ ] Definir interfaces (IOrderRepository, etc.)
- [ ] Crear carpeta `dtos/`
- [ ] Definir DTOs (CreateOrderDTO, etc.)
- [ ] Implementar FirebaseOrderRepository
- [ ] Implementar otros repositorios de Firebase
- [ ] Crear RepositoryProvider
- [ ] Crear hooks (useOrderRepository, etc.)
- [ ] Actualizar layout con RepositoryProvider
- [ ] Refactorizar Dashboard
- [ ] Refactorizar Inventory page
- [ ] Refactorizar Combos page
- [ ] Refactorizar OrderContext
- [ ] Crear mocks para tests
- [ ] Escribir tests unitarios
- [ ] Documentar arquitectura

---

**¿Quieres que implemente este patrón en tu aplicación?**
