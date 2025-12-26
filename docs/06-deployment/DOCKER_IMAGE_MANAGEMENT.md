# Guía de Gestión de Imágenes Docker - FastChicken

Esta guía te enseña cómo construir, subir, descargar y actualizar imágenes Docker para el proyecto FastChicken.

## 📋 Índice

- [Prerequisitos](#-prerequisitos)
- [Construir la Imagen](#-construir-la-imagen)
- [Ejecutar Localmente](#-ejecutar-localmente)
- [Subir Imagen a Docker Hub](#-subir-imagen-a-docker-hub)
- [Descargar y Usar la Imagen](#-descargar-y-usar-la-imagen)
- [Actualizar la Imagen](#-actualizar-la-imagen)
- [Versionado de Imágenes](#-versionado-de-imágenes)
- [Registros Alternativos](#-registros-alternativos)
- [Comandos Útiles](#-comandos-útiles)

---

## 🔧 Prerequisitos

1. **Docker instalado:**
   ```bash
   docker --version
   ```

2. **Cuenta en Docker Hub** (o registro alternativo):
   - Crear cuenta en: https://hub.docker.com

3. **Login en Docker:**
   ```bash
   docker login
   # Ingresa tu usuario y contraseña de Docker Hub
   ```

## 💻 Compatibilidad Multiplataforma

### ⚠️ IMPORTANTE: Mac M1/M2/M3 → Windows

**Si compilas en Mac con Apple Silicon (M1/M2/M3) y ejecutas en Windows, DEBES usar build multiplataforma.**

**El problema:**
- Mac M1/M2/M3 usa arquitectura **ARM64**
- Windows usa arquitectura **AMD64 (x86_64)**
- Si construyes solo para ARM64, NO funcionará en Windows

**La solución: Docker Buildx**

Docker Buildx te permite construir imágenes para múltiples arquitecturas simultáneamente.

### 🔧 Configuración Inicial (Solo Una Vez)

```bash
# 1. Verificar que buildx está disponible (viene incluido en Docker Desktop)
docker buildx version

# 2. Crear un builder multiplataforma
docker buildx create --name multiplatform-builder --use

# 3. Iniciar el builder
docker buildx inspect --bootstrap
```

### 🏗️ Build Correcto para Mac M1 → Windows

**Opción 1: Build y Push en un Solo Comando (RECOMENDADO)**

```bash
# Build para ARM64 (Mac) y AMD64 (Windows/Linux) y push automático
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t tuusuario/fastchicken-app:latest \
  --push \
  .
```

**Opción 2: Build Solo para Windows (AMD64)**

Si solo necesitas que funcione en Windows:

```bash
# Build solo para AMD64 (Windows/Linux Intel)
docker buildx build \
  --platform linux/amd64 \
  -t tuusuario/fastchicken-app:latest \
  --push \
  .
```

**Opción 3: Build Local + Push Manual**

```bash
# Build multiplataforma
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t tuusuario/fastchicken-app:latest \
  --load \
  .

# Push manual
docker push tuusuario/fastchicken-app:latest
```

**Nota:** `--load` solo funciona con una plataforma. Para múltiples plataformas, usa `--push` directamente.

### 📋 Workflow Recomendado: Mac M1 → Windows

```bash
# === EN MAC M1/M2/M3 (Desarrollo) ===

# 1. Build multiplataforma y push automático
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t tuusuario/fastchicken-app:latest \
  --push \
  .

# === EN WINDOWS (Producción) ===

# 2. Pull (descargará automáticamente la versión AMD64)
docker pull tuusuario/fastchicken-app:latest

# 3. Run
docker run -d -p 3000:3000 tuusuario/fastchicken-app:latest

# O usar el script start-fastchicken.bat
```

### 🔍 Verificar Arquitecturas Soportadas

```bash
# Ver qué arquitecturas tiene tu imagen
docker buildx imagetools inspect tuusuario/fastchicken-app:latest
```

Deberías ver algo como:
```
MediaType: application/vnd.docker.distribution.manifest.list.v2+json
Digest:    sha256:...

Manifests:
  Name:      tuusuario/fastchicken-app:latest
  MediaType: application/vnd.docker.distribution.manifest.v2+json
  Platform:  linux/amd64    ← Para Windows/Linux Intel

  Name:      tuusuario/fastchicken-app:latest
  MediaType: application/vnd.docker.distribution.manifest.v2+json
  Platform:  linux/arm64    ← Para Mac M1/M2/M3
```

### ⚙️ Compatibilidad según Sistema

| Desde (Build)     | Hacia (Run)       | Comando Necesario                                    |
|-------------------|-------------------|------------------------------------------------------|
| Mac Intel         | Windows/Linux     | `docker build` normal                                |
| Mac M1/M2/M3      | Windows/Linux     | `docker buildx build --platform linux/amd64,linux/arm64` |
| Windows           | Mac/Linux         | `docker build` normal                                |
| Linux             | Mac/Windows       | `docker build` normal                                |

---

## 🏗️ Construir la Imagen

### 1. Construcción Básica

```bash
# Desde la raíz del proyecto
docker build -t fastchicken-app .
```

### 2. Construcción con Tag Específico

```bash
# Con versión específica
docker build -t fastchicken-app:1.0.0 .

# Con múltiples tags
docker build -t fastchicken-app:latest -t fastchicken-app:1.0.0 .
```

### 3. Construcción con tu Usuario de Docker Hub

```bash
# Reemplaza 'tuusuario' con tu usuario de Docker Hub
docker build -t tuusuario/fastchicken-app:latest .
```

### 4. Construcción sin Cache (Forzar Rebuild)

```bash
docker build --no-cache -t fastchicken-app:latest .
```

---

## 🚀 Ejecutar Localmente

### Prueba la imagen antes de subirla:

```bash
# Ejecutar en primer plano
docker run -p 3000:3000 fastchicken-app:latest

# Ejecutar en segundo plano
docker run -d -p 3000:3000 --name fastchicken fastchicken-app:latest

# Verificar que funciona
curl http://localhost:3000
```

---

## ☁️ Subir Imagen a Docker Hub

### 1. Tag con tu Usuario

```bash
# Si no lo hiciste en el build, tagea la imagen
docker tag fastchicken-app:latest tuusuario/fastchicken-app:latest

# También puedes crear tags con versiones
docker tag fastchicken-app:latest tuusuario/fastchicken-app:1.0.0
```

### 2. Push a Docker Hub

```bash
# Subir la versión latest
docker push tuusuario/fastchicken-app:latest

# Subir una versión específica
docker push tuusuario/fastchicken-app:1.0.0

# Subir todas las versiones
docker push tuusuario/fastchicken-app --all-tags
```

### 3. Verificar en Docker Hub

- Ve a: `https://hub.docker.com/r/tuusuario/fastchicken-app`
- Deberías ver tu imagen listada

---

## 📥 Descargar y Usar la Imagen

### En Otra Máquina o Servidor

```bash
# 1. Pull de la imagen
docker pull tuusuario/fastchicken-app:latest

# 2. Ejecutar el contenedor
docker run -d \
  --name fastchicken \
  -p 3000:3000 \
  --restart unless-stopped \
  tuusuario/fastchicken-app:latest

# 3. Verificar que está corriendo
docker ps

# 4. Ver logs
docker logs -f fastchicken
```

### Usando Docker Compose

Crea un `docker-compose.yml` simplificado:

```yaml
version: '3.8'

services:
  fastchicken:
    image: tuusuario/fastchicken-app:latest
    container_name: fastchicken-app
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Luego ejecuta:
```bash
docker-compose up -d
```

---

## 🔄 Actualizar la Imagen

### Proceso Completo de Actualización

#### 1. **Hacer Cambios en el Código**

```bash
# Edita tus archivos
# Actualiza el .env si es necesario
git add .
git commit -m "feat: nuevas funcionalidades"
```

#### 2. **Reconstruir la Imagen con Nueva Versión**

```bash
# ⚠️ IMPORTANTE: Si cambiaste el .env, DEBES reconstruir la imagen
# El .env está compilado DENTRO de la imagen Docker, no se lee en runtime

# Si estás en Mac M1/M2/M3 y vas a Windows:
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t tuusuario/fastchicken-app:1.1.0 \
  -t tuusuario/fastchicken-app:latest \
  --push \
  .

# Si NO necesitas multiplataforma:
docker build -t tuusuario/fastchicken-app:1.1.0 -t tuusuario/fastchicken-app:latest .
```

#### 3. **Subir la Nueva Versión**

```bash
# Push ambos tags
docker push tuusuario/fastchicken-app:1.1.0
docker push tuusuario/fastchicken-app:latest
```

#### 4. **Actualizar en el Servidor**

```bash
# En el servidor/máquina de producción

# Detener el contenedor actual
docker stop fastchicken

# Eliminar el contenedor (no la imagen)
docker rm fastchicken

# Pull de la nueva versión
docker pull tuusuario/fastchicken-app:latest

# Iniciar con la nueva imagen
docker run -d \
  --name fastchicken \
  -p 3000:3000 \
  --restart unless-stopped \
  tuusuario/fastchicken-app:latest

# O si usas docker-compose
docker-compose pull
docker-compose up -d
```

#### 5. **Limpieza de Imágenes Antiguas**

```bash
# Ver imágenes antiguas
docker images

# Eliminar imágenes sin tag
docker image prune -a

# O eliminar una versión específica
docker rmi tuusuario/fastchicken-app:1.0.0
```

---

## 🏷️ Versionado de Imágenes

### Estrategia de Versionado (Semantic Versioning)

```bash
# Desarrollo
docker build -t tuusuario/fastchicken-app:dev .

# Release candidates
docker build -t tuusuario/fastchicken-app:1.0.0-rc1 .

# Versiones estables
docker build -t tuusuario/fastchicken-app:1.0.0 .

# Latest (siempre apunta a la última estable)
docker build -t tuusuario/fastchicken-app:latest .
```

### Mejores Prácticas

1. **Siempre usa versiones específicas en producción:**
   ```yaml
   # Bien ✅
   image: tuusuario/fastchicken-app:1.2.0

   # Evita en producción ⚠️
   image: tuusuario/fastchicken-app:latest
   ```

2. **Mantén múltiples tags:**
   ```bash
   docker build \
     -t tuusuario/fastchicken-app:1.2.0 \
     -t tuusuario/fastchicken-app:1.2 \
     -t tuusuario/fastchicken-app:1 \
     -t tuusuario/fastchicken-app:latest \
     .
   ```

---

## 🗄️ Registros Alternativos

### GitHub Container Registry (ghcr.io)

```bash
# 1. Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 2. Build y tag
docker build -t ghcr.io/tuusuario/fastchicken-app:latest .

# 3. Push
docker push ghcr.io/tuusuario/fastchicken-app:latest
```

### Google Container Registry (gcr.io)

```bash
# 1. Configurar gcloud
gcloud auth configure-docker

# 2. Build y tag
docker build -t gcr.io/proyecto-id/fastchicken-app:latest .

# 3. Push
docker push gcr.io/proyecto-id/fastchicken-app:latest
```

### AWS ECR

```bash
# 1. Login
aws ecr get-login-password --region region | docker login --username AWS --password-stdin aws_account_id.dkr.ecr.region.amazonaws.com

# 2. Build y tag
docker build -t aws_account_id.dkr.ecr.region.amazonaws.com/fastchicken-app:latest .

# 3. Push
docker push aws_account_id.dkr.ecr.region.amazonaws.com/fastchicken-app:latest
```

---

## 🛠️ Comandos Útiles

### Gestión de Imágenes

```bash
# Ver todas las imágenes locales
docker images

# Ver el tamaño de las imágenes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Buscar imágenes en Docker Hub
docker search fastchicken

# Inspeccionar una imagen
docker inspect tuusuario/fastchicken-app:latest

# Ver el historial de capas de la imagen
docker history tuusuario/fastchicken-app:latest

# Eliminar una imagen específica
docker rmi tuusuario/fastchicken-app:1.0.0

# Eliminar todas las imágenes sin usar
docker image prune -a

# Eliminar todo (imágenes, contenedores, volúmenes, redes)
docker system prune -a --volumes
```

### Gestión de Contenedores

```bash
# Ver contenedores en ejecución
docker ps

# Ver todos los contenedores (incluidos detenidos)
docker ps -a

# Detener un contenedor
docker stop fastchicken

# Iniciar un contenedor detenido
docker start fastchicken

# Reiniciar un contenedor
docker restart fastchicken

# Ver logs en tiempo real
docker logs -f fastchicken

# Ver últimas 100 líneas de logs
docker logs --tail 100 fastchicken

# Ejecutar comando dentro del contenedor
docker exec -it fastchicken sh

# Ver estadísticas de uso
docker stats fastchicken

# Copiar archivos desde/hacia el contenedor
docker cp archivo.txt fastchicken:/app/
docker cp fastchicken:/app/archivo.txt .
```

### Información y Debugging

```bash
# Ver espacio usado por Docker
docker system df

# Ver configuración del Docker daemon
docker info

# Ver eventos de Docker en tiempo real
docker events

# Ver procesos corriendo en un contenedor
docker top fastchicken

# Ver puertos mapeados
docker port fastchicken
```

---

## 📝 Workflow Completo - Ejemplo Práctico

### Escenario: Nueva Feature → Producción (Mac M1 → Windows)

```bash
# === DESARROLLO EN MAC M1 ===
# 1. Desarrollar nueva feature
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...

# 2. Actualizar .env si es necesario
nano .env

# 3. Probar localmente
npm run dev

# 4. Commit
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 5. Merge a main
git checkout main
git merge feature/nueva-funcionalidad

# === BUILD Y PUBLISH (MÉTODO FÁCIL) ===
# 6. Usar el script automático
./build-and-push.sh

# === BUILD Y PUBLISH (MÉTODO MANUAL) ===
# 6a. Construir imagen multiplataforma con nueva versión
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t tuusuario/fastchicken-app:1.2.0 \
  -t tuusuario/fastchicken-app:latest \
  --push \
  .

# 7. Verificar arquitecturas
docker buildx imagetools inspect tuusuario/fastchicken-app:latest

# === DEPLOY EN WINDOWS (Producción) ===
# 8. En Windows, ejecutar start-fastchicken.bat
# El script automáticamente:
#    - Descarga la versión AMD64 correcta
#    - Detiene versión anterior
#    - Inicia la nueva versión
#    - Abre el navegador

# O manualmente en Windows:
# docker pull tuusuario/fastchicken-app:latest
# docker stop fastchicken
# docker rm fastchicken
# docker run -d --name fastchicken -p 3000:3000 tuusuario/fastchicken-app:latest

# 9. Verificar en Windows
# docker logs -f fastchicken
# Abrir http://localhost:3000

# 10. Limpieza en Windows
# docker image prune -a
```

---

## 🚨 Problemas Comunes

### "Cambié las credenciales de MongoDB en Atlas pero la app sigue funcionando"

**Esto es NORMAL y esperado** con esta configuración de Docker.

**¿Por qué pasa esto?**
- El archivo `.env` está **compilado DENTRO de la imagen Docker** durante el build
- Cuando ejecutas la imagen, usa las credenciales que tenía el `.env` en el momento de construir la imagen
- Los cambios en Atlas no afectan a las credenciales almacenadas en la imagen

**Solución:**
1. Actualiza tu archivo `.env` local con las nuevas credenciales
2. **Reconstruye la imagen Docker**:
   ```bash
   # Mac M1/M2/M3 → Windows
   docker buildx build \
     --platform linux/amd64,linux/arm64 \
     -t tuusuario/fastchicken-app:latest \
     --push \
     .

   # Build normal
   docker build -t tuusuario/fastchicken-app:latest .
   ```
3. Si ya hiciste push, actualiza en Windows:
   ```bash
   docker pull tuusuario/fastchicken-app:latest
   docker stop fastchicken && docker rm fastchicken
   docker run -d -p 3000:3000 --name fastchicken tuusuario/fastchicken-app:latest
   ```

**Cuándo DEBES reconstruir la imagen:**
- ✅ Cambios en `.env` (credenciales, URLs, configuración)
- ✅ Cambios en código fuente
- ✅ Cambios en dependencias (`package.json`)
- ✅ Cambios en configuración de Next.js

### "La app no se conecta a MongoDB después de rebuild"

**Verificaciones:**
1. ¿El `.env` tiene las credenciales correctas?
   ```bash
   cat .env | grep MONGODB
   ```

2. ¿Las credenciales en Atlas coinciden con el `.env`?

3. ¿Reconstruiste la imagen DESPUÉS de actualizar el `.env`?

4. ¿Hiciste pull de la nueva imagen en Windows?
   ```bash
   docker pull tuusuario/fastchicken-app:latest
   ```

---

## ⚠️ Seguridad y Mejores Prácticas

### ⚠️ IMPORTANTE: .env en la Imagen

```bash
# El .env está compilado DENTRO de la imagen
# NUNCA subas imágenes con datos sensibles a registros públicos

# Opciones seguras:
1. Usar Docker Hub PRIVADO
2. Usar registros privados (ECR, GCR, ACR)
3. Cambiar a variables de entorno en runtime para producción
```

### Hacer tu Repositorio Privado en Docker Hub

1. Ve a Docker Hub → Repositories
2. Selecciona tu repositorio
3. Settings → Make Private

### Usar Variables de Entorno en Runtime

Para producción, considera cambiar el Dockerfile para NO incluir .env:

```bash
# Pasar variables al ejecutar
docker run -d \
  -e MONGODB_USER=prod_user \
  -e MONGODB_PASSWORD=prod_pass \
  -e MONGODB_CLUSTER_URL=prod.mongodb.net \
  -e MONGODB_DB_NAME=fastchicken_prod \
  tuusuario/fastchicken-app:latest
```

---

## 🎯 Resumen Quick Reference

### Para Mac M1/M2/M3 (Desarrollo)

```bash
# === CONFIGURACIÓN INICIAL (Solo una vez) ===
docker buildx create --name multiplatform-builder --use
docker buildx inspect --bootstrap

# === BUILD Y PUSH MULTIPLATAFORMA (Método Fácil) ===
./build-and-push.sh

# === BUILD Y PUSH MANUAL ===
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t usuario/app:latest \
  --push \
  .

# === VERIFICAR ARQUITECTURAS ===
docker buildx imagetools inspect usuario/app:latest

# === ACTUALIZAR VERSIÓN ===
# 1. Edita build-and-push.sh y cambia VERSION="1.2.0"
# 2. ./build-and-push.sh
# O manualmente:
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t usuario/app:1.2.0 \
  -t usuario/app:latest \
  --push \
  .
```

### Para Windows (Producción)

```cmd
REM === PRIMERA VEZ ===
1. Editar start-fastchicken.bat (cambiar "tuusuario")
2. Doble click en start-fastchicken.bat
3. Listo!

REM === ACTUALIZAR ===
Doble click en start-fastchicken.bat

REM === COMANDOS MANUALES ===
docker pull usuario/app:latest
docker stop fastchicken && docker rm fastchicken
docker run -d -p 3000:3000 --name fastchicken usuario/app:latest

REM === VERIFICAR ===
docker ps
docker logs -f fastchicken

REM === LIMPIEZA ===
docker image prune -a
docker system prune -a
```

### Comandos Generales

```bash
# Ver imágenes
docker images

# Ver contenedores corriendo
docker ps

# Ver logs
docker logs -f nombre-contenedor

# Detener contenedor
docker stop nombre-contenedor

# Eliminar contenedor
docker rm nombre-contenedor

# Eliminar imagen
docker rmi usuario/app:version

# Limpiar todo
docker system prune -a --volumes
```
