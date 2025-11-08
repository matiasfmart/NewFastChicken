# Arquitectura FastChicken POS

## Visión General

FastChicken POS sigue **Clean Architecture** (Arquitectura Limpia) con clara separación de responsabilidades, diseñada para ser **escalable** y **fácilmente separable** en múltiples proyectos (backend independiente, admin frontend separado, etc.).

## Estructura de Capas

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION                          │
│  (React Components, Contexts, Pages)                    │
│  - components/  - context/  - app/                      │
└─────────────────────────────────────────────────────────┘
                          ↓ usa
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION                           │
│  (Use Cases - Orquestación de casos de uso)            │
│  - application/use-cases/                               │
│    * FinalizeOrderUseCase                               │
│    * StartShiftUseCase                                  │
│    * EndShiftUseCase                                    │
└─────────────────────────────────────────────────────────┘
                          ↓ usa
┌─────────────────────────────────────────────────────────┐
│                     DOMAIN                              │
│  (Business Logic Pura + Contratos)                      │
│  - domain/                                              │
│    ├── repositories/  (Interfaces/Contratos)            │
│    └── services/      (Business Logic)                  │
│        └── DiscountService                              │
│  - lib/types.ts       (Entidades)                       │
│  - dtos/              (Data Transfer Objects)           │
└─────────────────────────────────────────────────────────┘
                          ↓ implementado por
┌─────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                         │
│  (Implementaciones específicas)                         │
│  - infrastructure/repositories/                         │
│    ├── mongodb/    (Backend - DB directa)               │
│    └── http/       (Frontend - API calls)               │
│  - app/api/        (Next.js API Routes)                 │
└─────────────────────────────────────────────────────────┘
```

## Estructura de Carpetas

```
src/
├── domain/                       # 🟦 DOMAIN LAYER (Portable)
│   ├── repositories/             # Interfaces (contratos)
│   │   ├── IOrderRepository.ts
│   │   ├── IComboRepository.ts
│   │   ├── IInventoryRepository.ts
│   │   ├── IShiftRepository.ts
│   │   └── IEmployeeRepository.ts
│   │
│   └── services/                 # Business Logic (funciones puras)
│       └── DiscountService.ts    # Lógica de descuentos
│
├── lib/                          # 🟦 DOMAIN LAYER (Portable)
│   └── types.ts                  # Entidades del dominio
│
├── dtos/                         # 🟦 DOMAIN LAYER (Portable)
│   ├── CreateOrderDTO.ts
│   ├── UpdateInventoryDTO.ts
│   └── index.ts
│
├── application/                  # 🟩 APPLICATION LAYER (Portable)
│   └── use-cases/                # Casos de uso orquestados
│       ├── FinalizeOrderUseCase.ts
│       ├── StartShiftUseCase.ts
│       ├── EndShiftUseCase.ts
│       └── index.ts
│
├── infrastructure/               # 🟨 INFRASTRUCTURE LAYER
│   └── repositories/
│       ├── mongodb/              # Backend implementation
│       │   ├── MongoDBOrderRepository.ts
│       │   ├── MongoDBComboRepository.ts
│       │   └── ...
│       │
│       └── http/                 # Frontend implementation
│           ├── HttpOrderRepository.ts
│           ├── HttpComboRepository.ts
│           └── ...
│
├── context/                      # 🟥 PRESENTATION LAYER
│   ├── OrderContext.tsx          # State management + UI orchestration
│   └── ShiftContext.tsx
│
├── components/                   # 🟥 PRESENTATION LAYER
│   ├── cashier/                  # Cajero UI
│   ├── admin/                    # Admin UI (futuro: separable)
│   └── ui/                       # UI primitives
│
├── app/                          # 🟥 PRESENTATION LAYER
│   ├── page.tsx                  # Cashier pages
│   ├── admin/                    # Admin pages
│   └── api/                      # 🟨 Backend API routes
│
└── api/                          # 🟨 INFRASTRUCTURE LAYER
    └── *.ts                      # API client adapters
```

## Reglas de Dependencia

### ✅ Permitido (flujo correcto):
- **Presentation** → Application → Domain → Infrastructure ❌
- **Presentation** → Application → Domain ✅
- **Application** → Domain ✅
- **Infrastructure** → Domain ✅
- **Domain** → NADA (completamente independiente) ✅

### ❌ Prohibido:
- Domain → Infrastructure ❌
- Domain → Application ❌
- Domain → Presentation ❌

## Componentes Portables (Shared Core)

Estos módulos son **100% portables** y pueden ser compartidos entre backend y frontend:

### 1. `domain/` - Contratos y Business Logic
- **repositories/** - Interfaces que definen contratos
- **services/** - Lógica de negocio pura (sin dependencias)

### 2. `lib/types.ts` - Entidades del Dominio
- Definiciones de tipos TypeScript
- Entidades del negocio (Order, Combo, Inventory, etc.)

### 3. `dtos/` - Data Transfer Objects
- Objetos para transferir datos entre capas
- Validación de datos

### 4. `application/use-cases/` - Casos de Uso
- Orquestación de repositorios y servicios
- Lógica de aplicación (no de negocio)
- **Portable**: Puede ejecutarse en backend o frontend

## Ejemplo de Flujo: Finalizar Orden

```typescript
// 1. PRESENTATION LAYER (OrderContext.tsx)
const finalizeOrder = async () => {
  // Solo maneja UI state y coordina
  const order = await finalizeOrderUseCase.execute({
    shiftId: currentShift?.id,
    items: orderItems,
    deliveryType,
    subtotal,
    discount,
    total
  });

  // Actualizar estado local UI
  setCompletedOrders([...orders, order]);
  clearOrder();
};

// 2. APPLICATION LAYER (FinalizeOrderUseCase.ts)
class FinalizeOrderUseCase {
  async execute(input) {
    // Orquesta múltiples operaciones
    const order = await this.orderRepo.createWithStockUpdate(input);
    await this.shiftRepo.incrementTotals(input.shiftId, input.total);
    return order;
  }
}

// 3. INFRASTRUCTURE LAYER (MongoDBOrderRepository.ts)
class MongoDBOrderRepository implements IOrderRepository {
  async createWithStockUpdate(order) {
    // Implementación específica de MongoDB
    // Transacción atómica
    const session = await startSession();
    // ... crear orden y actualizar stock
  }
}
```

## Plan de Separación (Futuro)

Cuando quieras separar en proyectos independientes:

### Backend API (Proyecto separado)
```
backend-api/
├── src/
│   ├── domain/           ← Copiar completo
│   ├── lib/types.ts      ← Copiar
│   ├── dtos/             ← Copiar
│   ├── application/      ← Copiar completo
│   ├── infrastructure/
│   │   └── repositories/mongodb/  ← Copiar
│   └── routes/           ← Mover desde app/api/
```

### Admin Frontend (Proyecto separado)
```
admin-app/
├── src/
│   ├── domain/           ← Copiar completo
│   ├── lib/types.ts      ← Copiar
│   ├── dtos/             ← Copiar
│   ├── application/      ← Copiar completo
│   ├── infrastructure/
│   │   └── repositories/http/  ← Copiar
│   ├── components/admin/ ← Mover
│   └── app/admin/        ← Mover
```

### Cashier Frontend (Proyecto actual)
```
cashier-app/
├── src/
│   ├── domain/           ← Mantener
│   ├── lib/types.ts      ← Mantener
│   ├── dtos/             ← Mantener
│   ├── application/      ← Mantener
│   ├── infrastructure/
│   │   └── repositories/http/  ← Mantener
│   ├── components/cashier/  ← Mantener
│   └── context/          ← Mantener
```

## Ventajas de esta Arquitectura

### ✅ Escalabilidad
- Agregar features nuevas = agregar Use Cases
- Business logic centralizada en `domain/services/`
- Fácil de testear cada capa independientemente

### ✅ Separabilidad
- Código portable claramente identificado
- Use Cases funcionan igual en backend y frontend
- Interfaces de repositorios permiten cambiar implementaciones

### ✅ Mantenibilidad
- Responsabilidades claras por capa
- Cambios en UI no afectan business logic
- Cambios en DB no afectan casos de uso

### ✅ Testabilidad
- Domain services = funciones puras (fácil de testear)
- Use Cases = lógica aislada (fácil de mockear repos)
- Contexts = solo orchestration (testear con mocks de Use Cases)

## Ejemplos de Uso

### Usar un Use Case en el Frontend (Context)

```typescript
import { FinalizeOrderUseCase } from '@/application/use-cases';
import { OrderAPI, ShiftAPI } from '@/api';

// Crear instancia del Use Case con repositories HTTP
const finalizeOrderUseCase = new FinalizeOrderUseCase(
  OrderAPI,   // HTTP repository
  ShiftAPI    // HTTP repository
);

// Usar en el Context
const order = await finalizeOrderUseCase.execute({...});
```

### Usar un Use Case en el Backend (API Route)

```typescript
import { FinalizeOrderUseCase } from '@/application/use-cases';
import { MongoDBOrderRepository, MongoDBShiftRepository } from '@/infrastructure';

// Crear instancia del Use Case con repositories MongoDB
const finalizeOrderUseCase = new FinalizeOrderUseCase(
  new MongoDBOrderRepository(db),   // MongoDB repository
  new MongoDBShiftRepository(db)    // MongoDB repository
);

// Usar en la API route
const order = await finalizeOrderUseCase.execute({...});
```

## Notas Importantes

1. **Domain** nunca debe importar de otras capas
2. **Use Cases** solo coordinan, no contienen business logic
3. **Business Logic** va en `domain/services/` (funciones puras)
4. **Contexts** son para UI state management + orchestration
5. **Repositories** siempre implementan interfaces del domain

---

**Última actualización:** 2025-01-08
**Versión de arquitectura:** 2.0 (con Application Layer)
