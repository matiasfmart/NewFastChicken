# Plan de Separación en 3 Proyectos

## Objetivo
Separar el monolito actual de Next.js en 3 proyectos independientes:
1. **Backend API** - Node.js/Express + MongoDB
2. **Frontend Caja** - Next.js (solo interfaz cajero)
3. **Frontend Admin** - Next.js (solo interfaz administración)

---

## 📁 Estructura Actual vs. Futura

### Monolito Actual (NewFastChicken)
```
src/
├── domain/              # Lógica de negocio PURA
├── application/         # Casos de uso
├── infrastructure/      # Implementaciones (MongoDB, HTTP)
├── context/            # React Context (estado)
├── components/         # UI Components
├── app/               # Next.js routes
└── lib/               # Tipos y utilidades
```

### Proyectos Separados

```
📦 fastchicken-backend/
├── src/
│   ├── domain/                    # ← COPIADO DEL MONOLITO
│   │   ├── repositories/          # Interfaces (I*Repository.ts)
│   │   └── services/              # DiscountService, etc.
│   │
│   ├── application/               # ← COPIADO DEL MONOLITO
│   │   └── use-cases/             # *UseCase.ts
│   │
│   ├── infrastructure/            # ← SOLO MongoDB
│   │   └── repositories/
│   │       └── mongodb/           # MongoDB*Repository.ts
│   │
│   ├── presentation/              # ← NUEVO (API REST)
│   │   ├── routes/                # Express routes
│   │   ├── controllers/           # HTTP controllers
│   │   └── middleware/            # Auth, validation, etc.
│   │
│   ├── lib/                       # ← COPIADO
│   │   ├── types.ts               # Tipos compartidos
│   │   └── mongodb.ts             # Conexión MongoDB
│   │
│   └── dtos/                      # ← COPIADO
│       └── index.ts               # DTOs para validación
│
├── package.json
├── tsconfig.json
└── .env

📦 fastchicken-cashier/
├── src/
│   ├── domain/                    # ← COPIADO (mismos archivos)
│   │   ├── repositories/
│   │   └── services/
│   │
│   ├── infrastructure/            # ← SOLO HTTP
│   │   └── repositories/
│   │       └── http/              # Http*Repository.ts
│   │
│   ├── context/                   # ← FILTRADO
│   │   ├── OrderContext.tsx       # ✅ Para caja
│   │   ├── ShiftContext.tsx       # ✅ Para caja
│   │   └── DiscountContext.tsx    # ✅ Compartido
│   │
│   ├── components/                # ← FILTRADO
│   │   └── cashier/               # ✅ Solo componentes de caja
│   │
│   ├── app/                       # ← FILTRADO
│   │   ├── page.tsx               # ✅ Página principal (caja)
│   │   └── layout.tsx
│   │
│   ├── lib/                       # ← COPIADO
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   └── api/                       # ← MODIFICADO
│       └── initializeAPIsClient.ts
│
├── package.json
├── next.config.js
└── .env.local

📦 fastchicken-admin/
├── src/
│   ├── domain/                    # ← COPIADO (mismos archivos)
│   │   ├── repositories/
│   │   └── services/
│   │
│   ├── infrastructure/            # ← SOLO HTTP
│   │   └── repositories/
│   │       └── http/
│   │
│   ├── context/                   # ← FILTRADO
│   │   └── DiscountContext.tsx    # ✅ Solo si se usa en admin
│   │
│   ├── components/                # ← FILTRADO
│   │   └── admin/                 # ✅ Solo componentes admin
│   │
│   ├── app/                       # ← FILTRADO
│   │   ├── admin/                 # ✅ Páginas admin
│   │   ├── page.tsx               # Redirect a /admin
│   │   └── layout.tsx
│   │
│   └── lib/                       # ← COPIADO
│       ├── types.ts
│       └── utils.ts
│
├── package.json
├── next.config.js
└── .env.local
```

---

## 🗂️ Archivos por Proyecto

### ✅ BACKEND (Node.js/Express)

#### Archivos a COPIAR del monolito:
```
✅ src/domain/**/*                          # TODO (lógica pura)
✅ src/application/**/*                     # TODO (use cases)
✅ src/infrastructure/repositories/mongodb/**/*  # Solo MongoDB
✅ src/lib/types.ts                         # Tipos
✅ src/lib/mongodb.ts                       # Conexión
✅ src/lib/mongodb-config.ts                # Config
✅ src/dtos/**/*                            # DTOs
```

#### Archivos NUEVOS a crear:
```
🆕 src/presentation/routes/combo.routes.ts
🆕 src/presentation/routes/discount.routes.ts
🆕 src/presentation/routes/employee.routes.ts
🆕 src/presentation/routes/inventory.routes.ts
🆕 src/presentation/routes/order.routes.ts
🆕 src/presentation/routes/shift.routes.ts
🆕 src/presentation/controllers/ComboController.ts
🆕 src/presentation/controllers/DiscountController.ts
🆕 src/presentation/controllers/EmployeeController.ts
🆕 src/presentation/controllers/InventoryController.ts
🆕 src/presentation/controllers/OrderController.ts
🆕 src/presentation/controllers/ShiftController.ts
🆕 src/presentation/middleware/auth.ts
🆕 src/presentation/middleware/errorHandler.ts
🆕 src/server.ts                           # Express app
🆕 src/index.ts                            # Entry point
```

#### Ejemplo de Controller:
```typescript
// src/presentation/controllers/DiscountController.ts
import { CreateDiscountUseCase, UpdateDiscountUseCase } from '@/application/use-cases';
import { MongoDBDiscountRepository } from '@/infrastructure/repositories/mongodb';

export class DiscountController {
  constructor(
    private createUseCase: CreateDiscountUseCase,
    private updateUseCase: UpdateDiscountUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const discount = await this.createUseCase.execute(req.body);
      res.status(201).json(discount);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const discount = await this.updateUseCase.execute({
        id: req.params.id,
        ...req.body
      });
      res.json(discount);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

---

### ✅ FRONTEND CAJA (Next.js)

#### Archivos a COPIAR del monolito:
```
✅ src/domain/**/*                          # TODO (para validaciones locales)
✅ src/infrastructure/repositories/http/**/*  # Solo HTTP repositories
✅ src/context/OrderContext.tsx             # Estado del carrito
✅ src/context/ShiftContext.tsx             # Estado de jornada
✅ src/context/DiscountContext.tsx          # Estado de descuentos
✅ src/components/cashier/**/*              # Todos los componentes de caja
✅ src/components/ui/**/*                   # shadcn/ui components
✅ src/app/page.tsx                         # Página principal
✅ src/app/layout.tsx                       # Layout
✅ src/app/client-shell.tsx                 # Shell principal
✅ src/lib/types.ts                         # Tipos
✅ src/lib/utils.ts                         # Utilidades
✅ src/api/**/*                             # API client
✅ src/hooks/**/*                           # Custom hooks
```

#### Archivos a ELIMINAR (no se usan en caja):
```
❌ src/components/admin/**/*                # Admin UI
❌ src/app/admin/**/*                       # Admin pages
❌ src/infrastructure/repositories/mongodb/**/*  # MongoDB directo
❌ src/lib/mongodb.ts                       # No acceso directo a DB
```

#### Configuración especial:
```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

```typescript
// src/api/initializeAPIsClient.ts
// Ya configurado para usar HTTP repositories
import { HttpComboRepository } from '@/infrastructure/repositories/http';
import { HttpInventoryRepository } from '@/infrastructure/repositories/http';
import { HttpDiscountRepository } from '@/infrastructure/repositories/http';
// ... etc
```

---

### ✅ FRONTEND ADMIN (Next.js)

#### Archivos a COPIAR del monolito:
```
✅ src/domain/**/*                          # TODO (para validaciones locales)
✅ src/infrastructure/repositories/http/**/*  # Solo HTTP repositories
✅ src/context/DiscountContext.tsx          # Si se usa en admin
✅ src/components/admin/**/*                # Todos los componentes admin
✅ src/components/ui/**/*                   # shadcn/ui components
✅ src/app/admin/**/*                       # Páginas admin
✅ src/app/layout.tsx                       # Layout
✅ src/lib/types.ts                         # Tipos
✅ src/lib/utils.ts                         # Utilidades
✅ src/api/**/*                             # API client
✅ src/hooks/**/*                           # Custom hooks
```

#### Archivos a ELIMINAR (no se usan en admin):
```
❌ src/components/cashier/**/*              # Cashier UI
❌ src/app/page.tsx                         # Página principal de caja
❌ src/app/client-shell.tsx                 # Shell de caja
❌ src/context/OrderContext.tsx             # Estado del carrito (solo caja)
❌ src/context/ShiftContext.tsx             # Estado de jornada (solo caja)
❌ src/infrastructure/repositories/mongodb/**/*  # MongoDB directo
❌ src/lib/mongodb.ts                       # No acceso directo a DB
```

#### Crear página principal:
```typescript
// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/admin/dashboard');
}
```

---

## 🔄 Flujo de Datos en Proyectos Separados

### Crear un descuento desde el Admin:

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND ADMIN (http://localhost:3000)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario rellena formulario                              │
│     DiscountManagement.tsx                                  │
│          ↓                                                   │
│  2. Llama a DiscountContext                                 │
│     createDiscount(data)                                    │
│          ↓                                                   │
│  3. DiscountContext usa DiscountAPI                         │
│     DiscountAPI.create(data)                                │
│          ↓                                                   │
│  4. DiscountAPI usa HttpDiscountRepository                  │
│     POST http://localhost:3001/api/discounts                │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Request
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND API (http://localhost:3001)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  5. Express route recibe request                            │
│     POST /api/discounts → DiscountController.create()       │
│          ↓                                                   │
│  6. Controller llama Use Case                               │
│     CreateDiscountUseCase.execute(data)                     │
│          ↓                                                   │
│  7. Use Case valida y llama Repository                      │
│     MongoDBDiscountRepository.create(discount)              │
│          ↓                                                   │
│  8. Repository guarda en MongoDB                            │
│     db.collection('discounts').insertOne(...)               │
│          ↓                                                   │
│  9. Retorna el descuento creado                             │
│     { id: '...', type: 'simple', ... }                      │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Response
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND ADMIN                                               │
│  10. UI se actualiza con el nuevo descuento                 │
└─────────────────────────────────────────────────────────────┘
```

### Aplicar descuento en el carrito (Caja):

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND CAJA (http://localhost:3002)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario agrega item al carrito                          │
│     OrderPanel.tsx                                          │
│          ↓                                                   │
│  2. OrderContext calcula descuentos                         │
│     DiscountService.applyPromotionalDiscounts(              │
│       orderItems, combos, discounts                         │
│     )                                                        │
│          ↓                                                   │
│  3. DiscountService (DOMINIO) aplica reglas                 │
│     - Filtra descuentos activos por fecha/hora              │
│     - Aplica cross-promotion                                │
│     - Calcula precios finales                               │
│          ↓                                                   │
│  4. UI muestra precio con descuento                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

NOTA: Los descuentos se cargan al inicio desde:
GET http://localhost:3001/api/discounts → DiscountContext
```

---

## 🚀 Pasos para la Migración

### Fase 1: Crear Backend API

1. **Crear proyecto backend:**
   ```bash
   mkdir fastchicken-backend
   cd fastchicken-backend
   npm init -y
   npm install express cors dotenv mongodb
   npm install -D typescript @types/express @types/cors @types/node ts-node nodemon
   ```

2. **Copiar archivos del monolito:**
   ```bash
   # Desde el monolito
   cp -r src/domain ../fastchicken-backend/src/
   cp -r src/application ../fastchicken-backend/src/
   cp -r src/infrastructure/repositories/mongodb ../fastchicken-backend/src/infrastructure/repositories/
   cp src/lib/types.ts ../fastchicken-backend/src/lib/
   cp src/lib/mongodb.ts ../fastchicken-backend/src/lib/
   cp -r src/dtos ../fastchicken-backend/src/
   ```

3. **Crear estructura Express:**
   ```bash
   # En fastchicken-backend
   mkdir -p src/presentation/{routes,controllers,middleware}
   ```

4. **Crear archivos base:**
   - `src/server.ts` - Express app
   - `src/index.ts` - Entry point
   - `src/presentation/routes/*.routes.ts` - Rutas
   - `src/presentation/controllers/*.ts` - Controllers

5. **Configurar tsconfig.json y package.json**

6. **Probar endpoints:**
   ```bash
   npm run dev
   curl http://localhost:3001/api/discounts
   ```

### Fase 2: Adaptar Frontend Caja

1. **Crear proyecto frontend-caja:**
   ```bash
   npx create-next-app@latest fastchicken-cashier --typescript --tailwind --app
   ```

2. **Copiar archivos del monolito:**
   ```bash
   # Solo lo necesario para caja
   cp -r src/domain ../fastchicken-cashier/src/
   cp -r src/infrastructure/repositories/http ../fastchicken-cashier/src/infrastructure/repositories/
   cp -r src/context/{OrderContext,ShiftContext,DiscountContext}.tsx ../fastchicken-cashier/src/context/
   cp -r src/components/cashier ../fastchicken-cashier/src/components/
   cp -r src/components/ui ../fastchicken-cashier/src/components/
   cp -r src/app/{page,layout,client-shell}.tsx ../fastchicken-cashier/src/app/
   cp -r src/api ../fastchicken-cashier/src/
   ```

3. **Configurar conexión al backend:**
   ```
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Probar:**
   ```bash
   npm run dev
   # Abrir http://localhost:3002
   ```

### Fase 3: Adaptar Frontend Admin

1. **Crear proyecto frontend-admin:**
   ```bash
   npx create-next-app@latest fastchicken-admin --typescript --tailwind --app
   ```

2. **Copiar archivos del monolito:**
   ```bash
   # Solo lo necesario para admin
   cp -r src/domain ../fastchicken-admin/src/
   cp -r src/infrastructure/repositories/http ../fastchicken-admin/src/infrastructure/repositories/
   cp -r src/components/admin ../fastchicken-admin/src/components/
   cp -r src/components/ui ../fastchicken-admin/src/components/
   cp -r src/app/admin ../fastchicken-admin/src/app/
   cp -r src/api ../fastchicken-admin/src/
   ```

3. **Configurar:**
   ```
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Probar:**
   ```bash
   npm run dev
   # Abrir http://localhost:3000
   ```

---

## 🔒 Seguridad y Autenticación

### Backend:
```typescript
// src/presentation/middleware/auth.ts
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Uso en routes:
router.post('/discounts', authMiddleware, discountController.create);
```

### Frontend:
```typescript
// src/infrastructure/repositories/http/HttpDiscountRepository.ts
async create(discount: Omit<DiscountRule, 'id'>): Promise<DiscountRule> {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${this.baseUrl}/discounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(discount)
  });

  if (!response.ok) throw new Error('Failed to create discount');
  return response.json();
}
```

---

## 📊 Ventajas de esta Separación

### ✅ Escalabilidad
- Backend puede escalarse independientemente
- Frontends pueden deployarse en diferentes servidores

### ✅ Mantenibilidad
- Equipos diferentes pueden trabajar en cada proyecto
- Menos dependencias cruzadas

### ✅ Reutilización
- Domain y Application se comparten entre todos
- Múltiples frontends pueden usar el mismo backend

### ✅ Deploy Flexible
- Backend: Railway, Render, DigitalOcean
- Frontends: Vercel, Netlify
- Diferentes environments (dev, staging, prod)

### ✅ Arquitectura Limpia Preservada
```
FRONTEND CAJA         FRONTEND ADMIN
      ↓                     ↓
   HTTP Repos          HTTP Repos
      ↓                     ↓
      └──────────┬──────────┘
                 ↓
            BACKEND API
                 ↓
         Use Cases (Application)
                 ↓
         Services (Domain)
                 ↓
         MongoDB Repos (Infrastructure)
                 ↓
             MongoDB
```

---

## 📝 Checklist de Migración

### Backend:
- [ ] Proyecto creado con Express
- [ ] Domain copiado
- [ ] Application copiado
- [ ] MongoDB repositories copiados
- [ ] Controllers creados
- [ ] Routes configuradas
- [ ] Middleware (CORS, auth, error handling)
- [ ] Variables de entorno configuradas
- [ ] Tests básicos
- [ ] Deploy configurado

### Frontend Caja:
- [ ] Proyecto Next.js creado
- [ ] Domain copiado
- [ ] HTTP repositories copiados
- [ ] Contexts copiados (Order, Shift, Discount)
- [ ] Componentes cashier copiados
- [ ] UI components copiados
- [ ] API client configurado
- [ ] Variables de entorno (.env.local)
- [ ] Probado en local
- [ ] Deploy configurado

### Frontend Admin:
- [ ] Proyecto Next.js creado
- [ ] Domain copiado
- [ ] HTTP repositories copiados
- [ ] Componentes admin copiados
- [ ] UI components copiados
- [ ] Páginas admin copiadas
- [ ] API client configurado
- [ ] Variables de entorno (.env.local)
- [ ] Probado en local
- [ ] Deploy configurado

---

## 🎯 Resultado Final

Tendrás 3 proyectos corriendo simultáneamente:

```
http://localhost:3001  →  Backend API      (Express)
http://localhost:3002  →  Frontend Caja    (Next.js)
http://localhost:3000  →  Frontend Admin   (Next.js)
```

Todos compartiendo la misma lógica de dominio, pero completamente independientes y desplegables por separado.
