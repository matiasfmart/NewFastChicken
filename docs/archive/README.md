# Archive - Documentación Histórica

Esta carpeta contiene documentación antigua, versiones deprecadas y diagnósticos de bugs ya resueltos.

**⚠️ IMPORTANTE:** Esta documentación es solo para referencia histórica. NO la uses para desarrollo actual.

---

## 📋 Índice de Archivos

### 🐛 Diagnósticos de Bugs de Descuentos (Resueltos)
Estos archivos documentan el proceso de diagnóstico y corrección de bugs relacionados con el sistema de descuentos.

- **[DIAGNOSTICO_BUGS_DESCUENTOS.md](DIAGNOSTICO_BUGS_DESCUENTOS.md)** - Diagnóstico inicial de bugs en descuentos
- **[DIAGNOSTICO_DESCUENTOS_CRUZADOS.md](DIAGNOSTICO_DESCUENTOS_CRUZADOS.md)** - Análisis de descuentos cruzados
- **[DIAGNOSTICO_FINAL_DESCUENTOS.md](DIAGNOSTICO_FINAL_DESCUENTOS.md)** - Diagnóstico final del sistema de descuentos
- **[DISCOUNT_FIXES.md](DISCOUNT_FIXES.md)** - Documentación de fixes aplicados
- **[FIX_DESCUENTO_TOTAL_ORDEN.md](FIX_DESCUENTO_TOTAL_ORDEN.md)** - Fix específico para descuento total de orden
- **[RESUMEN_CAMBIOS_DESCUENTOS.md](RESUMEN_CAMBIOS_DESCUENTOS.md)** - Resumen de todos los cambios en descuentos

**Status:** ✅ Todos los bugs resueltos. Sistema de descuentos funcional.

---

### 🚀 Documentación de Deployment (Versiones Antiguas)

#### Windows Deployment
- **[DEPLOY_WINDOWS_ACTUALIZADO.md](DEPLOY_WINDOWS_ACTUALIZADO.md)** - Versión intermedia del fix de combos (2025-12-22)
  - Problema: Usaba `dotenv` como dependencia externa
  - Reemplazado por: `06-deployment/WINDOWS_DEPLOYMENT.md` (versión final sin dependencias)

- **[WINDOWS_DEPLOYMENT_DOCKER.md](WINDOWS_DEPLOYMENT_DOCKER.md)** - Versión antigua usando Docker
  - Problema: Docker Desktop requiere licencia comercial en Windows
  - Reemplazado por: Standalone build sin Docker

**Versión actual:** [docs/06-deployment/WINDOWS_DEPLOYMENT.md](../06-deployment/WINDOWS_DEPLOYMENT.md) ✅

#### Docker y MongoDB
- **[MONGODB_SETUP_DOCKER_OLD.md](MONGODB_SETUP_DOCKER_OLD.md)** - Setup de Docker y MongoDB (versión antigua)
  - Contenido duplicado/incorrecto
  - Reemplazado por: `06-deployment/DOCKER_SETUP.md` y `02-architecture/MONGODB_SETUP.md`

---

### 📝 Documentación de Soluciones Específicas

- **[SOLUCION_COMBOS_STANDALONE.md](SOLUCION_COMBOS_STANDALONE.md)** - Documentación del proceso de solución de combos en standalone
  - Contenido: Proceso iterativo de debugging
  - Reemplazado por: `06-deployment/WINDOWS_DEPLOYMENT.md` (versión consolidada y final)

- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Guía de migración (fecha desconocida)
  - Posiblemente para migración de modelo de datos antiguo
  - Verificar relevancia antes de usar

---

### ⚙️ Configuración Legacy

- **[backend.json](backend.json)** - Configuración de backend antigua
  - Archivo de configuración obsoleto
  - No usar en desarrollo actual

---

## 🗓️ Cronología de Archivado

### 2025-12-24
- Movidos todos los archivos .md del root a docs/
- Consolidada documentación de Windows deployment
- Creada carpeta `06-deployment/` con versiones finales
- Archivos movidos a archive:
  - `DEPLOY_WINDOWS_ACTUALIZADO.md`
  - `WINDOWS_DEPLOYMENT_DOCKER.md`
  - `MONGODB_SETUP_DOCKER_OLD.md`
  - `SOLUCION_COMBOS_STANDALONE.md`
  - `MIGRATION_GUIDE.md`

### Anterior a 2025-12-20
- Archivados diagnósticos de descuentos (bugs resueltos)
- Movido `backend.json` legacy

---

## 📖 Cómo Usar Este Archive

### ✅ Casos de Uso Válidos:
1. **Investigación histórica:** Entender cómo se resolvió un bug antiguo
2. **Auditoría:** Revisar el proceso de toma de decisiones
3. **Aprendizaje:** Estudiar el proceso de debugging y solución de problemas
4. **Referencia:** Consultar enfoques anteriores antes de un refactor similar

### ❌ NO usar para:
1. **Desarrollo actual:** Usa la documentación en `docs/` (fuera de archive)
2. **Deployment:** Usa `docs/06-deployment/WINDOWS_DEPLOYMENT.md`
3. **Configuración:** Usa los archivos actuales en el root del proyecto
4. **Arquitectura:** Usa `docs/02-architecture/`

---

## 🔍 Búsqueda de Información

Si estás buscando documentación sobre un tema específico:

1. **Primero:** Revisa `docs/README.md` para la estructura actual
2. **Luego:** Busca en las carpetas numeradas (01-06)
3. **Solo si no encuentras:** Revisa este archive

**Regla general:** Si un archivo está en archive/, probablemente hay una versión mejor en docs/.

---

## 🧹 Política de Limpieza

- **NO eliminar:** Archivos de diagnóstico de bugs (valor histórico)
- **Considerar eliminar (1 año después):** Versiones intermedias de documentación
- **Revisar anualmente:** Relevancia de archivos de migración/configuración legacy

---

Última actualización: 2025-12-24
