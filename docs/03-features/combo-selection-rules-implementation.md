# Implementación: Reglas de Selección de Productos en Combos

## Resumen
Sistema de productos obligatorios vs opcionales en combos, permitiendo configurar productos fijos (incluidos automáticamente) y grupos de selección (el cliente debe elegir UNO del grupo).

---

## Problema a Resolver

### Requerimiento Original:
Al crear un combo, los productos deben poder gestionarse como:
- **OBLIGATORIOS**: Productos incluidos automáticamente (ej: hamburguesa)
- **DE SELECCIÓN OBLIGATORIA**: Cliente debe elegir UNO del grupo (ej: papas fritas O ensalada)

### Reglas de Negocio:
✅ **Productos fijos** se incluyen automáticamente en el combo
✅ **Productos de selección** requieren que el cliente elija exactamente UNO por grupo
❌ **NO se permite** omitir la selección (no elegir ninguno)
❌ **NO se permite** elegir productos no incluidos en el combo
❌ **NO se permite** restar del precio si no se elige un producto

---

## Arquitectura Implementada (Clean Architecture)

### 🟦 DOMAIN LAYER (100% portable, sin dependencias)

#### 1. Tipos actualizados en `src/lib/types.ts`

```typescript
/**
 * Tipo de selección de producto en combo
 */
export type ComboProductSelectionType = 'fixed' | 'choice';

export interface ComboProduct {
  productId: string;
  quantity: number;
  selectionType: ComboProductSelectionType; // 'fixed' o 'choice'
  choiceGroup?: string; // Grupo de elección (ej: "guarnicion", "bebida")
}
```

**✅ Cumple Clean Architecture:**
- Define contratos de dominio
- Sin dependencias externas
- 100% portable

#### 2. Servicio de Dominio: `src/domain/services/ComboValidationService.ts`

**Lógica de negocio pura:**

```typescript
export class ComboValidationService {
  // Valida configuración del combo (admin)
  static validateComboConfiguration(combo: Combo): ComboValidationResult

  // Valida selecciones del usuario (cajero)
  static validateUserSelections(
    combo: Combo,
    selections: UserProductSelection[]
  ): ComboValidationResult

  // Obtiene productos finales (fixed + selecciones)
  static getFinalComboProducts(
    combo: Combo,
    selections: UserProductSelection[],
    allInventory: InventoryItem[]
  ): { products: InventoryItem[]; validation: ComboValidationResult }

  // Helpers
  static getChoiceGroups(combo: Combo): string[]
  static getFixedProducts(combo: Combo): ComboProduct[]
  static getProductsByChoiceGroup(combo: Combo, group: string): ComboProduct[]
  static requiresUserSelection(combo: Combo): boolean
}
```

**✅ Cumple Clean Architecture:**
- Funciones puras sin dependencias
- Solo lógica de negocio
- Sin acceso a DB ni APIs
- Fácilmente testeable

#### 3. Helper de Migración: `src/domain/services/ComboMigrationHelper.ts`

**Retrocompatibilidad con combos existentes:**

```typescript
export class ComboMigrationHelper {
  // Migración simple (todos → 'choice')
  static migrateCombo(combo: Combo): Combo

  // Migración inteligente (analiza tipos)
  static smartMigration(
    combo: Combo,
    allInventory: Array<{ id: string; type: string }>
  ): Combo

  // Verifica si necesita migración
  static needsMigration(combo: Combo): boolean
}
```

**Estrategia de migración automática:**
- Si solo hay 1 producto de un tipo → `selectionType: 'fixed'`
- Si hay > 1 del mismo tipo → `selectionType: 'choice'` con `choiceGroup` basado en el tipo

**✅ Cumple Clean Architecture:**
- Funciones puras
- No modifica la base de datos
- Migración en memoria

---

### 🟨 INFRASTRUCTURE LAYER (Implementaciones)

#### 1. MongoDB Repository: `src/infrastructure/repositories/mongodb/MongoDBComboRepository.ts`

**Sin cambios necesarios** ✅

MongoDB guarda documentos JSON tal cual, por lo que los nuevos campos `selectionType` y `choiceGroup` se persisten automáticamente sin modificaciones al repositorio.

---

### 🟥 PRESENTATION LAYER (UI + React)

#### 1. Admin UI: `src/app/admin/combos/page.tsx`

**Gestión de productos en combos:**

```tsx
// Cada producto del combo tiene:
<Select> {/* Tipo de Selección */}
  <SelectItem value="fixed">Fijo (incluido)</SelectItem>
  <SelectItem value="choice">Opcional (a elegir)</SelectItem>
</Select>

{/* Si es 'choice', mostrar campo de grupo */}
{selectionType === 'choice' && (
  <Input
    placeholder="ej: guarnicion, bebida"
    value={choiceGroup}
    onChange={...}
  />
)}
```

**Features:**
- Selector visual "Fijo" vs "Opcional"
- Campo de grupo de elección (solo para opcionales)
- Alert informativo explicando la funcionalidad
- Validación visual en tiempo real

**✅ Cumple Clean Architecture:**
- Solo UI, sin lógica de negocio
- Llama a ComboAPI para persistencia

#### 2. Cashier UI: `src/components/cashier/CustomizationDialog.tsx`

**COMPLETAMENTE REESCRITO** para soportar la nueva estructura:

**Estructura del diálogo:**

```tsx
// 1. Productos fijos (con checkmark verde)
<div>
  <h3>Incluido en el combo</h3>
  <CheckCircle2 /> Hamburguesa
  <CheckCircle2 /> Papas medianas
</div>

// 2. Grupos de selección (radio buttons)
<div>
  <h3>Guarnición (Elige una opción)</h3>
  <RadioGroup>
    <RadioGroupItem value="papas-grandes" />
    <RadioGroupItem value="ensalada" />
  </RadioGroup>
</div>

// 3. Opciones globales
<Switch> ¿Con picante? </Switch>
<Switch> ¿Con hielo? </Switch>
```

**Flujo de validación:**

1. Usuario abre diálogo de combo
2. **Migración automática** si el combo no tiene `selectionType`
3. Renderiza productos fijos (solo info, no seleccionables)
4. Renderiza grupos de selección (radio buttons)
5. Usuario selecciona UNA opción por cada grupo
6. Al hacer submit:
   - Valida con `ComboValidationService.validateUserSelections()`
   - Si faltan selecciones → toast de error
   - Si está completo → construye `OrderItem` y agrega al pedido

**✅ Cumple Clean Architecture:**
- Solo UI y orchestración
- Lógica de validación en `ComboValidationService`
- Migración automática con `ComboMigrationHelper`

---

## Flujo Completo

### 1. Admin crea/edita combo:

```
1. Admin abre formulario de combo
2. Agrega productos al combo
3. Para cada producto, selecciona:
   - Tipo: "Fijo" o "Opcional"
   - Si es opcional: Nombre del grupo (ej: "guarnicion")
4. Guarda combo en MongoDB
```

**Ejemplo de configuración:**

```json
{
  "id": "combo-1",
  "name": "Combo Clásico",
  "price": 5000,
  "products": [
    {
      "productId": "hamburguesa-clasica",
      "quantity": 1,
      "selectionType": "fixed"  // ← Incluido automáticamente
    },
    {
      "productId": "papas-fritas",
      "quantity": 1,
      "selectionType": "choice",
      "choiceGroup": "guarnicion"  // ← Grupo de elección
    },
    {
      "productId": "ensalada",
      "quantity": 1,
      "selectionType": "choice",
      "choiceGroup": "guarnicion"  // ← Mismo grupo, debe elegir UNO
    },
    {
      "productId": "coca-cola",
      "quantity": 1,
      "selectionType": "choice",
      "choiceGroup": "bebida"
    },
    {
      "productId": "sprite",
      "quantity": 1,
      "selectionType": "choice",
      "choiceGroup": "bebida"
    }
  ]
}
```

### 2. Cajero toma pedido:

```
1. Cajero hace click en combo
2. Se abre CustomizationDialog
3. Diálogo muestra:
   - "Incluido en el combo": Hamburguesa clásica ✓
   - "Guarnición (Elige una)": ○ Papas fritas  ○ Ensalada
   - "Bebida (Elige una)": ○ Coca-Cola  ○ Sprite
4. Cajero selecciona: Papas fritas + Coca-Cola
5. Click "Agregar al Pedido"
6. Validación en backend:
   - ComboValidationService.validateUserSelections() ✅
   - Todos los grupos tienen selección ✅
7. Se crea OrderItem con productos finales:
   - Hamburguesa (fijo)
   - Papas fritas (seleccionado)
   - Coca-Cola (seleccionado)
```

### 3. Retrocompatibilidad (combos antiguos):

```
1. Combo antiguo sin selectionType se carga
2. ComboMigrationHelper.smartMigration() lo procesa:
   - Analiza productos por tipo
   - Si solo hay 1 producto de un tipo → 'fixed'
   - Si hay > 1 del mismo tipo → 'choice' con grupo basado en tipo
3. Combo migrado se usa normalmente (sin tocar la DB)
4. Admin puede ajustar manualmente las reglas
```

---

## Impacto en Base de Datos

### Colección `combos`:

```json
{
  "_id": ObjectId,
  "name": "string",
  "price": number,
  "products": [
    {
      "productId": "string",
      "quantity": number,
      "selectionType": "fixed" | "choice",  // NUEVO
      "choiceGroup": "string"               // NUEVO (opcional)
    }
  ]
}
```

**Retrocompatibilidad:**
- Combos existentes sin `selectionType` funcionan gracias a `ComboMigrationHelper`
- Se migran automáticamente en memoria (sin tocar DB)
- Admin puede actualizar combos para guardar la estructura nueva

---

## Archivos Nuevos Creados

### Domain:
- `src/domain/services/ComboValidationService.ts` - Validación de combos
- `src/domain/services/ComboMigrationHelper.ts` - Migración automática

### Documentation:
- `docs/combo-selection-rules-implementation.md` - Esta documentación

---

## Archivos Modificados

### Domain:
- `src/lib/types.ts` - Tipos `ComboProductSelectionType` y `ComboProduct` actualizados

### Presentation:
- `src/app/admin/combos/page.tsx` - UI para gestionar selectionType y choiceGroup
- `src/components/cashier/CustomizationDialog.tsx` - REESCRITO completamente para nueva lógica

---

## Validación Final: ✅ Clean Architecture

### ✅ Reglas de Dependencia Respetadas

```
Presentation → Domain
Infrastructure → Domain

✅ Domain NO depende de nada
✅ Business Logic en domain/services/
✅ UI solo orquesta, validación en domain
```

### ✅ Separación de Capas

| Capa | Responsabilidad | Verificado |
|------|----------------|------------|
| Domain | Tipos, validación de reglas, migración | ✅ |
| Infrastructure | Persistencia en MongoDB (sin cambios) | ✅ |
| Presentation | UI admin + cashier, orchestración | ✅ |

### ✅ Portabilidad

- **Domain layer**: 100% portable, puede usarse en cualquier proyecto
- **Infrastructure**: MongoDB guarda JSON tal cual, sin cambios
- **Presentation**: Separable a aplicación móvil/web independiente

### ✅ Testabilidad

```typescript
// Domain services son funciones puras:
describe('ComboValidationService', () => {
  it('should validate choice group selections', () => {
    const combo = {
      products: [
        { productId: 'p1', selectionType: 'choice', choiceGroup: 'guarnicion' },
        { productId: 'p2', selectionType: 'choice', choiceGroup: 'guarnicion' }
      ]
    };
    const selections = [{ productId: 'p1', choiceGroup: 'guarnicion' }];
    const result = ComboValidationService.validateUserSelections(combo, selections);
    expect(result.isValid).toBe(true);
  });

  it('should fail if no selection for choice group', () => {
    // ... test que falla si no hay selección
  });

  it('should fail if multiple selections in same group', () => {
    // ... test que falla si hay múltiples selecciones
  });
});
```

---

## Casos de Uso Cubiertos

### ✅ Caso 1: Combo simple (todo fijo)
```
Combo: Hamburguesa + Papas + Coca-Cola
Todos los productos: selectionType: 'fixed'
→ Cliente no elige nada, todo se incluye automáticamente
```

### ✅ Caso 2: Combo con una opción
```
Combo: Hamburguesa (fijo) + (Papas O Ensalada)
- Hamburguesa: selectionType: 'fixed'
- Papas: selectionType: 'choice', choiceGroup: 'guarnicion'
- Ensalada: selectionType: 'choice', choiceGroup: 'guarnicion'
→ Cliente DEBE elegir Papas O Ensalada
```

### ✅ Caso 3: Combo con múltiples grupos de elección
```
Combo: Hamburguesa (fijo) + (Papas O Ensalada) + (Coca O Sprite)
- Hamburguesa: fixed
- Papas/Ensalada: choice, group: 'guarnicion'
- Coca/Sprite: choice, group: 'bebida'
→ Cliente DEBE elegir una guarnición Y una bebida
```

### ✅ Caso 4: Retrocompatibilidad
```
Combo antiguo sin selectionType → Migración automática
→ Funciona normalmente, admin puede ajustar después
```

### ❌ Caso rechazado: Omitir selección
```
Cliente intenta no elegir guarnición
→ ComboValidationService.validateUserSelections() → error
→ Toast: "Debe seleccionar una opción para 'guarnicion'"
```

### ❌ Caso rechazado: Elegir múltiples del mismo grupo
```
Cliente intenta elegir Papas Y Ensalada
→ RadioGroup solo permite una selección
→ Si se manipula: validación rechaza múltiples selecciones
```

---

## Próximos Pasos (Opcionales)

### Mejoras futuras sin romper arquitectura:

1. **Tests unitarios:**
   ```typescript
   // domain/services/ComboValidationService.test.ts
   // domain/services/ComboMigrationHelper.test.ts
   ```

2. **Precio dinámico por selección:**
   - Agregar `priceModifier` a `ComboProduct`
   - Lógica en `ComboValidationService` para calcular precio final

3. **Cantidades variables:**
   - Permitir que admin configure "Elige hasta N opciones"
   - Actualizar `choiceGroup` con `maxSelections`

4. **Migración masiva de combos:**
   - Script para actualizar todos los combos en MongoDB
   - Use case: `MigrateAllCombosUseCase`

---

## Conclusión

✅ **Clean Architecture completamente respetada**
✅ **Código 100% portable y mantenible**
✅ **Separación clara de responsabilidades**
✅ **Lógica de negocio en domain layer**
✅ **Retrocompatibilidad garantizada**
✅ **UX mejorada para admin y cajero**

El sistema de reglas de selección está implementado siguiendo estrictamente Clean Architecture, permitiendo que el código sea fácil de mantener, testear y evolucionar sin romper la arquitectura existente.
