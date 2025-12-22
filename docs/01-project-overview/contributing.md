# Guía de Contribución - FastChicken POS

Esta guía te ayudará a contribuir al proyecto respetando la arquitectura limpia y escalable que mantenemos.

## 📋 Antes de Empezar

### Lee Primero

1. **[Overview del Proyecto](./overview.md)** - Comprende el contexto y objetivos
2. **[Arquitectura](./ARCHITECTURE.md)** - Entiende la estructura de capas
3. **[Prompts para IA](./prompts.md)** - Si usas agentes de IA

### Requisitos

- Node.js 18+
- npm 9+
- MongoDB 6+ (para desarrollo)
- Git

## 🚀 Setup del Proyecto

```bash
# 1. Clonar repositorio
git clone [repository-url]
cd NewFastChicken

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de MongoDB

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en navegador
# http://localhost:9002
```

## 🏗️ Arquitectura: Reglas de Oro

### 1. Regla de Dependencia

```
Presentation → Application → Domain ← Infrastructure
```

**Nunca violes esta regla:**
- ❌ `domain/` NO puede importar de ninguna otra capa
- ❌ `application/` NO puede importar de `infrastructure/` ni `presentation/`
- ✅ `infrastructure/` y `presentation/` SÍ pueden importar de `domain/`
- ✅ `presentation/` SÍ puede importar de `application/`

### 2. Ubicación del Código

| Tipo de Código | Ubicación Correcta | ❌ NO Poner Aquí |
|----------------|-------------------|-------------------|
| Business Logic (funciones puras) | `domain/services/` | `context/`, `components/` |
| Orquestación de operaciones | `application/use-cases/` | `context/`, `components/` |
| Interfaces de datos | `domain/repositories/` | `infrastructure/` |
| Implementación MongoDB | `infrastructure/repositories/mongodb/` | `domain/`, `application/` |
| Implementación HTTP | `infrastructure/repositories/http/` | `domain/`, `application/` |
| UI State Management | `context/` | `domain/`, `application/` |
| Componentes React | `components/` | `domain/`, `application/` |
| Entidades/Types | `lib/types.ts` | Dispersos en archivos |
| DTOs | `dtos/` | `lib/types.ts` |

### 3. Checklist de Arquitectura

Antes de hacer commit, verifica:

- [ ] ¿Está el business logic en `domain/services/` y no en contexts?
- [ ] ¿Los Use Cases solo orquestan y no tienen lógica de negocio?
- [ ] ¿Domain NO tiene imports de infrastructure ni presentation?
- [ ] ¿Los repositories implementan interfaces de `domain/repositories/`?
- [ ] ¿El código es portable (puede separarse a backend independiente)?
- [ ] ¿Hay tests para business logic nueva?

## 📝 Flujo de Trabajo

### 1. Crear Feature Branch

```bash
git checkout -b feature/nombre-feature
# o
git checkout -b fix/nombre-bug
```

### 2. Desarrollo

#### Para Agregar Nueva Funcionalidad

1. **Analiza**: ¿En qué capa debe vivir cada pieza?
2. **Types primero**: Define entidades en `lib/types.ts`
3. **Domain layer**: Business logic en `domain/services/`
4. **Application layer**: Use Cases si hay orquestación compleja
5. **Infrastructure**: Implementa repositories si accedes a datos
6. **Presentation**: UI components y contexts

#### Ejemplo: Agregar Sistema de Mesas

```typescript
// 1. Types (lib/types.ts)
export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved';
  occupiedSince?: Date;
  currentOrderId?: string;
}

// 2. Repository Interface (domain/repositories/ITableRepository.ts)
export interface ITableRepository {
  getAll(): Promise<Table[]>;
  getById(id: string): Promise<Table | null>;
  update(id: string, data: Partial<Table>): Promise<void>;
}

// 3. Use Case (application/use-cases/AssignTableToOrderUseCase.ts)
export class AssignTableToOrderUseCase {
  constructor(
    private tableRepo: ITableRepository,
    private orderRepo: IOrderRepository
  ) {}

  async execute(orderId: string, tableNumber: number) {
    // Orquestación de múltiples operaciones
    const table = await this.tableRepo.getByNumber(tableNumber);
    if (table.status !== 'available') {
      throw new Error('Mesa no disponible');
    }
    await this.orderRepo.assignTable(orderId, table.id);
    await this.tableRepo.update(table.id, {
      status: 'occupied',
      occupiedSince: new Date(),
      currentOrderId: orderId
    });
  }
}

// 4. Implementation (infrastructure/repositories/mongodb/MongoDBTableRepository.ts)
export class MongoDBTableRepository implements ITableRepository {
  // Implementación específica de MongoDB
}

// 5. Context (context/TableContext.tsx)
export const TableProvider = ({ children }) => {
  // Solo UI state + orchestration
  const assignTable = async (orderId: string, tableNumber: number) => {
    await assignTableUseCase.execute(orderId, tableNumber);
    // Actualizar estado local UI
    refreshTables();
  };
};
```

### 3. Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm test -- --watch

# Coverage
npm test -- --coverage
```

#### Tests por Capa

```typescript
// Tests de domain/services/ (funciones puras, sin mocks)
describe('DiscountService', () => {
  it('should apply discount if within time range', () => {
    const rule: DiscountRule = {
      type: 'weekday',
      percentage: 20,
      timeRange: { start: '18:00', end: '22:00' }
    };
    const date = new Date('2024-01-08T19:00:00'); // 19:00
    expect(DiscountService.isDiscountRuleActive(rule, date)).toBe(true);
  });
});

// Tests de application/use-cases/ (con mocks de repos)
describe('FinalizeOrderUseCase', () => {
  it('should create order and update shift totals', async () => {
    const mockOrderRepo = {
      createWithStockUpdate: jest.fn().mockResolvedValue(mockOrder)
    };
    const mockShiftRepo = {
      update: jest.fn()
    };
    const useCase = new FinalizeOrderUseCase(mockOrderRepo, mockShiftRepo);

    await useCase.execute(orderInput);

    expect(mockOrderRepo.createWithStockUpdate).toHaveBeenCalled();
    expect(mockShiftRepo.update).toHaveBeenCalled();
  });
});
```

### 4. Commit

```bash
# Formato de commits (Conventional Commits)
git add .
git commit -m "feat: add table management system"
# o
git commit -m "fix: correct stock calculation for individual items"
# o
git commit -m "refactor: move discount logic to domain layer"
```

#### Tipos de Commits

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactor sin cambiar funcionalidad
- `docs`: Cambios en documentación
- `test`: Agregar o modificar tests
- `chore`: Cambios en build, deps, etc

### 5. Pull Request

1. Push de tu branch
```bash
git push origin feature/nombre-feature
```

2. Crea PR en GitHub con:
   - **Título**: Descripción clara
   - **Descripción**:
     - ¿Qué hace esta PR?
     - ¿Por qué es necesaria?
     - ¿Qué capas arquitectónicas se modificaron?
     - Screenshots si aplica
   - **Checklist**:
     - [ ] Tests pasan
     - [ ] Arquitectura respetada
     - [ ] Código documentado
     - [ ] Sin breaking changes (o explícitamente documentados)

## 🎨 Estándares de Código

### TypeScript

```typescript
// ✅ BIEN: Tipos explícitos
function calculateDiscount(price: number, percentage: number): number {
  return price * (1 - percentage / 100);
}

// ❌ MAL: Tipos implícitos any
function calculateDiscount(price, percentage) {
  return price * (1 - percentage / 100);
}
```

### Naming Conventions

```typescript
// Interfaces de repositories: IXxxRepository
export interface IOrderRepository { }

// Use Cases: XxxUseCase
export class FinalizeOrderUseCase { }

// Services: XxxService
export class DiscountService { }

// Components: PascalCase
export function OrderPanel() { }

// Contexts: XxxContext, useXxx
export const OrderContext = createContext();
export function useOrder() { }

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;
```

### Estructura de Archivos

```typescript
// Orden de imports
// 1. External libraries
import React from 'react';
import { format } from 'date-fns';

// 2. Internal types
import type { Order, OrderItem } from '@/lib/types';

// 3. Domain layer
import { DiscountService } from '@/domain/services/DiscountService';

// 4. Application layer
import { FinalizeOrderUseCase } from '@/application/use-cases';

// 5. Infrastructure layer
import { OrderAPI } from '@/api';

// 6. Presentation layer
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';

// 7. Styles
import styles from './OrderPanel.module.css';
```

### Comentarios y Documentación

```typescript
/**
 * Calcula el descuento aplicable a un combo según las reglas activas
 *
 * 🟦 DOMAIN LAYER - Business Logic Pura
 *
 * @param combo - Combo al que se aplicará el descuento
 * @param currentDate - Fecha actual para validar reglas de tiempo
 * @returns Descuento activo o null si no aplica ninguno
 *
 * @example
 * ```typescript
 * const discount = DiscountService.getActiveDiscountForCombo(combo);
 * if (discount) {
 *   const finalPrice = price * (1 - discount.percentage / 100);
 * }
 * ```
 */
export static getActiveDiscountForCombo(
  combo: Combo,
  currentDate: Date = new Date()
): { rule: DiscountRule; percentage: number } | null {
  // Implementación...
}
```

## 🐛 Debugging

### Logs Estructurados

```typescript
// ✅ BIEN: Logs informativos
console.log('📦 Processing order:', { orderId, itemCount: items.length });
console.error('❌ Failed to create order:', { error: error.message, orderId });

// ❌ MAL: Logs no informativos
console.log('here');
console.log(data);
```

### Source Maps

En desarrollo, los source maps están habilitados. Usa las DevTools de Chrome para debuggear.

## 🔍 Code Review

### Como Reviewer

Verifica:
1. ✅ Arquitectura respetada (regla de dependencia)
2. ✅ Business logic en la capa correcta
3. ✅ Tests incluidos para nueva funcionalidad
4. ✅ Sin código duplicado
5. ✅ Nombres descriptivos
6. ✅ Documentación clara

### Feedback Constructivo

```markdown
# ✅ Bueno
"Sugerencia: Esta lógica de validación debería estar en `domain/services/`
en lugar de `OrderContext` para mantener la separación de capas.
¿Podrías crear un `OrderValidationService`?"

# ❌ Malo
"Esto está mal. Movelo."
```

## 📚 Recursos

### Documentación Interna
- [Arquitectura](./ARCHITECTURE.md)
- [Overview](./overview.md)
- [Prompts para IA](./prompts.md)

### Lecturas Recomendadas
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

### Herramientas
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev/)

## ❓ FAQ

### ¿Dónde pongo la validación de formularios?
En el component que contiene el formulario. La validación de UI es responsabilidad de presentation layer.

### ¿Dónde pongo la validación de business rules?
En `domain/services/`. Ejemplo: validar que un descuento no supere 50% va en DiscountService.

### ¿Cuándo creo un Use Case vs usar Repository directamente?
Crea un Use Case si:
- Orquestas múltiples repositories
- La operación tiene múltiples pasos
- La lógica puede reutilizarse entre frontend y backend

Usa Repository directamente si es una operación simple CRUD desde context.

### ¿Puedo usar hooks en Use Cases?
NO. Use Cases deben ser clases/funciones puras de TypeScript sin dependencias de React.

### ¿Cómo accedo a la base de datos desde el frontend?
NO accedes directamente. El frontend usa `infrastructure/repositories/http/` que llama a API routes, y las API routes usan `infrastructure/repositories/mongodb/`.

## 🆘 Ayuda

Si tienes dudas:
1. Revisa la documentación en `docs/`
2. Busca ejemplos similares en el código existente
3. Usa los prompts de `docs/prompts.md` con un agente de IA
4. Abre un issue en GitHub con la etiqueta `question`

---

**¡Gracias por contribuir a FastChicken POS!** 🍗

**Última actualización:** 2025-01-08
