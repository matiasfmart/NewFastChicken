# Implementación: Cancelación de Pedidos

## Resumen
Sistema completo de cancelación de pedidos con búsqueda en la caja, respetando estrictamente Clean Architecture.

---

## Arquitectura Implementada

### 🟦 DOMAIN LAYER (100% portable, sin dependencias)

#### 1. Tipos actualizados en `src/lib/types.ts`
```typescript
export type OrderStatus = 'completed' | 'cancelled';

export interface Order {
  // ... campos existentes
  status: OrderStatus;
  cancelledAt?: Date | Timestamp;
  cancellationReason?: string;
}
```

**✅ Cumple Clean Architecture:**
- Define contratos de dominio
- Sin dependencias externas
- 100% portable

#### 2. Interface actualizada: `src/domain/repositories/IOrderRepository.ts`
```typescript
export interface IOrderRepository {
  // ... métodos existentes
  cancel(id: string, reason?: string): Promise<Order>;
  search(criteria: SearchCriteria): Promise<Order[]>;
}
```

**✅ Cumple Clean Architecture:**
- Define contratos, no implementaciones
- Inversión de dependencias
- Permite múltiples implementaciones

#### 3. Servicio de dominio: `src/domain/services/OrderService.ts`
**Lógica de negocio pura:**
- `canBeCancelled(order)` - Valida si orden puede cancelarse
- `calculateEffectiveRevenue(orders)` - Calcula ingresos sin canceladas
- `recalculateShiftTotals(shift, orders)` - Recalcula totales de jornada
- `isValidCancellationReason(reason)` - Valida razón de cancelación

**✅ Cumple Clean Architecture:**
- Funciones puras sin dependencias
- Solo lógica de negocio
- Sin acceso a DB ni APIs
- Fácilmente testeable

---

### 🟩 APPLICATION LAYER (Casos de uso orquestados)

#### 1. Use Case: `src/application/use-cases/CancelOrderUseCase.ts`
**Orquesta el proceso de cancelación:**
1. Valida razón con `OrderService.isValidCancellationReason()`
2. Obtiene orden del repositorio
3. Valida si puede cancelarse con `OrderService.canBeCancelled()`
4. Cancela en repositorio
5. Recalcula totales de jornada con `OrderService.recalculateShiftTotals()`

**✅ Cumple Clean Architecture:**
- Solo orquesta, no contiene lógica de negocio
- Depende de interfaces, no implementaciones
- Usa servicios de dominio para validaciones

#### 2. Use Case: `src/application/use-cases/SearchOrdersUseCase.ts`
**Orquesta búsqueda de órdenes:**
- Wrapper simple sobre repositorio
- Preparado para extender con lógica futura

**✅ Cumple Clean Architecture:**
- Separa casos de uso de repositorios
- Permite agregar lógica adicional sin romper capas

---

### 🟨 INFRASTRUCTURE LAYER (Implementaciones)

#### 1. MongoDB Repository: `src/infrastructure/repositories/mongodb/MongoDBOrderRepository.ts`
**Implementación backend:**
```typescript
async cancel(id: string, reason?: string): Promise<Order> {
  // Actualiza status a 'cancelled' en MongoDB
  // Marca cancelledAt con fecha actual
}

async search(criteria): Promise<Order[]> {
  // Búsqueda flexible por ID, shiftId, fechas, status
}
```

**✅ Cumple Clean Architecture:**
- Implementa `IOrderRepository`
- Encapsula lógica específica de MongoDB
- Puede reemplazarse por PostgreSQL, Firebase, etc.

#### 2. HTTP Repository: `src/infrastructure/repositories/http/HttpOrderRepository.ts`
**Implementación frontend:**
```typescript
async cancel(id: string, reason?: string): Promise<Order> {
  // Llama a /api/orders/cancel
}

async search(criteria): Promise<Order[]> {
  // Llama a /api/orders/search
}
```

**✅ Cumple Clean Architecture:**
- Implementa `IOrderRepository`
- Permite usar mismo código en cliente
- Fácil migración a backend separado

#### 3. API Routes (Next.js)
- `src/app/api/orders/cancel/route.ts` - Endpoint de cancelación
- `src/app/api/orders/search/route.ts` - Endpoint de búsqueda

**✅ Cumple Clean Architecture:**
- Delgados, solo coordinan
- Usan OrderAPI que abstrae repositories

---

### 🟥 PRESENTATION LAYER (UI + React)

#### 1. Context: `src/context/OrderContext.tsx`
**Orquestación de UI:**
```typescript
const searchOrders = async (orderId: string): Promise<Order[]>
const cancelOrder = async (orderId: string, reason?: string): Promise<void>
```

**✅ Cumple Clean Architecture:**
- Solo orquestación de UI
- No contiene lógica de negocio
- Llama a API/repositorios

#### 2. Componente: `src/components/cashier/OrderSearchDialog.tsx`
**UI de lista y cancelación:**
- Lista visual de pedidos de la jornada actual
- Ordenados por fecha (más reciente primero)
- Tarjetas con detalles: ID, hora, items, total, estado
- Scroll para navegar entre pedidos
- Botón "Cancelar" en pedidos completados
- Diálogo de confirmación con razón

**✅ Cumple Clean Architecture:**
- Solo UI, sin lógica de negocio
- Consume funciones del context

**🎨 UX Mejorada:**
- No requiere recordar ID del pedido
- Navegación visual por scroll
- Muestra información contextual
- Feedback visual de estados

#### 3. Header actualizado: `src/components/cashier/CashierHeader.tsx`
- Botón "Cancelar Pedido" con etiqueta clara
- Integra `OrderSearchDialog`

**✅ Cumple Clean Architecture:**
- Componente presentacional
- Conecta UI con context

#### 4. Admin: `src/components/admin/ShiftDetailModal.tsx`
**Visualización de cancelaciones:**
- Separa órdenes completadas de canceladas
- Muestra total cancelado
- Excluye canceladas de ventas

**✅ Cumple Clean Architecture:**
- Solo presentación
- Usa lógica de filtrado simple

---

## Validación Final: ✅ Clean Architecture

### ✅ Reglas de Dependencia Respetadas

```
Presentation → Application → Domain
Infrastructure → Domain

✅ Domain NO depende de nada
✅ Application NO depende de Infrastructure ni Presentation
✅ Business Logic en domain/services/
✅ Use Cases solo ORQUESTAN
```

### ✅ Separación de Capas

| Capa | Responsabilidad | Verificado |
|------|----------------|------------|
| Domain | Tipos, interfaces, lógica de negocio pura | ✅ |
| Application | Casos de uso que orquestan | ✅ |
| Infrastructure | Acceso a MongoDB, HTTP | ✅ |
| Presentation | UI, React contexts, componentes | ✅ |

### ✅ Portabilidad

- **Domain layer**: 100% portable, puede usarse en cualquier proyecto
- **Application layer**: Portable, solo depende de interfaces
- **Infrastructure**: Intercambiable (MongoDB → PostgreSQL fácil)
- **Presentation**: Separable a aplicación móvil/web independiente

### ✅ Testabilidad

```typescript
// Domain services son funciones puras:
describe('OrderService', () => {
  it('should validate if order can be cancelled', () => {
    const order = { status: 'completed' };
    expect(OrderService.canBeCancelled(order)).toBe(true);
  });
});

// Use cases con mocks:
describe('CancelOrderUseCase', () => {
  it('should cancel order and update shift', async () => {
    const mockOrderRepo = { cancel: jest.fn(), getById: jest.fn() };
    const useCase = new CancelOrderUseCase(mockOrderRepo, mockShiftRepo);
    // ...
  });
});
```

---

## Flujo Completo

### 1. Usuario cancela pedido en caja:
```
1. Cajero click "Cancelar Pedido" → CashierHeader
2. Se abre OrderSearchDialog con lista de pedidos
3. Se cargan pedidos de jornada → OrderContext.loadCurrentShiftOrders()
4. Cajero navega por scroll (no necesita recordar ID)
5. Ve detalles en tarjetas: ID, hora, items, total
6. Click "Cancelar" en pedido deseado
7. Confirma con razón → OrderContext.cancelOrder()
8. Backend usa CancelOrderUseCase
9. Valida con OrderService.canBeCancelled()
10. Cancela en MongoDBOrderRepository
11. Recalcula jornada con OrderService.recalculateShiftTotals()
12. UI se actualiza automáticamente
```

### 2. Admin ve resumen:
```
1. Admin abre ShiftDetailModal
2. Obtiene órdenes de la jornada
3. Filtra completadas vs canceladas
4. Muestra total de ventas (solo completadas)
5. Muestra total cancelado por separado
```

---

## Impacto en Base de Datos

### Colección `orders`:
```json
{
  "_id": ObjectId,
  "status": "completed" | "cancelled",  // NUEVO
  "cancelledAt": ISODate,                // NUEVO (opcional)
  "cancellationReason": "string",        // NUEVO (opcional)
  // ... campos existentes
}
```

### Colección `shifts`:
```json
{
  "totalOrders": 10,      // Solo cuenta completadas (auto-recalculado)
  "totalRevenue": 50000   // Solo suma completadas (auto-recalculado)
}
```

---

## Archivos Nuevos Creados

### Domain:
- `src/domain/services/OrderService.ts`

### Application:
- `src/application/use-cases/CancelOrderUseCase.ts`
- `src/application/use-cases/SearchOrdersUseCase.ts`

### Infrastructure:
- Ninguno (solo actualizaciones)

### Presentation:
- `src/components/cashier/OrderSearchDialog.tsx`
- `src/app/api/orders/cancel/route.ts`
- `src/app/api/orders/search/route.ts`

### Documentation:
- `docs/cancelacion-pedidos-implementacion.md`

---

## Archivos Modificados

### Domain:
- `src/lib/types.ts` - Agregado OrderStatus, campos en Order
- `src/domain/repositories/IOrderRepository.ts` - Métodos cancel() y search()

### Application:
- `src/application/use-cases/index.ts` - Export de nuevos use cases

### Infrastructure:
- `src/infrastructure/repositories/mongodb/MongoDBOrderRepository.ts`
- `src/infrastructure/repositories/http/HttpOrderRepository.ts`
- `src/api/orders/index.ts` - OrderAPI con cancel() y search()

### Presentation:
- `src/context/OrderContext.tsx` - searchOrders() y cancelOrder()
- `src/components/cashier/CashierHeader.tsx` - Botón búsqueda
- `src/components/admin/ShiftDetailModal.tsx` - Visualización cancelaciones

---

## Próximos Pasos (Opcionales)

### Mejoras futuras sin romper arquitectura:

1. **Tests unitarios:**
   ```typescript
   // domain/services/OrderService.test.ts
   // application/use-cases/CancelOrderUseCase.test.ts
   ```

2. **Más filtros de búsqueda:**
   - Búsqueda por rango de fechas
   - Búsqueda por empleado
   - Solo en SearchOrdersUseCase (application)

3. **Reportes de cancelaciones:**
   - Nuevo use case: `GenerateCancellationReportUseCase`
   - Usa OrderService para cálculos

4. **Permisos:**
   - Solo admin puede cancelar después de X tiempo
   - Lógica en OrderService.canBeCancelled()

5. **Notificaciones:**
   - Email al admin cuando se cancela
   - En CancelOrderUseCase después de cancelar

---

## Conclusión

✅ **Clean Architecture completamente respetada**
✅ **Código 100% portable y mantenible**
✅ **Separación clara de responsabilidades**
✅ **Lógica de negocio en domain layer**
✅ **Fácil de testear y extender**
✅ **Preparado para migración a microservicios**

El sistema de cancelación de pedidos está implementado siguiendo estrictamente los principios de Clean Architecture, permitiendo que el código sea fácil de mantener, testear y evolucionar sin romper la arquitectura existente.
