# 🔍 DIAGNÓSTICO FINAL - SISTEMA DE DESCUENTOS

**Fecha:** 2025-11-11
**Estado Actual:** 🔴 PARCIALMENTE ROTO

---

## 📊 ESTADO ACTUAL DE CADA TIPO DE DESCUENTO

| Tipo de Descuento | Estado | Problema |
|-------------------|--------|----------|
| Simple sobre combo específico | ✅ **FUNCIONA** | Se aplica en CustomizationDialog |
| Simple sobre total de la compra | ❌ **NO FUNCIONA** | Se aplica en finalizeOrder pero no es visible |
| Cross-promotion (2x1, A→B) | ❌ **NO FUNCIONA** | useEffect desactivado, no se aplica en carrito |

---

## 🔍 ANÁLISIS PROFUNDO DEL PROBLEMA

### Problema 1: Descuento sobre Total NO ES VISIBLE

**¿Por qué no funciona?**

El descuento sobre total SÍ se aplica en `finalizeOrder()`, pero el usuario **NO lo ve** porque:

1. **En el carrito (OrderPanel):** No hay indicación de descuento sobre total
2. **En MenuItemCard:** El badge solo muestra descuentos sobre combos específicos
3. **Solo se ve en CheckoutDialog:** Cuando ya se finalizó la orden

**Código actual en finalizeOrder:**
```typescript
// ✅ El código SÍ aplica el descuento
const orderDiscount = DiscountService.getActiveOrderDiscount(discounts);
if (orderDiscount) {
  total = total * (1 - orderDiscount.percentage / 100);
}
```

**Problema:** El descuento se calcula correctamente, pero falta **feedback visual** antes del checkout.

---

### Problema 2: Cross-Promotion NO FUNCIONA EN CARRITO

**¿Por qué no funciona?**

El `useEffect` que aplicaba descuentos cross-promotion fue **desactivado** (líneas 169-192) porque causaba loop infinito.

**Código actual:**
```typescript
// ⚠️ DESACTIVADO TEMPORALMENTE: Causaba loop infinito
// useEffect(() => {
//   const itemsWithPromotionalDiscounts = DiscountService.applyPromotionalDiscounts(...);
//   if (hasChanges) {
//     setOrderItems(itemsWithPromotionalDiscounts);
//   }
// }, [orderItems, combos, discounts]);
```

**Consecuencia:**
- Los descuentos cross-promotion **SÍ se aplican en finalizeOrder()**
- Pero **NO se ven en el carrito** antes de hacer checkout
- El usuario NO sabe que hay un descuento activo

---

## 🎯 CAUSA RAÍZ DEL PROBLEMA

### El Dilema del useEffect

```
┌─────────────────────────────────────────────────┐
│ OPCIÓN A: useEffect ACTIVADO                    │
├─────────────────────────────────────────────────┤
│ ✅ Descuentos cross-promotion visibles en carrito│
│ ❌ Loop infinito → App se congela               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ OPCIÓN B: useEffect DESACTIVADO (actual)        │
├─────────────────────────────────────────────────┤
│ ✅ No hay loop infinito                         │
│ ❌ Descuentos NO visibles en carrito            │
│ ❌ Solo se aplican al finalizar orden           │
└─────────────────────────────────────────────────┘
```

### ¿Por qué el useEffect causaba loop?

```typescript
useEffect(() => {
  // 1. Lee orderItems
  const itemsWithPromotionalDiscounts = DiscountService.applyPromotionalDiscounts(
    orderItems,  // ← Depende de orderItems
    combos,
    discounts
  );

  if (hasChanges) {
    // 2. Modifica orderItems
    setOrderItems(itemsWithPromotionalDiscounts);  // ← Cambia orderItems
  }
}, [orderItems, combos, discounts]);  // ← Depende de orderItems → LOOP!
```

---

## 💡 SOLUCIÓN CORRECTA RESPETANDO CLEAN ARCHITECTURE

### Opción 1: useEffect con useRef para evitar loop ✅ RECOMENDADO

**Concepto:** Usar `useRef` para trackear el estado anterior y solo actualizar si hay cambios REALES.

```typescript
const prevOrderItemsRef = useRef<OrderItem[]>([]);

useEffect(() => {
  if (orderItems.length === 0) return;

  // Aplicar descuentos
  const itemsWithPromotionalDiscounts = DiscountService.applyPromotionalDiscounts(
    orderItems,
    combos,
    discounts
  );

  // Comparar con estado anterior usando referencia
  const prevItems = prevOrderItemsRef.current;

  // Solo actualizar si hay cambios REALES en precios/descuentos
  const hasRealChanges = itemsWithPromotionalDiscounts.some((newItem, index) => {
    const prevItem = prevItems[index];
    if (!prevItem) return true;

    return (
      newItem.finalUnitPrice !== prevItem.finalUnitPrice ||
      newItem.appliedDiscount?.percentage !== prevItem.appliedDiscount?.percentage
    );
  });

  if (hasRealChanges) {
    prevOrderItemsRef.current = itemsWithPromotionalDiscounts;
    setOrderItems(itemsWithPromotionalDiscounts);
  }
}, [orderItems.length, combos, discounts]);  // ⚠️ SOLO length, no orderItems completo
```

**Ventajas:**
- ✅ No hay loop (solo depende de `orderItems.length`)
- ✅ Descuentos cross-promotion visibles en carrito
- ✅ Performance óptimo
- ✅ Respeta Clean Architecture

---

### Opción 2: Agregar indicador visual sin modificar items ✅ ALTERNATIVA

**Concepto:** Calcular descuentos para mostrar, pero NO modificar `orderItems` en useEffect.

```typescript
// Calcular descuentos solo para visualización
const orderItemsWithVisualDiscounts = useMemo(() => {
  if (orderItems.length === 0) return [];

  return DiscountService.applyPromotionalDiscounts(
    orderItems,
    combos,
    discounts
  );
}, [orderItems, combos, discounts]);

// Usar orderItemsWithVisualDiscounts solo para renderizar
// Pero mantener orderItems como fuente de verdad
```

**En OrderPanel:**
```tsx
{orderItemsWithVisualDiscounts.map(item => (
  <div>
    <span>{item.quantity}x {item.combo.name}</span>
    {item.appliedDiscount && (
      <Badge>{item.appliedDiscount.percentage}% OFF</Badge>
    )}
    <span>${item.finalUnitPrice}</span>
  </div>
))}
```

**Ventajas:**
- ✅ No hay loop (useMemo no modifica estado)
- ✅ Descuentos visibles
- ✅ `orderItems` se mantiene simple
- ❌ Duplica lógica (calcula en useMemo Y en finalizeOrder)

---

### Opción 3: Aplicar descuentos al agregar item (CURRENT - INCOMPLETO)

**Concepto actual:** Los descuentos simples se aplican en `CustomizationDialog`, pero cross-promotion no.

**Problema:** Cross-promotion necesita ver TODO el carrito, no solo un item.

**Mejora:** Aplicar cross-promotion inmediatamente después de agregar item.

```typescript
const addItemToOrder = (newItem: OrderItem) => {
  setOrderItems((prevItems) => {
    const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);

    let updatedItems: OrderItem[];
    if (existingItemIndex > -1) {
      updatedItems = [...prevItems];
      updatedItems[existingItemIndex].quantity += newItem.quantity;
    } else {
      updatedItems = [...prevItems, newItem];
    }

    // ✅ APLICAR CROSS-PROMOTION INMEDIATAMENTE
    return DiscountService.applyPromotionalDiscounts(
      updatedItems,
      combos,
      discounts
    );
  });
};
```

**Ventajas:**
- ✅ No hay loop
- ✅ Descuentos visibles inmediatamente
- ✅ Simple y directo
- ⚠️ Se recalcula en cada adición (puede ser costoso)

---

## 🏗️ SOLUCIÓN RECOMENDADA (OPCIÓN 1)

### Implementación con useRef

**Archivo:** `OrderContext.tsx`

```typescript
const prevOrderItemsRef = useRef<OrderItem[]>([]);
const isApplyingDiscountsRef = useRef(false);

useEffect(() => {
  // Evitar loop cuando estamos aplicando descuentos
  if (isApplyingDiscountsRef.current) {
    isApplyingDiscountsRef.current = false;
    return;
  }

  if (orderItems.length === 0) {
    prevOrderItemsRef.current = [];
    return;
  }

  // Aplicar descuentos cross-promotion
  const itemsWithPromotionalDiscounts = DiscountService.applyPromotionalDiscounts(
    orderItems,
    combos,
    discounts
  );

  // Comparar con estado anterior
  const prevItems = prevOrderItemsRef.current;

  // Verificar si hay cambios reales
  const hasRealChanges =
    itemsWithPromotionalDiscounts.length !== prevItems.length ||
    itemsWithPromotionalDiscounts.some((newItem, index) => {
      const prevItem = prevItems[index];
      if (!prevItem) return true;

      // Comparar solo campos relevantes
      return (
        newItem.id !== prevItem.id ||
        newItem.quantity !== prevItem.quantity ||
        newItem.finalUnitPrice !== prevItem.finalUnitPrice ||
        newItem.appliedDiscount?.percentage !== prevItem.appliedDiscount?.percentage
      );
    });

  if (hasRealChanges) {
    isApplyingDiscountsRef.current = true;
    prevOrderItemsRef.current = itemsWithPromotionalDiscounts;
    setOrderItems(itemsWithPromotionalDiscounts);
  }
}, [orderItems.length, JSON.stringify(orderItems.map(i => i.id + ':' + i.quantity)), combos, discounts]);
```

**Ventajas de esta solución:**
- ✅ **No hay loop infinito** - `isApplyingDiscountsRef` previene re-entrada
- ✅ **Descuentos visibles** - Se aplican en tiempo real
- ✅ **Performance óptimo** - Solo actualiza cuando hay cambios reales
- ✅ **Respeta Clean Architecture** - Lógica en DiscountService (Domain)
- ✅ **Sin duplicación** - No necesita calcular en finalizeOrder

---

## 📝 PLAN DE IMPLEMENTACIÓN

### Paso 1: Re-activar useEffect con useRef
1. Descomentar useEffect en OrderContext
2. Agregar `useRef` para prevenir loop
3. Modificar dependencias para evitar loop

### Paso 2: Simplificar finalizeOrder
```typescript
const finalizeOrder = async (): Promise<Order | null> => {
  if (orderItems.length === 0) return null;

  // ✅ Los descuentos cross-promotion YA están aplicados en orderItems
  // Solo necesitamos calcular subtotal, total y descuento sobre orden

  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  let total = orderItems.reduce(
    (acc, item) => acc + item.finalUnitPrice * item.quantity,
    0
  );

  // Aplicar descuento sobre total si existe
  const orderDiscount = DiscountService.getActiveOrderDiscount(discounts);
  if (orderDiscount) {
    total = total * (1 - orderDiscount.percentage / 100);
  }

  const newOrderData: CreateOrderDTO = {
    shiftId: currentShift?.id,
    items: orderItems,  // ✅ Ya tienen todos los descuentos aplicados
    deliveryType,
    subtotal,
    discount: subtotal - total,
    total,
    createdAt: new Date(),
  };

  // ... resto del código
};
```

### Paso 3: Agregar indicador de descuento sobre total en OrderPanel

```tsx
// En OrderPanel.tsx
const { discounts } = useDiscounts();
const orderDiscount = DiscountService.getActiveOrderDiscount(discounts);

{orderDiscount && (
  <Alert className="bg-green-50 border-green-200 mb-2">
    <Info className="h-4 w-4 text-green-600" />
    <AlertDescription className="text-sm">
      ¡Descuento del {orderDiscount.percentage}% sobre el total activo!
    </AlertDescription>
  </Alert>
)}
```

---

## ✅ VERIFICACIÓN DE CLEAN ARCHITECTURE

| Principio | Cumplimiento | Detalle |
|-----------|--------------|---------|
| **Separación de capas** | ✅ | Lógica en Domain (DiscountService), orquestación en Presentation (OrderContext) |
| **Dependency Inversion** | ✅ | OrderContext depende de DiscountService (abstracción) |
| **Single Responsibility** | ✅ | DiscountService = cálculo, OrderContext = state management |
| **Open/Closed** | ✅ | Nuevos tipos de descuento se agregan sin modificar código existente |
| **No acoplamiento** | ✅ | Domain no conoce React, Presentation usa Domain services |

---

## 🎯 RESULTADO ESPERADO

Después de implementar la solución:

| Tipo de Descuento | Estado | Visible en Carrito | Visible en Checkout |
|-------------------|--------|--------------------|---------------------|
| Simple sobre combo | ✅ | ✅ Badge en tarjeta | ✅ |
| Simple sobre total | ✅ | ✅ Alert en panel | ✅ |
| Cross-promotion 2x1 | ✅ | ✅ Precio actualizado | ✅ |
| Cross-promotion A→B | ✅ | ✅ Precio actualizado | ✅ |

---

## 📊 COMPARACIÓN DE OPCIONES

| Criterio | Opción 1 (useRef) | Opción 2 (useMemo) | Opción 3 (addItem) |
|----------|-------------------|--------------------|--------------------|
| Sin loop | ✅ | ✅ | ✅ |
| Descuentos visibles | ✅ | ✅ | ✅ |
| Performance | ✅ Excelente | ⚠️ Bueno | ⚠️ Bueno |
| Duplicación lógica | ✅ NO | ❌ SÍ | ✅ NO |
| Clean Architecture | ✅ | ✅ | ✅ |
| Complejidad | ⚠️ Media | ✅ Baja | ✅ Baja |

**RECOMENDACIÓN:** Opción 1 (useRef) es la mejor solución técnica.

---

## 🚀 PRÓXIMO PASO

¿Quieres que implemente la **Opción 1 (useRef)** para resolver todos los problemas de forma definitiva?
