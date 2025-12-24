# ✅ SOLUCIÓN: Combos no se visualizan en standalone build

## 🔴 Problema Identificado

**Síntoma:**
- En `npm run dev` → Combos se ven ✅
- En `node server.js` (standalone) → Combos NO se ven ❌
- La interfaz carga correctamente, pero la lista de combos está vacía

**Causa raíz:**
Next.js standalone build **NO carga automáticamente el archivo `.env`**.

Cuando ejecutas `node server.js` en Windows, las variables de entorno de MongoDB NO están disponibles, por lo que no puede conectarse a la base de datos.

---

## ✅ SOLUCIÓN

### Opción 1: Usar dotenv (RECOMENDADO)

Modificar el archivo `server.js` standalone para cargar `.env` manualmente.

#### Paso 1: Agregar dotenv al proyecto

```bash
npm install dotenv
```

#### Paso 2: Modificar proceso de build

Después de hacer el build y copiar archivos, agregar este paso:

**En tu Mac (después del build):**

```bash
# Después de copiar standalone, static, public y .env...
cd fastchicken-win

# Crear un nuevo server.js que carga .env
cat > server-start.js << 'EOF'
// Cargar variables de entorno ANTES de iniciar Next.js
require('dotenv').config();

// Iniciar servidor Next.js
require('./server.js');
EOF
```

#### Paso 3: Actualizar BAT files en Windows

**start-caja.bat:**
```bat
@echo off
set PORT=3000
set APP_NAME=FastChicken Caja

echo ======================================
echo %APP_NAME%
echo Port %PORT%
echo ======================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 >nul

cd /d %~dp0
start "" http://localhost:%PORT%
set PORT=%PORT%
node server-start.js

pause
```

**start-admin.bat:**
```bat
@echo off
set PORT=3001
set APP_NAME=FastChicken Admin

echo ======================================
echo %APP_NAME%
echo Port %PORT%
echo ======================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 >nul

cd /d %~dp0
start "" http://localhost:%PORT%/admin
set PORT=%PORT%
node server-start.js

pause
```

---

### Opción 2: Variables de entorno en Windows (Alternativa)

Si no quieres usar dotenv, puedes cargar las variables manualmente en el BAT:

**start-caja.bat:**
```bat
@echo off
set PORT=3000

REM Cargar variables de MongoDB desde .env
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" (
        set %%a=%%b
    )
)

cd /d %~dp0
start "" http://localhost:%PORT%
node server.js

pause
```

---

## 📋 Proceso de Deploy Actualizado

### En tu Mac:

```bash
# 1. Build
npm run build

# 2. Copiar standalone
cp -R .next/standalone/* fastchicken-win/

# 3. Copiar static
rm -rf fastchicken-win/.next/static
cp -R .next/static fastchicken-win/.next/

# 4. Copiar public
cp -R public fastchicken-win/

# 5. Copiar .env
cp .env fastchicken-win/.env

# 6. 🆕 NUEVO: Crear server-start.js
cat > fastchicken-win/server-start.js << 'EOF'
require('dotenv').config();
require('./server.js');
EOF

# 7. 🆕 NUEVO: Verificar que dotenv está en node_modules
# (Ya debería estar si hiciste npm install dotenv antes del build)

# 8. ZIP y enviar a cliente
cd fastchicken-win
zip -r ../fastchicken-win.zip .
```

### En Windows (Cliente):

```bash
# 1. Descomprimir
unzip fastchicken-win.zip -d C:\Users\ELIPOS J4125\documents\fastchicken-win

# 2. Ejecutar
cd C:\Users\ELIPOS J4125\documents\fastchicken-win
start-caja.bat
```

---

## 🧪 Cómo probar localmente (en tu Mac)

```bash
# 1. Hacer build
npm run build

# 2. Copiar .env al standalone
cp .env .next/standalone/.env

# 3. Crear server-start.js
cat > .next/standalone/server-start.js << 'EOF'
require('dotenv').config();
require('./server.js');
EOF

# 4. Probar
cd .next/standalone
node server-start.js

# 5. Abrir navegador
open http://localhost:3000
```

**Resultado esperado:** Los combos deberían aparecer.

---

## 🔍 Debug: Verificar que funciona

### En Windows, agregar logs temporales:

**server-start.js** (versión debug):
```javascript
require('dotenv').config();

// Verificar que las variables se cargaron
console.log('========================================');
console.log('Variables de entorno cargadas:');
console.log('MONGODB_USER:', process.env.MONGODB_USER ? '✅' : '❌');
console.log('MONGODB_PASSWORD:', process.env.MONGODB_PASSWORD ? '✅' : '❌');
console.log('MONGODB_CLUSTER_URL:', process.env.MONGODB_CLUSTER_URL ? '✅' : '❌');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅' : '❌');
console.log('========================================');

// Iniciar servidor
require('./server.js');
```

Si ves ✅ en todas las variables, el `.env` se está cargando correctamente.

---

## ⚠️ Importante: dotenv debe estar en dependencies

Asegúrate de que `dotenv` esté en `dependencies` (NO en `devDependencies`):

**package.json:**
```json
{
  "dependencies": {
    "dotenv": "^16.4.5",
    ...otras dependencias...
  }
}
```

Luego:
```bash
npm install
npm run build
```

---

## 📊 Resumen del problema y solución

| Aspecto | Problema | Solución |
|---------|----------|----------|
| **Entorno** | Next.js standalone NO carga `.env` automáticamente | Usar `dotenv` para cargar manualmente |
| **Síntoma** | MongoDB no se conecta, combos aparecen vacíos | `server-start.js` carga `.env` antes de iniciar Next.js |
| **Deploy** | Mismo proceso + crear `server-start.js` | Script automatizado |
| **Windows** | BATs ejecutan `node server-start.js` en lugar de `node server.js` | Actualizar start-caja.bat y start-admin.bat |

---

## ✅ Checklist final

- [ ] `npm install dotenv`
- [ ] `npm run build`
- [ ] Copiar standalone, static, public, .env
- [ ] Crear `server-start.js` en `fastchicken-win/`
- [ ] Actualizar `start-caja.bat` para usar `server-start.js`
- [ ] Actualizar `start-admin.bat` para usar `server-start.js`
- [ ] Probar localmente: `cd .next/standalone && node server-start.js`
- [ ] ZIP y enviar a cliente
- [ ] Cliente prueba en Windows

---

**Estado:** ✅ Solución identificada y documentada
