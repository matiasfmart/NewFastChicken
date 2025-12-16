# Manual de Usuario - Cajero

**FastChicken POS - Sistema de Punto de Venta**

---

## 📋 Tabla de Contenidos

1. [Inicio de Sesión y Jornada](#1-inicio-de-sesión-y-jornada)
2. [Tomar un Pedido](#2-tomar-un-pedido)
3. [Personalizar Combos](#3-personalizar-combos)
4. [Gestionar el Carrito](#4-gestionar-el-carrito)
5. [Finalizar y Confirmar Pedido](#5-finalizar-y-confirmar-pedido)
6. [Cancelar un Pedido](#6-cancelar-un-pedido)
7. [Cerrar Jornada](#7-cerrar-jornada)
8. [Preguntas Frecuentes](#8-preguntas-frecuentes)

---

## 1. Inicio de Sesión y Jornada

### 1.1 Iniciar Jornada

Cuando abres el sistema por primera vez en el día, necesitas iniciar tu jornada de trabajo.

**Pasos:**

1. **Selecciona tu nombre** de la lista de cajeros disponibles
   - Los cajeros aparecen en botones grandes con tu nombre
   - Solo verás cajeros activos en el sistema

2. **Ingresa el fondo inicial de caja**
   - Cuenta el efectivo con el que inicias
   - Ingresa la cantidad exacta en pesos (ARS)
   - Ejemplo: Si tienes $10,000 en caja, ingresa `10000`

3. **Haz click en "Iniciar Jornada"**
   - El sistema registra tu hora de inicio
   - Se habilita la interfaz de caja

**⚠️ Importante:**
- Solo puedes tener UNA jornada abierta a la vez
- Si alguien más tiene una jornada abierta, no podrás iniciar hasta que cierre
- Guarda el valor del fondo inicial, lo necesitarás al cerrar

---

### 1.2 Información Durante la Jornada

Una vez iniciada la jornada, verás en la parte superior:

- **Tu nombre** como cajero activo
- **Tiempo transcurrido** desde que iniciaste (se actualiza automáticamente)
- **Total recaudado** hasta el momento
- Botones:
  - 🔍 **Cancelar Pedido** - Para buscar y anular órdenes
  - 🔚 **Terminar Jornada** - Para cerrar tu turno

---

## 2. Tomar un Pedido

### 2.1 Explorar el Menú

El catálogo de productos está organizado en **4 pestañas**:

1. **🍗 Combos** - Combos completos (pollo/hamburguesa + guarnición + bebida)
2. **🍔 Pollo y Hamburguesas** - Productos principales individuales
3. **🍟 Guarniciones** - Papas fritas, ensaladas, etc.
4. **🥤 Bebidas** - Gaseosas, jugos, agua

**Navegación:**
- Haz click en las pestañas para cambiar de categoría
- Desplázate hacia abajo para ver todos los productos
- Cada tarjeta muestra:
  - Nombre del producto/combo
  - Descripción breve
  - Precio
  - Badge de descuento (si hay promoción activa)

---

### 2.2 Agregar un Producto al Carrito

**Para Combos:**

1. **Click en la tarjeta del combo**
   - Se abre el diálogo de personalización

2. **Revisa los productos incluidos**
   - Verás productos con ✓ verde = "Incluido en el combo"
   - Estos ya vienen en el combo automáticamente

3. **Selecciona las opciones del cliente** (si aplica)
   - **Producto Principal**: Elige entre las opciones (pollo frito, hamburguesa, etc.)
   - **Bebida**: Elige una bebida de las disponibles
   - **Guarnición**: Elige la guarnición (papas, ensalada, etc.)
   - Solo puedes elegir UNA opción por categoría

4. **Configura opciones adicionales:**
   - ☑️ **¿Con picante?** - Activa si el cliente quiere picante
   - ☑️ **¿Con hielo?** - Activa si la bebida lleva hielo

5. **Haz click en "Agregar al Pedido"**

**Para Productos Individuales:**

1. **Click en el producto**
2. **Configura opciones:**
   - Si es bebida: ¿Con hielo?
   - Si es comida: ¿Con picante?
3. **Haz click en "Agregar al Pedido"**

**✓ Stock Automático:**
- El sistema verifica automáticamente si hay suficiente stock
- Si un producto está agotado, verás un mensaje de advertencia
- Los productos sin stock aparecen deshabilitados

---

### 2.3 Descuentos Automáticos

El sistema aplica descuentos automáticamente según:
- **Día de la semana** - Ej: "Martes de descuento 20%"
- **Fecha específica** - Ej: "25 de diciembre 15% OFF"
- **Horario** - Ej: "Happy hour 18:00-22:00"

**Cómo lo identificas:**
- Badge 🏷️ en la tarjeta del producto: `"XX% OFF"`
- Precio original tachado
- Precio final con descuento en verde

**No necesitas hacer nada**, el descuento se aplica solo.

---

## 3. Personalizar Combos

### 3.1 Entender la Pantalla de Personalización

Cuando seleccionas un combo, verás:

**Sección 1: Incluido en el combo**
```
✓ Hamburguesa Clásica
✓ Papas Medianas
```
Estos productos YA están en el combo, no necesitas seleccionarlos.

**Sección 2: Opciones a elegir**
```
🍗 Producto Principal (Elige una opción)
○ Pollo Frito
○ Hamburguesa de Pollo
○ Hamburguesa de Carne

🥤 Bebida (Elige una opción)
○ Coca-Cola
○ Sprite
○ Fanta
```

**IMPORTANTE:** Debes elegir UNA opción de cada categoría marcada como "Elige una opción".

---

### 3.2 Validaciones Importantes

**❌ No podrás agregar el combo si:**
- Falta elegir una opción obligatoria
- Algún producto del combo no tiene stock suficiente

**Mensajes de Error Comunes:**

| Error | Causa | Solución |
|-------|-------|----------|
| "Debe seleccionar un producto principal" | No elegiste el producto | Selecciona una opción en Producto Principal |
| "Stock insuficiente para Papas Fritas" | No hay suficiente stock | Elige otro producto o avisa al encargado |
| "Debe completar todas las selecciones" | Faltan opciones por elegir | Revisa que todas las categorías tengan una selección |

---

### 3.3 Ejemplo Completo

**Escenario:** Cliente pide "Combo Familiar"

1. Click en "Combo Familiar"
2. Pantalla muestra:
   - ✓ Incluido: Papas Grandes
   - Elegir Producto: Pollo Frito / Hamburguesa / Milanesa
   - Elegir Bebida: Coca / Sprite / Fanta

3. Cliente dice: "Pollo frito, con Coca-Cola, con picante y sin hielo"

4. Tú seleccionas:
   - ⦿ Pollo Frito
   - ⦿ Coca-Cola
   - ☑ Con picante (activado)
   - ☐ Con hielo (desactivado)

5. Click "Agregar al Pedido"

6. ✓ El combo aparece en el panel derecho con todos los detalles

---

## 4. Gestionar el Carrito

### 4.1 Panel de Pedido (Lado Derecho)

El panel lateral muestra toda la información del pedido actual:

**Encabezado:**
```
Pedido #001
```
El número se genera automáticamente y se incrementa con cada pedido.

**Lista de Items:**

Cada item muestra:
- Cantidad (ej: `2x`)
- Nombre del combo/producto
- Detalles de personalización:
  - Productos elegidos
  - 🌶️ CON PICANTE (si aplica)
  - 🧊 Con hielo (si aplica)
- Precio unitario
- Precio final (con descuento si aplica)
- Badge de descuento (ej: `20% OFF`)

---

### 4.2 Modificar Cantidades

**Aumentar cantidad:**
- Click en el botón **`+`** a la derecha del item
- Verifica stock automáticamente
- Si no hay stock, muestra mensaje y no aumenta

**Disminuir cantidad:**
- Click en el botón **`-`** a la izquierda del item
- Si la cantidad llega a 0, el item se elimina del pedido

**Ejemplo:**
```
2x Combo Pollo Grande   [-] 2 [+]   $2,200
```

---

### 4.3 Eliminar un Item

**Opción 1:** Reducir cantidad a cero con el botón `-`

**Opción 2:** Click en el ícono de 🗑️ papelera
- Elimina el item completo sin importar la cantidad

---

### 4.4 Tipo de Entrega

Antes de finalizar, **SIEMPRE** selecciona el tipo de entrega:

| Opción | Cuándo usar |
|--------|-------------|
| 🏠 **Para comer acá** | Cliente come en el local |
| 📦 **Para llevar** | Cliente se lleva el pedido |
| 🚴 **Delivery** | Se enviará a domicilio |

**El botón seleccionado se marca en color amarillo.**

---

### 4.5 Resumen del Pedido

En la parte inferior del panel verás:

```
Subtotal    $ 2,400    (si hay descuentos)
Descuentos  -$ 240     (si hay descuentos)
─────────────────────
TOTAL       $ 2,160
```

---

### 4.6 Limpiar el Pedido

Si necesitas empezar de cero:

1. Click en botón **"Limpiar"** (parte inferior del panel)
2. Confirma la acción
3. Se vacía todo el carrito

**⚠️ Cuidado:** Esta acción no se puede deshacer.

---

## 5. Finalizar y Confirmar Pedido

### 5.1 Terminar Pedido

Cuando el pedido esté completo:

1. **Verifica** que todos los items sean correctos
2. **Verifica** el tipo de entrega
3. **Haz click en "Terminar Pedido"** (botón amarillo grande)

El sistema:
- ✓ Valida que haya stock suficiente
- ✓ Descuenta el stock automáticamente
- ✓ Registra el pedido en la jornada
- ✓ Actualiza el total recaudado
- ✓ Muestra el diálogo de confirmación

---

### 5.2 Pantalla de Confirmación

Se abre una ventana con **2 pestañas**:

**Pestaña 1: Ticket Cliente**
- Muestra el ticket CON precios
- Incluye:
  - Logo de FastChicken
  - Número de orden
  - Detalle de items con precios
  - Subtotal, descuentos, total
  - Tipo de entrega
  - Fecha y hora

**Pestaña 2: Ticket Cocina**
- Muestra el ticket SIN precios (solo para cocina)
- Incluye:
  - Número de orden (grande)
  - Detalle de items y cantidades
  - Personalizaciones (picante, hielo)
  - Tipo de entrega
  - Hora

---

### 5.3 Imprimir Tickets

**Opción 1: Imprimir ticket actual**
- Click en "Imprimir" (botón en la pestaña activa)
- Imprime solo el ticket que estás viendo

**Opción 2: Imprimir ambos**
- Click en "Ambos" (botón azul)
- Imprime primero el ticket de cliente
- Pausa 2 segundos
- Imprime el ticket de cocina

**💡 Recomendado:** Usa "Ambos" para imprimir los dos tickets de una vez.

---

### 5.4 Nuevo Pedido

Después de imprimir:

1. **Click en "Nuevo Pedido"**
2. El diálogo se cierra
3. El carrito se limpia automáticamente
4. Listo para tomar el siguiente pedido

---

## 6. Cancelar un Pedido

### 6.1 Cuándo Cancelar

Cancela un pedido si:
- El cliente cambió de opinión
- Hubo un error al tomar el pedido
- El pedido no se puede completar

**⚠️ Importante:** Solo puedes cancelar pedidos de la jornada actual.

---

### 6.2 Buscar y Cancelar

**Paso 1: Abrir búsqueda**
- Click en botón **"Cancelar Pedido"** (parte superior)

**Paso 2: Encontrar el pedido**
- Verás una lista de todos los pedidos de hoy
- Están ordenados del más reciente al más antiguo
- Usa el scroll para navegar

**Información de cada pedido:**
- ID del pedido (últimos 8 caracteres)
- Estado: `Completado` o `Cancelado`
- Hora del pedido
- Cantidad de items
- Items principales (máximo 3, si hay más dice "+N más")
- Total del pedido

**Paso 3: Cancelar**
1. Busca el pedido que necesitas cancelar
2. Click en botón **"Cancelar"** (solo aparece en pedidos completados)
3. Se abre confirmación

**Paso 4: Confirmar cancelación**
1. (Opcional) Ingresa la razón de cancelación
   - Ejemplo: "Cliente canceló", "Error en pedido"
   - Máximo 500 caracteres
2. Click en **"Confirmar Cancelación"**

**Resultado:**
- ✓ El pedido se marca como cancelado
- ✓ El total recaudado se actualiza (resta el monto)
- ✓ El stock se devuelve automáticamente
- ✓ Aparece badge `Cancelado` en rojo

---

### 6.3 Pedidos Cancelados

Los pedidos cancelados:
- Aparecen en la lista con fondo rojo claro
- Muestran badge "Cancelado"
- Muestran la razón de cancelación (si se ingresó)
- **NO** se pueden volver a cancelar
- **NO** cuentan en el total de ventas

---

## 7. Cerrar Jornada

### 7.1 Cuándo Cerrar

Cierra tu jornada cuando:
- Termina tu turno de trabajo
- Vas a entregar la caja al siguiente cajero
- Es el cierre del día

**⚠️ Importante:** NO cierres la jornada si hay pedidos pendientes de entregar.

---

### 7.2 Proceso de Cierre

**Paso 1: Contar el efectivo**
- Cuenta TODO el dinero físico de la caja
- Incluye billetes y monedas
- Anota la cantidad exacta

**Paso 2: Iniciar cierre**
1. Click en botón **"Terminar Jornada"** (parte superior)
2. Se abre el diálogo de cierre de jornada

**Paso 3: Revisar resumen**

El diálogo muestra:

```
👤 Cajero: Juan Pérez
🕐 Inicio: Hoy a las 08:00

📊 Resumen de Ventas
   Total de órdenes: 25
   Total recaudado: $ 45,000

💰 Arqueo de Caja
   Fondo inicial:        $ 10,000
   Efectivo esperado:    $ 55,000

   Efectivo real: [______] ← INGRESA EL MONTO CONTADO
```

**Paso 4: Ingresar efectivo real**
1. En el campo "Efectivo real contado"
2. Ingresa la cantidad exacta que contaste
3. El sistema calcula automáticamente la diferencia

**Diferencia:**
```
🟢 Diferencia: $ 0      (Todo cuadra, perfecto)
🔵 Diferencia: + $ 100  (Sobra dinero, hay más de lo esperado)
🔴 Diferencia: - $ 100  (Falta dinero, hay menos de lo esperado)
```

**Paso 5: Confirmar cierre**
1. Verifica que todos los datos sean correctos
2. Click en **"Cerrar Jornada"**
3. Se registra el cierre
4. Vuelves a la pantalla de inicio

---

### 7.3 Después del Cierre

Una vez cerrada la jornada:
- ✓ Se registra la hora de cierre
- ✓ Se guarda la diferencia de caja
- ✓ El administrador puede ver el reporte completo
- ✓ Para trabajar de nuevo, debes iniciar una nueva jornada

**⚠️ Una jornada cerrada NO se puede reabrir.**

---

## 8. Preguntas Frecuentes

### ❓ ¿Qué hago si me equivoco al tomar un pedido?

**Si aún no finalizaste:**
- Elimina el item incorrecto del carrito (🗑️)
- Agrega el item correcto

**Si ya finalizaste:**
- Cancela el pedido (ver sección 6)
- Crea un nuevo pedido correcto

---

### ❓ ¿Cómo sé si un producto tiene stock?

El sistema te avisa automáticamente:
- ✓ Productos sin stock aparecen deshabilitados (gris)
- ✓ Al intentar agregar, verás: "Stock insuficiente"
- ✓ El botón "+" no aumenta si no hay stock

**Si no hay stock:**
1. Ofrece un producto alternativo al cliente
2. Avisa al encargado para reponer stock

---

### ❓ ¿Puedo editar un pedido después de finalizarlo?

**No**, una vez finalizado el pedido NO se puede editar.

**Opciones:**
1. **Cancelar** el pedido incorrecto
2. **Crear** un nuevo pedido correcto

---

### ❓ ¿Cómo funciona el descuento 2x1?

El sistema lo aplica automáticamente:
- Compras 2 del mismo combo
- El segundo tiene descuento
- Lo verás en el carrito con badge de descuento

**Ejemplo:**
```
2x Combo Pollo    $1,200
               ├─ 1° unidad: $ 1,200
               └─ 2° unidad: $ 840 (30% OFF)
```

---

### ❓ ¿Qué hago si el sistema se traba o cierra?

1. **Recarga la página** (F5 o Ctrl+R)
2. Vuelve a iniciar sesión
3. Tu jornada sigue abierta (no se pierde)
4. Los pedidos completados están guardados

**Si el problema persiste:**
- Avisa al administrador o soporte técnico

---

### ❓ ¿Puedo tener dos jornadas abiertas al mismo tiempo?

**No**, el sistema solo permite UNA jornada abierta a la vez.

Si intentas abrir y alguien más tiene una jornada activa:
- Verás mensaje de error
- Espera a que cierre su jornada
- O consulta con el administrador

---

### ❓ ¿Dónde veo el detalle de mis ventas?

Durante la jornada:
- **Header superior** muestra el total recaudado en tiempo real

Al cerrar:
- **Diálogo de cierre** muestra resumen completo

Reportes detallados:
- Solo el administrador puede verlos en el panel de admin

---

### ❓ ¿Qué significa cada tipo de entrega?

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| 🏠 **Para comer acá** | Cliente consume en el local | Mesa 5, para comer aquí |
| 📦 **Para llevar** | Cliente retira y se va | Pedido para llevar en bolsa |
| 🚴 **Delivery** | Se envía a domicilio | Envío a calle Falsa 123 |

---

### ❓ ¿Puedo cancelar un pedido de ayer?

**No**, solo puedes cancelar pedidos de la jornada actual (hoy).

Para cancelaciones de días anteriores:
- Consulta con el administrador
- El admin tiene acceso a todos los pedidos históricos

---

### ❓ ¿Cómo sé si un combo tiene descuento activo?

Verás en la tarjeta:
- 🏷️ Badge `"XX% OFF"` en la esquina
- Precio original tachado
- Precio final con descuento

**El descuento se aplica automáticamente** al agregar al carrito.

---

### ❓ ¿Qué hago si hay diferencia de caja al cerrar?

**Diferencia positiva (sobra dinero):**
- Verifica que contaste bien
- Si confirmas que está bien, cierra normalmente
- El admin revisará después

**Diferencia negativa (falta dinero):**
- Re-cuenta el efectivo
- Revisa si hay billetes pegados
- Verifica pedidos cancelados
- Si la diferencia persiste, repórtalo al cerrar

**El sistema registra la diferencia** para que el admin la revise.

---

### ❓ ¿Puedo ver pedidos de otros cajeros?

Durante tu jornada solo ves tus propios pedidos.

**El administrador** puede ver:
- Pedidos de todos los cajeros
- Historial completo
- Reportes por cajero

---

## 📞 Soporte

Si tienes problemas que no están en este manual:

1. **Consulta con el encargado de turno**
2. **Reporta al administrador del sistema**
3. **Anota el error exacto** que ves en pantalla

---

**Última actualización:** 2025-01-15
**Versión del manual:** 1.0
**Sistema:** FastChicken POS v2.0
