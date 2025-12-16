# Manual de Usuario - Administrador

**FastChicken POS - Panel de Administración**

---

## 📋 Tabla de Contenidos

1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Dashboard y Reportes](#2-dashboard-y-reportes)
3. [Gestión de Inventario](#3-gestión-de-inventario)
4. [Gestión de Combos](#4-gestión-de-combos)
5. [Configuración de Descuentos](#5-configuración-de-descuentos)
6. [Gestión de Empleados](#6-gestión-de-empleados)
7. [Historial de Jornadas](#7-historial-de-jornadas)
8. [Configuración del Sistema](#8-configuración-del-sistema)
9. [Mejores Prácticas](#9-mejores-prácticas)
10. [Solución de Problemas](#10-solución-de-problemas)

---

## 1. Acceso al Sistema

### 1.1 Iniciar Sesión

**URL de acceso:** `https://tu-dominio.com/admin/login`

**Pasos:**

1. Abre tu navegador web (Chrome, Firefox, Safari, Edge)
2. Ingresa la URL del panel de administración
3. Verás la pantalla de login con:
   - Campo "Usuario"
   - Campo "Contraseña"
4. Ingresa tus credenciales de administrador
5. Click en **"Iniciar sesión"**

**Si las credenciales son correctas:**
- ✓ Serás redirigido al Dashboard
- ✓ La sesión quedará activa hasta que cierres sesión

**Si hay un error:**
- ❌ Verás mensaje: "Usuario o contraseña inválidos"
- Verifica que tus credenciales sean correctas
- Asegúrate de no tener mayúsculas activas (Caps Lock)

---

### 1.2 Cerrar Sesión

Para cerrar tu sesión de forma segura:

1. Haz click en tu nombre de usuario (esquina superior derecha)
2. Selecciona **"Cerrar sesión"**
3. Serás redirigido a la pantalla de login
4. Tu sesión se cierra completamente

**💡 Recomendación:** Siempre cierra sesión cuando termines, especialmente en computadoras compartidas.

---

### 1.3 Recuperar Credenciales

**Si olvidaste tu contraseña:**

⚠️ El sistema NO tiene recuperación automática de contraseña por seguridad.

**Opciones:**

1. **Si tienes acceso a la base de datos:**
   - Accede a MongoDB
   - Busca la colección `config`
   - Actualiza manualmente `adminUsername` y `adminPassword`

2. **Si NO tienes acceso:**
   - Contacta al soporte técnico
   - Será necesario resetear las credenciales directamente en la base de datos

**💡 Importante:** Guarda tus credenciales en un lugar seguro (gestor de contraseñas).

---

## 2. Dashboard y Reportes

### 2.1 Vista General del Dashboard

Al iniciar sesión, llegas al **Dashboard** - tu centro de control.

**Elementos principales:**

```
┌──────────────────────────────────────────────────┐
│  🏠 Dashboard                        👤 Admin ▼  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📅 [Selector de fechas]                         │
│                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │Ingresos │ │Pedidos  │ │ Ticket  │ │ Stock  │ │
│  │$125,000 │ │   42    │ │ $2,976  │ │  Bajo  │ │
│  └─────────┘ └─────────┘ └─────────┘ └────────┘ │
│                                                  │
│  [Gráfico: Top 5 Productos Vendidos]            │
│  [Gráfico: Local vs Delivery]                   │
│  [Tabla: Ventas por Producto]                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### 2.2 Filtrar por Fechas

**Selector de Rango de Fechas:**

Por defecto muestra: **Hoy** (desde 00:00 hasta 23:59)

**Para cambiar el rango:**

1. Click en el selector de fechas
2. **Opción A - Rango rápido:**
   - Hoy
   - Ayer
   - Últimos 7 días
   - Últimos 30 días
   - Este mes

3. **Opción B - Rango personalizado:**
   - Click en "Desde"
   - Selecciona fecha de inicio
   - Click en "Hasta"
   - Selecciona fecha de fin
   - Click en "Aplicar"

**Los datos se actualizan automáticamente** al cambiar el rango.

---

### 2.3 Métricas Principales (KPIs)

**1. Ingresos Totales**
- Suma de todas las ventas completadas
- **NO** incluye pedidos cancelados
- Formato: $ 125,000

**2. Total de Pedidos**
- Cantidad de pedidos completados
- **NO** cuenta pedidos cancelados
- Muestra número entero: 42

**3. Ticket Promedio**
- Cálculo: `Ingresos Totales ÷ Total de Pedidos`
- Indica el valor promedio de cada venta
- Formato: $ 2,976

**4. Item Más Vendido**
- Producto o combo con mayor cantidad de ventas
- Muestra el nombre del item
- Ejemplo: "Combo Familiar"

**5. Stock Bajo**
- Cantidad de productos con stock < 10 unidades
- **Alerta:** Si hay items bajos en stock
- Click para ver detalles

---

### 2.4 Gráficos y Visualizaciones

**Gráfico 1: Top 5 Productos Más Vendidos**

- Gráfico de pastel (pie chart)
- Muestra los 5 combos/productos con más ventas
- Al pasar el mouse: Cantidad vendida y porcentaje

**Colores:** Cada producto tiene un color único

**Interpretación:**
```
🔵 Combo Familiar: 45% (28 unidades)
🟢 Combo Pollo: 25% (15 unidades)
🟡 Hamburguesa Clásica: 15% (9 unidades)
🟣 Combo Jumbo: 10% (6 unidades)
🟠 Combo Vegetariano: 5% (3 unidades)
```

---

**Gráfico 2: Distribución por Tipo de Entrega**

- Gráfico de pastel
- Muestra qué porcentaje de pedidos es:
  - 🏠 Para comer acá (Local)
  - 📦 Para llevar (Takeaway)
  - 🚴 Delivery

**Al pasar el mouse:** Pedidos, porcentaje e ingresos por tipo

**Ejemplo:**
```
Para llevar:  60% - 25 pedidos - $75,000
Para comer:   30% - 13 pedidos - $39,000
Delivery:     10% -  4 pedidos - $11,000
```

**💡 Uso:** Identifica qué canal genera más ingresos para optimizar operaciones.

---

**Tabla: Ventas por Producto**

Lista completa con:

| Producto | Cantidad | Ingresos | % del Total |
|----------|----------|----------|-------------|
| Combo Familiar | 28 | $ 56,000 | 45% |
| Combo Pollo | 15 | $ 30,000 | 24% |
| ... | ... | ... | ... |

**Ordenamiento:** Por defecto por cantidad (mayor a menor)

**💡 Uso:**
- Identifica productos estrella
- Detecta productos con pocas ventas
- Planifica promociones

---

### 2.5 Interpretación de Datos

**Ejemplo de análisis:**

```
📅 Rango: Últimos 7 días

💰 Ingresos:        $ 875,000
📦 Pedidos:         294
🎯 Ticket Promedio: $ 2,976
⭐ Más Vendido:     Combo Familiar

Análisis:
✓ Ticket promedio saludable (~$3,000)
✓ Combo Familiar representa 45% de ventas
⚠️ Delivery solo 10% - oportunidad de crecimiento
⚠️ Stock bajo en Papas Fritas - reabastecer urgente
```

---

## 3. Gestión de Inventario

### 3.1 Acceder al Inventario

**Navegación:** Sidebar → 📦 **Inventario**

**Vista principal:**
- 3 pestañas por categoría
- Tabla con lista de productos
- Botón "Añadir [Categoría]"

---

### 3.2 Categorías de Inventario

**Pestaña 1: 🍗 Pollo y Hamburguesas**
- Productos principales
- Ejemplo: Pollo Frito, Hamburguesa Clásica, Milanesa

**Pestaña 2: 🥤 Bebidas**
- Todas las bebidas
- Ejemplo: Coca-Cola, Sprite, Fanta, Agua

**Pestaña 3: 🍟 Guarniciones**
- Acompañamientos
- Ejemplo: Papas Fritas, Ensalada, Aros de Cebolla

---

### 3.3 Crear Nuevo Producto

**Pasos:**

1. Selecciona la pestaña correspondiente
2. Click en **"Añadir [Producto/Bebida/Guarnición]"**
3. Se abre un formulario modal

**Campos del formulario:**

| Campo | Descripción | Ejemplo | Requerido |
|-------|-------------|---------|-----------|
| **Nombre** | Nombre del producto | "Pollo Frito Mediano" | Sí |
| **Precio** | Precio unitario en ARS | 1200 | Sí |
| **Stock** | Cantidad disponible | 50 | Sí |

4. Completa todos los campos
5. Click en **"Guardar"**

**Validaciones:**
- ✓ Nombre no puede estar vacío
- ✓ Precio debe ser mayor a 0
- ✓ Stock debe ser mayor o igual a 0

**Resultado:**
- ✓ El producto aparece en la tabla
- ✓ Ya está disponible para agregar a combos
- ✓ Los cajeros pueden venderlo

---

### 3.4 Editar Producto

**Pasos:**

1. Encuentra el producto en la tabla
2. Click en el menú **⋮** (tres puntos)
3. Selecciona **"Editar"**
4. Modifica los campos necesarios:
   - Cambiar nombre
   - Ajustar precio
   - Actualizar stock
5. Click en **"Guardar"**

**💡 Casos de uso comunes:**

**Actualizar stock:**
```
Situación: Llega nuevo inventario de Papas Fritas
Acción:
  - Stock actual: 15
  - Ingresaron: 50
  - Nuevo stock: 65
```

**Cambiar precio:**
```
Situación: Aumenta el costo del pollo
Acción:
  - Precio anterior: $1,200
  - Nuevo precio: $1,350
  - Guardar cambios
```

**⚠️ Importante:** Los cambios de precio afectan inmediatamente a nuevos pedidos.

---

### 3.5 Eliminar Producto

**Pasos:**

1. Click en menú **⋮** del producto
2. Selecciona **"Eliminar"**
3. Confirma la acción en el diálogo

**⚠️ ADVERTENCIA:**

Antes de eliminar, verifica:

- ❌ **NO elimines** si el producto está en combos activos
- ❌ **NO elimines** si hay pedidos recientes con este producto
- ✓ **SÍ elimina** si es un producto discontinuado que ya no se vende

**Consecuencias de eliminar:**
- El producto desaparece del inventario
- Ya no estará disponible para venta
- Los cajeros no lo verán en el menú
- **Los pedidos históricos NO se afectan**

**💡 Alternativa:** En lugar de eliminar, pon stock en 0 para deshabilitarlo temporalmente.

---

### 3.6 Alertas de Stock Bajo

**El sistema alerta cuando:**
- Un producto tiene stock < 10 unidades
- Aparece en el Dashboard con contador

**Cómo revisar:**

1. Ve al Dashboard
2. Mira la tarjeta "Stock Bajo"
3. Si muestra un número (ej: "5"), hay 5 productos con stock bajo
4. Ve a Inventario para revisar cuáles son

**Productos con stock bajo aparecen:**
- Con fondo rojo claro en la tabla
- Con icono ⚠️ de advertencia

**Acción recomendada:**
- Reabastecer urgentemente
- Actualizar el stock en el sistema

---

### 3.7 Mejores Prácticas para Inventario

**1. Actualiza stock regularmente**
- ✓ Al inicio del día
- ✓ Después de recibir mercadería
- ✓ Si detectas faltante

**2. Mantén precios actualizados**
- Ajusta según costos de proveedores
- Considera inflación
- Revisa competencia

**3. Monitorea productos de alta rotación**
- Asegura stock suficiente de best-sellers
- Evita quedarte sin stock en horarios pico

**4. Limpieza periódica**
- Elimina productos discontinuados
- Mantén nombres claros y consistentes
- Revisa precios duplicados o erróneos

---

## 4. Gestión de Combos

### 4.1 Acceder a Combos

**Navegación:** Sidebar → 🛒 **Combos**

**Vista principal:**
- Tabla con lista de todos los combos
- Botón "Crear Nuevo Combo"
- Información de cada combo: nombre, precio, productos incluidos

---

### 4.2 Crear Nuevo Combo

**Pasos:**

1. Click en **"Crear Nuevo Combo"**
2. Se abre formulario modal extenso

**Sección 1: Información General**

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nombre** | Nombre del combo | "Combo Familiar" |
| **Descripción** | Descripción breve | "Ideal para compartir en familia" |
| **Precio** | Precio total del combo | 3500 |

---

**Sección 2: Productos del Combo**

**Agregar productos:**

1. Click en **"+ Agregar Producto"**
2. Se abre una nueva fila de configuración

**Configuración por producto:**

| Campo | Opciones | Descripción |
|-------|----------|-------------|
| **Producto** | Lista desplegable | Selecciona del inventario |
| **Cantidad** | Número | Cantidad incluida (ej: 2) |
| **Tipo de Selección** | Fijo / Opcional | Cómo se incluye |
| **Grupo** | Texto | Solo si es "Opcional" |

---

**Tipo de Selección: Explicación**

**🔒 FIJO (Fixed):**
- El producto **siempre** está incluido
- El cliente **NO** puede elegir
- Se agrega automáticamente al pedido

**Ejemplo:**
```
Producto: Papas Grandes
Tipo: Fijo
→ El combo SIEMPRE incluye Papas Grandes
```

**🔀 OPCIONAL (Choice):**
- El cliente **DEBE elegir uno** del grupo
- Se agrupan productos del mismo tipo
- Solo se puede seleccionar UNO por grupo

**Ejemplo:**
```
Producto A: Pollo Frito    | Tipo: Opcional | Grupo: "producto"
Producto B: Hamburguesa    | Tipo: Opcional | Grupo: "producto"
→ El cliente elige: Pollo Frito O Hamburguesa (obligatorio)
```

---

**Grupos de Selección:**

Usa el campo "Grupo" para agrupar opciones del mismo tipo:

| Grupo | Productos Típicos |
|-------|-------------------|
| `producto` | Pollo, Hamburguesa, Milanesa |
| `bebida` | Coca-Cola, Sprite, Fanta |
| `guarnicion` | Papas, Ensalada, Aros |

**💡 Regla importante:** Productos del mismo grupo compiten entre sí. El cliente elige UNO.

---

**Ejemplo Completo: Combo Clásico**

```
Nombre: Combo Clásico
Precio: $2,500

Productos:
1. Hamburguesa Clásica  | Cantidad: 1 | Tipo: Fijo        | Grupo: -
2. Pollo Frito         | Cantidad: 1 | Tipo: Opcional    | Grupo: producto
3. Milanesa            | Cantidad: 1 | Tipo: Opcional    | Grupo: producto
4. Coca-Cola           | Cantidad: 1 | Tipo: Opcional    | Grupo: bebida
5. Sprite              | Cantidad: 1 | Tipo: Opcional    | Grupo: bebida
6. Papas Fritas        | Cantidad: 1 | Tipo: Fijo        | Grupo: -

Resultado:
✓ Incluye SIEMPRE: Hamburguesa Clásica + Papas Fritas
✓ Cliente elige: Pollo Frito O Milanesa (producto)
✓ Cliente elige: Coca-Cola O Sprite (bebida)
```

---

**Validaciones del Sistema:**

Al crear/editar un combo, el sistema valida:

✓ **Nombre no vacío**
✓ **Precio mayor a 0**
✓ **Al menos 1 producto agregado**
✓ **Grupos de selección válidos:**
   - Si hay productos opcionales, debe haber mínimo 2 del mismo grupo
   - No puede haber un solo producto opcional en un grupo

**Advertencias visuales:**

El formulario muestra análisis en tiempo real:

```
✓ Productos fijos: 2 (incluidos automáticamente)
✓ Grupo "producto": 2 opciones (válido)
✓ Grupo "bebida": 2 opciones (válido)
⚠️ Grupo "guarnicion": 1 opción (incompleto - agregar más opciones)
```

---

### 4.3 Editar Combo

**Pasos:**

1. Encuentra el combo en la tabla
2. Click en menú **⋮**
3. Selecciona **"Editar"**
4. El formulario se abre con datos pre-cargados
5. Modifica lo necesario:
   - Cambiar nombre o descripción
   - Ajustar precio
   - Agregar/quitar productos
   - Cambiar configuración de productos
6. Click en **"Guardar"**

**⚠️ Importante:**
- Los cambios afectan inmediatamente a nuevos pedidos
- Pedidos anteriores NO se modifican

---

### 4.4 Eliminar Combo

**Pasos:**

1. Click en menú **⋮** del combo
2. Selecciona **"Eliminar"**
3. Confirma la eliminación

**⚠️ ADVERTENCIA:**

- ❌ La acción NO se puede deshacer
- El combo desaparece del menú de cajeros
- Ya no se podrá vender

**💡 Alternativa segura:**

En lugar de eliminar, considera:
- Crear un combo nuevo mejorado
- Mantener el viejo temporalmente
- Monitorear que los cajeros usen el nuevo
- Eliminar el viejo después de confirmar

---

### 4.5 Casos de Uso Comunes

**Caso 1: Combo Simple (todo incluido)**

```
Nombre: Combo Básico
Precio: $1,800

Productos:
- Hamburguesa Clásica (Fijo, cantidad: 1)
- Papas Medianas (Fijo, cantidad: 1)
- Coca-Cola (Fijo, cantidad: 1)

Resultado: El cliente recibe TODO sin elegir nada
```

---

**Caso 2: Combo con Opciones de Bebida**

```
Nombre: Combo Pollo
Precio: $2,200

Productos:
- Pollo Frito (Fijo, cantidad: 2)
- Papas Grandes (Fijo, cantidad: 1)
- Coca-Cola (Opcional, grupo: bebida)
- Sprite (Opcional, grupo: bebida)
- Fanta (Opcional, grupo: bebida)

Resultado:
  Incluye: 2 Pollos + Papas
  Cliente elige: 1 bebida entre las 3 opciones
```

---

**Caso 3: Combo Totalmente Personalizable**

```
Nombre: Arma tu Combo
Precio: $3,000

Productos:
Grupo "producto":
- Pollo Frito (Opcional)
- Hamburguesa (Opcional)
- Milanesa (Opcional)

Grupo "guarnicion":
- Papas Fritas (Opcional)
- Ensalada (Opcional)
- Aros de Cebolla (Opcional)

Grupo "bebida":
- Coca-Cola (Opcional)
- Sprite (Opcional)
- Agua (Opcional)

Resultado:
  Cliente elige: 1 producto + 1 guarnición + 1 bebida
  Total de combinaciones: 3 × 3 × 3 = 27 variantes
```

---

## 5. Configuración de Descuentos

### 5.1 Acceder a Descuentos

**Navegación:** Sidebar → 🏷️ **Descuentos**

**Vista principal:**
- Lista de descuentos activos
- Botón "Nuevo Descuento"
- Información: tipo, aplicación, condiciones

---

### 5.2 Tipos de Descuentos

El sistema soporta **2 tipos principales**:

**1. Descuento Simple**
- Aplica % de descuento a:
  - Total de la compra (order)
  - Combos específicos

**2. Promoción Cruzada (Cross-promotion)**
- "Compra A → Descuento en B"
- Caso especial 2x1: A = B

---

### 5.3 Crear Descuento Simple

**Pasos:**

1. Click en **"Nuevo Descuento"**
2. Selecciona **tipo: "Simple"**

**Configuración:**

**Paso 1: Porcentaje**
- Ingresa el % de descuento
- Rango: 1% a 100%
- Ejemplo: 20 (para 20% de descuento)

**Paso 2: Aplica a**
- **Opción A: "Total de la compra"**
  - El descuento se aplica al total final del pedido
  - Ejemplo: Pedido de $5,000 con 20% → $4,000

- **Opción B: "Combos específicos"**
  - Selecciona uno o más combos
  - El descuento solo afecta esos combos
  - Ejemplo: "Combo Familiar" con 15% OFF

**Paso 3: Condiciones Temporales** (Obligatorio)

**Opción A - Día de la semana:**
```
Tipo: Día de la semana
Día: Martes
Horario: 18:00 - 22:00

Resultado: Solo los martes de 18 a 22hs
```

**Opción B - Fecha específica:**
```
Tipo: Fecha específica
Fecha: 2025-12-25
Horario: Todo el día

Resultado: Solo el 25 de diciembre, todo el día
```

**Horario (opcional):**
- Si NO especificas horario: Aplica todo el día
- Si especificas: Solo en ese rango
- Formato: HH:MM (24 horas)

**Paso 4: Guardar**
- Click en **"Crear Descuento"**
- El descuento se activa inmediatamente

---

**Ejemplos de Descuentos Simples:**

**Ejemplo 1: Happy Hour**
```
Tipo: Simple
Porcentaje: 25%
Aplica a: Total de la compra
Día: Todos los días de la semana (crear uno por día)
Horario: 17:00 - 20:00

Efecto: 25% de descuento en todo entre 17 y 20hs
```

**Ejemplo 2: Martes de Pollo**
```
Tipo: Simple
Porcentaje: 30%
Aplica a: Combos específicos
Combos: [Combo Pollo, Combo Pollo Jumbo]
Día: Martes
Horario: Todo el día

Efecto: 30% OFF en combos de pollo solo los martes
```

**Ejemplo 3: Navidad**
```
Tipo: Simple
Porcentaje: 15%
Aplica a: Total de la compra
Fecha: 2025-12-25
Horario: Todo el día

Efecto: 15% de descuento en todo el 25 de diciembre
```

---

### 5.4 Crear Promoción Cruzada

**Concepto:** "Si compras A, obtienes descuento en B"

**Pasos:**

1. Click en **"Nuevo Descuento"**
2. Selecciona **tipo: "Promoción Cruzada"**

**Configuración:**

**Paso 1: Combos**
- **Combo Disparador:** El que el cliente debe comprar
- **Combo con Descuento:** El que obtiene el descuento
- Selecciona uno de cada lista desplegable

**Paso 2: Porcentaje**
- % de descuento que se aplica al Combo con Descuento
- Ejemplo: 50 (para 50% OFF)

**Paso 3: Condiciones Temporales**
- Igual que en descuento simple
- Día de semana o fecha específica
- Horario opcional

---

**Ejemplos de Promoción Cruzada:**

**Ejemplo 1: Promoción Mix**
```
Tipo: Promoción Cruzada
Combo Disparador: Combo Familiar
Combo con Descuento: Combo Hamburguesa
Porcentaje: 40%
Día: Sábado
Horario: Todo el día

Efecto: Los sábados, si compras Combo Familiar,
        obtienes 40% OFF en Combo Hamburguesa
```

**Ejemplo 2: 2x1 (Caso Especial)**
```
Tipo: Promoción Cruzada
Combo Disparador: Combo Pollo
Combo con Descuento: Combo Pollo (el mismo)
Porcentaje: 100%
Día: Jueves
Horario: Todo el día

Efecto: 2x1 en Combo Pollo los jueves
        (compra 2, el segundo gratis)
```

**Ejemplo 3: 2 x 50% OFF**
```
Tipo: Promoción Cruzada
Combo Disparador: Combo Clásico
Combo con Descuento: Combo Clásico (el mismo)
Porcentaje: 50%
Día: Viernes
Horario: 19:00 - 23:00

Efecto: Viernes de noche, compra 2 Combo Clásico,
        el segundo a mitad de precio
```

---

### 5.5 Editar Descuento

**Pasos:**

1. Encuentra el descuento en la lista
2. Click en menú **⋮**
3. Selecciona **"Editar"**
4. Modifica los campos necesarios
5. Click en **"Guardar"**

**Cambios comunes:**
- Ajustar porcentaje
- Cambiar día/fecha
- Modificar horario
- Cambiar combos incluidos

---

### 5.6 Eliminar Descuento

**Pasos:**

1. Click en menú **⋮** del descuento
2. Selecciona **"Eliminar"**
3. Confirma la eliminación

**Efecto:**
- El descuento se desactiva inmediatamente
- Nuevos pedidos NO lo aplican
- Pedidos en curso pueden tenerlo aplicado aún

---

### 5.7 Cómo se Aplican los Descuentos (Lógica del Sistema)

**Orden de aplicación:**

1. **Descuentos simples en combos específicos**
   - Se aplican al agregar el combo al carrito
   - El cajero ve el precio descontado de inmediato

2. **Promociones cruzadas**
   - Se aplican automáticamente cuando hay múltiples combos en el carrito
   - El sistema detecta si hay combo disparador
   - Aplica descuento al combo objetivo

3. **Descuento sobre total de compra**
   - Se aplica al finalizar el pedido
   - Afecta el total completo

**Validaciones temporales:**
- El sistema verifica fecha y hora actual
- Solo aplica si está dentro del rango configurado
- La verificación se hace al momento de agregar al carrito

---

### 5.8 Mejores Prácticas para Descuentos

**1. Nombra claramente tus descuentos**
- ✓ Usa nombres descriptivos
- Ejemplo: "Martes Pollo 30%", "2x1 Jueves", "Happy Hour"

**2. Evita superposición excesiva**
- ⚠️ Múltiples descuentos pueden acumularse
- Verifica que no generes pérdidas
- Ejemplo: 20% en combo + 15% en total = descuento combinado

**3. Planifica promociones por día**
- Lunes: Promoción A
- Martes: Promoción B
- Mantén un calendario de descuentos

**4. Monitorea el impacto**
- Revisa en Dashboard si aumentan ventas
- Compara días con/sin descuento
- Ajusta porcentajes según resultados

**5. Comunica las promociones**
- Informa a cajeros sobre descuentos activos
- Capacita para que ofrezcan al cliente
- Publica en redes sociales

---

## 6. Gestión de Empleados

### 6.1 Acceder a Empleados

**Navegación:** Sidebar → 👥 **Empleados**

**Vista principal:**
- Tarjetas de empleados en grid
- Botón "Nuevo Empleado"
- Info: nombre, rol, estado

---

### 6.2 Crear Nuevo Empleado

**Pasos:**

1. Click en **"Nuevo Empleado"**
2. Completa el formulario

**Campos:**

| Campo | Opciones | Descripción |
|-------|----------|-------------|
| **Nombre** | Texto | Nombre del empleado |
| **Rol** | Cajero / Admin | Nivel de acceso |
| **Activo** | Checkbox | Si está activo o inactivo |

**Roles explicados:**

**🧑‍💼 Cajero:**
- Acceso SOLO a la caja (`/`)
- Puede: Tomar pedidos, iniciar/cerrar jornada, cancelar pedidos
- NO puede: Acceder al panel de admin

**👔 Admin:**
- Acceso COMPLETO al panel de admin (`/admin/*`)
- Puede: Todo lo que hace el cajero + gestionar sistema
- Requiere: Credenciales separadas de login

3. Click en **"Guardar"**

**Resultado:**
- El empleado aparece en la lista
- Si es cajero y está activo: aparece en diálogo de inicio de jornada
- Si es admin: puede acceder con credenciales de admin

---

### 6.3 Editar Empleado

**Pasos:**

1. Encuentra la tarjeta del empleado
2. Click en ícono ✏️ **Editar**
3. Modifica los campos
4. Click en **"Guardar"**

**Cambios comunes:**
- Corregir nombre
- Cambiar rol (ej: Cajero → Admin)
- Activar/desactivar

---

### 6.4 Cambiar Estado (Activo/Inactivo)

**Método rápido:**

1. En la tarjeta del empleado
2. Click en botón **"Activo"** o **"Inactivo"**
3. El estado cambia inmediatamente (sin confirmación)

**Estados:**

**✅ Activo (verde):**
- El empleado puede trabajar
- Aparece en lista de inicio de jornada
- Puede iniciar sesión

**❌ Inactivo (gris):**
- El empleado NO puede trabajar
- NO aparece en lista de cajeros
- No puede iniciar nuevas jornadas

**💡 Uso:**
- Desactiva empleados que renunciaron o están de vacaciones
- Reactiva cuando vuelven
- NO elimines, solo desactiva

---

### 6.5 Eliminar Empleado

**Pasos:**

1. Click en ícono 🗑️ **Eliminar**
2. Confirma la eliminación

**⚠️ ADVERTENCIA:**

- La eliminación marca al empleado como **inactivo**
- **NO** se borra de la base de datos (por integridad referencial)
- Jornadas históricas del empleado se mantienen
- NO aparecerá más en listas de cajeros

**💡 Recomendación:** En lugar de eliminar, mejor desactiva.

---

### 6.6 Mejores Prácticas

**1. Nombres claros y completos**
- ✓ "Juan Pérez"
- ❌ "Juancho"

**2. Asigna rol correcto desde el inicio**
- Revisa bien si es Cajero o Admin

**3. Desactiva en lugar de eliminar**
- Preserva historial
- Puedes reactivar después

**4. Mantén lista actualizada**
- Desactiva empleados que ya no trabajan
- Evita confusión al iniciar jornadas

---

## 7. Historial de Jornadas

### 7.1 Acceder a Jornadas

**Navegación:** Sidebar → 🕐 **Jornadas**

**Vista principal:**
- Filtro de fechas
- Lista de jornadas en tarjetas
- Badge con cantidad

---

### 7.2 Filtrar Jornadas por Fecha

**Selector de fechas:**

Por defecto: **Hoy**

**Para cambiar:**

1. Click en el selector
2. Elige rango:
   - Hoy
   - Últimos 7 días
   - Últimos 30 días
   - Personalizado (elige inicio y fin)
3. Las jornadas se filtran automáticamente

**Badge de cantidad:**
```
📅 Hoy  [3]
```
Indica que hay 3 jornadas en el rango seleccionado.

---

### 7.3 Información de Jornada (Tarjeta)

**Vista en tarjeta:**

```
┌─────────────────────────────────┐
│ 👤 Juan Pérez                   │
│ 🟢 Abierta  /  🔴 Cerrada       │
├─────────────────────────────────┤
│ 📅 14 de Enero de 2025          │
│ 🕐 08:00 - 16:30 (8h 30m)       │
│                                 │
│ 💰 Fondo inicial: $ 10,000      │
│ 💵 Ventas:       $ 45,000       │
│ 📦 Pedidos:      25             │
│                                 │
│ [Si está cerrada]               │
│ Efectivo esperado: $ 55,000     │
│ Efectivo real:     $ 55,100     │
│ Diferencia:        +$ 100 🟢     │
│                                 │
│         [Ver Detalle]           │
└─────────────────────────────────┘
```

---

### 7.4 Ver Detalle de Jornada

**Pasos:**

1. Click en **"Ver Detalle"** en cualquier tarjeta
2. Se abre modal con información completa

**Modal de Detalle:**

**Sección 1: Información General**
- Nombre del empleado
- Fecha
- Hora de inicio y fin
- Duración total

**Sección 2: Resumen Financiero**

```
Fondo inicial:           $ 10,000
Total ventas:            $ 45,000
Pedidos cancelados:      -$ 1,500 (3 pedidos)
Efectivo esperado:       $ 53,500

[Si está cerrada]
Efectivo real:           $ 53,600
Diferencia de caja:      +$ 100
```

**Sección 3: Métricas de Ventas**

- Total órdenes completadas
- Ticket promedio
- Ventas brutas (sin cancelaciones)

**Sección 4: Productos Vendidos**

Lista de todos los combos/productos vendidos:

| Producto | Cantidad | Ingresos |
|----------|----------|----------|
| Combo Familiar | 12 | $ 18,000 |
| Combo Pollo | 8 | $ 12,000 |
| ... | ... | ... |

**Sección 5: Órdenes de la Jornada**

Tabla completa de pedidos:

| Hora | Producto | Entrega | Total | Estado |
|------|----------|---------|-------|--------|
| 09:15 | Combo Familiar | Local | $ 1,500 | ✓ |
| 09:23 | Combo Pollo | Delivery | $ 1,200 | ❌ Cancelado |

**Pedidos cancelados:**
- Aparecen con fondo rojo
- Badge "Cancelado"
- Muestran razón de cancelación

---

### 7.5 Análisis de Jornadas

**Caso de uso 1: Auditoría de Caja**

Si hay diferencia de caja al cerrar:

1. Ve a la jornada específica
2. Revisa sección financiera
3. Verifica:
   - Total de ventas vs efectivo esperado
   - Pedidos cancelados (resta del total)
   - Diferencia final

**Investigación:**
- Si sobra dinero (+): Verifica si hubo error al contar
- Si falta dinero (-): Revisa pedidos cancelados, posible faltante

---

**Caso de uso 2: Evaluar Desempeño de Cajero**

1. Filtra jornadas del cajero (último mes)
2. Analiza:
   - Ticket promedio por jornada
   - Cantidad de pedidos por hora
   - Diferencias de caja recurrentes
   - Pedidos cancelados (cantidad y razón)

**Indicadores de buen desempeño:**
- ✓ Ticket promedio alto
- ✓ Pocas diferencias de caja
- ✓ Bajas cancelaciones

**Señales de alerta:**
- ⚠️ Diferencias de caja frecuentes
- ⚠️ Muchos pedidos cancelados
- ⚠️ Ticket promedio muy bajo

---

**Caso de uso 3: Análisis de Turnos**

Compara jornadas de diferentes horarios:

```
Turno Mañana (08:00-14:00):
  - Pedidos promedio: 18
  - Ingresos promedio: $ 25,000

Turno Tarde (14:00-20:00):
  - Pedidos promedio: 32
  - Ingresos promedio: $ 48,000

Conclusión: El turno tarde es más productivo
```

**Decisiones basadas en datos:**
- Asignar cajeros más experimentados en horarios pico
- Planificar promociones en horarios bajos
- Optimizar stock para horarios de mayor demanda

---

### 7.6 Exportar Datos de Jornadas

**Actualmente NO hay exportación automática.**

**Alternativa manual:**
1. Toma screenshots del modal de detalle
2. Anota datos relevantes
3. Crea reportes en Excel/Google Sheets

**💡 Futura mejora:** Botón "Exportar a Excel" en desarrollo.

---

## 8. Configuración del Sistema

### 8.1 Acceder a Configuración

**Navegación:** Sidebar → ⚙️ **Configuración**

**Pantalla principal:**
- Configuración actual
- Formulario de actualización

---

### 8.2 Ver Configuración Actual

**Información mostrada:**

```
📋 Configuración Actual

Usuario administrador: admin_usuario
Estado: Activo
Última actualización: 15 de Enero de 2025
```

**💡 Uso:** Verifica cuál es el usuario actual antes de cambiar.

---

### 8.3 Actualizar Credenciales de Admin

**Cuándo hacerlo:**
- Primera configuración del sistema
- Por seguridad (cambio periódico)
- Si crees que las credenciales fueron comprometidas

**Pasos:**

1. Completa el formulario:

| Campo | Descripción | Mínimo |
|-------|-------------|--------|
| **Nuevo usuario** | Nombre de usuario para admin | 3 caracteres |
| **Nueva contraseña** | Contraseña para admin | 4 caracteres |

2. Click en **"Actualizar Credenciales"**

**Validaciones:**
- ✓ Usuario debe tener al menos 3 caracteres
- ✓ Contraseña debe tener al menos 4 caracteres
- ✓ Ambos campos son obligatorios

**Resultado:**
- ✓ Credenciales actualizadas en la base de datos
- ✓ Mensaje de confirmación
- ✓ El formulario se limpia
- ✓ **IMPORTANTE:** Tu sesión actual sigue activa

---

### 8.4 Mejores Prácticas de Seguridad

**1. Contraseña segura**
- ✓ Mínimo 8 caracteres (aunque el sistema permite 4)
- ✓ Combina letras, números y símbolos
- ✓ Evita palabras comunes
- ❌ No uses: "admin", "1234", "password"

**Ejemplo de contraseña segura:**
```
❌ Débil:    admin123
✓ Fuerte:   Fc$2025!Pos*
```

**2. Usuario único**
- ✓ No uses "admin" genérico
- ✓ Personaliza el nombre
- Ejemplo: "fc_admin_2025"

**3. Rotación periódica**
- Cambia credenciales cada 3-6 meses
- Especialmente si hay rotación de personal

**4. Guarda en lugar seguro**
- ✓ Usa gestor de contraseñas (LastPass, 1Password, Bitwarden)
- ✓ Anota físicamente en lugar seguro
- ❌ NO guardes en archivo de texto en la computadora
- ❌ NO compartas por WhatsApp o email

**5. Cierra sesión siempre**
- Especialmente en computadoras compartidas
- No dejes la sesión abierta sin supervisión

---

### 8.5 Recuperación de Acceso

**Si olvidaste las credenciales:**

El sistema **NO** tiene recuperación automática.

**Opciones:**

**Opción 1: Acceso directo a MongoDB**

Si tienes acceso a la base de datos:

1. Conéctate a MongoDB
2. Usa MongoDB Compass o shell
3. Encuentra colección `config`
4. Actualiza campos:
   ```javascript
   {
     adminUsername: "nuevo_usuario",
     adminPassword: "nueva_contraseña"
   }
   ```
5. Guarda cambios
6. Ya puedes hacer login con las nuevas credenciales

**Opción 2: Soporte Técnico**

Si NO tienes acceso a MongoDB:
- Contacta al desarrollador del sistema
- Proporciona prueba de identidad/autorización
- El soporte resetea las credenciales manualmente

---

## 9. Mejores Prácticas

### 9.1 Rutinas Diarias Recomendadas

**Al inicio del día:**

✓ Revisa el Dashboard
✓ Verifica stock bajo (reabastecer si es necesario)
✓ Confirma que cajeros pueden iniciar jornada
✓ Revisa promociones activas del día
✓ Informa a cajeros sobre descuentos vigentes

**Durante el día:**

✓ Monitorea ventas en tiempo real
✓ Responde consultas de cajeros sobre stock/combos
✓ Verifica que no haya alertas de sistema

**Al final del día:**

✓ Revisa jornadas cerradas
✓ Verifica diferencias de caja
✓ Analiza productos más vendidos
✓ Planifica reabastecimiento para mañana
✓ Exporta datos si es necesario

---

### 9.2 Gestión de Stock Proactiva

**Semanalmente:**

1. Ve al Dashboard
2. Analiza productos más vendidos (últimos 7 días)
3. Identifica patrones:
   - Productos de alta rotación
   - Días de mayor venta
   - Combos estrella

4. Planifica compras:
   ```
   Ejemplo:
   Papas Fritas: 120 unidades vendidas/semana
   Stock actual: 50
   Reabastecer: 150 para cubrir semana + buffer
   ```

**Alertas proactivas:**

Cuando un producto llega a stock < 20:
- Crea alerta para reabastecimiento
- Considera aumentar cantidad de compra si es recurrente

---

### 9.3 Optimización de Precios

**Análisis de rentabilidad:**

1. Dashboard → Ventas por Producto
2. Identifica:
   - Productos con % bajo de ventas
   - Productos con % alto de ventas

**Estrategias:**

**Para productos con pocas ventas:**
- Opción 1: Bajar precio (crear descuento temporal)
- Opción 2: Incluirlo en combo atractivo
- Opción 3: Discontinuar si no mejora

**Para productos estrella:**
- Mantén precio competitivo
- Asegura stock suficiente
- Considera combos premium con ellos

---

### 9.4 Gestión de Descuentos Estratégica

**Calendario de promociones:**

```
Lunes:    Sin descuento (día regular)
Martes:   30% en Combos de Pollo
Miércoles: 2x1 en Combos Clásicos
Jueves:   Happy Hour 18-22hs (25% total)
Viernes:  Sin descuento (día de alta venta)
Sábado:   Combos Familiares 20% OFF
Domingo:  Sin descuento
```

**Razones:**
- Martes-Jueves: Días bajos, estimular con descuentos
- Viernes-Domingo: Alta demanda natural, mantener margen

**A/B Testing:**

Prueba diferentes descuentos:
1. Semana 1: Martes 30% en Pollo
2. Semana 2: Martes 2x1 en Pollo
3. Semana 3: Martes 25% en todo

Compara resultados:
- ¿Cuál generó más ventas?
- ¿Cuál tuvo mejor margen?
- Implementa el más efectivo permanentemente

---

### 9.5 Capacitación de Cajeros

**Temas clave a entrenar:**

1. **Combos y personalización**
   - Explicar diferencia entre productos fijos y opcionales
   - Practicar casos complejos

2. **Descuentos activos**
   - Informar qué promociones están vigentes
   - Enseñar a verificar descuentos aplicados

3. **Gestión de stock**
   - Qué hacer si no hay stock
   - Sugerir alternativas al cliente

4. **Cancelación de pedidos**
   - Cuándo es apropiado cancelar
   - Importancia de registrar razón

5. **Arqueo de caja**
   - Contar efectivo correctamente
   - Qué hacer si hay diferencia

**💡 Tip:** Crea checklist impreso con procedimientos clave.

---

## 10. Solución de Problemas

### 10.1 No puedo iniciar sesión

**Síntoma:** Error "Usuario o contraseña inválidos"

**Soluciones:**

1. **Verifica credenciales:**
   - ✓ Usuario correcto (sin espacios)
   - ✓ Contraseña correcta (mayúsculas/minúsculas importan)
   - ✓ No hay Caps Lock activo

2. **Recuerda las credenciales correctas:**
   - Ve a Configuración si tienes acceso
   - Consulta tus notas seguras
   - Contacta soporte si olvidaste

3. **Verifica conexión a internet:**
   - El sistema requiere internet para autenticación
   - Prueba abrir otro sitio web

4. **Limpia caché del navegador:**
   - Ctrl+Shift+Delete (Chrome/Firefox)
   - Limpia cookies y caché
   - Reinicia navegador

---

### 10.2 Los datos no se cargan o aparecen desactualizados

**Síntoma:** Dashboard vacío, inventario no se ve, o datos viejos

**Soluciones:**

1. **Recarga la página:**
   - Presiona F5 o Ctrl+R
   - Espera a que cargue completamente

2. **Verifica conexión a internet:**
   - Asegúrate de estar conectado
   - Prueba velocidad de conexión

3. **Revisa base de datos:**
   - Si tienes acceso a MongoDB, verifica que esté activa
   - Confirma que MongoDB está corriendo

4. **Consulta logs de error:**
   - Abre consola del navegador (F12)
   - Busca errores en rojo
   - Reporta al soporte técnico

---

### 10.3 No puedo crear/editar combos

**Síntoma:** Error al guardar combo, validación falla

**Causas comunes:**

1. **Grupos de selección incompletos:**
   - Error: "Grupo 'bebida' solo tiene 1 opción"
   - Solución: Agrega mínimo 2 productos del mismo grupo opcional

2. **Precio o nombre vacío:**
   - Error: "Nombre es requerido"
   - Solución: Completa todos los campos obligatorios

3. **Productos sin stock:**
   - Advertencia: "Stock insuficiente"
   - Solución: Reabastece inventario primero

4. **Productos eliminados:**
   - Error: "Producto no encontrado"
   - Solución: Quita el producto del combo o reemplázalo

---

### 10.4 Los descuentos no se aplican correctamente

**Síntoma:** Descuento configurado pero no aparece en caja

**Verificaciones:**

1. **Revisa condiciones temporales:**
   - ✓ ¿Es el día correcto? (Lunes = 1, Martes = 2...)
   - ✓ ¿Está dentro del horario configurado?
   - ✓ Si es fecha específica, ¿coincide la fecha?

2. **Verifica aplicación:**
   - Si es "Combos específicos", ¿el combo está en la lista?
   - Si es "Total de compra", ¿se está finalizando la orden?

3. **Revisa que el descuento no haya sido eliminado:**
   - Ve a Descuentos
   - Confirma que esté en la lista

4. **Prueba manualmente:**
   - Simula un pedido desde la caja
   - Verifica si el badge "% OFF" aparece
   - Revisa el precio final

---

### 10.5 Diferencia de caja recurrente

**Síntoma:** Todos los días hay diferencia al cerrar jornada

**Investigación:**

1. **Analiza el patrón:**
   - ¿Siempre falta o siempre sobra?
   - ¿Es la misma cantidad o varía?
   - ¿Ocurre con todos los cajeros o solo uno?

2. **Revisa pedidos cancelados:**
   - Ve a Jornadas → Detalle
   - Verifica cantidad de cancelaciones
   - Si hay muchas, el total esperado puede ser incorrecto

3. **Verifica método de conteo:**
   - ¿El cajero cuenta correctamente?
   - ¿Separa billetes y monedas?
   - ¿Verifica dos veces?

4. **Causas técnicas:**
   - Descuentos mal configurados
   - Productos con precio incorrecto
   - Bugs en cálculo de total

**Acción recomendada:**
- Si el patrón es consistente: Investiga configuración de precios/descuentos
- Si varía: Problema de conteo manual
- Si es solo un cajero: Capacitación adicional

---

### 10.6 Stock desincronizado

**Síntoma:** El sistema muestra stock diferente a la realidad física

**Causas:**

1. **Cancelaciones de pedidos:**
   - Al cancelar, el stock se devuelve
   - Verifica que coincida con realidad

2. **Pedidos no registrados:**
   - Ventas manuales no ingresadas al sistema
   - Solución: Ingresar todos los pedidos

3. **Robo o pérdida física:**
   - Stock físico menor que digital
   - Hacer ajuste manual en Inventario

4. **Error de carga inicial:**
   - Stock mal ingresado al inicio
   - Hacer conteo físico y ajustar

**Solución: Ajuste manual**

1. Ve a Inventario
2. Cuenta físicamente el producto
3. Edita el producto
4. Actualiza stock con cantidad real
5. Anota la fecha del ajuste

**💡 Prevención:**
- Haz inventarios físicos semanales
- Compara con stock digital
- Ajusta inmediatamente si hay diferencia

---

### 10.7 El sistema está lento

**Síntoma:** Páginas tardan en cargar, botones no responden

**Soluciones:**

1. **Verifica conexión a internet:**
   - Haz speed test
   - Mínimo recomendado: 5 Mbps de descarga

2. **Cierra pestañas innecesarias:**
   - El navegador consume memoria
   - Deja solo el panel de admin abierto

3. **Reinicia el navegador:**
   - Cierra completamente
   - Vuelve a abrir
   - Inicia sesión de nuevo

4. **Limpia caché:**
   - Ctrl+Shift+Delete
   - Limpia caché e imágenes
   - Reinicia navegador

5. **Usa navegador recomendado:**
   - Chrome (actualizado)
   - Firefox (actualizado)
   - Evita Internet Explorer

6. **Verifica recursos del servidor:**
   - Si persiste, puede ser problema de hosting
   - Contacta soporte técnico

---

### 10.8 Error al imprimir tickets

**Síntoma:** Los cajeros reportan que no se imprime

**Nota:** La impresión depende de la configuración del navegador y la impresora física.

**Soluciones:**

1. **Verifica que la impresora esté conectada:**
   - Prendida
   - Con papel
   - Conectada a la computadora

2. **Configura impresora predeterminada:**
   - Panel de Control → Dispositivos → Impresoras
   - Marca la impresora de tickets como predeterminada

3. **Ajusta configuración de impresión:**
   - Al hacer click en "Imprimir", se abre diálogo del navegador
   - Selecciona la impresora correcta
   - Tamaño de papel: 80mm (térmico) o A4
   - Orientación: Vertical

4. **Prueba desde otro programa:**
   - Si no imprime desde ningún lado: problema de impresora
   - Si solo no imprime desde el sistema: contacta soporte

---

### 10.9 Mensajes de error comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Network Error" | Sin conexión a internet | Verifica conexión |
| "Unauthorized" | Sesión expirada | Vuelve a iniciar sesión |
| "Stock insuficiente" | No hay suficiente stock | Reabastecer inventario |
| "Invalid credentials" | Credenciales incorrectas | Verifica usuario/contraseña |
| "Server error 500" | Error del servidor | Recarga página, contacta soporte |
| "Not found 404" | Recurso no existe | Reporta a soporte |

---

## 📞 Contacto y Soporte

**Para soporte técnico:**

1. **Documentación:**
   - Revisa este manual primero
   - Consulta sección de Solución de Problemas

2. **Soporte interno:**
   - Contacta al encargado de sistemas
   - Proporciona detalles del error

3. **Soporte técnico externo:**
   - Email: [soporte@fastchicken.com]
   - Teléfono: [XXX-XXXX-XXXX]
   - Horario: Lunes a viernes, 9:00 - 18:00

**Al reportar un problema, incluye:**
- ✓ Descripción detallada del error
- ✓ Pasos para reproducir el problema
- ✓ Screenshot del error (si aplica)
- ✓ Navegador y versión que usas
- ✓ Qué intentaste para solucionarlo

---

**Última actualización:** 2025-01-15
**Versión del manual:** 1.0
**Sistema:** FastChicken POS v2.0
