#!/bin/bash

# FastChicken POS - Deploy Script para Windows
# Este script automatiza todo el proceso de preparación para Windows

set -e  # Salir si hay algún error

echo "========================================="
echo "FastChicken POS - Deploy para Windows"
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paso 1: Verificar dependencias (ya no necesitamos dotenv)
echo -e "${BLUE}[1/9]${NC} Verificando proyecto..."
echo -e "${GREEN}✅ Listo para build${NC}"
echo ""

# Paso 2: Build
echo -e "${BLUE}[2/9]${NC} Compilando aplicación..."
npm run build
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

# Paso 3: Crear carpeta destino
echo -e "${BLUE}[3/9]${NC} Preparando carpeta fastchicken-win..."
rm -rf fastchicken-win
mkdir -p fastchicken-win
echo -e "${GREEN}✅ Carpeta creada${NC}"
echo ""

# Paso 4: Copiar standalone
echo -e "${BLUE}[4/9]${NC} Copiando archivos standalone..."
cp -R .next/standalone/* fastchicken-win/
# CRÍTICO: El glob * no copia archivos ocultos como .next
cp -R .next/standalone/.next fastchicken-win/
echo -e "${GREEN}✅ Standalone copiado${NC}"
echo ""

# Paso 5: Copiar static (SOLO reemplazar la carpeta static, no todo .next)
echo -e "${BLUE}[5/9]${NC} Copiando archivos estáticos..."
# El standalone ya tiene un .next, solo reemplazamos static
cp -R .next/static fastchicken-win/.next/
echo -e "${GREEN}✅ Static copiado${NC}"
echo ""

# Paso 6: Copiar public
echo -e "${BLUE}[6/9]${NC} Copiando carpeta public..."
cp -R public fastchicken-win/
echo -e "${GREEN}✅ Public copiado${NC}"
echo ""

# Paso 7: Copiar .env
echo -e "${BLUE}[7/9]${NC} Copiando variables de entorno..."
if [ -f .env ]; then
    cp .env fastchicken-win/.env
    echo -e "${GREEN}✅ .env copiado${NC}"
else
    echo -e "${YELLOW}⚠️  Advertencia: .env no encontrado${NC}"
fi
echo ""

# Paso 8: Crear server-start.js (SIN dotenv - usar fs nativo)
echo -e "${BLUE}[8/9]${NC} Creando server-start.js..."
cat > fastchicken-win/server-start.js << 'EOF'
// Cargar variables de entorno desde .env manualmente (sin dotenv)
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');

  envContent.split('\n').forEach(line => {
    // Ignorar comentarios y líneas vacías
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    // Parsear KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();

      // Remover comillas si existen
      const cleanValue = value.replace(/^["']|["']$/g, '');

      // Solo setear si no existe ya
      if (!process.env[key]) {
        process.env[key] = cleanValue;
      }
    }
  });

  // Fix: El .env usa MONGO_URI pero el app necesita MONGODB_URI
  if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
    process.env.MONGODB_URI = process.env.MONGO_URI;
  }

  // Debug: Verificar que las variables se cargaron
  console.log('========================================');
  console.log('FastChicken POS - Variables de entorno:');
  console.log('MONGODB_USER:', process.env.MONGODB_USER ? '✅ Cargada' : '❌ NO encontrada');
  console.log('MONGODB_CLUSTER_URL:', process.env.MONGODB_CLUSTER_URL ? '✅ Cargada' : '❌ NO encontrada');
  console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Cargada' : '❌ NO encontrada');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Cargada' : '❌ NO encontrada');
  console.log('========================================\n');
} else {
  console.error('❌ Archivo .env no encontrado en:', envPath);
}

// Iniciar servidor Next.js
require('./server.js');
EOF
echo -e "${GREEN}✅ server-start.js creado (sin dependencia de dotenv)${NC}"
echo ""

# Paso 9: Crear BAT files
echo -e "${BLUE}[9/9]${NC} Creando archivos .bat para Windows..."

# start-caja.bat
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

# start-admin.bat
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

echo -e "${GREEN}✅ Archivos .bat creados${NC}"
echo ""

# Resumen final
echo "========================================="
echo -e "${GREEN}✅ Deploy completado exitosamente${NC}"
echo "========================================="
echo ""
echo "Archivos preparados en: ./fastchicken-win/"
echo ""
echo "Próximos pasos:"
echo "  1. ZIP la carpeta:"
echo "     cd fastchicken-win && zip -r ../fastchicken-win.zip . && cd .."
echo ""
echo "  2. Enviar fastchicken-win.zip al cliente"
echo ""
echo "  3. En Windows, descomprimir y ejecutar:"
echo "     start-caja.bat    (para la caja)"
echo "     start-admin.bat   (para el admin)"
echo ""
echo "========================================="
