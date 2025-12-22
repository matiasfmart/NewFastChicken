# Casos de Uso de Negocio

**FastChicken POS - Documentación de Reglas de Negocio y Casos de Uso**

---

## 📋 Tabla de Contenidos

1. [Gestión de Jornadas](#1-gestión-de-jornadas)
2. [Toma y Procesamiento de Pedidos](#2-toma-y-procesamiento-de-pedidos)
3. [Gestión de Stock e Inventario](#3-gestión-de-stock-e-inventario)
4. [Sistema de Descuentos](#4-sistema-de-descuentos)
5. [Cancelación de Pedidos](#5-cancelación-de-pedidos)
6. [Personalización de Combos](#6-personalización-de-combos)
7. [Arqueo de Caja](#7-arqueo-de-caja)
8. [Reportes y Analytics](#8-reportes-y-analytics)

---

## 1. Gestión de Jornadas

### CU-001: Iniciar Jornada de Trabajo

**Actor Principal:** Cajero

**Precondiciones:**
- El cajero debe estar registrado en el sistema
- El cajero debe estar activo
- NO debe haber otra jornada abierta

**Flujo Principal:**

1. El cajero abre el sistema
2. El sistema muestra el diálogo "Iniciar Jornada"
3. El sistema carga la lista de cajeros activos
4. El cajero selecciona su nombre de la lista
5. El cajero ingresa el fondo inicial de caja (efectivo)
6. El cajero hace click en "Iniciar Jornada"
7. El sistema valida que no haya otra jornada abierta
8. El sistema crea una nueva jornada con:
   - `employeeId`: ID del cajero
   - `employeeName`: Nombre del cajero
   - `startedAt`: Fecha y hora actual
   - `status`: "open"
   - `initialCash`: Monto ingresado
   - `totalOrders`: 0
   - `totalRevenue`: 0
9. El sistema habilita la interfaz de caja
10. El sistema muestra el header con información de jornada

**Flujo Alternativo 1: Ya hay jornada abierta**

7a. El sistema detecta que ya existe una jornada abierta
7b. El sistema muestra error: "Ya hay una jornada abierta. Solo puede haber una jornada activa a la vez."
7c. El cajero debe esperar a que se cierre la jornada actual

**Flujo Alternativo 2: Fondo inicial inválido**

6a. El cajero ingresa un valor negativo o no numérico
6b. El sistema muestra error de validación
6c. El cajero corrige el valor

**Postcondiciones:**
- Se crea un registro de jornada en estado "open"
- El cajero puede empezar a tomar pedidos
- El contador de órdenes inicia en 0
- El timer de jornada comienza a contar

**Reglas de Negocio:**
- **RN-001:** Solo puede haber UNA jornada abierta a la vez en todo el sistema
- **RN-002:** El fondo inicial debe ser mayor o igual a 0
- **RN-003:** El cajero debe estar activo para poder iniciar jornada
- **RN-004:** La hora de inicio se registra automáticamente al momento de crear la jornada

---

### CU-002: Cerrar Jornada de Trabajo

**Actor Principal:** Cajero

**Precondiciones:**
- Debe haber una jornada abierta del cajero actual
- NO deben haber pedidos en proceso (carrito vacío)

**Flujo Principal:**

1. El cajero termina su turno y decide cerrar jornada
2. El cajero hace click en "Terminar Jornada"
3. El sistema muestra el diálogo de cierre con resumen:
   - Nombre del cajero
   - Hora de inicio
   - Total de órdenes completadas
   - Total recaudado
   - Fondo inicial
   - Efectivo esperado (fondo inicial + total recaudado)
4. El cajero cuenta el efectivo físico de la caja
5. El cajero ingresa el monto real contado
6. El sistema calcula la diferencia:
   ```
   diferencia = efectivo_real - efectivo_esperado
   ```
7. El sistema muestra la diferencia con código de color:
   - Verde: diferencia = 0 (cuadra perfecto)
   - Azul: diferencia > 0 (sobra dinero)
   - Rojo: diferencia < 0 (falta dinero)
8. El cajero verifica la información
9. El cajero hace click en "Cerrar Jornada"
10. El sistema actualiza la jornada:
    - `endedAt`: Fecha y hora actual
    - `status`: "closed"
    - `actualCash`: Monto ingresado
    - `cashDifference`: Diferencia calculada
11. El sistema cierra la sesión de caja
12. El sistema redirige a la pantalla de inicio de jornada

**Flujo Alternativo 1: Hay pedidos en proceso**

2a. El sistema detecta que hay items en el carrito
2b. El sistema muestra advertencia: "Tienes un pedido en proceso. Finalízalo o cancélalo antes de cerrar la jornada."
2c. El cajero debe finalizar o limpiar el carrito
2d. Vuelve al paso 2

**Flujo Alternativo 2: Diferencia significativa de caja**

7a. La diferencia es mayor a $500 (en valor absoluto)
7b. El sistema muestra advertencia: "Hay una diferencia significativa. Por favor, vuelve a contar el efectivo."
7c. El cajero puede:
   - Opción A: Volver a contar y actualizar el monto
   - Opción B: Confirmar que contó correctamente y proceder

**Postcondiciones:**
- La jornada queda en estado "closed"
- Se registra la diferencia de caja (si la hay)
- El sistema queda listo para que otro cajero inicie nueva jornada
- El administrador puede ver el reporte completo de la jornada

**Reglas de Negocio:**
- **RN-005:** Una jornada cerrada NO puede reabrirse
- **RN-006:** El efectivo esperado se calcula como: fondo inicial + total recaudado - total de pedidos cancelados
- **RN-007:** La diferencia de caja puede ser positiva (sobra), negativa (falta) o cero (cuadra)
- **RN-008:** El total recaudado NO incluye pedidos cancelados
- **RN-009:** El cierre de jornada registra automáticamente la hora exacta

---

## 2. Toma y Procesamiento de Pedidos

### CU-003: Crear Pedido Completo

**Actor Principal:** Cajero

**Precondiciones:**
- Debe haber una jornada abierta
- Debe haber productos/combos disponibles en el sistema

**Flujo Principal:**

1. El cliente llega y solicita productos
2. El cajero navega por las pestañas del menú:
   - Combos
   - Pollo y Hamburguesas
   - Guarniciones
   - Bebidas
3. El cajero hace click en un producto/combo
4. El sistema abre el diálogo de personalización (ver CU-006)
5. El cajero personaliza según preferencias del cliente
6. El cajero hace click en "Agregar al Pedido"
7. El sistema valida stock disponible
8. El sistema crea un `OrderItem` con:
   - ID único
   - Referencia al combo o producto
   - Cantidad: 1
   - Precio unitario original
   - Precio final (con descuento aplicado si corresponde)
   - Descuento aplicado (si existe)
   - Personalizaciones (productos elegidos, opciones)
9. El sistema agrega el item al carrito
10. El sistema actualiza el stock temporalmente (reserva)
11. El sistema muestra el item en el panel de pedido
12. El cajero repite pasos 3-11 para cada item que el cliente desea
13. El cajero selecciona el tipo de entrega:
    - Para comer acá (local)
    - Para llevar (takeaway)
    - Delivery
14. El cajero revisa el resumen del pedido
15. El cajero hace click en "Terminar Pedido"
16. El sistema ejecuta CU-004: Finalizar Pedido

**Flujo Alternativo 1: Stock insuficiente**

7a. El sistema detecta que no hay suficiente stock
7b. El sistema muestra error: "Stock insuficiente para [Producto]. Disponible: X unidades"
7c. El cajero informa al cliente
7d. El cliente puede:
   - Opción A: Elegir un producto alternativo (vuelve al paso 3)
   - Opción B: Reducir la cantidad
   - Opción C: Cancelar ese item

**Flujo Alternativo 2: Cliente cambia de opinión**

Xa. En cualquier momento antes de finalizar
Xb. El cajero elimina items del carrito con el botón 🗑️
Xc. El sistema libera el stock reservado
Xd. Continúa normalmente

**Flujo Alternativo 3: Cliente cancela todo**

Xa. El cliente decide no comprar nada
Xb. El cajero hace click en "Limpiar"
Xc. El sistema vacía el carrito
Xd. El sistema libera todo el stock reservado
Xe. Vuelve al estado inicial

**Postcondiciones:**
- El pedido queda agregado al carrito
- El stock se reserva temporalmente
- El resumen muestra totales actualizados
- El cajero puede finalizar el pedido

**Reglas de Negocio:**
- **RN-010:** El stock se reserva temporalmente al agregar al carrito
- **RN-011:** El stock se libera si el item se elimina o si se limpia el carrito
- **RN-012:** El tipo de entrega es obligatorio antes de finalizar
- **RN-013:** Un pedido debe tener al menos 1 item para poder finalizarse
- **RN-014:** Los descuentos se aplican automáticamente según reglas vigentes
- **RN-015:** El número de pedido se genera automáticamente basado en totalOrders de la jornada

---

### CU-004: Finalizar Pedido

**Actor Principal:** Cajero

**Precondiciones:**
- Hay items en el carrito
- Se seleccionó tipo de entrega
- Hay stock suficiente para todos los items

**Flujo Principal:**

1. El cajero hace click en "Terminar Pedido"
2. El sistema valida stock disponible para todos los items
3. El sistema calcula:
   ```
   subtotal = Σ (item.unitPrice × item.quantity)
   total_con_descuentos_items = Σ (item.finalUnitPrice × item.quantity)
   descuento_items = subtotal - total_con_descuentos_items
   ```
4. El sistema verifica si hay descuento sobre total de compra activo
5. Si existe, aplica el descuento al total:
   ```
   total_final = total_con_descuentos_items × (1 - porcentaje_descuento_orden / 100)
   descuento_total = descuento_items + (total_con_descuentos_items - total_final)
   ```
6. El sistema crea la orden con:
   - `id`: UUID único
   - `shiftId`: ID de la jornada actual
   - `items`: Array de OrderItems
   - `deliveryType`: Tipo seleccionado
   - `subtotal`: Subtotal calculado
   - `discount`: Descuento total aplicado
   - `total`: Total final
   - `status`: "completed"
   - `createdAt`: Fecha y hora actual
7. El sistema ejecuta transacción atómica:
   - Crea la orden en la base de datos
   - Descuenta el stock de cada producto utilizado
   - Actualiza la jornada:
     ```
     totalOrders = totalOrders + 1
     totalRevenue = totalRevenue + total_final
     ```
8. El sistema abre el CheckoutDialog con el ticket
9. El cajero puede imprimir tickets (ver CU-005)
10. El cajero hace click en "Nuevo Pedido"
11. El sistema limpia el carrito
12. El sistema está listo para el siguiente pedido

**Flujo Alternativo 1: Stock insuficiente al finalizar**

2a. Otro cajero vendió el producto mientras estaba en el carrito
2b. El sistema detecta que ya no hay stock suficiente
2c. El sistema muestra error: "Stock insuficiente para: [lista de productos]"
2d. El cajero debe:
   - Opción A: Eliminar items sin stock y finalizar el resto
   - Opción B: Cancelar el pedido completo
   - Opción C: Reducir cantidades

**Flujo Alternativo 2: Error de transacción**

7a. Ocurre un error al guardar en la base de datos
7b. El sistema ejecuta rollback completo
7c. No se descuenta stock
7d. No se actualiza la jornada
7e. El sistema muestra error: "Error al procesar el pedido. Intenta nuevamente."
7f. El cajero puede reintentar

**Postcondiciones:**
- La orden se guarda en la base de datos
- El stock se descuenta definitivamente
- La jornada se actualiza con el nuevo pedido
- El total recaudado se incrementa
- El número de orden se incrementa
- El carrito queda vacío

**Reglas de Negocio:**
- **RN-016:** La creación de orden y descuento de stock deben ser ATÓMICOS (transacción)
- **RN-017:** Si falla cualquier parte de la transacción, se hace rollback completo
- **RN-018:** El número de orden se basa en `jornada.totalOrders + 1`
- **RN-019:** El total recaudado SOLO incluye pedidos completados (no cancelados)
- **RN-020:** La orden se crea inmediatamente al finalizar (no hay estado "pendiente")
- **RN-021:** Los descuentos sobre el total se aplican DESPUÉS de descuentos por item

---

### CU-005: Imprimir Tickets

**Actor Principal:** Cajero

**Precondiciones:**
- Se finalizó un pedido
- El CheckoutDialog está abierto
- Hay impresora configurada (depende del navegador)

**Flujo Principal:**

1. El sistema muestra CheckoutDialog con 2 tabs:
   - Ticket Cliente (con precios)
   - Ticket Cocina (sin precios)
2. El cajero selecciona la pestaña "Ticket Cliente"
3. El cajero hace click en "Imprimir"
4. El sistema abre el diálogo de impresión del navegador
5. El sistema formatea el ticket con:
   - Logo de FastChicken
   - Número de orden (formato: #001)
   - Lista de items con cantidades
   - Personalizaciones de cada item
   - Subtotal (si hay descuentos)
   - Descuentos aplicados
   - Total final
   - Tipo de entrega
   - Fecha y hora
6. El cajero confirma la impresión
7. El ticket se imprime
8. (Opcional) El cajero repite pasos 2-7 con "Ticket Cocina"

**Flujo Alternativo 1: Imprimir ambos tickets**

2a. El cajero hace click en "Ambos"
2b. El sistema imprime "Ticket Cliente"
2c. El sistema espera 2 segundos
2d. El sistema imprime "Ticket Cocina"
2e. Ambos tickets se generan automáticamente

**Flujo Alternativo 2: Error de impresora**

6a. La impresora no está conectada o sin papel
6b. El sistema del navegador muestra error
6c. El cajero revisa la impresora
6d. El cajero puede reintentar desde CheckoutDialog

**Postcondiciones:**
- Se imprime el ticket seleccionado
- El cliente recibe su comprobante
- La cocina recibe la orden de preparación
- El cajero puede cerrar el diálogo y continuar

**Reglas de Negocio:**
- **RN-022:** El ticket de cliente DEBE mostrar precios y total
- **RN-023:** El ticket de cocina NO debe mostrar precios (solo preparación)
- **RN-024:** Ambos tickets deben mostrar personalizaciones claramente
- **RN-025:** El número de orden debe ser único y secuencial por jornada
- **RN-026:** El ticket debe indicar si lleva picante o hielo para facilitar preparación

---

## 3. Gestión de Stock e Inventario

### CU-007: Actualizar Stock de Productos

**Actor Principal:** Administrador

**Precondiciones:**
- El administrador tiene acceso al panel de admin
- El producto existe en el inventario

**Flujo Principal:**

1. El administrador navega a Inventario
2. El administrador selecciona la pestaña correspondiente (Producto/Bebida/Guarnición)
3. El administrador encuentra el producto a actualizar
4. El administrador hace click en el menú ⋮ del producto
5. El administrador selecciona "Editar"
6. El sistema muestra el formulario pre-llenado
7. El administrador actualiza el campo "Stock" con el nuevo valor
8. El administrador hace click en "Guardar"
9. El sistema valida que el stock sea >= 0
10. El sistema actualiza el registro del producto
11. El sistema muestra confirmación: "Producto actualizado exitosamente"
12. El stock actualizado se refleja inmediatamente en la caja

**Flujo Alternativo 1: Stock negativo**

9a. El administrador ingresa un valor negativo
9b. El sistema muestra error: "El stock no puede ser negativo"
9c. El administrador corrige el valor
9d. Vuelve al paso 8

**Flujo Alternativo 2: Ajuste por inventario físico**

7a. El administrador hace inventario físico
7b. Cuenta: 45 unidades físicas
7c. Sistema muestra: 52 unidades
7d. El administrador actualiza a 45
7e. Anota en bitácora: "Ajuste por inventario físico - Fecha: X"
7f. Continúa normalmente

**Postcondiciones:**
- El stock se actualiza en la base de datos
- Los cajeros ven el nuevo stock disponible inmediatamente
- Las alertas de stock bajo se recalculan

**Reglas de Negocio:**
- **RN-027:** El stock SIEMPRE debe ser >= 0
- **RN-028:** El stock se actualiza en tiempo real (sin caché)
- **RN-029:** Si stock < 10, se considera "stock bajo" y se alerta
- **RN-030:** El stock se comparte entre todos los cajeros (no hay stock por jornada)
- **RN-031:** Cambios de stock NO afectan pedidos ya completados

---

### CU-008: Crear Nuevo Producto en Inventario

**Actor Principal:** Administrador

**Precondiciones:**
- El administrador tiene acceso al panel de admin

**Flujo Principal:**

1. El administrador navega a Inventario
2. El administrador selecciona la pestaña donde crear el producto
3. El administrador hace click en "Añadir [Producto/Bebida/Guarnición]"
4. El sistema muestra formulario vacío
5. El administrador completa:
   - Nombre del producto
   - Precio unitario
   - Stock inicial
6. El administrador hace click en "Guardar"
7. El sistema valida:
   - Nombre no vacío
   - Precio > 0
   - Stock >= 0
8. El sistema crea el producto con:
   - `id`: UUID único
   - `name`: Nombre ingresado
   - `price`: Precio ingresado
   - `stock`: Stock ingresado
   - `type`: "product" | "drink" | "side" (según pestaña)
9. El sistema guarda en la base de datos
10. El producto aparece en la tabla de inventario
11. El producto está disponible inmediatamente para:
    - Agregar a combos
    - Vender como producto individual

**Flujo Alternativo 1: Nombre duplicado**

7a. Ya existe un producto con el mismo nombre
7b. El sistema muestra advertencia: "Ya existe un producto con ese nombre"
7c. El administrador puede:
   - Opción A: Cambiar el nombre (ej: agregar "Mediano", "Grande")
   - Opción B: Cancelar y usar el producto existente

**Postcondiciones:**
- El producto se crea en la base de datos
- El producto está disponible para venta
- El producto puede agregarse a combos

**Reglas de Negocio:**
- **RN-032:** El nombre del producto debe ser único por tipo
- **RN-033:** El precio inicial debe ser > 0
- **RN-034:** El stock inicial puede ser 0 (producto sin stock)
- **RN-035:** El tipo de producto se determina por la pestaña donde se crea

---

## 4. Sistema de Descuentos

### CU-009: Crear Descuento Simple

**Actor Principal:** Administrador

**Precondiciones:**
- El administrador tiene acceso al panel de admin
- Existen combos en el sistema (si el descuento es sobre combos)

**Flujo Principal:**

1. El administrador navega a Descuentos
2. El administrador hace click en "Nuevo Descuento"
3. El sistema muestra formulario de descuento
4. El administrador selecciona tipo: "Simple"
5. El administrador configura:
   - Porcentaje de descuento (1-100)
   - Aplica a:
     - Opción A: "Total de la compra"
     - Opción B: "Combos específicos" (selecciona combos de lista)
6. El administrador configura condiciones temporales:
   - Tipo temporal:
     - Opción A: "Día de la semana" (selecciona día 0-6)
     - Opción B: "Fecha específica" (selecciona fecha)
   - (Opcional) Rango horario:
     - Hora inicio (HH:MM)
     - Hora fin (HH:MM)
7. El administrador hace click en "Crear Descuento"
8. El sistema valida:
   - Porcentaje entre 1 y 100
   - Al menos una condición temporal definida
   - Si es "combos específicos", al menos 1 combo seleccionado
9. El sistema crea el DiscountRule con:
   - `id`: UUID único
   - `type`: "simple"
   - `percentage`: Porcentaje ingresado
   - `appliesTo`: "order" | "combos"
   - `comboIds`: Array de IDs (si es combos específicos)
   - `temporalType`: "weekday" | "date"
   - `value`: Día (0-6) o fecha (YYYY-MM-DD)
   - `timeRange`: { start, end } (si se especificó)
10. El sistema guarda en la base de datos
11. El descuento se activa inmediatamente
12. Los cajeros ven el descuento aplicado según condiciones

**Flujo Alternativo 1: Porcentaje inválido**

8a. El administrador ingresa porcentaje > 100 o <= 0
8b. El sistema muestra error: "El porcentaje debe estar entre 1 y 100"
8c. El administrador corrige el valor
8d. Vuelve al paso 7

**Flujo Alternativo 2: Sin condiciones temporales**

8a. El administrador no seleccionó día ni fecha
8b. El sistema muestra error: "Debe seleccionar al menos una condición temporal"
8c. El administrador selecciona día o fecha
8d. Vuelve al paso 7

**Postcondiciones:**
- El descuento se crea en la base de datos
- El descuento se aplica automáticamente cuando se cumplen las condiciones
- Los cajeros ven badges de descuento en productos afectados

**Reglas de Negocio:**
- **RN-036:** Un descuento simple puede aplicar a total O a combos específicos (no ambos)
- **RN-037:** El porcentaje debe estar entre 1% y 100%
- **RN-038:** Un descuento DEBE tener al menos una condición temporal
- **RN-039:** Si se especifica horario, solo aplica en ese rango
- **RN-040:** Si NO se especifica horario, aplica todo el día (00:00-23:59)
- **RN-041:** Los descuentos de "weekday" se repiten cada semana
- **RN-042:** Los descuentos de "date" solo aplican en esa fecha específica

---

### CU-010: Crear Promoción Cruzada (2x1, Mix)

**Actor Principal:** Administrador

**Precondiciones:**
- Existen al menos 2 combos en el sistema

**Flujo Principal:**

1. El administrador navega a Descuentos
2. El administrador hace click en "Nuevo Descuento"
3. El administrador selecciona tipo: "Promoción Cruzada"
4. El administrador configura:
   - Combo Disparador (el que activa la promo)
   - Combo con Descuento (el que recibe el descuento)
   - Porcentaje de descuento
5. El administrador configura condiciones temporales (igual que CU-009)
6. El administrador hace click en "Crear Descuento"
7. El sistema valida configuración
8. El sistema crea el DiscountRule con:
   - `type`: "cross-promotion"
   - `triggerComboId`: ID del combo disparador
   - `targetComboId`: ID del combo objetivo
   - `percentage`: Porcentaje de descuento
   - Condiciones temporales
9. El sistema guarda en la base de datos
10. El descuento se activa inmediatamente

**Caso Especial: 2x1 (Mismo Combo)**

4a. El administrador selecciona el MISMO combo en disparador y objetivo
4b. El administrador configura porcentaje: 100% (gratis) o 50% (mitad de precio)
4c. El sistema lo trata como promoción 2x1
4d. Al comprar 2 del mismo combo:
   - Primera unidad: Precio normal
   - Segunda unidad: Con descuento del porcentaje configurado

**Flujo Alternativo: Promoción Mix**

4a. El administrador selecciona combos DIFERENTES
4b. Ejemplo: Disparador = "Combo Familiar", Objetivo = "Combo Hamburguesa"
4c. Efecto: Al comprar Combo Familiar, obtiene X% en Combo Hamburguesa

**Postcondiciones:**
- La promoción cruzada se crea
- Se aplica automáticamente cuando hay ambos combos en el carrito
- El cajero ve el descuento aplicado en el segundo combo

**Reglas de Negocio:**
- **RN-043:** Una promoción cruzada requiere 2 combos (pueden ser el mismo)
- **RN-044:** Si triggerCombo = targetCombo → Es promoción 2x1
- **RN-045:** Si triggerCombo ≠ targetCombo → Es promoción mix
- **RN-046:** El descuento se aplica SOLO al targetCombo
- **RN-047:** En 2x1, se aplica a la segunda unidad (y siguientes pares)
- **RN-048:** La promoción se aplica automáticamente al agregar items al carrito

---

### CU-011: Aplicar Descuentos Automáticamente

**Actor Principal:** Sistema (automático)

**Trigger:**
- Al agregar combo al carrito
- Al actualizar carrito
- Al finalizar pedido

**Flujo Principal:**

1. El cajero agrega un combo al carrito
2. El sistema obtiene todos los descuentos activos
3. El sistema filtra descuentos aplicables:
   - Descuentos simples sobre combos específicos
   - Descuentos sobre total de compra
   - Promociones cruzadas
4. Para cada descuento, el sistema verifica condiciones temporales:
   ```javascript
   function isActive(discount) {
     if (discount.temporalType === "weekday") {
       const today = new Date().getDay(); // 0 = Domingo, 6 = Sábado
       if (today !== parseInt(discount.value)) return false;
     }

     if (discount.temporalType === "date") {
       const today = formatDate(new Date(), "yyyy-MM-dd");
       if (today !== discount.value) return false;
     }

     if (discount.timeRange) {
       const now = new Date();
       const current = `${now.getHours()}:${now.getMinutes()}`;
       if (current < discount.timeRange.start || current > discount.timeRange.end) {
         return false;
       }
     }

     return true;
   }
   ```
5. El sistema aplica descuentos en orden de prioridad:

   **Prioridad 1: Descuentos simples en combos**
   ```javascript
   if (discount.type === "simple" && discount.appliesTo === "combos") {
     if (discount.comboIds.includes(item.comboId)) {
       item.finalUnitPrice = item.unitPrice * (1 - discount.percentage / 100);
       item.appliedDiscount = { percentage: discount.percentage, rule: discount };
     }
   }
   ```

   **Prioridad 2: Promociones cruzadas**
   ```javascript
   const hasTrigger = orderItems.some(i => i.comboId === discount.triggerComboId);
   const targets = orderItems.filter(i => i.comboId === discount.targetComboId);

   if (hasTrigger && targets.length > 0) {
     // Para 2x1 (trigger = target)
     if (discount.triggerComboId === discount.targetComboId) {
       // Aplicar descuento a posiciones pares (1, 3, 5...)
       targets.forEach((item, index) => {
         if (index % 2 === 1) { // Segunda unidad, cuarta, etc.
           item.finalUnitPrice = item.unitPrice * (1 - discount.percentage / 100);
           item.appliedDiscount = { percentage: discount.percentage, rule: discount };
         }
       });
     } else {
       // Promoción mix: aplicar a TODOS los targets
       targets.forEach(item => {
         item.finalUnitPrice = item.unitPrice * (1 - discount.percentage / 100);
         item.appliedDiscount = { percentage: discount.percentage, rule: discount };
       });
     }
   }
   ```

   **Prioridad 3: Descuento sobre total (al finalizar)**
   ```javascript
   if (discount.type === "simple" && discount.appliesTo === "order") {
     total = total * (1 - discount.percentage / 100);
   }
   ```

6. El sistema actualiza los precios finales de los items
7. El sistema recalcula el total del pedido
8. El sistema muestra badges de descuento en UI

**Postcondiciones:**
- Los descuentos aplicables se reflejan en precios
- El total se calcula correctamente
- El cliente ve claramente los descuentos

**Reglas de Negocio:**
- **RN-049:** Los descuentos se verifican en tiempo real (hora actual)
- **RN-050:** Un item puede tener SOLO UN descuento simple aplicado
- **RN-051:** Los descuentos sobre total se aplican DESPUÉS de descuentos por item
- **RN-052:** Las promociones cruzadas se aplican automáticamente cuando se cumple la condición
- **RN-053:** En 2x1, se descuenta siempre la segunda unidad (no la primera)
- **RN-054:** Si hay múltiples descuentos aplicables a un combo, se aplica el de mayor porcentaje

---

## 5. Cancelación de Pedidos

### CU-012: Cancelar Pedido Completado

**Actor Principal:** Cajero

**Precondiciones:**
- Debe haber una jornada abierta
- El pedido a cancelar debe existir
- El pedido debe estar en estado "completed"
- El pedido debe pertenecer a la jornada actual

**Flujo Principal:**

1. El cajero necesita cancelar un pedido (error, cliente canceló, etc.)
2. El cajero hace click en "Cancelar Pedido" (header)
3. El sistema abre el OrderSearchDialog
4. El sistema carga todos los pedidos de la jornada actual
5. El sistema muestra lista de pedidos ordenados por hora (más reciente primero)
6. Cada pedido muestra:
   - ID (últimos 8 caracteres)
   - Estado (badge)
   - Hora del pedido
   - Cantidad de items
   - Items principales
   - Total
7. El cajero navega por la lista (scroll)
8. El cajero identifica el pedido a cancelar
9. El cajero hace click en "Cancelar" (solo visible en pedidos completed)
10. El sistema abre diálogo de confirmación
11. El cajero (opcional) ingresa razón de cancelación
12. El cajero hace click en "Confirmar Cancelación"
13. El sistema valida que el pedido esté en estado "completed"
14. El sistema ejecuta transacción atómica:
    ```javascript
    // 1. Actualizar orden
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = reason;

    // 2. Devolver stock
    for (const item of order.items) {
      // Por cada producto usado en el combo
      for (const [key, productId] of Object.entries(item.customizations)) {
        if (productId) {
          inventory[productId].stock += item.quantity;
        }
      }
    }

    // 3. Actualizar jornada
    shift.totalOrders -= 1;
    shift.totalRevenue -= order.total;
    ```
15. El sistema guarda los cambios
16. El sistema muestra confirmación: "Pedido cancelado exitosamente"
17. El sistema actualiza la lista de pedidos
18. El pedido aparece con badge "Cancelado" en rojo

**Flujo Alternativo 1: Pedido ya cancelado**

13a. El sistema detecta que el pedido ya está cancelado
13b. El sistema muestra error: "Este pedido ya está cancelado"
13c. El diálogo se cierra

**Flujo Alternativo 2: Error en transacción**

14a. Ocurre un error al actualizar la base de datos
14b. El sistema ejecuta rollback completo
14c. No se devuelve stock
14d. No se actualiza jornada
14e. El sistema muestra error: "Error al cancelar pedido. Intenta nuevamente."

**Postcondiciones:**
- El pedido cambia a estado "cancelled"
- El stock se devuelve al inventario
- El total recaudado de la jornada se reduce
- El contador de órdenes se reduce
- El pedido muestra razón de cancelación (si se ingresó)

**Reglas de Negocio:**
- **RN-055:** Solo se pueden cancelar pedidos en estado "completed"
- **RN-056:** Solo se pueden cancelar pedidos de la jornada actual
- **RN-057:** La cancelación devuelve automáticamente el stock
- **RN-058:** La cancelación reduce el total recaudado de la jornada
- **RN-059:** La cancelación y devolución de stock deben ser ATÓMICAS
- **RN-060:** Un pedido cancelado NO puede volver a estado "completed"
- **RN-061:** La razón de cancelación es opcional pero recomendada
- **RN-062:** Los pedidos cancelados NO cuentan en reportes de ventas

---

## 6. Personalización de Combos

### CU-006: Personalizar Combo con Productos Opcionales

**Actor Principal:** Cajero

**Precondiciones:**
- El combo existe en el sistema
- El combo tiene productos configurados (fijos y/u opcionales)
- Hay stock suficiente de los productos

**Flujo Principal:**

1. El cajero hace click en un combo del menú
2. El sistema carga la configuración del combo
3. El sistema verifica si el combo necesita migración (retro-compatibilidad):
   ```javascript
   if (!combo.products[0].selectionType) {
     combo = ComboMigrationHelper.smartMigration(combo, inventory);
   }
   ```
4. El sistema separa productos en categorías:
   - **Fijos**: `selectionType === "fixed"`
   - **Opcionales**: `selectionType === "choice"` (agrupados por `choiceGroup`)
5. El sistema muestra el diálogo:

   **Sección 1: Productos fijos**
   ```
   ✓ Incluido en el combo
   • Hamburguesa Clásica
   • Papas Grandes
   ```

   **Sección 2: Grupos de selección**
   ```
   Producto Principal (Elige una opción) *
   ○ Pollo Frito
   ○ Hamburguesa de Pollo

   Bebida (Elige una opción) *
   ○ Coca-Cola
   ○ Sprite
   ○ Fanta
   ```

6. El cajero selecciona UNA opción por cada grupo obligatorio
7. El cajero configura opciones globales:
   - ☑ ¿Con picante?
   - ☑ ¿Con hielo?
8. El cajero hace click en "Agregar al Pedido"
9. El sistema valida las selecciones:
   ```javascript
   const validation = ComboValidationService.validateUserSelections(
     combo,
     selections
   );

   if (!validation.isValid) {
     showError(validation.errors);
     return;
   }
   ```
10. El sistema construye customizations:
    ```javascript
    customizations = {
      product: selectedProduct,    // Del grupo "producto"
      drink: selectedDrink,        // Del grupo "bebida"
      side: selectedSide,          // Del grupo "guarnicion" (si existe)
      withIce: iceToggle,          // Boolean
      isSpicy: spicyToggle         // Boolean
    };
    ```
11. El sistema crea el OrderItem con todos los datos
12. El sistema agrega al carrito (CU-003 continúa)

**Flujo Alternativo 1: Faltan selecciones obligatorias**

9a. El sistema detecta que falta seleccionar en un grupo
9b. El sistema muestra error: "Debe seleccionar una opción para 'bebida'"
9c. El cajero completa la selección
9d. Vuelve al paso 8

**Flujo Alternativo 2: Producto sin stock**

9a. El sistema detecta que un producto seleccionado no tiene stock
9b. El sistema muestra advertencia: "Stock insuficiente para 'Coca-Cola'"
9c. El sistema deshabilita ese producto en el selector
9d. El cajero selecciona otra opción
9e. Vuelve al paso 8

**Postcondiciones:**
- El combo se agrega al carrito con las selecciones correctas
- Las personalizaciones quedan registradas
- El stock se reserva temporalmente

**Reglas de Negocio:**
- **RN-063:** Productos fijos se incluyen SIEMPRE sin necesidad de selección
- **RN-064:** Productos opcionales del mismo grupo son EXCLUYENTES (solo 1)
- **RN-065:** Todos los grupos opcionales requieren selección obligatoria
- **RN-066:** No se permite NO elegir (todos los grupos deben tener selección)
- **RN-067:** Las opciones "con picante" y "con hielo" son globales al combo
- **RN-068:** Un grupo de selección debe tener mínimo 2 productos
- **RN-069:** Combos antiguos sin `selectionType` se migran automáticamente en memoria

---

## 7. Arqueo de Caja

### CU-013: Realizar Arqueo de Caja al Cierre

**Actor Principal:** Cajero

**Precondiciones:**
- Hay una jornada abierta
- Se completaron ventas durante la jornada

**Flujo Principal:**

1. El cajero decide cerrar su jornada
2. El cajero cuenta físicamente todo el efectivo en caja:
   - Billetes de todos los cortes
   - Monedas
3. El cajero hace click en "Terminar Jornada"
4. El sistema calcula automáticamente:
   ```javascript
   const fondoInicial = shift.initialCash;
   const ventasCompletadas = shift.totalRevenue; // Solo completed, no cancelled
   const efectivoEsperado = fondoInicial + ventasCompletadas;
   ```
5. El sistema muestra el resumen:
   ```
   Fondo inicial:        $ 10,000
   Total recaudado:      $ 45,000

   Efectivo esperado:    $ 55,000
   ```
6. El cajero ingresa el efectivo real contado: `$ 55,100`
7. El sistema calcula la diferencia:
   ```javascript
   const diferencia = efectivoReal - efectivoEsperado;
   // diferencia = 55,100 - 55,000 = +100
   ```
8. El sistema muestra la diferencia con código de color:
   - `diferencia === 0`: 🟢 Verde "Todo cuadra"
   - `diferencia > 0`: 🔵 Azul "Sobra $ X"
   - `diferencia < 0`: 🔴 Rojo "Falta $ X"
9. Si `|diferencia| > 500`:
   ```
   ⚠️ ADVERTENCIA: Hay una diferencia significativa de $X.
   Por favor, vuelve a contar el efectivo antes de confirmar.
   ```
10. El cajero revisa:
    - Si diferencia = 0: Confirma cierre
    - Si diferencia > 0: Verifica si contó de más o hubo error
    - Si diferencia < 0: Vuelve a contar, busca billetes pegados
11. El cajero decide:
    - Opción A: Volver a contar (modifica efectivo real)
    - Opción B: Confirmar (está seguro del conteo)
12. El cajero hace click en "Cerrar Jornada"
13. El sistema guarda:
    ```javascript
    shift.actualCash = efectivoReal;
    shift.cashDifference = diferencia;
    shift.endedAt = new Date();
    shift.status = "closed";
    ```
14. El sistema cierra la jornada (CU-002 completa)

**Flujo Alternativo 1: Diferencia positiva (sobra)**

8a. `diferencia = +$ 200` (sobran $200)
8b. Posibles causas:
   - Error al contar (contó de más)
   - Cliente pagó de más y no se devolvió vuelto
   - Se registró mal un pedido (precio menor)
8c. El cajero vuelve a contar
8d. Si persiste: Registra y reporta al administrador

**Flujo Alternativo 2: Diferencia negativa (falta)**

8a. `diferencia = -$ 150` (faltan $150)
8b. Posibles causas:
   - Error al contar (contó de menos)
   - Billetes pegados
   - Pedido registrado sin cobrar
   - Pedidos cancelados no considerados
8c. El cajero:
   - Revisa billetes pegados
   - Cuenta monedas nuevamente
   - Verifica pedidos cancelados en el resumen
8d. Si persiste: Registra y reporta

**Flujo Alternativo 3: Múltiples pedidos cancelados**

4a. Durante la jornada se cancelaron 3 pedidos por $ 4,500
4b. El sistema ya ajustó `totalRevenue`:
   ```javascript
   totalRevenue = 45,000 - 4,500 = 40,500
   efectivoEsperado = 10,000 + 40,500 = 50,500
   ```
4c. El cajero cuenta: $ 50,500
4d. Diferencia = 0 ✓

**Postcondiciones:**
- Se registra el efectivo real contado
- Se registra la diferencia de caja
- El administrador puede auditar la jornada
- La jornada queda cerrada

**Reglas de Negocio:**
- **RN-070:** El efectivo esperado EXCLUYE pedidos cancelados
- **RN-071:** El fondo inicial NO se modifica nunca durante la jornada
- **RN-072:** La diferencia de caja puede ser positiva, negativa o cero
- **RN-073:** Diferencias > $500 requieren doble verificación (advertencia)
- **RN-074:** El cajero es responsable de la diferencia de caja
- **RN-075:** Las diferencias se registran para auditoría del administrador
- **RN-076:** NO se puede cerrar jornada con pedido en proceso (carrito con items)

---

## 8. Reportes y Analytics

### CU-014: Generar Reporte de Ventas por Período

**Actor Principal:** Administrador

**Precondiciones:**
- Existen pedidos completados en el sistema

**Flujo Principal:**

1. El administrador navega al Dashboard
2. El sistema muestra métricas del día actual por defecto
3. El administrador hace click en el selector de fechas
4. El administrador selecciona un rango:
   - Opción A: Rango predefinido (Hoy, Últimos 7 días, Últimos 30 días)
   - Opción B: Rango personalizado (fecha inicio - fecha fin)
5. El sistema filtra todas las órdenes en el rango:
   ```javascript
   const orders = await OrderAPI.getAll();
   const filteredOrders = orders.filter(order => {
     const orderDate = new Date(order.createdAt);
     return orderDate >= startDate &&
            orderDate <= endDate &&
            order.status === "completed"; // Solo completadas
   });
   ```
6. El sistema calcula métricas:
   ```javascript
   // KPI 1: Ingresos
   const ingresos = filteredOrders.reduce((sum, order) => sum + order.total, 0);

   // KPI 2: Cantidad de pedidos
   const cantidadPedidos = filteredOrders.length;

   // KPI 3: Ticket promedio
   const ticketPromedio = cantidadPedidos > 0 ? ingresos / cantidadPedidos : 0;

   // KPI 4: Item más vendido
   const itemCounts = {};
   filteredOrders.forEach(order => {
     order.items.forEach(item => {
       const name = item.combo ? item.combo.name : item.product.name;
       itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
     });
   });
   const masVendido = Object.keys(itemCounts).reduce((a, b) =>
     itemCounts[a] > itemCounts[b] ? a : b
   );

   // KPI 5: Stock bajo
   const stockBajo = inventory.filter(item => item.stock < 10).length;
   ```
7. El sistema genera gráficos:

   **Gráfico 1: Top 5 Productos**
   ```javascript
   const top5 = Object.entries(itemCounts)
     .sort(([,a], [,b]) => b - a)
     .slice(0, 5)
     .map(([name, count]) => ({
       name,
       quantity: count,
       percentage: (count / totalItems * 100).toFixed(1)
     }));
   ```

   **Gráfico 2: Distribución por Tipo de Entrega**
   ```javascript
   const byDeliveryType = {
     local: 0,
     takeaway: 0,
     delivery: 0
   };
   filteredOrders.forEach(order => {
     byDeliveryType[order.deliveryType] += 1;
   });
   ```
8. El sistema muestra:
   - 4 tarjetas de KPIs
   - 2 gráficos de pastel
   - 1 tabla detallada de ventas por producto

**Flujo Alternativo 1: Sin datos en el rango**

5a. No hay pedidos en el rango seleccionado
5b. El sistema muestra:
   ```
   📊 Sin datos
   No hay pedidos en el rango seleccionado.
   ```
5c. El administrador cambia el rango

**Postcondiciones:**
- Se muestran métricas calculadas del período
- Los gráficos reflejan los datos filtrados
- El administrador puede tomar decisiones basadas en datos

**Reglas de Negocio:**
- **RN-077:** Los reportes SOLO incluyen pedidos con status "completed"
- **RN-078:** Los pedidos cancelados NO se cuentan en ingresos
- **RN-079:** El ticket promedio se calcula: ingresos ÷ cantidad de pedidos
- **RN-080:** Los reportes se generan en tiempo real (sin caché)
- **RN-081:** Los rangos de fecha son INCLUSIVOS (inicio y fin se incluyen)

---

### CU-015: Analizar Jornada Específica

**Actor Principal:** Administrador

**Precondiciones:**
- Existe al menos una jornada cerrada

**Flujo Principal:**

1. El administrador navega a Jornadas
2. El sistema muestra lista de jornadas filtradas por fecha
3. El administrador encuentra la jornada a analizar
4. El administrador hace click en "Ver Detalle"
5. El sistema carga:
   ```javascript
   const shift = await ShiftAPI.getById(shiftId);
   const orders = await OrderAPI.getByShiftId(shiftId);
   ```
6. El sistema separa órdenes:
   ```javascript
   const completedOrders = orders.filter(o => o.status === "completed");
   const cancelledOrders = orders.filter(o => o.status === "cancelled");
   ```
7. El sistema calcula métricas:
   ```javascript
   // Resumen financiero
   const fondoInicial = shift.initialCash;
   const totalVentas = completedOrders.reduce((sum, o) => sum + o.total, 0);
   const totalCancelado = cancelledOrders.reduce((sum, o) => sum + o.total, 0);
   const efectivoEsperado = fondoInicial + totalVentas;
   const efectivoReal = shift.actualCash;
   const diferencia = shift.cashDifference;

   // Métricas de ventas
   const cantidadCompletadas = completedOrders.length;
   const cantidadCanceladas = cancelledOrders.length;
   const ticketPromedio = cantidadCompletadas > 0 ? totalVentas / cantidadCompletadas : 0;
   ```
8. El sistema muestra modal con:

   **Sección 1: Info General**
   - Empleado
   - Fecha
   - Horario (inicio - fin)
   - Duración

   **Sección 2: Resumen Financiero**
   ```
   Fondo inicial:           $ 10,000
   Total ventas:            $ 45,000
   Pedidos cancelados:      -$ 1,500 (3 pedidos)
   ────────────────────────────────
   Efectivo esperado:       $ 53,500
   Efectivo real:           $ 53,600
   Diferencia de caja:      +$ 100  🔵
   ```

   **Sección 3: Métricas de Ventas**
   - Total órdenes completadas: 25
   - Ticket promedio: $ 1,800
   - Total ventas brutas: $ 45,000

   **Sección 4: Productos Vendidos**
   | Producto | Cantidad | Ingresos |
   |----------|----------|----------|
   | Combo Familiar | 12 | $ 18,000 |
   | Combo Pollo | 8 | $ 12,000 |

   **Sección 5: Órdenes de la Jornada**
   - Tabla con todas las órdenes (completed y cancelled)
   - Cancelled aparecen con fondo rojo y badge
   - Muestra razón de cancelación

9. El administrador analiza:
   - Desempeño del cajero
   - Diferencias de caja
   - Productos más vendidos
   - Patrones de cancelación

**Flujo Alternativo 1: Jornada con diferencia significativa**

7a. `|cashDifference| > 500`
7b. El administrador investiga:
   - Revisa pedidos cancelados (causa común)
   - Verifica razones de cancelación
   - Consulta con el cajero
   - Documenta hallazgos

**Postcondiciones:**
- El administrador tiene visibilidad completa de la jornada
- Puede identificar problemas o patrones
- Puede tomar acciones correctivas si es necesario

**Reglas de Negocio:**
- **RN-082:** El efectivo esperado DEBE excluir pedidos cancelados
- **RN-083:** Las cancelaciones se restan del totalRevenue automáticamente
- **RN-084:** El detalle de jornada muestra TODAS las órdenes (completed y cancelled)
- **RN-085:** Las órdenes cancelled aparecen visualmente diferenciadas
- **RN-086:** El ticket promedio se calcula SOLO con órdenes completadas
- **RN-087:** Una jornada puede tener diferencia de caja positiva, negativa o cero

---

## Anexo: Matriz de Reglas de Negocio

| ID | Descripción | Caso de Uso |
|----|-------------|-------------|
| RN-001 | Solo puede haber UNA jornada abierta a la vez | CU-001 |
| RN-002 | El fondo inicial debe ser >= 0 | CU-001 |
| RN-003 | Solo empleados activos pueden iniciar jornada | CU-001 |
| RN-004 | La hora de inicio se registra automáticamente | CU-001 |
| RN-005 | Una jornada cerrada NO puede reabrirse | CU-002 |
| RN-006 | Efectivo esperado = fondo + ventas - cancelaciones | CU-002, CU-013 |
| RN-007 | La diferencia de caja puede ser +, - o 0 | CU-002, CU-013 |
| RN-008 | Total recaudado NO incluye pedidos cancelados | CU-002 |
| RN-009 | El cierre registra automáticamente hora exacta | CU-002 |
| RN-010 | El stock se reserva al agregar al carrito | CU-003 |
| RN-011 | El stock se libera al eliminar del carrito | CU-003 |
| RN-012 | El tipo de entrega es obligatorio | CU-003 |
| RN-013 | Un pedido debe tener al menos 1 item | CU-003 |
| RN-014 | Los descuentos se aplican automáticamente | CU-003, CU-011 |
| RN-015 | Número de orden = jornada.totalOrders + 1 | CU-003, CU-004 |
| RN-016 | Creación de orden y stock son ATÓMICOS | CU-004 |
| RN-017 | Si falla la transacción, rollback completo | CU-004 |
| RN-018 | El número de orden se basa en totalOrders | CU-004 |
| RN-019 | Total recaudado = solo completed | CU-004 |
| RN-020 | Las órdenes se crean inmediatamente | CU-004 |
| RN-021 | Descuentos de total se aplican AL FINAL | CU-004, CU-011 |
| RN-022 | Ticket cliente DEBE mostrar precios | CU-005 |
| RN-023 | Ticket cocina NO muestra precios | CU-005 |
| RN-024 | Ambos tickets muestran personalizaciones | CU-005 |
| RN-025 | Número de orden único y secuencial | CU-005 |
| RN-026 | Tickets indican picante/hielo claramente | CU-005 |
| RN-027 | El stock SIEMPRE debe ser >= 0 | CU-007 |
| RN-028 | Stock se actualiza en tiempo real | CU-007 |
| RN-029 | Stock < 10 = alerta de stock bajo | CU-007 |
| RN-030 | El stock es global (compartido) | CU-007 |
| RN-031 | Cambios de stock NO afectan pedidos pasados | CU-007 |
| RN-032 | Nombre de producto único por tipo | CU-008 |
| RN-033 | Precio inicial debe ser > 0 | CU-008 |
| RN-034 | Stock inicial puede ser 0 | CU-008 |
| RN-035 | Tipo se determina por pestaña de creación | CU-008 |
| RN-036 | Descuento simple: total O combos (no ambos) | CU-009 |
| RN-037 | Porcentaje entre 1% y 100% | CU-009 |
| RN-038 | Descuento DEBE tener condición temporal | CU-009 |
| RN-039 | Si hay horario, solo aplica en ese rango | CU-009 |
| RN-040 | Sin horario = aplica todo el día | CU-009 |
| RN-041 | Descuentos weekday se repiten semanalmente | CU-009 |
| RN-042 | Descuentos date solo aplican en esa fecha | CU-009 |
| RN-043 | Promoción cruzada requiere 2 combos | CU-010 |
| RN-044 | Si trigger = target → Es 2x1 | CU-010 |
| RN-045 | Si trigger ≠ target → Es mix | CU-010 |
| RN-046 | Descuento se aplica SOLO al target | CU-010 |
| RN-047 | En 2x1, descuento en unidades pares | CU-010 |
| RN-048 | Promociones se aplican automáticamente | CU-010, CU-011 |
| RN-049 | Descuentos se verifican en tiempo real | CU-011 |
| RN-050 | Un item tiene SOLO UN descuento simple | CU-011 |
| RN-051 | Descuento total se aplica DESPUÉS de items | CU-011 |
| RN-052 | Promociones cruzadas son automáticas | CU-011 |
| RN-053 | 2x1 descuenta la segunda unidad | CU-011 |
| RN-054 | Si hay múltiples, se aplica el mayor | CU-011 |
| RN-055 | Solo se cancelan pedidos "completed" | CU-012 |
| RN-056 | Solo pedidos de jornada actual | CU-012 |
| RN-057 | Cancelación devuelve stock automáticamente | CU-012 |
| RN-058 | Cancelación reduce totalRevenue | CU-012 |
| RN-059 | Cancelación y stock son ATÓMICOS | CU-012 |
| RN-060 | Cancelled NO vuelve a completed | CU-012 |
| RN-061 | Razón de cancelación es opcional | CU-012 |
| RN-062 | Cancelled NO cuentan en reportes | CU-012, CU-014 |
| RN-063 | Productos fijos se incluyen SIEMPRE | CU-006 |
| RN-064 | Opcionales del mismo grupo son exclusivos | CU-006 |
| RN-065 | Todos los grupos requieren selección | CU-006 |
| RN-066 | NO se permite omitir selección | CU-006 |
| RN-067 | Picante/hielo son opciones globales | CU-006 |
| RN-068 | Grupo de selección mínimo 2 productos | CU-006 |
| RN-069 | Combos viejos se migran automáticamente | CU-006 |
| RN-070 | Efectivo esperado EXCLUYE cancelados | CU-013 |
| RN-071 | Fondo inicial NO se modifica durante jornada | CU-013 |
| RN-072 | Diferencia puede ser +, -, o 0 | CU-013 |
| RN-073 | Diferencia > $500 requiere verificación | CU-013 |
| RN-074 | Cajero responsable de diferencia | CU-013 |
| RN-075 | Diferencias se registran para auditoría | CU-013 |
| RN-076 | NO se cierra con pedido en proceso | CU-013 |
| RN-077 | Reportes SOLO incluyen completed | CU-014 |
| RN-078 | Cancelled NO cuentan en ingresos | CU-014 |
| RN-079 | Ticket promedio = ingresos ÷ pedidos | CU-014 |
| RN-080 | Reportes en tiempo real (sin caché) | CU-014 |
| RN-081 | Rangos de fecha son INCLUSIVOS | CU-014 |
| RN-082 | Efectivo esperado EXCLUYE cancelled | CU-015 |
| RN-083 | Cancelaciones restan de totalRevenue auto | CU-015 |
| RN-084 | Detalle muestra TODAS las órdenes | CU-015 |
| RN-085 | Cancelled visualmente diferenciadas | CU-015 |
| RN-086 | Ticket promedio SOLO con completed | CU-015 |
| RN-087 | Jornada puede tener diferencia +, -, o 0 | CU-015 |

---

**Última actualización:** 2025-01-15
**Versión:** 1.0
**Sistema:** FastChicken POS v2.0
