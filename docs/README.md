# FastChicken POS - Documentación

Documentación completa del proyecto FastChicken POS organizada por categorías.

## Estructura de la Documentación

### 📋 01-project-overview/
Visión general del proyecto, propósito y guías de contribución.

- **[blueprint.md](01-project-overview/blueprint.md)** - Blueprint original del proyecto con features core y guías de estilo
- **[overview.md](01-project-overview/overview.md)** - Propósito del negocio, usuarios del sistema y funcionalidades principales
- **[contributing.md](01-project-overview/contributing.md)** - Guía para contribuir al proyecto

**Empieza aquí si:** Eres nuevo en el proyecto y quieres entender qué hace FastChicken POS.

---

### 🏗️ 02-architecture/
Arquitectura del sistema, Clean Architecture, casos de uso y setup técnico.

- **[ARCHITECTURE.md](02-architecture/ARCHITECTURE.md)** - Estructura de capas (Domain, Application, Infrastructure, Presentation)
- **[CASOS_USO_NEGOCIO.md](02-architecture/CASOS_USO_NEGOCIO.md)** - Casos de uso del negocio mapeados a Use Cases
- **[MONGODB_SETUP.md](02-architecture/MONGODB_SETUP.md)** - Configuración de MongoDB para desarrollo y producción
- **[SEPARACION_PROYECTOS.md](02-architecture/SEPARACION_PROYECTOS.md)** - Guía para separar el monolito en backend/frontend independientes

**Empieza aquí si:** Necesitas entender la arquitectura técnica antes de desarrollar.

---

### ✨ 03-features/
Guías de implementación de funcionalidades específicas.

- **[combo-product-selection-simple.md](03-features/combo-product-selection-simple.md)** - Implementación de selección de productos en combos
- **[combo-selection-rules-implementation.md](03-features/combo-selection-rules-implementation.md)** - Reglas de validación para combos
- **[cancelacion-pedidos-implementacion.md](03-features/cancelacion-pedidos-implementacion.md)** - Sistema de cancelación de pedidos con reposición de stock
- **[shift-summary-ticket-implementation.md](03-features/shift-summary-ticket-implementation.md)** - Implementación de tickets de resumen de jornada

**Empieza aquí si:** Estás trabajando en una feature específica o necesitas entender cómo funciona.

---

### 📖 04-user-manuals/
Manuales de usuario para cajeros y administradores.

- **[MANUAL_USUARIO_CAJERO.md](04-user-manuals/MANUAL_USUARIO_CAJERO.md)** - Guía completa para cajeros
- **[MANUAL_USUARIO_ADMINISTRADOR.md](04-user-manuals/MANUAL_USUARIO_ADMINISTRADOR.md)** - Guía completa para administradores

**Empieza aquí si:** Eres usuario final del sistema o necesitas capacitar a alguien.

---

### 🛠️ 05-implementation-guides/
Guías técnicas para desarrolladores, prompts y patrones de implementación.

- **[prompts.md](05-implementation-guides/prompts.md)** - Prompts para Claude Code/LLMs al implementar features siguiendo Clean Architecture

**Empieza aquí si:** Estás usando Claude Code o LLMs para desarrollar en este proyecto.

---

### 📦 archive/
Documentos históricos y diagnósticos de bugs resueltos.

Contiene:
- Diagnósticos de bugs de descuentos (resueltos)
- Documentación de fixes antiguos
- Archivos de configuración legacy

**Solo para referencia histórica.** No uses estos documentos para desarrollo actual.

---

## Flujo de Lectura Recomendado

### Para Nuevos Desarrolladores:
1. `01-project-overview/overview.md` - Entiende el negocio
2. `02-architecture/ARCHITECTURE.md` - Entiende la arquitectura
3. `02-architecture/CASOS_USO_NEGOCIO.md` - Entiende los casos de uso
4. `05-implementation-guides/prompts.md` - Aprende los patrones de desarrollo
5. `03-features/*` - Revisa implementaciones específicas como referencia

### Para Usuarios Finales:
1. `01-project-overview/overview.md` - Visión general
2. `04-user-manuals/MANUAL_USUARIO_*.md` - Manual según tu rol

### Para Arquitectos/Tech Leads:
1. `02-architecture/ARCHITECTURE.md` - Arquitectura completa
2. `02-architecture/SEPARACION_PROYECTOS.md` - Estrategia de escalabilidad
3. `02-architecture/MONGODB_SETUP.md` - Setup de datos

---

## Archivos Deprecados Identificados

### ⚠️ Para Eliminar:

1. **`src/domain/services/ComboValidationService.ts.backup`**
   - Reemplazado por `ComboService.ts`
   - Solo se menciona en docs antiguos
   - Eliminar con: `rm src/domain/services/ComboValidationService.ts.backup`

2. **`src/domain/services/ComboMigrationHelper.ts`**
   - Helper de migración de modelo antiguo a nuevo
   - No se importa en ningún archivo de código
   - Solo se menciona en docs
   - Considerar eliminar si la migración ya se completó

---

## Mantenimiento de esta Documentación

- **Nuevos docs de features:** Agregar a `03-features/`
- **Nuevos casos de uso:** Documentar en `02-architecture/CASOS_USO_NEGOCIO.md`
- **Cambios arquitectónicos:** Actualizar `02-architecture/ARCHITECTURE.md`
- **Bugs resueltos:** Mover diagnósticos a `archive/`
- **Manuales de usuario:** Actualizar en `04-user-manuals/`

---

Última actualización: 2025-12-20
