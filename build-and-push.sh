#!/bin/bash

##############################################################
# FastChicken - Build y Push Script para Mac M1/M2/M3
##############################################################
# Este script compila la imagen para múltiples arquitecturas
# y la sube a Docker Hub
##############################################################

set -e  # Detener en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
IMAGE_NAME="tuusuario/fastchicken-app"  # ⚠️ CAMBIA ESTO por tu usuario de Docker Hub
VERSION="latest"
PLATFORMS="linux/amd64,linux/arm64"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}   FastChicken - Build & Push Multiplataforma${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Verificar que el usuario cambió el nombre de la imagen
if [[ "$IMAGE_NAME" == "tuusuario/fastchicken-app" ]]; then
    echo -e "${RED}[ERROR] Debes cambiar 'tuusuario' en la línea 14 del script${NC}"
    echo -e "${YELLOW}Edita este archivo y reemplaza 'tuusuario' con tu usuario de Docker Hub${NC}"
    exit 1
fi

# Verificar que Docker está instalado
echo -e "${BLUE}[1/6]${NC} Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker instalado${NC}"
echo ""

# Verificar que Docker está corriendo
echo -e "${BLUE}[2/6]${NC} Verificando que Docker esté corriendo..."
if ! docker info &> /dev/null; then
    echo -e "${RED}[ERROR] Docker no está corriendo${NC}"
    echo -e "${YELLOW}Inicia Docker Desktop y ejecuta este script nuevamente${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker corriendo${NC}"
echo ""

# Verificar login en Docker Hub
echo -e "${BLUE}[3/6]${NC} Verificando login en Docker Hub..."
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️  No has iniciado sesión en Docker Hub${NC}"
    echo -e "${YELLOW}Ejecutando: docker login${NC}"
    echo ""
    docker login
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Falló el login en Docker Hub${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Sesión iniciada en Docker Hub${NC}"
echo ""

# Verificar que buildx está disponible
echo -e "${BLUE}[4/6]${NC} Verificando Docker Buildx..."
if ! docker buildx version &> /dev/null; then
    echo -e "${RED}[ERROR] Docker Buildx no está disponible${NC}"
    echo -e "${YELLOW}Actualiza Docker Desktop a la última versión${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Buildx disponible${NC}"
echo ""

# Crear builder si no existe
echo -e "${BLUE}[5/6]${NC} Configurando builder multiplataforma..."
if ! docker buildx inspect multiplatform-builder &> /dev/null; then
    echo "Creando builder 'multiplatform-builder'..."
    docker buildx create --name multiplatform-builder --use
    docker buildx inspect --bootstrap
else
    echo "Usando builder existente 'multiplatform-builder'..."
    docker buildx use multiplatform-builder
fi
echo -e "${GREEN}✓ Builder configurado${NC}"
echo ""

# Build y Push
echo -e "${BLUE}[6/6]${NC} Compilando y subiendo imagen..."
echo ""
echo -e "${YELLOW}Imagen:${NC}       $IMAGE_NAME:$VERSION"
echo -e "${YELLOW}Plataformas:${NC}  $PLATFORMS"
echo ""
echo -e "${YELLOW}Esto puede tomar varios minutos...${NC}"
echo ""

docker buildx build \
    --platform $PLATFORMS \
    -t $IMAGE_NAME:$VERSION \
    --push \
    .

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERROR] Falló el build/push${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}   ✓ Build y Push Completado Exitosamente${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "${BLUE}Imagen:${NC} $IMAGE_NAME:$VERSION"
echo ""
echo -e "${YELLOW}Verificar arquitecturas:${NC}"
echo "  docker buildx imagetools inspect $IMAGE_NAME:$VERSION"
echo ""
echo -e "${YELLOW}Próximos pasos en Windows:${NC}"
echo "  1. docker pull $IMAGE_NAME:$VERSION"
echo "  2. docker run -d -p 3000:3000 $IMAGE_NAME:$VERSION"
echo "  3. O usa el script start-fastchicken.bat"
echo ""
echo -e "${GREEN}¡Listo para desplegar!${NC}"
echo ""
