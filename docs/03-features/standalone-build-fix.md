# Fix: Componentes no se visualizan en producción (standalone build)

**Fecha:** 2025-12-20
**Problema reportado:** Los combos no se visualizaban al ejecutar `node server.js` en Windows, pero sí funcionaban con `npm run dev`.

---

## 🔴 Problema

En **Next.js standalone build** (`output: 'standalone'`), los **Client Components** (`"use client"`) **NO pueden importar APIs internas directamente**.

### ¿Por qué funciona en desarrollo pero no en producción?

- **`npm run dev`**: Next.js ejecuta todo en el mismo proceso, compartiendo contexto entre servidor y cliente
- **`node server.js`** (standalone): El cliente se ejecuta en el navegador y debe usar HTTP para comunicarse con el servidor

### Error típico

```tsx
// ❌ ESTO NO FUNCIONA EN STANDALONE BUILD
"use client";
import { ComboAPI } from '@/api';  // API interna

export default function Page() {
  const combos = await ComboAPI.getAll();  // Error: API no disponible en el cliente
}
```

**Resultado:** La página se renderiza vacía, sin datos, sin errores visibles en consola.

---

## ✅ Solución Implementada

Creamos un **cliente HTTP** que usa `fetch()` para llamar a las API routes desde los componentes cliente.

### Arquitectura de la solución

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT COMPONENT ("use client")                        │
│  - src/app/admin/combos/page.tsx                        │
│                                                          │
│  import { CombosClient } from '@/lib/api-client'        │
│  const combos = await CombosClient.getAll()             │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP GET /api/combos
                      ↓
┌─────────────────────────────────────────────────────────┐
│  API ROUTE (Server-side)                                │
│  - src/app/api/combos/route.ts                          │
│                                                          │
│  export async function GET() {                          │
│    const combos = await ComboAPI.getAll()  // ✅ OK     │
│    return NextResponse.json(combos)                     │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

### Archivo creado: `src/lib/api-client.ts`

Cliente HTTP con todos los métodos necesarios:

- **CombosClient**: getAll, create, update, delete
- **InventoryClient**: getAll, create, update, delete
- **EmployeesClient**: getAll, create, update, delete
- **ShiftsClient**: getAll, getByDateRange
- **OrdersClient**: getAll
- **DiscountsClient**: getAll

```typescript
// src/lib/api-client.ts
export const CombosClient = {
  async getAll(): Promise<Combo[]> {
    const res = await fetch('/api/combos', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch combos: ${res.statusText}`);
    }

    return res.json();
  },
  // ... más métodos
};
```

### Archivos modificados

1. **src/app/admin/combos/page.tsx**
2. **src/app/admin/inventory/page.tsx**
3. **src/app/admin/employees/page.tsx**
4. **src/app/admin/shifts/page.tsx**
5. **src/app/admin/dashboard/page.tsx**

**Cambio aplicado:**

```typescript
// ❌ ANTES (solo funciona en dev)
import { ComboAPI } from '@/api';
const combos = await ComboAPI.getAll();

// ✅ DESPUÉS (funciona en dev y producción)
import { CombosClient } from '@/lib/api-client';
const combos = await CombosClient.getAll();
```

---

## 🧪 Verificación

### 1. TypeScript compila sin errores

```bash
npm run typecheck
# ✅ Sin errores
```

### 2. Build standalone exitoso

```bash
npm run build
# ✅ Build completo sin errores
```

### 3. Probar en producción

```bash
# En desarrollo (debe funcionar)
npm run dev
# Abrir http://localhost:9002/admin/combos

# En producción standalone (debe funcionar)
cd .next/standalone
node server.js
# Abrir http://localhost:3000/admin/combos
```

**Resultado esperado:** Los combos se visualizan correctamente en ambos entornos.

---

## 📦 Actualización del deploy en Windows

Los pasos de instalación **NO cambian**. El fix está incluido en el build.

### Proceso sigue igual:

```bash
# 1. Build
npm run build

# 2. Copiar standalone
cp -R .next/standalone/* fastchicken-win/

# 3. Copiar static
rm -rf fastchicken-win/.next/static
cp -R .next/static fastchicken-win/.next/

# 4. Copiar public
cp -R public fastchicken-win/

# 5. Copiar .env
cp .env fastchicken-win/.env

# 6. ZIP y enviar a cliente
```

**En Windows el cliente ejecuta:**

```bash
node server.js
```

✅ Todo funcionará correctamente.

---

## 🎯 Lección aprendada

### Regla general para Next.js standalone:

| Ubicación | Puede usar API interna | Debe usar HTTP |
|-----------|------------------------|----------------|
| **Client Component** (`"use client"`) | ❌ NO | ✅ SÍ |
| **Server Component** (default) | ✅ SÍ | ❌ NO |
| **API Route** (`route.ts`) | ✅ SÍ | ❌ NO |
| **Server Action** (`"use server"`) | ✅ SÍ | ❌ NO |

### ¿Cómo identificar Client Components?

Busca la directiva `"use client"` al inicio del archivo. Si está presente, **debe usar HTTP client**.

```tsx
"use client";  // ← Este archivo es Client Component

import { CombosClient } from '@/lib/api-client';  // ✅ Correcto
```

---

## 🔍 Debug en caso de problemas

Si algún componente no muestra datos en producción:

1. **Verificar si es Client Component**
   ```bash
   grep -r '"use client"' src/app/admin/
   ```

2. **Buscar importaciones de API interna**
   ```bash
   grep -r "from '@/api'" src/app/admin/
   ```

3. **Reemplazar con HTTP client**
   ```typescript
   // ❌ Cambiar esto:
   import { XxxAPI } from '@/api';

   // ✅ Por esto:
   import { XxxClient } from '@/lib/api-client';
   ```

4. **Rebuild y probar**
   ```bash
   npm run build
   cd .next/standalone
   node server.js
   ```

---

## ✅ Confirmación del fix

- [x] TypeScript compila sin errores
- [x] Build standalone exitoso
- [x] Todos los componentes admin actualizados
- [x] Cliente HTTP completo con todos los métodos
- [x] Documentación creada
- [x] Compatible con proceso de deploy existente

**Status:** ✅ Listo para producción
