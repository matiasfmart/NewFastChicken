# Deploy en Windows - Actualizado con Fix de Combos

**Fecha:** 2025-12-22
**Fix:** Combos no se visualizaban en standalone build debido a variables de entorno

---

## 🔴 Problema Resuelto

**Antes:**
- `npm run dev` → Combos funcionan ✅
- `node server.js` (standalone en Windows) → Combos NO aparecen ❌

**Causa:**
Next.js standalone **NO carga automáticamente el archivo `.env`**, por lo que no podía conectarse a MongoDB.

**Solución:**
Usar `dotenv` para cargar las variables de entorno manualmente antes de iniciar Next.js.

---

## 📦 Proceso de Deploy Actualizado

### PASO 0 — Preparación (solo primera vez)

```bash
# Instalar dotenv como dependencia
npm install dotenv

# Agregar al package.json si no está:
# "dependencies": {
#   "dotenv": "^16.4.5"
# }
```

### PASO 1 — Build

```bash
npm run build
```

### PASO 2 — Preparar carpeta destino

```bash
mkdir -p fastchicken-win
```

### PASO 3 — Copiar standalone

```bash
cp -R .next/standalone/* fastchicken-win/
```

### PASO 4 — Copiar static

```bash
rm -rf fastchicken-win/.next/static
cp -R .next/static fastchicken-win/.next/
```

### PASO 5 — Copiar public

```bash
cp -R public fastchicken-win/
```

### PASO 6 — Copiar .env

```bash
cp .env fastchicken-win/.env
```

### PASO 7 — 🆕 NUEVO: Crear server-start.js

```bash
cat > fastchicken-win/server-start.js << 'EOF'
// Cargar variables de entorno ANTES de iniciar Next.js
require('dotenv').config();

// Iniciar servidor Next.js
require('./server.js');
EOF
```

### PASO 8 — 🆕 NUEVO: Crear BAT files actualizados

#### start-caja.bat

```bash
cat > fastchicken-win/start-caja.bat << 'EOF'
@echo off
set PORT=3000
set APP_NAME=FastChicken Caja

echo ======================================
echo %APP_NAME%
echo Port %PORT%
echo ======================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Cerrando proceso anterior en puerto %PORT%...
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 >nul

cd /d %~dp0
start "" http://localhost:%PORT%
set PORT=%PORT%
node server-start.js

pause
EOF
```

#### start-admin.bat

```bash
cat > fastchicken-win/start-admin.bat << 'EOF'
@echo off
set PORT=3001
set APP_NAME=FastChicken Admin

echo ======================================
echo %APP_NAME%
echo Port %PORT%
echo ======================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Cerrando proceso anterior en puerto %PORT%...
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 >nul

cd /d %~dp0
start "" http://localhost:%PORT%/admin
set PORT=%PORT%
node server-start.js

pause
EOF
```

### PASO 9 — ZIP

```bash
cd fastchicken-win
zip -r ../fastchicken-win.zip .
cd ..
```

---

## 🖥️ Instalación en Windows (Cliente)

### PASO 1 — Descomprimir

```cmd
# En la PC del cliente (Windows)
cd C:\Users\ELIPOS J4125\documents
unzip fastchicken-win.zip -d fastchicken-win
```

### PASO 2 — Ejecutar

#### Para la Caja:
```cmd
cd C:\Users\ELIPOS J4125\documents\fastchicken-win
start-caja.bat
```

**Resultado:**
- Se abre automáticamente: `http://localhost:3000`
- Los combos **SÍ se visualizan** ✅

#### Para Admin:
```cmd
cd C:\Users\ELIPOS J4125\documents\fastchicken-win
start-admin.bat
```

**Resultado:**
- Se abre automáticamente: `http://localhost:3001/admin`
- Panel de administración funcional ✅

---

## ✅ Verificación

Cuando ejecutes `start-caja.bat` o `start-admin.bat`, deberías ver en la consola:

```
========================================
FastChicken POS - Variables de entorno:
MONGODB_USER: ✅ Cargada
MONGODB_CLUSTER_URL: ✅ Cargada
MONGO_URI: ✅ Cargada
========================================

   ▲ Next.js 15.3.3
   - Local:        http://localhost:3000

 ✓ Ready in 100ms
```

Si ves `❌ NO encontrada` en alguna variable, significa que el `.env` no se copió correctamente.

---

## 🔧 Troubleshooting

### Problema: "Cannot find module 'dotenv'"

**Causa:** dotenv no está en node_modules del standalone

**Solución:**
```bash
# En tu Mac, antes de hacer el build:
npm install dotenv
npm run build

# Verificar que dotenv esté en .next/standalone/node_modules:
ls -la .next/standalone/node_modules/ | grep dotenv
```

### Problema: Combos siguen sin aparecer

**Verificación paso a paso:**

1. **Verificar que .env existe:**
   ```cmd
   cd C:\Users\ELIPOS J4125\documents\fastchicken-win
   type .env
   ```
   Deberías ver las variables de MongoDB.

2. **Verificar que server-start.js existe:**
   ```cmd
   type server-start.js
   ```

3. **Verificar logs al iniciar:**
   - Las variables deben mostrar ✅
   - Si muestran ❌, el .env no se está cargando

4. **Probar API directamente:**
   ```cmd
   # Con el servidor corriendo:
   curl http://localhost:3000/api/combos
   ```
   Debería devolver JSON con los combos.

---

## 📄 Archivos del Deploy

Después de este proceso, `fastchicken-win/` debe contener:

```
fastchicken-win/
├── server.js                    # Servidor Next.js original
├── server-start.js              # 🆕 Wrapper que carga .env
├── .env                         # Variables de entorno
├── package.json
├── node_modules/
│   ├── dotenv/                  # 🆕 Módulo para cargar .env
│   └── ...otros módulos...
├── .next/
│   ├── BUILD_ID
│   ├── server/
│   └── static/
├── public/
├── start-caja.bat               # 🆕 Ejecuta caja con server-start.js
└── start-admin.bat              # 🆕 Ejecuta admin con server-start.js
```

---

## 🎯 Cambios vs. Versión Anterior

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Ejecutable** | `node server.js` | `node server-start.js` |
| **Variables .env** | ❌ No se cargaban | ✅ Se cargan automáticamente |
| **Dependencias** | - | `dotenv` |
| **Combos en caja** | ❌ Lista vacía | ✅ Funcionan correctamente |
| **Conexión MongoDB** | ❌ Fallaba silenciosamente | ✅ Funcional |

---

## ✅ Checklist de Deploy

- [ ] `npm install dotenv`
- [ ] `npm run build`
- [ ] Copiar standalone
- [ ] Copiar static
- [ ] Copiar public
- [ ] Copiar .env
- [ ] Crear server-start.js
- [ ] Crear start-caja.bat
- [ ] Crear start-admin.bat
- [ ] ZIP `fastchicken-win/`
- [ ] Enviar a cliente
- [ ] Cliente descomprime en Windows
- [ ] Cliente ejecuta start-caja.bat
- [ ] ✅ Combos se visualizan correctamente

---

**Status:** ✅ Fix implementado y probado localmente
