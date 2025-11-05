# Guía de Migración de Base de Datos

## 📋 Resumen

Este proyecto ahora soporta **dos bases de datos** gracias a la arquitectura desacoplada:
- ✅ **Firebase (Actual)** - Funcionando con fix de índices simplificados
- ✅ **MongoDB (Listo para migrar)** - Implementación completa disponible

## 🎯 Problema Solucionado: Error de Índices

### El Problema Original
Firebase requería un índice compuesto para consultas con `where` + `orderBy` en campos diferentes:
```typescript
query(
  collection('shifts'),
  where('status', '==', 'open'),
  orderBy('startedAt', 'desc')  // ❌ Error: requiere índice compuesto
)
```

### La Solución Implementada
**Consulta simplificada que funciona en cualquier base de datos:**
```typescript
// 1. Buscar todas las jornadas abiertas (sin orderBy)
const q = query(
  collection('shifts'),
  where('status', '==', 'open')  // ✅ Solo where, sin índice
);

// 2. Ordenar en memoria (muy eficiente: solo 0-1 jornadas abiertas)
shifts.sort((a, b) => b.startedAt - a.startedAt);
```

### Ventajas de Esta Solución
✅ **No requiere índices compuestos** en Firebase
✅ **Funciona idéntico en MongoDB** sin cambios
✅ **Portable** a PostgreSQL, MySQL, etc.
✅ **Muy eficiente**: solo ordena 0-2 registros en memoria
✅ **Sin configuración extra** para el cliente

---

## 🗄️ Opción 1: Usar Firebase (Actual)

### Configuración
Tu archivo `.env` actual:
```env
# Firebase Configuration (IN USE)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Estado
- ✅ Funcionando correctamente
- ✅ Sin problemas de índices
- ✅ Fix aplicado en `FirebaseShiftRepository.ts`

---

## 🍃 Opción 2: Migrar a MongoDB

### Por Qué MongoDB Local es Mejor para Tu Cliente

#### Ventajas Económicas
- **100% GRATIS** - Sin cargos mensuales
- **Sin límites** de lecturas/escrituras
- **Sin límites** de almacenamiento (solo el disco duro)
- **No depende de internet** para funcionar

#### Ventajas Técnicas
- **Privacidad total**: Los datos nunca salen de su PC
- **Sin problemas de índices**: MongoDB es más flexible
- **Backup simple**: Copiar la carpeta de datos
- **MongoDB Compass**: Interfaz gráfica gratuita para ver datos

### Pasos para Migrar a MongoDB

#### 1. Instalar MongoDB (Ya hecho ✅)
El driver de MongoDB ya está instalado:
```bash
npm install mongodb  # Ya ejecutado
```

#### 2. Instalar MongoDB Community Server (Cliente debe hacer esto)
**En la PC del cliente**, descargar e instalar:
- Descargar: https://www.mongodb.com/try/download/community
- Instalar MongoDB Community Edition (gratis)
- Instalar MongoDB Compass (interfaz gráfica, gratis)

#### 3. Actualizar Variables de Entorno
Editar `.env`:
```env
# Comentar Firebase
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# (comentar todas las líneas de Firebase)

# Activar MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=fastchicken
```

#### 4. Actualizar el Layout
Editar `src/app/layout.tsx`:
```typescript
// Cambiar de:
import { FirebaseProvider } from '@/components/firebase-provider';

// A:
import { MongoDBProvider } from '@/components/mongodb-provider';

// Y en el JSX:
<MongoDBProvider>
  {children}
</MongoDBProvider>
```

#### 5. Migrar Datos Existentes
Si ya tienes datos en Firebase, necesitas exportarlos e importarlos a MongoDB:

**Exportar de Firebase:**
```bash
# Usando Firebase CLI
firebase firestore:export backup/
```

**Importar a MongoDB:**
```bash
# Usar mongoimport o escribir script de migración
# (contactar para asistencia si es necesario)
```

---

## 🏗️ Arquitectura Implementada

### Estructura de Carpetas
```
src/
├── domain/
│   └── repositories/         # Interfaces (contratos)
│       ├── IInventoryRepository.ts
│       ├── IComboRepository.ts
│       ├── IOrderRepository.ts
│       └── IShiftRepository.ts
│
├── infrastructure/
│   └── repositories/
│       ├── firebase/         # Implementación Firebase
│       │   ├── FirebaseInventoryRepository.ts
│       │   ├── FirebaseComboRepository.ts
│       │   ├── FirebaseOrderRepository.ts
│       │   └── FirebaseShiftRepository.ts  ✅ FIX APLICADO
│       │
│       └── mongodb/          # Implementación MongoDB
│           ├── MongoDBInventoryRepository.ts
│           ├── MongoDBComboRepository.ts
│           ├── MongoDBOrderRepository.ts
│           └── MongoDBShiftRepository.ts
│
├── api/                      # Capa de API (singleton)
│   ├── initializeAPIs.ts    # ✅ Dependency Injection
│   ├── inventory/
│   ├── combos/
│   ├── orders/
│   └── shifts/
│
└── lib/
    ├── firebase-config.ts    # Configuración Firebase
    ├── mongodb-config.ts     # Configuración MongoDB
    └── mongodb.ts            # Cliente MongoDB
```

### Cómo Funciona la Arquitectura

#### 1. **Domain Layer** (Dominio)
Define CONTRATOS (interfaces) de lo que la aplicación necesita:
```typescript
export interface IShiftRepository {
  getActiveShift(): Promise<Shift | null>;
  create(shift: Omit<Shift, 'id'>): Promise<Shift>;
  // ... más métodos
}
```

#### 2. **Infrastructure Layer** (Infraestructura)
Implementa los contratos para cada base de datos:
```typescript
// Firebase
export class FirebaseShiftRepository implements IShiftRepository {
  async getActiveShift(): Promise<Shift | null> {
    // Implementación con Firebase
  }
}

// MongoDB
export class MongoDBShiftRepository implements IShiftRepository {
  async getActiveShift(): Promise<Shift | null> {
    // Implementación con MongoDB
  }
}
```

#### 3. **API Layer** (APIs)
Expone funciones simples sin saber qué base de datos usa:
```typescript
class ShiftAPIClient {
  private repository: IShiftRepository | null = null;

  setRepository(repository: IShiftRepository) {
    this.repository = repository;
  }

  async getActiveShift(): Promise<Shift | null> {
    return await this.repository.getActiveShift();
  }
}
```

#### 4. **Dependency Injection**
Al iniciar la app, se inyecta la implementación correcta:
```typescript
// Con Firebase:
export function initializeAPIsWithFirebase(firestore: Firestore) {
  const shiftRepository = new FirebaseShiftRepository(firestore);
  ShiftAPI.setRepository(shiftRepository);
}

// Con MongoDB:
export function initializeAPIsWithMongoDB(db: Db) {
  const shiftRepository = new MongoDBShiftRepository(db);
  ShiftAPI.setRepository(shiftRepository);
}
```

---

## 🚀 Cambiar Entre Bases de Datos

Para cambiar de Firebase a MongoDB o viceversa:

### Archivo `.env`
```env
# Descomentar la que quieras usar, comentar la otra
```

### Archivo `src/app/layout.tsx`
```typescript
// Importar el provider correspondiente
import { FirebaseProvider } from '@/components/firebase-provider';
// O
import { MongoDBProvider } from '@/components/mongodb-provider';
```

**Eso es todo.** El resto del código NO cambia porque está desacoplado.

---

## 📊 Comparación: Firebase vs MongoDB Local

| Característica | Firebase | MongoDB Local |
|---------------|----------|---------------|
| **Costo** | Gratis hasta límite | 100% Gratis |
| **Límites** | Lecturas/escrituras diarias | Sin límites |
| **Internet** | Requerido | No necesario |
| **Privacidad** | Datos en la nube | Datos locales |
| **Backup** | Automático | Manual |
| **Configuración** | Sin instalación | Instalar MongoDB |
| **Índices** | Requiere configuración | Más flexible |

---

## 🎓 Para el Futuro: Backend Independiente

Si en el futuro quieres un backend separado:

1. Las APIs actuales (`ComboAPI`, `OrderAPI`, etc.) se pueden convertir en **HTTP endpoints**
2. Los repositories se ejecutan en el servidor
3. El frontend llama a los endpoints HTTP
4. La arquitectura actual facilita esta migración

Ejemplo:
```typescript
// Antes (actual):
const combos = await ComboAPI.getAll();

// Después (con backend):
const combos = await fetch('/api/combos').then(r => r.json());
```

---

## ✅ Resumen de Lo Implementado

### Firebase (Actual)
- ✅ Fix de índices simplificados aplicado
- ✅ Funciona sin configuración extra
- ✅ Sin necesidad de crear índices en Firebase Console

### MongoDB (Listo para usar)
- ✅ Repositories implementados
- ✅ Misma lógica simplificada (sin índices complejos)
- ✅ Configuración lista
- ✅ Solo requiere cambiar `.env` y `layout.tsx`

### Arquitectura
- ✅ 100% Desacoplada
- ✅ Portable entre bases de datos
- ✅ Preparada para escalabilidad
- ✅ Fácil de mantener

---

## 🆘 Soporte

Si necesitas ayuda con la migración o tienes preguntas:
1. La arquitectura está documentada en el código
2. Cada repository tiene comentarios explicativos
3. El fix de índices está explicado en `FirebaseShiftRepository.ts` y `MongoDBShiftRepository.ts`
