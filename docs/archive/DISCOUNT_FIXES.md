# 🔧 CORRECCIÓN DE DESCUENTOS CRUZADOS - Clean Architecture

## 📋 Problemas Identificados

### ❌ Problema 1: Descripción confusa en gestión de descuentos
**Síntoma:** En `/admin/discounts`, la columna "Aplica a" mostraba "Sin asignar" para descuentos cruzados.

**Causa raíz:** La función `formatAppliesTo()` en `DiscountManagement.tsx` solo manejaba descuentos con `comboIds`, pero los descuentos cruzados usan `triggerComboId` y `targetComboId`.

**Capa afectada:** Presentation Layer

---

### ❌ Problema 2: Descuentos cruzados NO se aplicaban en la caja (CRÍTICO)
**Síntoma:** Al comprar combo activador + combo objetivo, el descuento NO se aplicaba al total.

**Causa raíz:** **VIOLACIÓN ARQUITECTURAL** - `DiscountService.applyPromotionalDiscounts()` buscaba descuentos en `combo.discounts[]`, pero:
- Los combos NO tienen descuentos populados desde MongoDB
- Los descuentos están en colección **separada** (diseño normalizado correcto)
- El servicio NO recibía la lista de descuentos activos

**Capa afectada:** Domain Service + Infrastructure

---

### ❌ Problema 3: No indica descuentos al seleccionar items
**Síntoma:** La UI no muestra indicadores visuales de descuentos disponibles.

**Capa afectada:** Presentation Layer (pendiente de implementación UI)

---

## ✅ SOLUCIÓN IMPLEMENTADA (Respetando Clean Architecture)

### Principio de diseño:
**Mantener colecciones separadas (normalización) y pasar dependencias explícitamente**

```
MongoDB:
  ├── Collection: combos     { _id, name, price, products }
  └── Collection: discounts  { _id, type, triggerComboId, targetComboId, ... }
                             ↑ SEPARADAS (correcto)
```

---

## 🔨 Cambios Implementados

### 1. **Domain Layer** - `DiscountService.ts`

**Archivo:** `src/domain/services/DiscountService.ts`

**Cambio:** Actualizar signature para recibir `allDiscounts` como parámetro separado

**Antes:**
```typescript
static applyPromotionalDiscounts(
  orderItems: OrderItem[],
  allCombos: Combo[],
  currentDate: Date = new Date()
): OrderItem[] {
  // ❌ Buscaba en combo.discounts[]
  allCombos.forEach(combo => {
    if (!combo.discounts) return;
    combo.discounts.forEach(rule => { ... });
  });
}
```

**Después:**
```typescript
static applyPromotionalDiscounts(
  orderItems: OrderItem[],
  allCombos: Combo[],
  allDiscounts: DiscountRule[],  // ✅ NUEVO: colección separada
  currentDate: Date = new Date()
): OrderItem[] {
  // ✅ Filtra descuentos activos de la colección separada
  const activeDiscounts = allDiscounts.filter(rule =>
    this.isDiscountRuleActive(rule, currentDate)
  );

  // Aplica descuentos de tipo 'quantity'
  const quantityDiscounts = activeDiscounts.filter(r => r.type === 'quantity');

  // Aplica descuentos de tipo 'cross-promotion'
  const crossPromotionDiscounts = activeDiscounts.filter(r => r.type === 'cross-promotion');

  crossPromotionDiscounts.forEach(rule => {
    // Verifica si combo trigger está en carrito
    const triggerCount = triggerCounts.get(rule.triggerComboId!) || 0;
    if (triggerCount === 0) return;

    // Aplica descuento a combo target
    // ...
  });
}
```

**Beneficios:**
- ✅ Respeta separación de colecciones
- ✅ No requiere JOIN/lookup en MongoDB
- ✅ Descuentos se gestionan independientemente de combos
- ✅ Fácil de testear (dependency injection)

---

### 2. **Presentation Layer** - `OrderContext.tsx`

**Archivo:** `src/context/OrderContext.tsx`

**Cambio:** Obtener descuentos del `DiscountContext` y pasarlos al servicio

**Antes:**
```typescript
export const OrderProvider = ({ children, initialCombos, initialInventory }) => {
  const { toast } = useToast();
  const { currentShift, refreshShift } = useShift();

  useEffect(() => {
    const itemsWithDiscounts = DiscountService.applyPromotionalDiscounts(
      orderItems,
      combos  // ❌ Solo pasaba combos
    );
  }, [orderItems, combos]);
};
```

**Después:**
```typescript
export const OrderProvider = ({ children, initialCombos, initialInventory }) => {
  const { toast } = useToast();
  const { currentShift, refreshShift } = useShift();
  const { discounts } = useDiscounts();  // ✅ NUEVO: obtener descuentos

  useEffect(() => {
    const itemsWithDiscounts = DiscountService.applyPromotionalDiscounts(
      orderItems,
      combos,
      discounts  // ✅ Pasar descuentos desde colección separada
    );
  }, [orderItems, combos, discounts]);  // ✅ Añadir a dependencias
};
```

---

### 3. **Presentation Layer** - `client-shell.tsx`

**Archivo:** `src/app/client-shell.tsx`

**Cambio:** Agregar `DiscountProvider` al árbol de componentes

**Antes:**
```typescript
return (
  <ShiftProvider>
    <OrderProvider initialCombos={combos} initialInventory={inventory}>
      <CashierContent ... />
    </OrderProvider>
  </ShiftProvider>
);
```

**Después:**
```typescript
return (
  <ShiftProvider>
    <DiscountProvider>  {/* ✅ NUEVO */}
      <OrderProvider initialCombos={combos} initialInventory={inventory}>
        <CashierContent ... />
      </OrderProvider>
    </DiscountProvider>
  </ShiftProvider>
);
```

**Por qué:** Para que `OrderContext` pueda acceder a `useDiscounts()`

---

### 4. **Presentation Layer** - `DiscountManagement.tsx`

**Archivo:** `src/components/admin/DiscountManagement.tsx`

**Cambio:** Manejar correctamente descuentos cross-promotion en la UI

**Antes:**
```typescript
const formatAppliesTo = (discount: DiscountRule): string => {
  if (discount.appliesTo === 'order') return 'Total de la compra';
  if (discount.appliesTo === 'combos' && discount.comboIds?.length) {
    // ...
  }
  return 'Sin asignar';  // ❌ Mostraba esto para cross-promotion
};
```

**Después:**
```typescript
const formatAppliesTo = (discount: DiscountRule): string => {
  if (discount.appliesTo === 'order') return 'Total de la compra';

  // ✅ NUEVO: Manejar cross-promotion
  if (discount.type === 'cross-promotion') {
    const trigger = combos.find(c => c.id === discount.triggerComboId);
    const target = combos.find(c => c.id === discount.targetComboId);
    return `${trigger?.name || 'N/A'} → ${target?.name || 'N/A'}`;
  }

  if (discount.appliesTo === 'combos' && discount.comboIds?.length) {
    // ...
  }
  return 'Sin asignar';
};
```

---

## 📊 Validación de Clean Architecture

### ✅ ¿El domain/ NO tiene imports de infrastructure ni presentation?
**APROBADO** - Solo importa tipos y date-fns

### ✅ ¿La business logic está en domain/services/?
**APROBADO** - `DiscountService` contiene toda la lógica de cálculo de descuentos

### ✅ ¿Los Use Cases solo orquestan?
**APROBADO** - No se modificaron Use Cases, solo el servicio de dominio

### ✅ ¿El código es portable a un backend separado?
**APROBADO** - DiscountService es puro, solo requiere pasar `allDiscounts[]`

### ✅ ¿Se respetan las reglas de dependencia?
**APROBADO** - Flujo correcto:
```
Presentation (OrderContext)
    ↓ usa
Domain Service (DiscountService)
    ↓ recibe datos de
Infrastructure (MongoDB Collections separadas)
```

---

## 🎯 Resultado Final

| Problema | Estado | Solución |
|----------|--------|----------|
| **Problema 1**: UI confusa | ✅ RESUELTO | `formatAppliesTo()` ahora maneja cross-promotion |
| **Problema 2**: Descuentos no se aplican | ✅ RESUELTO | `DiscountService` recibe `allDiscounts` separado |
| **Problema 3**: Sin indicadores visuales | ⚠️ PENDIENTE | Requiere mejora de UI (badge/tag) |

---

## 🧪 Testing Recomendado

### Test unitario para `DiscountService`:
```typescript
describe('DiscountService.applyPromotionalDiscounts', () => {
  it('should apply cross-promotion discount when trigger combo is in cart', () => {
    const orderItems = [
      { combo: { id: 'combo1' }, quantity: 1, unitPrice: 100, finalUnitPrice: 100 },
      { combo: { id: 'combo2' }, quantity: 1, unitPrice: 50, finalUnitPrice: 50 }
    ];

    const discounts = [
      {
        id: 'discount1',
        type: 'cross-promotion',
        triggerComboId: 'combo1',
        targetComboId: 'combo2',
        percentage: 20,
        temporalType: 'weekday',
        value: '1',  // Lunes
        appliesTo: 'order'
      }
    ];

    const result = DiscountService.applyPromotionalDiscounts(
      orderItems,
      [],
      discounts,
      new Date('2025-01-13')  // Lunes
    );

    expect(result[1].finalUnitPrice).toBe(40);  // 50 * 0.8 = 40
    expect(result[1].appliedDiscount?.percentage).toBe(20);
  });
});
```

---

## 📝 Notas Importantes

### ¿Por qué NO denormalizar (combo.discounts[])?

**Razones:**
1. **Duplicación de datos:** Un descuento puede aplicar a múltiples combos
2. **Inconsistencia:** Actualizar descuento requiere actualizar N combos
3. **Performance:** JOIN en MongoDB es costoso y lento
4. **Escalabilidad:** A mayor cantidad de descuentos, más costoso

### ¿Por qué esta solución es mejor?

1. **Separation of Concerns:** Descuentos y combos son entidades independientes
2. **Single Source of Truth:** Un descuento, una ubicación
3. **Flexibility:** Fácil agregar nuevos tipos de descuentos
4. **Testability:** Fácil mockear `allDiscounts[]`
5. **Clean Architecture:** Respeta todas las reglas de dependencia

---

## 🔍 Monitoreo Post-Deploy

- [ ] Verificar que descuentos cruzados se aplican correctamente en caja
- [ ] Verificar que la UI muestra "Combo A → Combo B" en admin
- [ ] Verificar que no hay loops infinitos en `useEffect`
- [ ] Monitorear performance (filtrado de descuentos activos)
- [ ] Verificar que descuentos se actualizan en tiempo real

---

**Autor:** Claude (Clean Architecture Expert)
**Fecha:** 2025-01-11
**Arquitectura:** ✅ Clean Architecture Compliant
