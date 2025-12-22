# Sistema Simplificado de Selección de Productos en Combos

## Resumen
Sistema simple para gestionar productos fijos vs elegibles en combos de FastChicken POS.

---

## Concepto Principal

Un producto en un combo puede ser:
- **FIJO (isFixed: true)**: Se incluye automáticamente (ej: hamburguesa)
- **ELEGIBLE (isFixed: false)**: Cliente debe elegir entre opciones del mismo tipo (ej: Coca Cola O Sprite)

**Regla simple**: Si hay múltiples productos NO FIJOS del mismo tipo (product/drink/side), el cliente **DEBE** elegir UNO.

---

## Estructura de Datos

### Tipo Actualizado: `ComboProduct`

```typescript
export interface ComboProduct {
  productId: string;
  quantity: number;
  isFixed: boolean; // true = incluido automáticamente, false = elegible
}
```

### Ejemplo de Combo

```json
{
  "id": "combo-clasico",
  "name": "Combo Clásico",
  "price": 5000,
  "products": [
    {
      "productId": "hamburguesa-clasica",
      "quantity": 1,
      "isFixed": true  // ✅ Incluido automáticamente
    },
    {
      "productId": "papas-fritas",
      "quantity": 1,
      "isFixed": false  // ⚠️ Elegible (cliente debe elegir)
    },
    {
      "productId": "ensalada",
      "quantity": 1,
      "isFixed": false  // ⚠️ Elegible (cliente debe elegir)
    },
    {
      "productId": "coca-cola",
      "quantity": 1,
      "isFixed": false  // ⚠️ Elegible
    },
    {
      "productId": "sprite",
      "quantity": 1,
      "isFixed": false  // ⚠️ Elegible
    }
  ]
}
```

**Resultado para el cliente:**
- ✅ Hamburguesa Clásica (incluida)
- ⚠️ Debe elegir: Papas Fritas O Ensalada (ambas son 'side' y no fijas)
- ⚠️ Debe elegir: Coca Cola O Sprite (ambas son 'drink' y no fijas)

---

## Lógica de Agrupación Automática

El sistema agrupa automáticamente productos elegibles **por tipo de inventario**:

| Tipo de Inventario | Etiqueta en UI       | Campo en InventoryItem |
|--------------------|----------------------|------------------------|
| `product`          | Producto Principal   | `type: 'product'`      |
| `drink`            | Bebida               | `type: 'drink'`        |
| `side`             | Guarnición           | `type: 'side'`         |

**No necesitas configurar grupos manualmente** - el sistema agrupa automáticamente por el tipo del producto en inventario.

---

## Arquitectura (Clean Architecture)

### 🟦 DOMAIN LAYER

#### Archivo: `src/lib/types.ts`

```typescript
export interface ComboProduct {
  productId: string;
  quantity: number;
  isFixed: boolean;
}
```

✅ Simple, sin lógica compleja
✅ Sin dependencias externas
✅ 100% portable

### 🟨 INFRASTRUCTURE LAYER

#### Archivo: `src/infrastructure/repositories/mongodb/MongoDBComboRepository.ts`

**Sin cambios necesarios** - MongoDB guarda JSON tal cual.

### 🟥 PRESENTATION LAYER

#### 1. Admin UI: `src/app/admin/combos/page.tsx`

**Interface simple con checkbox:**

```tsx
<Checkbox
  id={`fixed-${index}`}
  checked={p.isFixed ?? true}
  onCheckedChange={(checked) => handleProductChange(index, 'isFixed', checked)}
/>
<Label htmlFor={`fixed-${index}`}>
  Producto fijo (incluido automáticamente)
</Label>
```

**Features:**
- ✅ Checkbox simple "Producto fijo"
- ✅ Alert informativo con ejemplo paso a paso
- ✅ **Badges en tiempo real** mostrando tipo de producto (Bebida/Guarnición/Producto)
- ✅ **Feedback visual instantáneo:**
  - Badge azul "Elegible (N opciones)" cuando hay 2+ productos no fijos del mismo tipo
  - Badge amarillo "⚠️ Requiere 2+ para elegir" cuando solo hay 1 producto no fijo
- ✅ **Vista previa del combo** mostrando:
  - Productos fijos con badge "Incluido"
  - Grupos de elección con badge "Elegir 1" y cantidad de opciones
  - Advertencias si la configuración está incompleta
- ✅ **Selector con tipos** - Al elegir producto, muestra "(Bebida)", "(Guarnición)", etc.

**Ejemplo de UI resultante:**

```
┌─ Producto 1 ────────────────────────────┐
│ [Hamburguesa Clásica ▼]  [1]  [🗑️]      │
│ ☑ Producto fijo          [Producto]     │
└──────────────────────────────────────────┘

┌─ Producto 2 ────────────────────────────┐
│ [Coca Cola ▼]  [1]  [🗑️]                │
│ ☐ Producto fijo   [Bebida] [Elegible (2 opciones)]  │
└──────────────────────────────────────────┘

┌─ Producto 3 ────────────────────────────┐
│ [Sprite ▼]  [1]  [🗑️]                   │
│ ☐ Producto fijo   [Bebida] [Elegible (2 opciones)]  │
└──────────────────────────────────────────┘

┌─ Vista previa del combo: ───────────────┐
│ [Incluido] 1x Producto (fijo)           │
│ [Elegir 1] Entre 2 opciones de Bebida   │
└──────────────────────────────────────────┘
```

El admin ve **inmediatamente** qué está configurando sin necesidad de probar en caja.

#### 2. Cashier UI: `src/components/cashier/CustomizationDialog.tsx`

**Lógica simplificada:**

```typescript
// 1. Separar productos por isFixed
const fixedProducts = combo.products.filter(p => p.isFixed);
const selectableProducts = combo.products.filter(p => !p.isFixed);

// 2. Agrupar productos elegibles por tipo de inventario
const selectableByType = new Map<string, ComboProduct[]>();
selectableProducts.forEach(p => {
  const inventoryItem = allInventory.find(inv => inv.id === p.productId);
  const type = inventoryItem.type; // 'product', 'drink', 'side'

  if (!selectableByType.has(type)) {
    selectableByType.set(type, []);
  }
  selectableByType.get(type)!.push(p);
});

// 3. Validar que el usuario haya seleccionado UNO por cada tipo
selectableByType.forEach((_, type) => {
  if (!selections.has(type)) {
    errors.push(`Debe seleccionar una opción para ${getTypeLabel(type)}`);
  }
});
```

**UI resultante:**

```
┌─ Personalizar: Combo Clásico ─────────────┐
│                                            │
│ ✅ Incluido en el combo                    │
│    ✓ Hamburguesa Clásica                   │
│                                            │
│ Guarnición (Elige una opción)             │
│    ○ Papas Fritas                          │
│    ○ Ensalada                              │
│                                            │
│ Bebida (Elige una opción)                 │
│    ○ Coca Cola                             │
│    ○ Sprite                                │
│                                            │
│ ¿Con hielo?    [Toggle]                    │
│ ¿Con picante?  [Toggle]                    │
│                                            │
│         [Cancelar]  [Agregar al Pedido]    │
└────────────────────────────────────────────┘
```

---

## Casos de Uso

### ✅ Caso 1: Todo fijo (sin elección)
```json
{
  "products": [
    { "productId": "hamburguesa", "quantity": 1, "isFixed": true },
    { "productId": "papas", "quantity": 1, "isFixed": true },
    { "productId": "coca-cola", "quantity": 1, "isFixed": true }
  ]
}
```
**Resultado:** Todo se incluye automáticamente, sin opciones para el cliente.

---

### ✅ Caso 2: Producto fijo + opciones
```json
{
  "products": [
    { "productId": "hamburguesa", "quantity": 1, "isFixed": true },
    { "productId": "papas", "quantity": 1, "isFixed": false },
    { "productId": "ensalada", "quantity": 1, "isFixed": false }
  ]
}
```
**Resultado:**
- ✅ Hamburguesa (incluida)
- ⚠️ Cliente elige: Papas O Ensalada

---

### ✅ Caso 3: Múltiples grupos de elección
```json
{
  "products": [
    { "productId": "hamburguesa", "quantity": 1, "isFixed": true },
    { "productId": "papas", "quantity": 1, "isFixed": false },
    { "productId": "ensalada", "quantity": 1, "isFixed": false },
    { "productId": "coca", "quantity": 1, "isFixed": false },
    { "productId": "sprite", "quantity": 1, "isFixed": false }
  ]
}
```
**Resultado:**
- ✅ Hamburguesa (incluida)
- ⚠️ Cliente elige guarnición: Papas O Ensalada
- ⚠️ Cliente elige bebida: Coca O Sprite

---

### ✅ Caso 4: Solo opciones (sin fijos)
```json
{
  "products": [
    { "productId": "hamburguesa-clasica", "quantity": 1, "isFixed": false },
    { "productId": "hamburguesa-doble", "quantity": 1, "isFixed": false }
  ]
}
```
**Resultado:** Cliente DEBE elegir una hamburguesa.

---

## Validaciones

### Admin (al crear/editar combo)
- ✅ Debe tener al menos 1 producto
- ⚠️ No se valida estructura - admin decide configuración

### Cashier (al agregar combo al pedido)
1. **Verificar selecciones completas:**
   - Por cada tipo de inventario con productos elegibles
   - Cliente debe haber seleccionado exactamente UNO

2. **Verificar stock:**
   - Productos fijos + seleccionados deben tener stock

3. **Construir OrderItem:**
   - Incluir productos fijos
   - Incluir productos seleccionados
   - Aplicar descuentos si corresponden

---

## Retrocompatibilidad

**Combos antiguos sin `isFixed`:** Se considera `isFixed: true` por defecto.

```typescript
// En CustomizationDialog.tsx
const fixedProducts = combo.products.filter(p => p.isFixed ?? true);
```

Esto garantiza que combos existentes sigan funcionando como "todo incluido".

---

## Ventajas de esta Implementación

✅ **Simple:** Solo un campo boolean `isFixed`
✅ **Intuitivo:** Admin entiende fácilmente "fijo" vs "elegible"
✅ **Automático:** Agrupación por tipo de inventario (sin configuración manual)
✅ **Flexible:** Permite cualquier combinación de productos
✅ **Clean Architecture:** Separación clara de capas
✅ **Retrocompatible:** Combos antiguos funcionan sin migración
✅ **Feedback visual en tiempo real:** Admin ve inmediatamente si la configuración es correcta
✅ **Badges descriptivos:** Tipo de producto, estado de elegibilidad, advertencias
✅ **Vista previa del combo:** Resumen claro de lo que verá el cliente
✅ **Prevención de errores:** Advertencias cuando falta agregar productos para crear grupo de elección
✅ **Escalable:** Análisis y validación sin lógica compleja
✅ **UX clara:** Sin ambigüedad sobre cómo configurar opciones elegibles

---

## Archivos Modificados

### Domain:
- ✅ `src/lib/types.ts` - Tipo `ComboProduct` simplificado

### Presentation:
- ✅ `src/app/admin/combos/page.tsx` - Checkbox simple para `isFixed`
- ✅ `src/components/cashier/CustomizationDialog.tsx` - Lógica simplificada de selección

### Documentation:
- ✅ `docs/combo-product-selection-simple.md` - Esta documentación

---

## Archivos Obsoletos (pueden eliminarse)

- ❌ `src/domain/services/ComboValidationService.ts` - Ya no necesario
- ❌ `src/domain/services/ComboMigrationHelper.ts` - Ya no necesario
- ❌ `docs/combo-selection-rules-implementation.md` - Versión compleja antigua

---

## Conclusión

✅ **Implementación simple y entendible**
✅ **Gestión práctica en admin**
✅ **UX clara para cajeros**
✅ **Sin lógica compleja innecesaria**
✅ **Respeta Clean Architecture**

El sistema ahora es mucho más simple: productos son fijos o elegibles, y la agrupación se hace automáticamente por tipo de inventario.
