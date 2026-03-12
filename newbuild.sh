#!/bin/bash

# ============================================================
#  FastChicken - Build & Package para Windows
# ============================================================

set -e

PROJECT_ROOT="/Users/matiasmartinez/Documents/personal/projects/NewFastChickenProject/NewFastChicken"

# Cargar nvm y usar Node 18
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18

cd "$PROJECT_ROOT"

echo ""
echo "======================================"
echo "  FastChicken - Empaquetado Windows"
echo "======================================"
echo ""

# BUILD
echo "🔨 Ejecutando next build..."
npm run build
echo "✅ Build completado."
echo ""

# PASO 1 — Crear carpeta destino
echo "📂 PASO 1 — Creando fastchicken-win/"
rm -rf fastchicken-win
mkdir fastchicken-win
echo "✅ Listo."
echo ""

# PASO 2 — Copiar TODO standalone
echo "📦 PASO 2 — Copiando .next/standalone/*"
cp -R .next/standalone/* fastchicken-win/
echo "✅ Listo."
echo ""

# PASO 3 — Reemplazar .next completo con el del build
echo "🔄 PASO 3 — Reemplazando .next/ completo"
rm -rf fastchicken-win/.next
cp -R .next fastchicken-win/.next
echo "✅ Listo."
echo ""

# PASO 4 — Copiar public
echo "🖼  PASO 4 — Copiando public/"
cp -R public fastchicken-win/
echo "✅ Listo."
echo ""

# PASO 5 — Copiar .env
echo "🔐 PASO 5 — Copiando .env"
cp .env fastchicken-win/.env
echo "✅ Listo."
echo ""

# PASO 6 — Generar .bat
echo "🪟  PASO 6 — Generando .bat..."

cat > fastchicken-win/start-caja.bat << 'EOF'
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
node server.js
pause
EOF

cat > fastchicken-win/start-admin.bat << 'EOF'
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
node server.js
pause
EOF

echo "✅ Listo."
echo ""
echo "======================================"
echo "✅ Listo. Probá con:"
echo "   cd fastchicken-win && node server.js"
echo "======================================"