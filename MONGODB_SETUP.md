# ✅ Configuración de MongoDB Completa

## 🎉 ¡La aplicación ahora usa MongoDB!

### Estado Actual
- ✅ MongoDB corriendo: **7.0.21**
- ✅ Base de datos: **fastchicken**
- ✅ Servidor de desarrollo: **http://localhost:9002**
- ✅ Arquitectura desacoplada funcionando

---

## 📋 Cambios Realizados

### 1. Variables de Entorno (`.env`)
```env
# MongoDB Configuration (IN USE)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=fastchicken
```

### 2. Layout Principal (`src/app/layout.tsx`)
```typescript
import { MongoDBProvider } from '@/components/mongodb-provider';

// En el body:
<MongoDBProvider>
  {children}
</MongoDBProvider>
```

### 3. Server Actions Implementadas
**Archivo:** `src/actions/db-actions.ts`

Todas las operaciones de base de datos ahora usan Server Actions:
- `getAllCombos()` - Obtener todos los combos
- `getAllInventory()` - Obtener inventario
- `createOrder()` - Crear orden
- `getActiveShift()` - Obtener jornada activa
- `startShift()` - Iniciar jornada
- `endShift()` - Cerrar jornada
- `updateShift()` - Actualizar jornada

### 4. Componentes Actualizados

#### `src/app/page.tsx`
```typescript
// Ahora usa Server Actions
import { getMenuData } from "./actions";

const { combos, inventory } = await getMenuData();
```

#### `src/context/ShiftContext.tsx`
```typescript
// Usa Server Actions en lugar de APIs
import { getActiveShift, startShift, endShift, updateShift } from "@/actions/db-actions";
```

#### `src/context/OrderContext.tsx`
```typescript
// Usa Server Actions para crear órdenes
import { createOrder, updateShift } from "@/actions/db-actions";
```

---

## 🗄️ Estructura de la Base de Datos MongoDB

La aplicación creará automáticamente estas colecciones:

### Collection: `combos`
```javascript
{
  _id: ObjectId("..."),
  name: "Combo 1",
  description: "Descripción",
  price: 1500,
  items: [...],
  category: "combos",
  image: "url",
  available: true,
  discount: 0
}
```

### Collection: `inventory`
```javascript
{
  _id: ObjectId("..."),
  name: "Pollo Frito",
  category: "pollo",
  price: 500,
  stock: 100,
  unit: "unidad",
  image: "url",
  available: true,
  minStock: 10
}
```

### Collection: `orders`
```javascript
{
  _id: ObjectId("..."),
  shiftId: "shift_id",
  items: [...],
  deliveryType: "local",
  subtotal: 1500,
  discount: 0,
  total: 1500,
  createdAt: ISODate("2025-11-05T...")
}
```

### Collection: `shifts`
```javascript
{
  _id: ObjectId("..."),
  employeeName: "Juan Pérez",
  startedAt: ISODate("2025-11-05T..."),
  endedAt: ISODate("2025-11-05T..."),  // opcional
  status: "open",  // o "closed"
  initialCash: 10000,
  totalOrders: 5,
  totalRevenue: 7500,
  actualCash: 17500,  // opcional
  cashDifference: 0  // opcional
}
```

---

## 🔍 Verificar MongoDB con MongoDB Compass

1. Abrir **MongoDB Compass**
2. Conectar a: `mongodb://localhost:27017`
3. Navegar a la base de datos `fastchicken`
4. Ver las colecciones creadas

O usar la terminal:
```bash
mongosh mongodb://localhost:27017/fastchicken

# Ver colecciones
show collections

# Ver datos de shifts
db.shifts.find().pretty()

# Ver datos de inventory
db.inventory.find().pretty()
```

---

## 🚀 Iniciar la Aplicación

```bash
npm run dev
```

Visita: **http://localhost:9002**

---

## ✨ Ventajas de Usar MongoDB

### vs Firebase:
- ✅ **100% gratis** - sin límites
- ✅ **Datos locales** - privacidad total
- ✅ **No requiere internet** - funciona offline
- ✅ **Sin índices complejos** - más flexible
- ✅ **Backup fácil** - copiar carpeta de datos
- ✅ **MongoDB Compass** - interfaz visual gratis

### Arquitectura:
- ✅ **Consultas simplificadas** - sin problemas de índices
- ✅ **Server Actions** - ejecución server-side
- ✅ **Transacciones** - consistencia de datos garantizada
- ✅ **Escalable** - fácil migrar a backend separado

---

## 🔄 Volver a Firebase

Si quieres volver a usar Firebase, solo cambia:

### 1. `.env`
```env
# Comentar MongoDB
# MONGODB_URI=mongodb://localhost:27017
# MONGODB_DATABASE=fastchicken

# Descomentar Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
# (resto de variables Firebase)
```

### 2. `src/app/layout.tsx`
```typescript
import { FirebaseProvider } from '@/components/firebase-provider';
// import { MongoDBProvider } from '@/components/mongodb-provider';

<FirebaseProvider>
  {children}
</FirebaseProvider>
```

### 3. Contexts y Page
Revertir los imports en:
- `src/app/page.tsx`
- `src/context/ShiftContext.tsx`
- `src/context/OrderContext.tsx`

De vuelta a usar `ComboAPI`, `InventoryAPI`, `OrderAPI`, `ShiftAPI`

---

## 📊 Monitoreo y Debugging

### Ver logs del servidor Next.js
El servidor muestra automáticamente:
- Conexiones a MongoDB
- Errores de base de datos
- Queries ejecutadas

### MongoDB Logs
```bash
# En macOS (si usas brew)
tail -f /usr/local/var/log/mongodb/mongo.log

# O ver status
brew services list | grep mongodb
```

---

## 🛠️ Troubleshooting

### Error: "Cannot connect to MongoDB"
```bash
# Verificar si MongoDB está corriendo
mongosh --version

# Iniciar MongoDB (macOS con brew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Error: "Database not found"
No hay problema - MongoDB crea la base de datos automáticamente cuando insertas el primer documento.

### Limpiar base de datos
```bash
mongosh mongodb://localhost:27017/fastchicken
db.dropDatabase()
```

---

## 📈 Próximos Pasos

### Poblar datos iniciales
Si quieres agregar datos de prueba:

```bash
mongosh mongodb://localhost:27017/fastchicken
```

```javascript
// Insertar combos de ejemplo
db.combos.insertMany([
  {
    name: "Combo Familiar",
    description: "8 piezas de pollo + papas grandes + gaseosa 2L",
    price: 3500,
    category: "combos",
    available: true,
    discount: 0
  }
]);

// Insertar inventory de ejemplo
db.inventory.insertMany([
  {
    name: "Pollo Frito (pieza)",
    category: "pollo",
    price: 500,
    stock: 100,
    unit: "unidad",
    available: true,
    minStock: 20
  }
]);
```

---

## ✅ Estado Final

- ✅ MongoDB configurado y funcionando
- ✅ Server Actions implementadas
- ✅ Arquitectura desacoplada mantenida
- ✅ Sin problemas de índices
- ✅ Listo para usar en producción local

**La aplicación está 100% funcional con MongoDB. Puedes empezar a usarla ahora mismo!**
