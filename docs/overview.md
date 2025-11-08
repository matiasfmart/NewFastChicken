# FastChicken POS - Visión General del Proyecto

## 🎯 Propósito

FastChicken POS es un **sistema de punto de venta** diseñado específicamente para un restaurante de comida rápida. El sistema permite gestionar pedidos, inventario, jornadas de trabajo, empleados y descuentos promocionales de forma eficiente y escalable.

## 🏢 Contexto del Negocio

**FastChicken** es un restaurante de comida rápida especializado en pollo que necesita:

- Registrar pedidos rápidamente en horarios pico
- Gestionar combos con productos personalizables
- Controlar stock en tiempo real
- Aplicar descuentos automáticos por día/horario
- Administrar jornadas de cajeros con control de caja
- Generar reportes de ventas

## 👥 Usuarios del Sistema

### Cajeros
- Registran pedidos en la caja
- Personalizan combos según preferencias del cliente
- Consultan disponibilidad de productos
- Inician/cierran jornadas de trabajo
- Gestionan el efectivo de la caja

### Administradores
- Configuran combos y precios
- Gestionan inventario y stock
- Configuran descuentos y promociones
- Administran empleados
- Consultan reportes y estadísticas

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15.3.3 con App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **State Management**: React Context API
- **Date Handling**: date-fns

### Backend
- **Database**: MongoDB
- **ORM**: Native MongoDB Driver
- **API**: Next.js API Routes (REST)
- **Architecture**: Repository Pattern

### Development
- **Package Manager**: npm
- **Dev Server**: Turbopack
- **Code Style**: ESLint + Prettier
- **Version Control**: Git

## 📐 Decisiones Arquitectónicas Clave

### 1. Clean Architecture

El proyecto sigue **Clean Architecture** con 4 capas claramente separadas:

```
Presentation → Application → Domain ← Infrastructure
```

**Razón**: Facilita testing, mantenibilidad y separación futura de backend/frontend.

### 2. Repository Pattern

Interfaces de repositorios definidas en `domain/repositories/` con implementaciones intercambiables.

**Razón**: Permite cambiar la fuente de datos (MongoDB → PostgreSQL, directo → API) sin afectar business logic.

### 3. Use Cases Explícitos

Casos de uso en `application/use-cases/` que orquestan operaciones complejas.

**Razón**: Clarifica intención de negocio, facilita testing y separa orchestration de business logic.

### 4. Server Components + Client Components

Next.js 15 con RSC (React Server Components) para data fetching y Client Components para interactividad.

**Razón**: Optimiza performance, reduce JavaScript enviado al cliente y mejora SEO.

### 5. Context API (no Redux)

React Context para state management de UI.

**Razón**: Suficiente para la escala actual, más simple que Redux, permite migración gradual a Use Cases.

## 🎨 Estructura del Proyecto

```
NewFastChicken/
├── src/
│   ├── domain/              # Business logic pura + contratos
│   ├── application/         # Use Cases (orquestación)
│   ├── infrastructure/      # Implementaciones (MongoDB, HTTP)
│   ├── context/             # React Context (UI state)
│   ├── components/          # React Components
│   │   ├── cashier/         # Componentes del cajero
│   │   ├── admin/           # Componentes del admin
│   │   └── ui/              # Primitivas UI (Shadcn)
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Página del cajero
│   │   ├── admin/           # Páginas de administración
│   │   └── api/             # API Routes
│   ├── lib/                 # Utilities y types
│   ├── dtos/                # Data Transfer Objects
│   ├── hooks/               # React hooks personalizados
│   └── api/                 # API clients (abstracciones)
│
├── docs/                    # Documentación del proyecto
├── public/                  # Assets estáticos
└── [archivos de config]
```

## 🔄 Flujos Principales

### Flujo: Realizar un Pedido

```
1. Cajero → Selecciona combo/producto
2. CustomizationDialog → Personaliza opciones (picante, hielo, etc)
3. OrderContext → Agrega al carrito (verifica stock)
4. DiscountService → Aplica descuentos automáticos
5. OrderPanel → Muestra resumen con precios
6. Cajero → Confirma pedido
7. FinalizeOrderUseCase → Orquesta creación
8. OrderRepository → Crea orden + actualiza stock (transacción)
9. ShiftRepository → Actualiza totales de jornada
10. CheckoutDialog → Muestra confirmación
```

### Flujo: Iniciar Jornada

```
1. Cajero → Click "Iniciar Jornada"
2. StartShiftDialog → Ingresa fondo inicial
3. StartShiftUseCase → Valida que no haya jornada activa
4. ShiftRepository → Crea nueva jornada
5. ShiftContext → Actualiza estado global
6. UI → Habilita funcionalidad de caja
```

### Flujo: Aplicar Descuento Automático

```
1. Usuario agrega combo al carrito
2. CustomizationDialog → Llama DiscountService.getActiveDiscountForCombo()
3. DiscountService → Valida día, fecha y horario actual
4. DiscountService → Retorna descuento activo si aplica
5. OrderItem → Se crea con precio descontado
6. OrderPanel → Muestra precio original tachado + precio con descuento
```

## 🗄️ Modelo de Datos

### Order (Pedido)
```typescript
{
  id: string
  shiftId: string           // Jornada asociada
  items: OrderItem[]        // Items del pedido
  deliveryType: 'local' | 'takeaway' | 'delivery'
  subtotal: number
  discount: number
  total: number
  createdAt: Date
}
```

### OrderItem (Item de Pedido)
```typescript
{
  id: string
  combo: Combo | null       // null si es producto individual
  quantity: number
  unitPrice: number         // Precio sin descuento
  finalUnitPrice: number    // Precio con descuento aplicado
  appliedDiscount?: {
    percentage: number
    rule: DiscountRule
  }
  customizations: {
    product?: InventoryItem
    drink?: InventoryItem
    side?: InventoryItem
    withIce?: boolean
    isSpicy?: boolean
  }
}
```

### Combo
```typescript
{
  id: string
  type: 'PO' | 'BG' | 'E' | 'ES' | 'EP'  // Tipos de combo
  name: string
  description: string
  price: number
  products: ComboProduct[]  // Productos incluidos
  discounts?: DiscountRule[]
}
```

### InventoryItem (Producto de Inventario)
```typescript
{
  id: string
  type: 'product' | 'drink' | 'side'
  name: string
  price: number
  stock: number
}
```

### Shift (Jornada)
```typescript
{
  id: string
  employeeId: string
  employeeName: string
  startedAt: Date
  endedAt?: Date
  status: 'open' | 'closed'
  initialCash: number
  totalOrders: number
  totalRevenue: number
  actualCash?: number
  cashDifference?: number
}
```

### DiscountRule (Regla de Descuento)
```typescript
{
  id: string
  type: 'weekday' | 'date' | 'quantity' | 'cross-promotion'
  percentage: number
  value?: string             // Día ('1' = lunes) o fecha ('2024-12-25')
  timeRange?: {              // Restricción de horario
    start: string            // "18:00"
    end: string              // "22:00"
  }
  requiredQuantity?: number  // Para descuentos por cantidad
  discountedQuantity?: number
  triggerComboId?: string    // Para promociones cruzadas
  targetComboId?: string
}
```

## 🔐 Seguridad y Permisos

### Autenticación
- Sistema básico de login por empleado
- Sesiones gestionadas con Next.js middleware

### Roles
- **Cajero**: Acceso a `/` (caja) únicamente
- **Admin**: Acceso a `/admin/*` completo

### Protección de Rutas
- Middleware de Next.js valida rol antes de renderizar
- API routes validan permisos antes de ejecutar

## 📊 Estado Actual del Proyecto

### ✅ Implementado
- Sistema de pedidos completo
- Gestión de inventario
- Control de stock en tiempo real
- Jornadas de trabajo con control de caja
- Descuentos automáticos por día/horario
- Reportes básicos de ventas
- Sistema de empleados
- Personalización de combos

### 🚧 En Progreso
- Descuentos por cantidad ("Compra 2, 2do con descuento")
- Promociones cruzadas entre combos
- Panel de admin para configurar descuentos

### 📋 Pendiente (Roadmap)
- Sistema de mesas
- Impresión de tickets
- Integración con sistemas de pago electrónico
- Reportes avanzados y analytics
- Backup automático de datos
- Notificaciones push para cocina
- App móvil para cajeros

## 🎯 Objetivos de Arquitectura

1. **Escalabilidad**: Soportar crecimiento de features sin refactors masivos
2. **Separabilidad**: Backend y Admin deben poder separarse a proyectos independientes fácilmente
3. **Mantenibilidad**: Código claro, testeable y documentado
4. **Performance**: Respuesta rápida en horarios pico (< 2s por operación)
5. **Confiabilidad**: Cero pérdida de datos, transacciones atómicas

## 📈 Métricas de Éxito

- **Tiempo de registro de pedido**: < 30 segundos
- **Uptime**: > 99.5%
- **Cobertura de tests**: > 80% en business logic
- **Tiempo de onboarding**: Nuevo cajero productivo en < 2 horas
- **Errores de stock**: 0 (gracias a validaciones)

## 🔗 Enlaces Útiles

- **Arquitectura detallada**: `docs/ARCHITECTURE.md`
- **Prompts para IA**: `docs/prompts.md`
- **Guía de contribución**: `docs/contributing.md`
- **Repository**: [GitHub URL]
- **Production**: [URL de producción]

---

**Última actualización:** 2025-01-08
**Versión del sistema:** 2.0
**Mantenedor**: Matias Martinez
