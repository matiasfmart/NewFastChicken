# 🔍 DIAGNÓSTICO: Descuentos Cruzados No Funcionan

## 📋 PROBLEMAS REPORTADOS

### Problema 1: Descuento cruzado sobre el mismo combo (2x1) no funciona
**Comportamiento:** Se crea descuento donde triggerComboId === targetComboId, pero no se aplica en caja.

### Problema 2: Descuento cruzado entre combos distintos no funciona
**Comportamiento:** Se crea descuento donde triggerComboId ≠ targetComboId, tampoco se aplica.

### Problema 3: UI ambigua para promociones cruzadas
**Comportamiento:** El campo "Aplica a" aparece para cross-promotion cuando NO debería.

---

## 🎯 ANÁLISIS DE CAUSA RAÍZ

### ✅ **Arquitectura Clean: Sin Violaciones**
La arquitectura está correctamente implementada:
- ✅ Domain Layer: `DiscountService` tiene la lógica pura
- ✅ Application Layer: Use Cases orquestan correctamente
- ✅ Infrastructure: Repositories bien implementados
- ✅ Presentation: UI separada correctamente

### ❌ **PROBLEMA 1: Lógica de Negocio Incorrecta**

**Ubicación:** `src/domain/services/DiscountService.ts` líneas 89-131

**Causa raíz:**
```typescript
// Líneas 99-100: Filtra solo descuentos cross-promotion
const crossPromotionDiscounts = activeDiscounts.filter(
  rule => rule.type === 'cross-promotion'
);

// Líneas 103-128: Aplica descuentos
crossPromotionDiscounts.forEach(rule => {
  // ❌ PROBLEMA: NO FILTRA POR appliesTo NI comboIds
  if (!rule.triggerComboId || !rule.targetComboId) return;

  const triggerCount = triggerCounts.get(rule.triggerComboId) || 0;
  if (triggerCount === 0) return;

  // Aplica a TODOS los items que coincidan con targetComboId
  updatedItems.forEach((item, index) => {
    if (item.combo && item.combo.id === rule.targetComboId) {
      // Aplica descuento...
    }
  });
});
```

**Por qué falla:**
1. La lógica **ignora completamente** el campo `appliesTo`
2. La lógica **ignora completamente** el campo `comboIds`
3. Aplica el descuento a **todos** los items con `targetComboId`, sin importar configuración

**Escenario de fallo real:**

```typescript
// Usuario crea descuento:
{
  type: 'cross-promotion',
  appliesTo: 'combos',  // ❌ IGNORADO
  comboIds: ['PO1'],     // ❌ IGNORADO
  triggerComboId: 'PO1',
  targetComboId: 'PO1',
  percentage: 50,
  temporalType: 'weekday',
  value: '1' // Lunes
}

// DiscountService.isDiscountRuleActive() valida día:
// Hoy es Martes (value = '2')
// currentWeekday (2) !== rule.value ('1')
// ❌ Retorna FALSE - El descuento NO está activo
```

### ❌ **PROBLEMA 2: Modelo de Datos Inconsistente**

**Ubicación:** `src/lib/types.ts` líneas 25-48

**Problema conceptual:**
```typescript
export interface DiscountRule {
  type: DiscountRuleType;  // 'simple' | 'cross-promotion'

  // ❌ PROBLEMA: Estos campos son para 'simple', NO para 'cross-promotion'
  appliesTo: 'order' | 'combos';
  comboIds?: string[];

  // ✅ Estos campos SÍ son para 'cross-promotion'
  triggerComboId?: string;
  targetComboId?: string;
}
```

**Análisis semántico:**

#### Tipo: `'simple'`
- **Significa:** "Aplicar X% de descuento directo"
- **Necesita:** Saber DÓNDE aplicar el descuento
- **Usa:**
  - `appliesTo: 'order'` → Aplicar al total de la compra
  - `appliesTo: 'combos'` + `comboIds` → Aplicar a combos específicos

#### Tipo: `'cross-promotion'`
- **Significa:** "Si compras A, B tiene descuento"
- **Ya define DÓNDE:** `targetComboId` es el combo que recibe descuento
- **NO necesita:** `appliesTo` ni `comboIds` porque:
  - El descuento **siempre** se aplica a `targetComboId`
  - El trigger **siempre** es `triggerComboId`
  - No tiene sentido "aplicar a toda la orden" en una promoción cruzada

**Conclusión:** El campo `appliesTo` es **redundante y confuso** para `cross-promotion`.

### ❌ **PROBLEMA 3: UI Permite Configuración Inválida**

**Ubicación:** `src/components/admin/DiscountManagement.tsx`

**Problema:**
```typescript
// Línea 355-373: Campo "Aplica a" SIEMPRE visible
<div className="space-y-2">
  <Label htmlFor="appliesTo">Aplica a</Label>
  <Select value={formData.appliesTo}>
    <SelectItem value="order">Total de la compra</SelectItem>
    <SelectItem value="combos">Combos específicos</SelectItem>
  </Select>
</div>

// Línea 475: Solo aquí se muestran campos de cross-promotion
{formData.type === 'cross-promotion' && (
  <div>
    <Label>Combo Disparador...</Label>
    <Label>Combo con Descuento...</Label>
  </div>
)}
```

**Por qué es confuso:**
1. Cuando el usuario selecciona "Promoción cruzada"
2. Ve el campo "Aplica a" con opciones que NO hacen sentido
3. Ve campos "Combo Disparador" y "Combo con Descuento"
4. Usuario piensa: "¿Por qué tengo que elegir 'Aplica a' si ya elegí los combos?"

---

## 🔧 SOLUCIÓN PROPUESTA

### Solución 1: Arreglar Lógica de DiscountService (CRÍTICO)

**Archivo:** `src/domain/services/DiscountService.ts`

**Cambio necesario:**

```typescript
// ANTES (líneas 103-128):
crossPromotionDiscounts.forEach(rule => {
  if (!rule.triggerComboId || !rule.targetComboId) return;

  const triggerCount = triggerCounts.get(rule.triggerComboId) || 0;
  if (triggerCount === 0) return;

  updatedItems.forEach((item, index) => {
    if (item.combo && item.combo.id === rule.targetComboId) {
      // Aplica descuento
    }
  });
});

// DESPUÉS (con validación de appliesTo):
crossPromotionDiscounts.forEach(rule => {
  if (!rule.triggerComboId || !rule.targetComboId) return;

  const triggerCount = triggerCounts.get(rule.triggerComboId) || 0;
  if (triggerCount === 0) return;

  updatedItems.forEach((item, index) => {
    if (!item.combo || item.combo.id !== rule.targetComboId) return;

    // ✅ NUEVO: Validar appliesTo y comboIds
    if (rule.appliesTo === 'combos' && rule.comboIds) {
      // Solo aplicar si el targetComboId está en la lista de comboIds
      if (!rule.comboIds.includes(rule.targetComboId)) return;
    }

    // Aplicar descuento...
  });
});
```

**Explicación:**
- Para `cross-promotion`, `appliesTo` y `comboIds` actúan como **filtro adicional**
- Si `appliesTo === 'combos'`, solo aplica si `targetComboId` está en `comboIds`
- Si `appliesTo === 'order'`, aplica sin restricción adicional

### Solución 2: Refactor del Modelo (RECOMENDADO A LARGO PLAZO)

**Propuesta:** Separar los tipos de descuento en interfaces distintas

```typescript
// types.ts
export type DiscountRuleType = 'simple' | 'cross-promotion';

// Base común
interface BaseDiscountRule {
  id: string;
  percentage: number;
  temporalType: TemporalType;
  value: string;
  timeRange?: { start: string; end: string };
}

// Descuento simple
export interface SimpleDiscountRule extends BaseDiscountRule {
  type: 'simple';
  appliesTo: 'order' | 'combos';
  comboIds?: string[];  // Solo cuando appliesTo === 'combos'
}

// Descuento cruzado
export interface CrossPromotionDiscountRule extends BaseDiscountRule {
  type: 'cross-promotion';
  triggerComboId: string;
  targetComboId: string;
  // ❌ NO tiene appliesTo ni comboIds
}

// Union type
export type DiscountRule = SimpleDiscountRule | CrossPromotionDiscountRule;
```

**Ventajas:**
- ✅ TypeScript previene errores en tiempo de compilación
- ✅ UI puede mostrar/ocultar campos según tipo
- ✅ Lógica de negocio más clara
- ✅ Imposible crear configuraciones inválidas

### Solución 3: Arreglar UI (INMEDIATO)

**Archivo:** `src/components/admin/DiscountManagement.tsx`

**Cambio necesario:**

```typescript
// ANTES (línea 355):
<div className="space-y-2">
  <Label htmlFor="appliesTo">Aplica a</Label>
  <Select value={formData.appliesTo}>...</Select>
</div>

// DESPUÉS:
{formData.type === 'simple' && (
  <div className="space-y-2">
    <Label htmlFor="appliesTo">Aplica a</Label>
    <Select value={formData.appliesTo}>
      <SelectItem value="order">Total de la compra</SelectItem>
      <SelectItem value="combos">Combos específicos</SelectItem>
    </Select>
  </div>
)}

{formData.type === 'cross-promotion' && (
  <Alert className="bg-blue-50 border-blue-200">
    <AlertDescription>
      El descuento se aplicará cuando se compre el <strong>Combo Disparador</strong>
      y se agregue el <strong>Combo con Descuento</strong> al carrito.
    </AlertDescription>
  </Alert>
)}
```

**Explicación:**
- Campo "Aplica a" **solo** visible para tipo `'simple'`
- Para `'cross-promotion'` mostrar mensaje explicativo
- Reduce confusión del usuario

---

## 🧪 PASOS DE PRUEBA

### Test Case 1: Descuento 2x1 (mismo combo)

**Setup:**
```
Descuento:
- type: 'cross-promotion'
- triggerComboId: 'PO1' (Combo Pollo Entero)
- targetComboId: 'PO1' (mismo)
- percentage: 50
- temporalType: 'weekday'
- value: getCurrentDay() // Hoy
- appliesTo: 'combos'
- comboIds: ['PO1']
```

**Pasos:**
1. Ir a caja
2. Agregar 1 "Combo Pollo Entero" → Sin descuento
3. Agregar otro "Combo Pollo Entero" → ✅ 50% desc en el 2do

**Resultado esperado:**
- Primer combo: Precio normal
- Segundo combo: 50% descuento

### Test Case 2: Promoción cruzada (combos distintos)

**Setup:**
```
Descuento:
- type: 'cross-promotion'
- triggerComboId: 'PO1' (Pollo Entero)
- targetComboId: 'BG1' (Hamburguesa)
- percentage: 30
- temporalType: 'weekday'
- value: getCurrentDay()
- appliesTo: 'combos'
- comboIds: ['BG1']
```

**Pasos:**
1. Agregar 1 "Hamburguesa" → Sin descuento (falta trigger)
2. Agregar 1 "Pollo Entero" → Sin descuento
3. Verificar que "Hamburguesa" ahora tiene 30% desc

**Resultado esperado:**
- Hamburguesa: 30% descuento (activado por Pollo)
- Pollo: Sin descuento

### Test Case 3: Día incorrecto (validación temporal)

**Setup:**
```
Descuento:
- temporalType: 'weekday'
- value: '1' // Lunes
// Hoy es Martes (value = '2')
```

**Resultado esperado:**
- ❌ Descuento NO se aplica (día incorrecto)

---

## 📊 RESUMEN DE CAMBIOS REQUERIDOS

### Prioridad ALTA (Arreglar funcionalidad)

1. **DiscountService.ts** - Agregar validación de `appliesTo` y `comboIds`
2. **DiscountManagement.tsx** - Ocultar campo "Aplica a" para cross-promotion
3. **Tests** - Verificar que descuentos se aplican correctamente

### Prioridad MEDIA (Mejorar experiencia)

4. **UI** - Agregar mensaje explicativo para cross-promotion
5. **Validaciones** - Validar que cross-promotion tenga ambos combos

### Prioridad BAJA (Refactor arquitectura)

6. **types.ts** - Separar interfaces SimpleDiscountRule y CrossPromotionDiscountRule
7. **Use Cases** - Actualizar validaciones para tipos específicos
8. **Migración** - Script para migrar descuentos existentes

---

## 🎓 RESPUESTA A PREGUNTA DEL USUARIO

### "¿La promoción cruzada necesita el campo appliesTo?"

**Respuesta corta:** NO, es redundante y confuso.

**Explicación detallada:**

#### Para `simple`:
```
appliesTo: 'order' → "Todos los combos tienen 10% desc"
appliesTo: 'combos' + comboIds: ['PO1', 'BG1'] → "Solo estos combos tienen desc"
```

#### Para `cross-promotion`:
```
triggerComboId: 'PO1'
targetComboId: 'BG1'
→ "Si compras PO1, BG1 tiene descuento"
→ El targetComboId YA DEFINE dónde aplica
→ appliesTo y comboIds son REDUNDANTES
```

**Sin embargo...**

Si queremos mantener `appliesTo` para cross-promotion, podría servir para:

```typescript
// Caso 1: Promoción específica
appliesTo: 'combos'
comboIds: ['BG1', 'BG2', 'BG3']
triggerComboId: 'PO1'
targetComboId: 'BG1'
→ "Si compras PO1, solo BG1/BG2/BG3 de mi lista tienen descuento"
→ Útil si hay muchas hamburguesas pero solo algunas califican

// Caso 2: Promoción general
appliesTo: 'order'
triggerComboId: 'PO1'
targetComboId: 'BG1'
→ "Si compras PO1, cualquier BG1 en la orden tiene descuento"
→ Menos restrictivo
```

**Recomendación final:**

1. **Opción A (Simple):** Eliminar `appliesTo` y `comboIds` de cross-promotion
2. **Opción B (Flexible):** Mantenerlos pero documentar claramente su uso
3. **Opción C (Actual):** Arreglar la lógica para que los respete

**Mi recomendación:** Opción A (eliminar) para simplicidad, o si no es posible, Opción C (arreglar lógica).

---

## ✅ CONCLUSIÓN

**Problemas encontrados:**
1. ❌ Lógica de DiscountService ignora `appliesTo` y `comboIds`
2. ❌ UI muestra campos confusos para cross-promotion
3. ❌ Modelo de datos tiene campos redundantes

**Soluciones propuestas:**
1. ✅ Arreglar lógica de negocio (CRÍTICO)
2. ✅ Mejorar UI (IMPORTANTE)
3. ✅ Refactor de tipos (RECOMENDADO)

**Arquitectura Clean:**
- ✅ No hay violaciones
- ✅ Problema está bien localizado en Domain Layer
- ✅ Solución respeta la arquitectura
