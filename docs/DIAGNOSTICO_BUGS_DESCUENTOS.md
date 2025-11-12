# 🔴 DIAGNÓSTICO CRÍTICO: BUGS EN SISTEMA DE DESCUENTOS

**Fecha:** 2025-11-11
**Estado:** CRÍTICO - Sistema de descuentos completamente roto
**Impacto:** Pérdida de ventas, experiencia de usuario negativa

---

## 📋 RESUMEN EJECUTIVO

El sistema de descuentos tiene **4 problemas críticos** que hacen que los descuentos no funcionen correctamente en caja. El análisis revela **violaciones de arquitectura limpia** donde hay **lógica duplicada y contradictoria** entre diferentes capas.

### Problemas Reportados:

1. ✅ **Descuento cruzado 2x1**: Solo 1 item aplica descuento (debería ser el 2do)
2. ✅ **Descuento cruzado A→B**: No funciona entre combos diferentes
3. ✅ **Descuentos simples**: Dejaron de funcionar (antes funcionaban)
4. ✅ **Badge de descuento**: No aparece en tarjetas de menú

---

## 🔍 ANÁLISIS DE FLUJO ACTUAL

### Capa de Presentación → Dominio → Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTACIÓN (React Components)                              │
├─────────────────────────────────────────────────────────────┤
│ MenuItemCard.tsx (línea 16-32)                              │
│ ├─ getActiveDiscount() LOCAL                                │
│ │  └─ ❌ PROBLEMA: Lógica duplicada, no usa DiscountService│
│ │  └─ ❌ Solo valida temporal, NO valida timeRange         │
│ │  └─ ❌ Solo funciona con combo.discounts (colección vieja)│
│ └─ Resultado: Badge con descuento incorrecto                │
│                                                              │
│ CustomizationDialog.tsx (línea 119)                         │
│ ├─ DiscountService.getActiveDiscountForCombo()             │
│ │  └─ ✅ USA servicio de dominio correctamente             │
│ │  └─ ❌ PERO: Solo aplica descuentos 'simple'             │
│ │  └─ ❌ NO considera cross-promotion ni appliesTo         │
│ └─ Resultado: Descuentos cross-promotion ignorados          │
│                                                              │
│ OrderContext.tsx (línea 171)                                │
│ ├─ DiscountService.applyPromotionalDiscounts()             │
│ │  └─ ✅ Correcto: Aplica descuentos cross-promotion       │
│ │  └─ ✅ Ya arreglado con validación appliesTo/comboIds    │
│ └─ Resultado: Debería funcionar PERO...                     │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ DOMINIO (Business Logic)                                     │
├─────────────────────────────────────────────────────────────┤
│ DiscountService.ts                                           │
│ ├─ isDiscountRuleActive() ✅ Valida temporal + timeRange   │
│ ├─ getActiveDiscountForCombo() ❌ PROBLEMA:                │
│ │   └─ Solo busca en combo.discounts (array embebido)      │
│ │   └─ Solo devuelve descuentos tipo 'simple'              │
│ │   └─ NO recibe allDiscounts como parámetro               │
│ └─ applyPromotionalDiscounts() ✅ Correcto (recién fijado) │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 CAUSA RAÍZ DE CADA PROBLEMA

### **PROBLEMA 1: Descuento cruzado 2x1 aplica en 1er item en lugar del 2do**

**Ubicación:** `DiscountService.applyPromotionalDiscounts()` (líneas 119-136)

**Causa Raíz:**
```typescript
// Código actual (línea 120-136)
updatedItems.forEach((item, index) => {
  if (item.combo && item.combo.id === rule.targetComboId) {
    // ❌ PROBLEMA: Aplica descuento a TODOS los items que coincidan
    // No diferencia cuál es el "trigger" y cuál es el "target"
    const currentDiscount = item.appliedDiscount?.percentage || 0;
    if (rule.percentage > currentDiscount) {
      const discountedPrice = item.unitPrice * (1 - rule.percentage / 100);
      updatedItems[index] = {
        ...item,
        finalUnitPrice: discountedPrice,
        appliedDiscount: { percentage: rule.percentage, rule }
      };
    }
  }
});
```

**Qué está mal:**
- Cuando `triggerComboId === targetComboId` (2x1), AMBOS items reciben descuento
- No hay contador de "cuántos triggers hay" vs "cuántos targets aplicar"
- No respeta la regla de negocio: "Compra X, el siguiente Y tiene descuento"

**Comportamiento esperado:**
- Si hay 2 unidades del mismo combo con 50% descuento:
  - Item 1 (trigger): Precio normal $100
  - Item 2 (target): Precio con descuento $50
- Si hay 3 unidades:
  - Item 1: $100
  - Item 2: $50 (descuento)
  - Item 3: $100 o $50 (depende de la política)

---

### **PROBLEMA 2: Cross-promotion A→B no funciona**

**Ubicación:** `CustomizationDialog.tsx` (línea 119)

**Causa Raíz:**
```typescript
// Código actual (línea 119)
const activeDiscount = DiscountService.getActiveDiscountForCombo(combo);
```

**Qué está mal:**
1. `getActiveDiscountForCombo()` **NO recibe** `allDiscounts` (colección separada)
2. Solo busca en `combo.discounts` (array embebido obsoleto)
3. Solo devuelve descuentos tipo `'simple'` (línea 60 de DiscountService)
4. Los descuentos cross-promotion NO están en `combo.discounts`, están en colección `discounts`

**Flujo incorrecto:**
```
Usuario agrega Combo A → CustomizationDialog
  └─ getActiveDiscountForCombo(comboA)
     └─ Busca en comboA.discounts[]
        └─ ❌ NO encuentra cross-promotion (A→B)
           └─ Retorna null
              └─ Item agregado SIN descuento
                 └─ OrderContext.useEffect() intenta arreglar
                    └─ ⚠️ Pero ya es tarde, el item tiene finalUnitPrice fijo
```

---

### **PROBLEMA 3: Descuentos simples dejaron de funcionar**

**Ubicaciones múltiples:**
1. `MenuItemCard.tsx` - getActiveDiscount() local (líneas 16-32)
2. `CustomizationDialog.tsx` - getActiveDiscountForCombo() (línea 119)
3. `OrderContext.tsx` - applyPromotionalDiscounts() (línea 171)

**Causa Raíz:**
```typescript
// MenuItemCard.tsx (línea 16-32)
const getActiveDiscount = (combo: Combo): number | null => {
    if (!combo.discounts || combo.discounts.length === 0) return null;

    // ❌ PROBLEMA 1: No valida timeRange
    // ❌ PROBLEMA 2: Solo busca en combo.discounts (obsoleto)
    // ❌ PROBLEMA 3: No usa DiscountService.isDiscountRuleActive()

    for (const rule of combo.discounts) {
        if (rule.temporalType === 'weekday' && rule.value === todayWeekday) {
            return rule.percentage; // ⚠️ Devuelve el primero que encuentra
        }
        // ...
    }
    return null;
}
```

**Por qué dejó de funcionar:**
1. **Fuente de datos obsoleta**: Los descuentos ahora están en colección `discounts`, no en `combo.discounts`
2. **Lógica duplicada**: `MenuItemCard` tiene su propia lógica en lugar de usar `DiscountService`
3. **Validación incompleta**: No valida `timeRange`, solo valida `temporalType`
4. **No considera `appliesTo`**: Un descuento con `appliesTo: 'order'` NO debería aparecer en tarjetas

**Arquitectura violada:**
```
❌ INCORRECTO (actual):
MenuItemCard → getActiveDiscount() local → combo.discounts[]

✅ CORRECTO (debería ser):
MenuItemCard → DiscountService.getActiveDiscountForCombo() → allDiscounts
```

---

### **PROBLEMA 4: Badge de descuento no aparece**

**Ubicación:** `MenuItemCard.tsx` (líneas 40-67)

**Causa Raíz:**
Mismo que Problema 3. El badge depende de `getActiveDiscount()` que está buscando en `combo.discounts[]` que está vacío o desactualizado.

```typescript
// MenuItemCard.tsx (línea 40-42)
const discount = useMemo(() => {
  return combo ? getActiveDiscount(combo) : null; // ❌ Retorna null siempre
}, [combo]);

// Línea 66-68
{discount && (
  <Badge variant="destructive">{discount}% OFF</Badge> // ❌ Nunca se renderiza
)}
```

---

## 🏗️ VIOLACIONES DE ARQUITECTURA LIMPIA

### ❌ Violación 1: Lógica de Negocio en Capa de Presentación

**Archivo:** `MenuItemCard.tsx` (líneas 16-32)

**Problema:**
```typescript
// ❌ Lógica de negocio duplicada en componente React
const getActiveDiscount = (combo: Combo): number | null => {
    // Validación de reglas de descuento (DOMAIN LOGIC)
    for (const rule of combo.discounts) {
        if (rule.temporalType === 'weekday' && rule.value === todayWeekday) {
            return rule.percentage;
        }
    }
    return null;
}
```

**Por qué es violación:**
- ✅ **Principio de Responsabilidad Única**: Violado
  - Un componente de UI NO debería conocer la lógica de validación de descuentos
- ✅ **Separación de Capas**: Violada
  - Presentación está accediendo directamente a `combo.discounts` (debería ser a través de servicio)
- ✅ **Reusabilidad**: Comprometida
  - Si cambia la lógica de descuentos, hay que modificar múltiples archivos

**Impacto:**
- Lógica inconsistente entre `MenuItemCard` y `CustomizationDialog`
- Difícil de mantener y testear
- Bugs al actualizar reglas de descuento

---

### ❌ Violación 2: Servicio de Dominio con Datos Obsoletos

**Archivo:** `DiscountService.getActiveDiscountForCombo()` (líneas 53-66)

**Problema:**
```typescript
static getActiveDiscountForCombo(combo: Combo, currentDate: Date = new Date()): { rule: DiscountRule; percentage: number } | null {
  if (!combo.discounts || combo.discounts.length === 0) {
    return null; // ❌ Solo busca en combo.discounts (obsoleto)
  }

  for (const rule of combo.discounts) {
    if (rule.type === 'simple' && this.isDiscountRuleActive(rule, currentDate)) {
      return { rule, percentage: rule.percentage };
    }
  }
  return null;
}
```

**Por qué es violación:**
- ✅ **Principio de Inversión de Dependencias**: Violado
  - Servicio de dominio depende de estructura de datos de infrastructure (`combo.discounts`)
- ✅ **Single Source of Truth**: Violado
  - Hay 2 fuentes de descuentos: `combo.discounts[]` y colección `discounts`
- ✅ **Acoplamiento**: Alto
  - Si cambiamos el modelo de descuentos, este método se rompe

**Solución esperada:**
```typescript
// ✅ CORRECTO
static getActiveDiscountForCombo(
  combo: Combo,
  allDiscounts: DiscountRule[], // ← Recibe descuentos como parámetro
  currentDate: Date = new Date()
): { rule: DiscountRule; percentage: number } | null {
  // Buscar en allDiscounts filtrando por combo.id
  const comboDiscounts = allDiscounts.filter(d =>
    d.type === 'simple' &&
    d.appliesTo === 'combos' &&
    d.comboIds?.includes(combo.id)
  );

  for (const rule of comboDiscounts) {
    if (this.isDiscountRuleActive(rule, currentDate)) {
      return { rule, percentage: rule.percentage };
    }
  }
  return null;
}
```

---

### ❌ Violación 3: Lógica de Cross-Promotion Incompleta

**Archivo:** `DiscountService.applyPromotionalDiscounts()` (líneas 119-136)

**Problema:**
No maneja correctamente la relación trigger→target en promociones 2x1:

```typescript
// ❌ Código actual: Aplica descuento a TODOS los items que coincidan
updatedItems.forEach((item, index) => {
  if (item.combo && item.combo.id === rule.targetComboId) {
    // Aplica descuento sin contar cuántos triggers hay
    updatedItems[index] = { ...item, finalUnitPrice: discountedPrice };
  }
});
```

**Qué falta:**
```typescript
// ✅ CORRECTO: Lógica con contador
const triggerCount = triggerCounts.get(rule.triggerComboId) || 0;

// Para cada trigger, aplicar descuento a UN target
let discountsToApply = triggerCount;

updatedItems.forEach((item, index) => {
  if (item.combo?.id === rule.targetComboId && discountsToApply > 0) {
    // Solo aplicar si aún quedan "créditos" de descuento
    if (!item.appliedDiscount || rule.percentage > item.appliedDiscount.percentage) {
      updatedItems[index] = { ...item, finalUnitPrice: discountedPrice, appliedDiscount: {...} };
      discountsToApply--; // ← Consumir un crédito
    }
  }
});
```

---

## 🛠️ PLAN DE SOLUCIÓN

### Fase 1: Arreglar Capa de Dominio ✅ (Prioridad Alta)

**Archivo:** `DiscountService.ts`

**Cambio 1:** Refactor `getActiveDiscountForCombo()`
```typescript
// ✅ NUEVO: Recibe allDiscounts como parámetro
static getActiveDiscountForCombo(
  combo: Combo,
  allDiscounts: DiscountRule[], // ← NUEVO
  currentDate: Date = new Date()
): { rule: DiscountRule; percentage: number } | null {
  // Filtrar descuentos que aplican a este combo específico
  const applicableDiscounts = allDiscounts.filter(discount => {
    // Solo descuentos simples
    if (discount.type !== 'simple') return false;

    // Verificar alcance
    if (discount.appliesTo === 'order') return false; // No aplica a combos individuales
    if (discount.appliesTo === 'combos') {
      if (!discount.comboIds || !discount.comboIds.includes(combo.id)) {
        return false; // No está en la lista de combos permitidos
      }
    }

    return this.isDiscountRuleActive(discount, currentDate);
  });

  // Retornar el de mayor porcentaje
  if (applicableDiscounts.length === 0) return null;

  const bestDiscount = applicableDiscounts.reduce((best, current) =>
    current.percentage > best.percentage ? current : best
  );

  return { rule: bestDiscount, percentage: bestDiscount.percentage };
}
```

**Cambio 2:** Arreglar lógica de cross-promotion para 2x1
```typescript
// ✅ NUEVO: Lógica correcta para 2x1
crossPromotionDiscounts.forEach(rule => {
  if (!rule.triggerComboId || !rule.targetComboId) return;

  const triggerCount = triggerCounts.get(rule.triggerComboId) || 0;
  if (triggerCount === 0) return;

  // Validar appliesTo y comboIds
  if (rule.appliesTo === 'combos' && rule.comboIds && rule.comboIds.length > 0) {
    if (!rule.comboIds.includes(rule.targetComboId)) return;
  }

  // ✅ NUEVO: Contador de descuentos aplicados
  let discountsApplied = 0;
  const maxDiscounts = triggerCount;

  // Caso especial: 2x1 (trigger === target)
  if (rule.triggerComboId === rule.targetComboId) {
    // Ordenar items por precio (aplicar descuento al más barato)
    const targetItems = updatedItems
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => item.combo?.id === rule.targetComboId)
      .sort((a, b) => a.item.unitPrice - b.item.unitPrice); // Más barato primero

    // Aplicar descuento a items pares (2do, 4to, 6to...)
    targetItems.forEach(({ item, idx }, position) => {
      if (position > 0 && position % 2 === 1 && discountsApplied < maxDiscounts) {
        // Este es un item par (2do, 4to, etc)
        const currentDiscount = item.appliedDiscount?.percentage || 0;
        if (rule.percentage > currentDiscount) {
          const discountedPrice = item.unitPrice * (1 - rule.percentage / 100);
          updatedItems[idx] = {
            ...item,
            finalUnitPrice: discountedPrice,
            appliedDiscount: { percentage: rule.percentage, rule }
          };
          discountsApplied++;
        }
      }
    });
  } else {
    // Caso normal: A → B
    updatedItems.forEach((item, index) => {
      if (item.combo?.id === rule.targetComboId && discountsApplied < maxDiscounts) {
        const currentDiscount = item.appliedDiscount?.percentage || 0;
        if (rule.percentage > currentDiscount) {
          const discountedPrice = item.unitPrice * (1 - rule.percentage / 100);
          updatedItems[index] = {
            ...item,
            finalUnitPrice: discountedPrice,
            appliedDiscount: { percentage: rule.percentage, rule }
          };
          discountsApplied++;
        }
      }
    });
  }
});
```

---

### Fase 2: Actualizar Capa de Presentación ✅ (Prioridad Alta)

**Archivo 1:** `CustomizationDialog.tsx` (línea 119)

**Cambio:**
```typescript
// ❌ ANTES
const activeDiscount = DiscountService.getActiveDiscountForCombo(combo);

// ✅ DESPUÉS
const { discounts } = useDiscounts(); // ← Obtener discounts desde context
const activeDiscount = DiscountService.getActiveDiscountForCombo(combo, discounts);
```

**Archivo 2:** `MenuItemCard.tsx`

**Cambio:** Eliminar función local y usar servicio de dominio
```typescript
// ❌ ELIMINAR (líneas 16-32)
const getActiveDiscount = (combo: Combo): number | null => {
  // ... lógica duplicada
}

// ✅ REEMPLAZAR CON
import { DiscountService } from '@/domain/services/DiscountService';
import { useDiscounts } from '@/context/DiscountContext';

export const MenuItemCard = React.memo(function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const isCombo = 'products' in item;
  const combo = isCombo ? (item as Combo) : null;
  const { discounts } = useDiscounts(); // ← Obtener discounts desde context

  const discount = useMemo(() => {
    if (!combo) return null;
    const activeDiscount = DiscountService.getActiveDiscountForCombo(combo, discounts);
    return activeDiscount?.percentage || null;
  }, [combo, discounts]);

  // ... resto del componente
});
```

---

### Fase 3: Testing ✅ (Prioridad Alta)

**Escenarios de prueba:**

1. **Descuento simple sobre combo específico:**
   - Crear descuento: `type: 'simple', appliesTo: 'combos', comboIds: ['combo1'], percentage: 20`
   - Verificar: Badge aparece en MenuItemCard
   - Verificar: Descuento se aplica al agregar al carrito

2. **Descuento cruzado 2x1:**
   - Crear descuento: `type: 'cross-promotion', triggerComboId: 'combo1', targetComboId: 'combo1', percentage: 50`
   - Agregar 2 unidades de combo1
   - Verificar: Item 1 = precio normal, Item 2 = 50% descuento

3. **Descuento cruzado A→B:**
   - Crear descuento: `type: 'cross-promotion', triggerComboId: 'comboA', targetComboId: 'comboB', percentage: 30`
   - Agregar comboA + comboB
   - Verificar: comboB tiene 30% descuento

4. **Validación de timeRange:**
   - Crear descuento con `timeRange: { start: '14:00', end: '18:00' }`
   - Probar dentro y fuera del rango horario

---

## 📝 RESUMEN DE CAMBIOS REQUERIDOS

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `DiscountService.ts` | Refactor `getActiveDiscountForCombo()` con parámetro `allDiscounts` | 🔴 CRÍTICO |
| `DiscountService.ts` | Arreglar lógica de 2x1 en `applyPromotionalDiscounts()` | 🔴 CRÍTICO |
| `CustomizationDialog.tsx` | Pasar `discounts` a `getActiveDiscountForCombo()` | 🔴 CRÍTICO |
| `MenuItemCard.tsx` | Eliminar `getActiveDiscount()` local, usar servicio | 🔴 CRÍTICO |
| Tests | Crear suite de tests para todos los escenarios | 🟡 IMPORTANTE |

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [ ] Badge de descuento aparece correctamente en MenuItemCard
- [ ] Descuentos simples funcionan (order y combos)
- [ ] Cross-promotion A→B funciona correctamente
- [ ] Cross-promotion 2x1 aplica descuento al 2do item (más barato si precios distintos)
- [ ] Validación de timeRange funciona
- [ ] NO hay lógica de negocio duplicada en capa de presentación
- [ ] Todos los componentes usan `DiscountService` como única fuente de verdad
