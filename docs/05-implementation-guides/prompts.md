# AI Agent Prompts - FastChicken POS

Este documento contiene prompts templates para que cualquier agente de IA pueda trabajar en este proyecto sin contexto previo, respetando siempre la arquitectura limpia y escalable.

---

## 📋 Índice

1. [Prompt: Agregar Nueva Funcionalidad](#prompt-agregar-nueva-funcionalidad)
2. [Prompt: Refactorizar Código Existente](#prompt-refactorizar-código-existente)
3. [Prompt: Debugging y Análisis](#prompt-debugging-y-análisis)
4. [Prompt: Crear Tests](#prompt-crear-tests)
5. [Prompt: Optimización de Performance](#prompt-optimización-de-performance)
6. [Prompt: Documentación](#prompt-documentación)
7. [Prompt: Separación de Proyectos (Backend/Admin/Cashier)](#prompt-separación-de-proyectos-backendadmincashier)
8. [Prompt: Migración de Base de Datos](#prompt-migración-de-base-de-datos)

---

## 🚀 Prompt: Agregar Nueva Funcionalidad

### Template Base

```
Eres un desarrollador senior experto en Clean Architecture trabajando en FastChicken POS,
un sistema de punto de venta para restaurante de comida rápida.

CONTEXTO DEL PROYECTO:
- Aplicación: Next.js 15.3.3 con App Router + TypeScript
- Base de datos: MongoDB (production)
- Arquitectura: Clean Architecture con 4 capas claramente separadas
- Stack: React 19, Tailwind CSS, Shadcn UI, date-fns
- Patrón: Repository Pattern con interfaces en domain layer

ARQUITECTURA ACTUAL (CRÍTICO - DEBE RESPETARSE):

📁 Estructura de Capas:
```
src/
├── domain/                    # 🟦 DOMAIN (100% portable, sin dependencias)
│   ├── repositories/          # Interfaces/Contratos
│   └── services/              # Business Logic pura
│
├── application/               # 🟩 APPLICATION (casos de uso orquestados)
│   └── use-cases/             # FinalizeOrderUseCase, StartShiftUseCase, etc
│
├── infrastructure/            # 🟨 INFRASTRUCTURE (implementaciones)
│   └── repositories/
│       ├── mongodb/           # Backend - acceso directo a DB
│       └── http/              # Frontend - API calls
│
├── context/                   # 🟥 PRESENTATION (React state + UI orchestration)
├── components/                # 🟥 PRESENTATION (UI components)
└── app/                       # 🟥 PRESENTATION (Next.js pages + API routes)
```

REGLAS DE DEPENDENCIA (INQUEBRANTABLES):
✅ Presentation → Application → Domain
✅ Infrastructure → Domain
❌ Domain NO puede depender de nada (cero imports de otras capas)
❌ Application NO puede depender de Infrastructure ni Presentation
❌ Business Logic SIEMPRE va en domain/services/ (funciones puras)
❌ Use Cases solo ORQUESTAN, no contienen lógica de negocio

ENTIDADES PRINCIPALES:
- Order: Pedidos con items, descuentos, delivery type
- Combo: Combos del menú con productos incluidos
- InventoryItem: Productos individuales (pollo, bebidas, guarniciones)
- Shift: Jornadas de trabajo de cajeros
- Employee: Empleados del sistema
- DiscountRule: Reglas de descuento (por día, horario, cantidad, cross-promotion)

FUNCIONALIDAD A IMPLEMENTAR:
[DESCRIPCIÓN DETALLADA DE LA FEATURE]

INSTRUCCIONES:
1. Analiza dónde debe ir cada pieza de código según la arquitectura
2. Crea Use Cases en application/use-cases/ si se necesita orquestar múltiples operaciones
3. Pon business logic pura en domain/services/ (funciones sin dependencias)
4. Usa interfaces de domain/repositories/ para acceso a datos
5. Mantén UI orchestration en contexts/ (no pongas lógica de negocio ahí)
6. Asegúrate de que el código sea portable (separable a backend/frontend independientes)
7. Documenta claramente qué capa pertenece cada archivo nuevo

ENTREGABLES:
- Estructura de carpetas propuesta con explicación de por qué va en cada capa
- Código implementado respetando Clean Architecture
- Actualización de tipos en lib/types.ts si es necesario
- DTOs en dtos/ si se necesitan para transferir datos
- Tests unitarios para business logic (domain/services/)
- Documentación de la funcionalidad

VALIDACIÓN FINAL:
Antes de terminar, verifica:
- [ ] ¿El domain/ NO tiene imports de infrastructure ni presentation?
- [ ] ¿La business logic está en domain/services/ y no en contexts?
- [ ] ¿Los Use Cases solo orquestan y no contienen lógica de negocio?
- [ ] ¿El código es portable a un backend separado?
- [ ] ¿Se respetan las reglas de dependencia?
```

### Ejemplo de Uso del Template

```
[... copiar template base ...]

FUNCIONALIDAD A IMPLEMENTAR:
Necesito implementar un sistema de **mesas** para el restaurante.

Requerimientos:
- Los cajeros deben poder asignar pedidos a mesas específicas
- Las mesas tienen estados: disponible, ocupada, reservada
- Un pedido puede estar asociado a una mesa o ser para llevar/delivery
- Necesito ver qué mesas están ocupadas y cuánto tiempo llevan
- Al finalizar el pedido, la mesa debe quedar disponible automáticamente
```

---

## 🔄 Prompt: Refactorizar Código Existente

```
Eres un desarrollador senior experto en Clean Architecture trabajando en FastChicken POS.

CONTEXTO DEL PROYECTO:
[... mismo contexto que el template anterior ...]

CÓDIGO A REFACTORIZAR:
[RUTA DEL ARCHIVO O DESCRIPCIÓN DEL CÓDIGO]

PROBLEMA ACTUAL:
[DESCRIPCIÓN DEL PROBLEMA]
Ejemplo: "El OrderContext tiene demasiada lógica de negocio mezclada con state management"

OBJETIVO DEL REFACTOR:
- Separar business logic de UI orchestration
- Mover lógica a las capas correctas según Clean Architecture
- Mantener funcionamiento idéntico (sin breaking changes)
- Mejorar testabilidad

INSTRUCCIONES:
1. Analiza el código actual e identifica violaciones de arquitectura
2. Propón estructura de refactor explicando qué va a cada capa
3. Crea Use Cases si hay orquestación compleja
4. Extrae business logic a domain/services/
5. Deja solo UI orchestration en contexts/
6. Asegura backward compatibility
7. Proporciona plan de migración paso a paso

VALIDACIÓN:
- [ ] ¿El refactor respeta las reglas de dependencia?
- [ ] ¿La funcionalidad sigue siendo idéntica?
- [ ] ¿El código es más testeable?
- [ ] ¿Se puede aplicar sin romper nada?
```

---

## 🐛 Prompt: Debugging y Análisis

```
Eres un desarrollador senior experto en Clean Architecture trabajando en FastChicken POS.

CONTEXTO DEL PROYECTO:
[... mismo contexto ...]

PROBLEMA A ANALIZAR:
[DESCRIPCIÓN DEL BUG O COMPORTAMIENTO INESPERADO]

ERROR/COMPORTAMIENTO:
[MENSAJE DE ERROR O LOGS]

INSTRUCCIONES:
1. Analiza el flujo completo desde la capa de presentación hasta infrastructure
2. Identifica en qué capa está el problema
3. Verifica si hay violaciones de arquitectura que causen el bug
4. Propón solución que respete Clean Architecture
5. Si el bug es resultado de arquitectura incorrecta, propón refactor

ÁREAS A REVISAR:
- ¿Hay lógica de negocio en contexts que debería estar en domain/services/?
- ¿Los Use Cases están orquestando correctamente?
- ¿Las interfaces de repositories están bien definidas?
- ¿Hay dependencias circulares?
- ¿Se está accediendo a infrastructure desde domain?

ENTREGABLES:
- Diagnóstico del problema con explicación de causa raíz
- Solución propuesta respetando arquitectura
- Código corregido con explicación
- Tests para prevenir regresión
```

---

## ✅ Prompt: Crear Tests

```
Eres un desarrollador senior experto en Clean Architecture y Testing trabajando en FastChicken POS.

CONTEXTO DEL PROYECTO:
[... mismo contexto ...]

CÓDIGO A TESTEAR:
[RUTA Y DESCRIPCIÓN DEL CÓDIGO]

INSTRUCCIONES:
1. Identifica la capa arquitectónica del código
2. Crea tests apropiados según la capa:
   - domain/services/: Tests unitarios puros (sin mocks, funciones puras)
   - application/use-cases/: Tests con mocks de repositories
   - infrastructure/repositories/: Tests de integración
   - contexts/: Tests con mocks de Use Cases
   - components/: Tests de React Testing Library

COBERTURA REQUERIDA:
- Casos felices (happy path)
- Casos de error
- Edge cases
- Validaciones de negocio

FRAMEWORKS:
- Jest para tests unitarios
- React Testing Library para components
- MSW para mocks de API (si aplica)

VALIDACIÓN:
- [ ] ¿Los tests no tienen dependencias de infrastructure?
- [ ] ¿Los tests de domain son funciones puras?
- [ ] ¿Los mocks están bien configurados?
- [ ] ¿Hay cobertura de edge cases?
```

---

## ⚡ Prompt: Optimización de Performance

```
Eres un desarrollador senior experto en Clean Architecture y Performance trabajando en FastChicken POS.

CONTEXTO DEL PROYECTO:
[... mismo contexto ...]

ÁREA A OPTIMIZAR:
[DESCRIPCIÓN DEL PROBLEMA DE PERFORMANCE]

MÉTRICAS ACTUALES:
[TIEMPOS DE CARGA, RENDERS, ETC]

INSTRUCCIONES:
1. Analiza el flujo completo identificando bottlenecks
2. Propón optimizaciones SIN romper arquitectura:
   - Memoización en components/contexts
   - Optimización de queries en repositories
   - Caching estratégico
   - Code splitting por features
3. Mantén la separación de capas
4. No sacrifiques testabilidad por performance

RESTRICCIONES:
- NO mezclar capas para "optimizar"
- NO poner business logic en components por performance
- SÍ usar memoización de React donde corresponda
- SÍ optimizar queries en la capa de infrastructure

ENTREGABLES:
- Análisis de bottlenecks
- Soluciones propuestas por capa
- Código optimizado respetando arquitectura
- Benchmarks antes/después
```

---

## 📖 Prompt: Documentación

```
Eres un desarrollador senior experto en Clean Architecture y Documentación técnica trabajando en FastChicken POS.

CONTEXTO DEL PROYECTO:
[... mismo contexto ...]

CÓDIGO A DOCUMENTAR:
[RUTA Y DESCRIPCIÓN]

INSTRUCCIONES:
1. Documenta la funcionalidad explicando:
   - Propósito y responsabilidad
   - En qué capa arquitectónica vive y por qué
   - Dependencias y contratos
   - Flujo de datos
2. Usa JSDoc para funciones/clases
3. Explica decisiones arquitectónicas
4. Incluye ejemplos de uso
5. Documenta interfaces y tipos

FORMATO:
```typescript
/**
 * [Nombre del Servicio/Use Case]
 *
 * 🟦 DOMAIN LAYER / 🟩 APPLICATION LAYER / 🟨 INFRASTRUCTURE LAYER
 *
 * **Propósito:**
 * [Descripción breve]
 *
 * **Responsabilidades:**
 * - [Lista de responsabilidades]
 *
 * **Arquitectura:**
 * - Capa: [Domain/Application/Infrastructure/Presentation]
 * - Portable: Sí/No
 * - Dependencias: [Lista]
 *
 * **Ejemplo de uso:**
 * ```typescript
 * [Código de ejemplo]
 * ```
 */
```

ENTREGABLES:
- Documentación inline (JSDoc)
- Actualización de docs/ si es feature mayor
- Diagrama de flujo si es necesario
- README actualizado
```

---

## 🎯 Notas Importantes para Todos los Prompts

### Principios Fundamentales

1. **Separation of Concerns**: Cada capa tiene una responsabilidad única
2. **Dependency Rule**: Las dependencias siempre apuntan hacia adentro (hacia domain)
3. **Portability**: El código de domain y application debe funcionar en cualquier contexto
4. **Testability**: Business logic debe ser testeable sin mocks

### Checklist Universal

Antes de considerar CUALQUIER tarea completada, verifica:

- [ ] **Domain puro**: ¿domain/ NO tiene imports de otras capas?
- [ ] **Business logic ubicada**: ¿La lógica está en domain/services/ y no en contexts?
- [ ] **Use Cases correctos**: ¿Los Use Cases solo orquestan y no tienen lógica de negocio?
- [ ] **Interfaces definidas**: ¿Hay interfaces en domain/repositories/ si se accede a datos?
- [ ] **Portabilidad**: ¿El código puede separarse a backend/frontend independientes?
- [ ] **Tests**: ¿Hay tests unitarios para business logic?
- [ ] **Documentación**: ¿Está documentada la decisión arquitectónica?

### Señales de Alerta (Red Flags)

🚨 Si ves esto, DETENTE y refactoriza:

- ❌ Business logic en `contexts/` o `components/`
- ❌ Imports de `infrastructure/` en `domain/`
- ❌ Use Cases con lógica compleja (debe delegarse a domain services)
- ❌ Repositorios accedidos directamente desde contexts (usar Use Cases)
- ❌ Tipos duplicados en múltiples capas
- ❌ Funciones que dependen de React/Next.js en domain/

### Estructura de Carpetas de Referencia Rápida

```
✅ CORRECTO:
src/domain/services/DiscountService.ts
  → Business logic pura de descuentos

src/application/use-cases/FinalizeOrderUseCase.ts
  → Orquesta OrderRepo + ShiftRepo + DiscountService

src/context/OrderContext.tsx
  → Usa FinalizeOrderUseCase + maneja UI state

❌ INCORRECTO:
src/context/OrderContext.tsx con lógica de descuentos
  → Business logic NO va en contexts

src/domain/services/OrderService.ts importando OrderAPI
  → Domain NO puede depender de infrastructure

src/components/OrderPanel.tsx con validaciones de negocio
  → Business logic NO va en components
```

---

## 🔀 Prompt: Separación de Proyectos (Backend/Admin/Cashier)

### Template: Separar Backend a Proyecto Independiente

```
Eres un arquitecto de software senior experto en Clean Architecture, microservicios y separación de concerns.

CONTEXTO ACTUAL:
FastChicken POS es actualmente un monolito Next.js 15.3.3 con:
- Frontend (Cashier + Admin UI) en Next.js
- Backend (API Routes) en Next.js API Routes
- Base de datos MongoDB con driver nativo
- Arquitectura limpia con 4 capas bien definidas

OBJETIVO DE LA SEPARACIÓN:
Extraer el backend a un proyecto de servicio independiente que:
1. Sea un servicio API REST/GraphQL standalone
2. Pueda desplegarse independientemente
3. Mantenga la arquitectura limpia actual
4. Sea consumido por múltiples frontends (Cashier, Admin, Mobile future)
5. Use la misma lógica de negocio (domain + application layers)

ARQUITECTURA ACTUAL DEL MONOLITO:
```
src/
├── domain/                    # 🟦 PORTABLE - Irá al backend
│   ├── repositories/          # Interfaces
│   └── services/              # Business Logic pura
│
├── application/               # 🟩 PORTABLE - Irá al backend
│   └── use-cases/             # Orquestación de casos de uso
│
├── infrastructure/            # 🟨 SPLIT
│   └── repositories/
│       ├── mongodb/           # → BACKEND (acceso directo a DB)
│       └── http/              # → FRONTEND (API clients)
│
├── context/                   # 🟥 FRONTEND (React contexts)
├── components/                # �� FRONTEND (UI components)
├── app/                       # 🟥 SPLIT
│   ├── api/                   # → BACKEND (API routes)
│   ├── cashier/               # → FRONTEND Cashier
│   └── admin/                 # → FRONTEND Admin
│
├── lib/                       # SHARED
│   ├── types.ts               # → AMBOS (tipos compartidos)
│   └── utils.ts               # → Según dependencias
│
└── dtos/                      # SHARED - Contratos API
```

ESTRUCTURA OBJETIVO - 3 PROYECTOS:

**1. fastchicken-backend-service** (Node.js/Express/Fastify/NestJS)
```
backend/
├── src/
│   ├── domain/                # Copiado del monolito
│   │   ├── repositories/
│   │   └── services/
│   │
│   ├── application/           # Copiado del monolito
│   │   └── use-cases/
│   │
│   ├── infrastructure/        # Solo MongoDB
│   │   ├── repositories/mongodb/
│   │   ├── database/
│   │   └── config/
│   │
│   ├── api/                   # Nueva capa API
│   │   ├── controllers/       # Express/Fastify controllers
│   │   ├── routes/            # Rutas REST
│   │   ├── middleware/        # Auth, validation, error handling
│   │   └── validators/        # Validación de requests
│   │
│   ├── shared/
│   │   ├── types/             # Types compartidos
│   │   └── dtos/              # DTOs para API
│   │
│   └── index.ts               # Entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── package.json
├── tsconfig.json
└── .env.example
```

**2. fastchicken-cashier-app** (Next.js frontend)
```
cashier-app/
├── src/
│   ├── infrastructure/        # Solo HTTP clients
│   │   └── repositories/http/
│   │
│   ├── context/               # React contexts
│   ├── components/            # UI components (Cashier específico)
│   ├── hooks/                 # Custom hooks
│   │
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/
│   │   └── (cashier)/
│   │
│   ├── shared/
│   │   ├── types/             # Types compartidos
│   │   └── dtos/              # DTOs para API
│   │
│   └── config/
│       └── api.ts             # API base URL config
│
├── public/
├── package.json
├── tsconfig.json
└── .env.example
```

**3. fastchicken-admin-app** (Next.js frontend)
```
admin-app/
├── src/
│   ├── infrastructure/        # Solo HTTP clients
│   │   └── repositories/http/
│   │
│   ├── context/               # React contexts
│   ├── components/            # UI components (Admin específico)
│   ├── hooks/                 # Custom hooks
│   │
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/
│   │   └── (admin)/
│   │
│   ├── shared/
│   │   ├── types/             # Types compartidos
│   │   └── dtos/              # DTOs para API
│   │
│   └── config/
│       └── api.ts             # API base URL config
│
├── public/
├── package.json
├── tsconfig.json
└── .env.example
```

PLAN DE SEPARACIÓN PASO A PASO:

**FASE 1: Preparación (Sin Breaking Changes)**
1. [ ] Crear proyecto backend vacío con estructura base
2. [ ] Configurar TypeScript, ESLint, Prettier igual que monolito
3. [ ] Copiar domain/ completo al backend
4. [ ] Copiar application/ completo al backend
5. [ ] Copiar infrastructure/repositories/mongodb/ al backend
6. [ ] Copiar lib/types.ts y dtos/ a shared/ en backend
7. [ ] Instalar dependencias: express/fastify, mongodb, cors, helmet, etc
8. [ ] Verificar que domain y application compilan sin errores

**FASE 2: Crear API Layer en Backend**
1. [ ] Crear controllers para cada entidad:
   - OrdersController
   - CombosController
   - InventoryController
   - ShiftsController
   - EmployeesController
2. [ ] Implementar rutas REST siguiendo convenciones:
   ```
   POST   /api/orders          → FinalizeOrderUseCase
   GET    /api/orders/:id      → GetOrderUseCase
   GET    /api/orders          → ListOrdersUseCase

   POST   /api/shifts          → StartShiftUseCase
   PUT    /api/shifts/:id/end  → EndShiftUseCase
   GET    /api/shifts/active   → GetActiveShiftUseCase

   GET    /api/combos          → ListCombosUseCase
   POST   /api/combos          → CreateComboUseCase
   PUT    /api/combos/:id      → UpdateComboUseCase
   DELETE /api/combos/:id      → DeleteComboUseCase

   GET    /api/inventory       → ListInventoryUseCase
   PUT    /api/inventory/:id   → UpdateStockUseCase
   ```
3. [ ] Implementar middleware:
   - Authentication (JWT/Session)
   - Authorization (role-based)
   - Request validation (Zod/Joi)
   - Error handling
   - Logging
   - CORS configuration
4. [ ] Crear DTOs para requests/responses usando Zod:
   ```typescript
   // shared/dtos/orders.dto.ts
   import { z } from 'zod';

   export const FinalizeOrderRequestDTO = z.object({
     shiftId: z.string(),
     items: z.array(z.object({
       comboId: z.string(),
       name: z.string(),
       quantity: z.number().min(1),
       price: z.number(),
       customizations: z.array(z.object({
         type: z.enum(['drink', 'side']),
         itemId: z.string(),
         name: z.string()
       }))
     })),
     total: z.number(),
     deliveryType: z.enum(['dine-in', 'takeout', 'delivery']),
     paymentMethod: z.enum(['cash', 'card', 'transfer'])
   });

   export type FinalizeOrderRequest = z.infer<typeof FinalizeOrderRequestDTO>;
   ```
5. [ ] Implementar controllers usando Use Cases:
   ```typescript
   // api/controllers/OrdersController.ts
   import { Request, Response } from 'express';
   import { FinalizeOrderUseCase } from '@/application/use-cases';
   import { FinalizeOrderRequestDTO } from '@/shared/dtos/orders.dto';

   export class OrdersController {
     constructor(
       private finalizeOrderUseCase: FinalizeOrderUseCase
     ) {}

     async finalizeOrder(req: Request, res: Response) {
       try {
         // Validar request
         const input = FinalizeOrderRequestDTO.parse(req.body);

         // Ejecutar use case
         const order = await this.finalizeOrderUseCase.execute(input);

         // Responder
         res.status(201).json({
           success: true,
           data: order
         });
       } catch (error) {
         // Error handling middleware se encarga
         throw error;
       }
     }
   }
   ```

**FASE 3: Dependency Injection en Backend**
1. [ ] Configurar DI container (InversifyJS/tsyringe/manual)
2. [ ] Registrar repositorios MongoDB
3. [ ] Registrar Use Cases con dependencias
4. [ ] Inyectar en controllers
   ```typescript
   // api/container.ts
   import { Container } from 'inversify';
   import { MongoDBOrderRepository } from '@/infrastructure/repositories/mongodb';
   import { FinalizeOrderUseCase } from '@/application/use-cases';

   const container = new Container();

   // Repositories
   container.bind(IOrderRepository).to(MongoDBOrderRepository);
   container.bind(IShiftRepository).to(MongoDBShiftRepository);

   // Use Cases
   container.bind(FinalizeOrderUseCase).toSelf();

   export { container };
   ```

**FASE 4: Configuración y Testing Backend**
1. [ ] Configurar variables de entorno:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/fastchicken
   JWT_SECRET=your-secret
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:9002,http://localhost:9003
   ```
2. [ ] Crear tests de integración para API endpoints
3. [ ] Configurar Docker para desarrollo
4. [ ] Crear docker-compose.yml con MongoDB
5. [ ] Documentar API con Swagger/OpenAPI

**FASE 5: Crear Frontend Cashier App**
1. [ ] Crear proyecto Next.js 15.3.3
2. [ ] Copiar components/cashier/ del monolito
3. [ ] Copiar context/ relevante a cashier
4. [ ] Copiar infrastructure/repositories/http/
5. [ ] Actualizar HTTP repositories para apuntar a backend API:
   ```typescript
   // infrastructure/repositories/http/HTTPOrderRepository.ts
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

   export class HTTPOrderRepository implements IOrderRepository {
     async createWithStockUpdate(data: CreateOrderData): Promise<Order> {
       const response = await fetch(`${API_BASE_URL}/api/orders`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${getToken()}`
         },
         body: JSON.stringify(data)
       });

       if (!response.ok) {
         throw new Error('Failed to create order');
       }

       const result = await response.json();
       return result.data;
     }
   }
   ```
6. [ ] Copiar shared types y DTOs
7. [ ] Configurar autenticación (JWT storage)
8. [ ] Testing del flujo completo

**FASE 6: Crear Frontend Admin App**
1. [ ] Crear proyecto Next.js 15.3.3
2. [ ] Copiar components/admin/ del monolito
3. [ ] Copiar context/ relevante a admin
4. [ ] Copiar infrastructure/repositories/http/
5. [ ] Actualizar HTTP repositories igual que Cashier
6. [ ] Implementar features específicos de admin:
   - Dashboard analytics
   - User management
   - Menu management
   - Reports
7. [ ] Testing del flujo completo

**FASE 7: Sincronización de Types Compartidos**
1. [ ] Crear paquete NPM privado para types compartidos (opcional):
   ```
   @fastchicken/shared-types/
   ├── src/
   │   ├── entities/
   │   ├── dtos/
   │   └── index.ts
   ├── package.json
   └── tsconfig.json
   ```
2. [ ] O usar git submodules / monorepo (Turborepo/Nx)
3. [ ] O simplemente copiar y versionar manualmente

**FASE 8: Deployment**
1. [ ] Backend:
   - Railway/Render/Fly.io/AWS ECS
   - Variable MONGODB_URI apuntando a MongoDB Atlas
   - Health check endpoint
   - Logging y monitoring
2. [ ] Cashier App:
   - Vercel/Netlify
   - NEXT_PUBLIC_API_URL apuntando a backend en producción
3. [ ] Admin App:
   - Vercel/Netlify
   - NEXT_PUBLIC_API_URL apuntando a backend en producción

REGLAS ARQUITECTÓNICAS A MANTENER:

✅ **Backend Service:**
- domain/ y application/ deben mantenerse 100% puros (sin dependencias de Express/Fastify)
- Controllers/Routes en api/ son la capa de presentación (equivalente a components en frontend)
- Dependency Injection para testability
- Use Cases no cambian, solo se invocan desde controllers en lugar de contexts
- Toda la business logic sigue en domain/services/

✅ **Frontend Apps:**
- NO deben tener business logic duplicada
- Toda la lógica viene del backend vía API
- Contexts solo manejan UI state + API orchestration
- HTTP repositories implementan IRepository interfaces
- Validaciones de UI (UX) en frontend, validaciones de negocio en backend

✅ **Shared Code:**
- Types y DTOs deben estar sincronizados entre proyectos
- Usar herramientas de code generation si es posible (OpenAPI → TypeScript types)

VALIDACIÓN FINAL:

Antes de considerar la separación completa, verifica:
- [ ] ¿El backend puede correr standalone sin frontend?
- [ ] ¿Los frontends pueden correr con backend mockeado?
- [ ] ¿No hay business logic duplicada entre backend y frontends?
- [ ] ¿Los 3 proyectos usan los mismos types/DTOs?
- [ ] ¿Hay tests de integración para el flujo completo?
- [ ] ¿La arquitectura limpia se mantiene en los 3 proyectos?
- [ ] ¿Puedo agregar un 4to frontend (mobile) fácilmente?
- [ ] ¿Puedo escalar backend independientemente de frontends?

ENTREGABLES:
1. Repositorio backend con API REST completa
2. Repositorio cashier-app funcional
3. Repositorio admin-app funcional
4. Documentación API (Swagger/OpenAPI)
5. Docker compose para desarrollo local de los 3 servicios
6. README con instrucciones de setup
7. Diagrama de arquitectura actualizado
```

---

## 💾 Prompt: Migración de Base de Datos

### Template: Cambiar Base de Datos (MongoDB → PostgreSQL/MySQL/etc)

```
Eres un arquitecto de software senior experto en Clean Architecture, migraciones de bases de datos y Repository Pattern.

CONTEXTO ACTUAL:
FastChicken POS usa MongoDB como base de datos con:
- Driver nativo de MongoDB (no Mongoose)
- Repository Pattern con interfaces en domain/repositories/
- Implementaciones en infrastructure/repositories/mongodb/
- Arquitectura limpia que permite cambiar implementación sin afectar negocio

OBJETIVO DE LA MIGRACIÓN:
Cambiar de MongoDB a [NUEVA_BASE_DATOS] manteniendo:
1. Arquitectura limpia intacta
2. Interfaces de repositories sin cambios
3. Cero cambios en domain/ y application/
4. Misma funcionalidad exacta
5. Data migration plan para datos existentes

BASE DE DATOS OBJETIVO:
[Especificar: PostgreSQL / MySQL / Firebase / Supabase / etc]

ARQUITECTURA ACTUAL:
```
src/
├── domain/
│   └── repositories/          # ✅ NO CAMBIA
│       ├── IOrderRepository.ts
│       ├── IComboRepository.ts
│       ├── IInventoryRepository.ts
│       ├── IShiftRepository.ts
│       └── IEmployeeRepository.ts
│
├── application/               # ✅ NO CAMBIA
│   └── use-cases/
│
└── infrastructure/
    └── repositories/
        ├── mongodb/           # ❌ ELIMINAR después
        │   ├── MongoDBOrderRepository.ts
        │   ├── MongoDBComboRepository.ts
        │   └── ...
        │
        └── [nueva-db]/        # ✅ CREAR NUEVA
            ├── PostgreSQLOrderRepository.ts
            ├── PostgreSQLComboRepository.ts
            └── ...
```

PLAN DE MIGRACIÓN PASO A PASO:

**FASE 1: Análisis de Schema**
1. [ ] Documentar schema actual de MongoDB:
   ```javascript
   // Colección: orders
   {
     _id: ObjectId,
     shiftId: ObjectId,
     items: [{
       comboId: ObjectId,
       name: String,
       quantity: Number,
       price: Number,
       customizations: [{ type, itemId, name }]
     }],
     total: Number,
     deliveryType: String,
     paymentMethod: String,
     createdAt: Date,
     status: String
   }

   // Colección: combos
   // Colección: inventory_items
   // Colección: shifts
   // Colección: employees
   ```

2. [ ] Diseñar schema relacional (si aplica):
   ```sql
   -- PostgreSQL example
   CREATE TABLE orders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     shift_id UUID REFERENCES shifts(id),
     total DECIMAL(10,2) NOT NULL,
     delivery_type VARCHAR(20) NOT NULL,
     payment_method VARCHAR(20) NOT NULL,
     status VARCHAR(20) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE order_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
     combo_id UUID REFERENCES combos(id),
     name VARCHAR(255) NOT NULL,
     quantity INTEGER NOT NULL,
     price DECIMAL(10,2) NOT NULL
   );

   CREATE TABLE order_item_customizations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
     type VARCHAR(50) NOT NULL,
     item_id UUID NOT NULL,
     name VARCHAR(255) NOT NULL
   );

   -- Indices
   CREATE INDEX idx_orders_shift_id ON orders(shift_id);
   CREATE INDEX idx_orders_created_at ON orders(created_at);
   CREATE INDEX idx_order_items_order_id ON order_items(order_id);
   ```

3. [ ] Identificar diferencias clave:
   - MongoDB usa ObjectId → Nueva DB usa UUID/Integer
   - MongoDB tiene arrays embebidos → Nueva DB puede necesitar tablas relacionales
   - Transacciones: MongoDB tiene limitaciones → PostgreSQL robusto

**FASE 2: Setup Nueva Base de Datos**
1. [ ] Instalar dependencias:
   ```bash
   # PostgreSQL
   npm install pg
   npm install --save-dev @types/pg

   # O MySQL
   npm install mysql2

   # O Prisma (ORM recomendado para type-safety)
   npm install @prisma/client
   npm install --save-dev prisma
   ```

2. [ ] Configurar conexión:
   ```typescript
   // infrastructure/database/postgresql/connection.ts
   import { Pool } from 'pg';

   const pool = new Pool({
     host: process.env.POSTGRES_HOST,
     port: parseInt(process.env.POSTGRES_PORT || '5432'),
     database: process.env.POSTGRES_DATABASE,
     user: process.env.POSTGRES_USER,
     password: process.env.POSTGRES_PASSWORD,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });

   export { pool };
   ```

3. [ ] O con Prisma:
   ```bash
   npx prisma init
   ```

   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   model Order {
     id            String   @id @default(uuid())
     shiftId       String
     shift         Shift    @relation(fields: [shiftId], references: [id])
     items         OrderItem[]
     total         Decimal  @db.Decimal(10, 2)
     deliveryType  String
     paymentMethod String
     status        String
     createdAt     DateTime @default(now())
   }

   model OrderItem {
     id              String   @id @default(uuid())
     orderId         String
     order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
     comboId         String
     combo           Combo    @relation(fields: [comboId], references: [id])
     name            String
     quantity        Int
     price           Decimal  @db.Decimal(10, 2)
     customizations  OrderItemCustomization[]
   }

   // ... otros modelos
   ```

**FASE 3: Implementar Nuevos Repositories**
1. [ ] Crear PostgreSQLOrderRepository implementando IOrderRepository:
   ```typescript
   // infrastructure/repositories/postgresql/PostgreSQLOrderRepository.ts
   import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';
   import type { Order, CreateOrderData } from '@/lib/types';
   import { pool } from '@/infrastructure/database/postgresql/connection';

   export class PostgreSQLOrderRepository implements IOrderRepository {
     async createWithStockUpdate(data: CreateOrderData): Promise<Order> {
       const client = await pool.connect();

       try {
         // Iniciar transacción
         await client.query('BEGIN');

         // 1. Crear order
         const orderResult = await client.query(`
           INSERT INTO orders (shift_id, total, delivery_type, payment_method, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *
         `, [data.shiftId, data.total, data.deliveryType, data.paymentMethod, 'completed']);

         const order = orderResult.rows[0];

         // 2. Crear order items
         for (const item of data.items) {
           const itemResult = await client.query(`
             INSERT INTO order_items (order_id, combo_id, name, quantity, price)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *
           `, [order.id, item.comboId, item.name, item.quantity, item.price]);

           const orderItem = itemResult.rows[0];

           // 3. Crear customizations
           for (const custom of item.customizations) {
             await client.query(`
               INSERT INTO order_item_customizations (order_item_id, type, item_id, name)
               VALUES ($1, $2, $3, $4)
             `, [orderItem.id, custom.type, custom.itemId, custom.name]);
           }
         }

         // 4. Actualizar stock (igual que en MongoDB)
         for (const item of data.items) {
           await client.query(`
             UPDATE inventory_items
             SET stock = stock - $1
             WHERE id = $2
           `, [item.quantity, item.comboId]);
         }

         // Commit transacción
         await client.query('COMMIT');

         // 5. Recuperar order completo con relaciones
         return await this.getById(order.id);

       } catch (error) {
         // Rollback en caso de error
         await client.query('ROLLBACK');
         throw error;
       } finally {
         client.release();
       }
     }

     async getById(id: string): Promise<Order | null> {
       const result = await pool.query(`
         SELECT
           o.*,
           json_agg(
             json_build_object(
               'id', oi.id,
               'comboId', oi.combo_id,
               'name', oi.name,
               'quantity', oi.quantity,
               'price', oi.price,
               'customizations', (
                 SELECT json_agg(
                   json_build_object(
                     'type', oic.type,
                     'itemId', oic.item_id,
                     'name', oic.name
                   )
                 )
                 FROM order_item_customizations oic
                 WHERE oic.order_item_id = oi.id
               )
             )
           ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id = $1
         GROUP BY o.id
       `, [id]);

       if (result.rows.length === 0) return null;

       // Mapear a tipo Order de domain
       return this.mapToOrder(result.rows[0]);
     }

     private mapToOrder(row: any): Order {
       return {
         id: row.id,
         shiftId: row.shift_id,
         items: row.items,
         total: parseFloat(row.total),
         deliveryType: row.delivery_type,
         paymentMethod: row.payment_method,
         status: row.status,
         createdAt: row.created_at
       };
     }

     // ... otros métodos de IOrderRepository
   }
   ```

2. [ ] O con Prisma (más type-safe):
   ```typescript
   // infrastructure/repositories/postgresql/PrismaOrderRepository.ts
   import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';
   import type { Order, CreateOrderData } from '@/lib/types';
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();

   export class PrismaOrderRepository implements IOrderRepository {
     async createWithStockUpdate(data: CreateOrderData): Promise<Order> {
       // Prisma maneja transacciones automáticamente
       const order = await prisma.order.create({
         data: {
           shiftId: data.shiftId,
           total: data.total,
           deliveryType: data.deliveryType,
           paymentMethod: data.paymentMethod,
           status: 'completed',
           items: {
             create: data.items.map(item => ({
               comboId: item.comboId,
               name: item.name,
               quantity: item.quantity,
               price: item.price,
               customizations: {
                 create: item.customizations.map(c => ({
                   type: c.type,
                   itemId: c.itemId,
                   name: c.name
                 }))
               }
             }))
           }
         },
         include: {
           items: {
             include: {
               customizations: true
             }
           }
         }
       });

       // Actualizar stock
       for (const item of data.items) {
         await prisma.inventoryItem.update({
           where: { id: item.comboId },
           data: {
             stock: {
               decrement: item.quantity
             }
           }
         });
       }

       return this.mapToOrder(order);
     }

     async getById(id: string): Promise<Order | null> {
       const order = await prisma.order.findUnique({
         where: { id },
         include: {
           items: {
             include: {
               customizations: true
             }
           }
         }
       });

       if (!order) return null;
       return this.mapToOrder(order);
     }

     private mapToOrder(prismaOrder: any): Order {
       // Mapear de Prisma types a domain types
       return {
         id: prismaOrder.id,
         shiftId: prismaOrder.shiftId,
         items: prismaOrder.items.map((item: any) => ({
           comboId: item.comboId,
           name: item.name,
           quantity: item.quantity,
           price: item.price.toNumber(),
           customizations: item.customizations
         })),
         total: prismaOrder.total.toNumber(),
         deliveryType: prismaOrder.deliveryType,
         paymentMethod: prismaOrder.paymentMethod,
         status: prismaOrder.status,
         createdAt: prismaOrder.createdAt
       };
     }
   }
   ```

3. [ ] Implementar todos los repositories:
   - PostgreSQLComboRepository
   - PostgreSQLInventoryRepository
   - PostgreSQLShiftRepository
   - PostgreSQLEmployeeRepository

**FASE 4: Testing de Nuevos Repositories**
1. [ ] Crear tests de integración:
   ```typescript
   // tests/integration/repositories/PostgreSQLOrderRepository.test.ts
   import { PostgreSQLOrderRepository } from '@/infrastructure/repositories/postgresql';

   describe('PostgreSQLOrderRepository', () => {
     let repository: PostgreSQLOrderRepository;

     beforeAll(async () => {
       // Setup test database
       repository = new PostgreSQLOrderRepository();
     });

     afterEach(async () => {
       // Clean up test data
     });

     it('should create order with stock update', async () => {
       const orderData = {
         shiftId: 'test-shift-id',
         items: [{ /* ... */ }],
         total: 100,
         deliveryType: 'dine-in',
         paymentMethod: 'cash'
       };

       const order = await repository.createWithStockUpdate(orderData);

       expect(order.id).toBeDefined();
       expect(order.total).toBe(100);
       // Verificar que stock se actualizó
     });

     it('should rollback on error', async () => {
       // Test que transacción hace rollback si falla
     });
   });
   ```

2. [ ] Ejecutar test suite completo
3. [ ] Verificar que todos los tests de Use Cases siguen pasando (no deberían cambiar)

**FASE 5: Data Migration**
1. [ ] Crear script de migración de datos:
   ```typescript
   // scripts/migrate-mongodb-to-postgresql.ts
   import { MongoClient } from 'mongodb';
   import { pool } from '@/infrastructure/database/postgresql/connection';

   async function migrate() {
     // 1. Conectar a MongoDB
     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!);
     const mongodb = mongoClient.db();

     // 2. Migrar Employees
     console.log('Migrating employees...');
     const employees = await mongodb.collection('employees').find().toArray();
     for (const emp of employees) {
       await pool.query(`
         INSERT INTO employees (id, name, role, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING
       `, [emp._id.toString(), emp.name, emp.role, emp.createdAt]);
     }

     // 3. Migrar Inventory
     console.log('Migrating inventory...');
     const items = await mongodb.collection('inventory_items').find().toArray();
     for (const item of items) {
       await pool.query(`
         INSERT INTO inventory_items (id, name, type, stock, unit, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING
       `, [item._id.toString(), item.name, item.type, item.stock, item.unit, item.createdAt]);
     }

     // 4. Migrar Combos
     console.log('Migrating combos...');
     // Similar...

     // 5. Migrar Shifts
     console.log('Migrating shifts...');
     // Similar...

     // 6. Migrar Orders
     console.log('Migrating orders...');
     const orders = await mongodb.collection('orders').find().toArray();
     for (const order of orders) {
       // Insert order
       await pool.query(`
         INSERT INTO orders (id, shift_id, total, delivery_type, payment_method, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING
       `, [
         order._id.toString(),
         order.shiftId.toString(),
         order.total,
         order.deliveryType,
         order.paymentMethod,
         order.status,
         order.createdAt
       ]);

       // Insert order items and customizations
       // ...
     }

     console.log('Migration completed!');
     await mongoClient.close();
     await pool.end();
   }

   migrate().catch(console.error);
   ```

2. [ ] Ejecutar migración en ambiente de prueba
3. [ ] Validar integridad de datos
4. [ ] Ejecutar queries de validación:
   ```sql
   -- Verificar conteos
   SELECT COUNT(*) FROM orders;
   SELECT COUNT(*) FROM employees;
   SELECT COUNT(*) FROM inventory_items;

   -- Verificar relaciones
   SELECT o.id, COUNT(oi.id) as items_count
   FROM orders o
   LEFT JOIN order_items oi ON o.id = oi.order_id
   GROUP BY o.id;
   ```

**FASE 6: Actualizar Dependency Injection**
1. [ ] Cambiar instanciación de repositories:
   ```typescript
   // Antes (MongoDB)
   import { MongoDBOrderRepository } from '@/infrastructure/repositories/mongodb';
   const orderRepository = new MongoDBOrderRepository();

   // Después (PostgreSQL)
   import { PostgreSQLOrderRepository } from '@/infrastructure/repositories/postgresql';
   const orderRepository = new PostgreSQLOrderRepository();
   ```

2. [ ] O con factory pattern:
   ```typescript
   // infrastructure/repositories/factory.ts
   import type { IOrderRepository } from '@/domain/repositories/IOrderRepository';

   export function createOrderRepository(): IOrderRepository {
     const dbType = process.env.DATABASE_TYPE || 'postgresql';

     switch (dbType) {
       case 'postgresql':
         return new PostgreSQLOrderRepository();
       case 'mongodb':
         return new MongoDBOrderRepository();
       default:
         throw new Error(`Unsupported database type: ${dbType}`);
     }
   }
   ```

3. [ ] Actualizar DI container si usas uno

**FASE 7: Deployment**
1. [ ] Configurar nueva base de datos en producción:
   - PostgreSQL: Railway/Supabase/Neon/AWS RDS
   - MySQL: PlanetScale/AWS RDS
2. [ ] Ejecutar migraciones en producción
3. [ ] Actualizar variables de entorno
4. [ ] Deploy con rolling update (zero downtime)
5. [ ] Monitorear logs y performance

**FASE 8: Cleanup**
1. [ ] Una vez estable, eliminar MongoDB repositories:
   ```bash
   rm -rf src/infrastructure/repositories/mongodb/
   ```
2. [ ] Eliminar dependencias de MongoDB:
   ```bash
   npm uninstall mongodb
   ```
3. [ ] Actualizar documentación

VALIDACIÓN ARQUITECTÓNICA:

✅ **Verificar que se mantiene Clean Architecture:**
- [ ] ¿domain/ sigue sin cambios?
- [ ] ¿application/ sigue sin cambios?
- [ ] ¿Solo cambió infrastructure/repositories/?
- [ ] ¿Las interfaces IRepository NO cambiaron?
- [ ] ¿Los Use Cases funcionan igual con nueva DB?
- [ ] ¿Los tests de domain y application siguen pasando sin modificaciones?

✅ **Ventajas de la arquitectura limpia en esta migración:**
- Cambio de DB afectó SOLO una capa (infrastructure)
- Cero cambios en business logic
- Cero cambios en UI
- Puedo tener ambas implementaciones corriendo en paralelo
- Puedo hacer rollback fácilmente

CONSIDERACIONES ESPECIALES POR BASE DE DATOS:

**PostgreSQL:**
- ✅ Transacciones ACID robustas
- ✅ JSON/JSONB para datos semi-estructurados
- ✅ Full-text search nativo
- ⚠️ Requiere schema bien definido

**MySQL:**
- ✅ Alta performance en reads
- ✅ Bien soportado en todos lados
- ⚠️ JSON menos robusto que PostgreSQL

**Firebase/Firestore:**
- ✅ Realtime capabilities
- ✅ Serverless, escalabilidad automática
- ⚠️ Modelo de datos NoSQL (similar a MongoDB)
- ⚠️ Costos pueden crecer rápido

**Supabase:**
- ✅ PostgreSQL + Realtime + Auth todo en uno
- ✅ Auto-generated REST API
- ✅ Type-safe TypeScript client

ENTREGABLES:
1. Nuevos repository implementations en infrastructure/
2. Schema SQL o Prisma schema
3. Scripts de migración de datos
4. Tests de integración pasando
5. Documentación actualizada
6. Guía de rollback en caso de problemas
```

---

## 📚 Referencias

- Arquitectura completa: `docs/ARCHITECTURE.md`
- Visión general: `docs/overview.md`
- Guía de contribución: `docs/contributing.md`

---

**Última actualización:** 2025-01-08
**Versión:** 2.0
