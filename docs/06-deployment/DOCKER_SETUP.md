# Configuración Docker - FastChicken

Este documento explica cómo usar Docker con el proyecto FastChicken, donde el `.env` **se compila dentro de la imagen**.

## 📋 Prerequisitos

- Docker instalado
- Docker Compose instalado
- Archivo `.env` configurado en el proyecto

## ⚠️ IMPORTANTE: Seguridad

El archivo `.env` se compila **DENTRO** de la imagen Docker. Esto significa que cualquiera que tenga acceso a la imagen podrá ver las variables de entorno.

### Consideraciones de Seguridad con MongoDB Atlas

**Si usas MongoDB Atlas con IP Whitelisting:**

✅ **Es ACEPTABLE usar repositorio PÚBLICO** porque:
- MongoDB Atlas requiere que apruebes las IPs que pueden conectarse
- Incluso si alguien tiene las credenciales, no podrá conectarse sin una IP aprobada
- Esto agrega una capa extra de seguridad

⚠️ **Sin embargo, considera:**
- Se expone el nombre del cluster, base de datos y usuario
- Se expone información sobre tu arquitectura tecnológica
- Si hay otras API keys o secretos en el `.env`, estos también se exponen

**Recomendaciones según tu caso:**

**Repositorio PÚBLICO - Seguro si:**
- ✅ Solo hay credenciales de MongoDB con IP whitelisting estricto
- ✅ El usuario de MongoDB tiene permisos LIMITADOS (solo read/write a esa DB, no admin)
- ✅ No hay otras variables sensibles (API keys, secrets de terceros)
- ✅ Es un proyecto personal o educativo

**Repositorio PRIVADO - Recomendado si:**
- ✅ Es un proyecto comercial o empresarial
- ✅ Hay otras API keys o secretos en el `.env`
- ✅ Quieres control total sobre quién accede a la imagen
- ✅ Necesitas cumplir con políticas de seguridad empresariales

### Mejores Prácticas Generales

**MongoDB:**
- ✅ Crea un usuario de DB con permisos MÍNIMOS necesarios
- ✅ Usa IP whitelisting estricto en MongoDB Atlas
- ✅ Usa credenciales diferentes para desarrollo/producción
- ❌ No uses el usuario admin de MongoDB en la aplicación

**Docker Hub:**
- ✅ Repositorio PRIVADO si hay datos sensibles más allá de MongoDB
- ✅ Repositorio PÚBLICO es aceptable solo con MongoDB + IP whitelisting
- ✅ Usa registros privados (AWS ECR, Google GCR, Azure ACR) para producción empresarial

## 🔧 Configuración

### 1. Archivo .env Incluido

El `.env` debe estar en la raíz del proyecto. Se compilará automáticamente en la imagen durante el build.

**Estructura del proyecto:**
```
/NewFastChicken/
├── Dockerfile
├── docker-compose.yml
├── .env              ← Se incluye en la imagen
├── src/
└── ...
```

### 2. Variables de Entorno Requeridas

Tu `.env` debe contener:

```bash
# MongoDB
MONGODB_USER=tu_usuario
MONGODB_PASSWORD=tu_password
MONGODB_CLUSTER_URL=tu_cluster.mongodb.net
MONGODB_DB_NAME=fastchicken

# Opcional: MongoDB Local
# MONGODB_URI=mongodb://localhost:27017
```

## 🚀 Uso Local

### Opción A: Docker Compose (Recomendado)

```bash
# 1. Construir la imagen
docker-compose build

# 2. Iniciar el contenedor
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Detener
docker-compose down
```

### Opción B: Docker CLI

```bash
# 1. Construir la imagen
docker build -t fastchicken-app .

# 2. Ejecutar
docker run -d \
  --name fastchicken \
  -p 3000:3000 \
  fastchicken-app

# 3. Ver logs
docker logs -f fastchicken

# 4. Detener
docker stop fastchicken
docker rm fastchicken
```

## 🔍 Verificación

```bash
# Verificar que el contenedor está corriendo
docker ps

# Acceder a la aplicación
curl http://localhost:3000

# O abrir en el navegador
open http://localhost:3000

# Ver logs en tiempo real
docker logs -f fastchicken-app
```

## 📦 Construcción y Distribución

### Construir con Tag Específico

```bash
# Con versión
docker build -t fastchicken-app:1.0.0 .

# Con usuario de Docker Hub
docker build -t tuusuario/fastchicken-app:latest .
```

### Subir a Docker Hub

```bash
# 1. Login
docker login

# 2. Tag la imagen
docker tag fastchicken-app:latest tuusuario/fastchicken-app:latest

# 3. Push
docker push tuusuario/fastchicken-app:latest
```

**Ver la guía completa:** [DOCKER_IMAGE_MANAGEMENT.md](DOCKER_IMAGE_MANAGEMENT.md)

## 🔄 Actualización del .env

Si cambias el archivo `.env`, debes **reconstruir** la imagen:

```bash
# 1. Editar el .env
nano .env

# 2. Reconstruir SIN cache
docker-compose build --no-cache

# 3. Reiniciar
docker-compose down
docker-compose up -d
```

O con Docker CLI:

```bash
# 1. Reconstruir
docker build --no-cache -t fastchicken-app .

# 2. Detener y eliminar el contenedor anterior
docker stop fastchicken
docker rm fastchicken

# 3. Iniciar con la nueva imagen
docker run -d --name fastchicken -p 3000:3000 fastchicken-app
```

## 🛠️ Solución de Problemas

### El contenedor no inicia

```bash
# Ver logs detallados
docker logs fastchicken-app

# Ver errores de build
docker-compose build --no-cache
```

### Variables de entorno no se cargan

```bash
# Verificar que el .env está en la imagen
docker exec fastchicken-app cat .env

# Verificar variables de entorno
docker exec fastchicken-app env | grep MONGODB
```

### Cambios en .env no se reflejan

```bash
# IMPORTANTE: Debes reconstruir la imagen
docker-compose build --no-cache
docker-compose down
docker-compose up -d
```

## 📊 Comandos Útiles

```bash
# Ver todas las imágenes
docker images

# Ver espacio usado
docker system df

# Limpiar imágenes antiguas
docker image prune -a

# Ver uso de recursos
docker stats fastchicken-app

# Acceder al shell del contenedor
docker exec -it fastchicken-app sh

# Copiar archivo desde el contenedor
docker cp fastchicken-app:/app/.env ./env-backup
```

## 🌐 Despliegue en Producción

### Opción 1: Con Imagen Privada

```bash
# En tu máquina de desarrollo
docker build -t tuusuario/fastchicken-app:1.0.0 .
docker push tuusuario/fastchicken-app:1.0.0

# En el servidor de producción
docker pull tuusuario/fastchicken-app:1.0.0
docker run -d \
  --name fastchicken \
  -p 3000:3000 \
  --restart unless-stopped \
  tuusuario/fastchicken-app:1.0.0
```

### Opción 2: Con Variables Externas (Más Seguro)

Para producción, es mejor **NO incluir** el `.env` en la imagen. Puedes modificar el `Dockerfile` y pasar las variables en runtime:

```bash
docker run -d \
  --name fastchicken \
  -p 3000:3000 \
  -e MONGODB_USER=prod_user \
  -e MONGODB_PASSWORD=prod_password \
  -e MONGODB_CLUSTER_URL=prod.mongodb.net \
  -e MONGODB_DB_NAME=fastchicken_prod \
  --restart unless-stopped \
  tuusuario/fastchicken-app:latest
```

O con un archivo `.env` externo:

```bash
docker run -d \
  --name fastchicken \
  -p 3000:3000 \
  --env-file /ruta/segura/.env \
  --restart unless-stopped \
  tuusuario/fastchicken-app:latest
```

## 📚 Documentación Relacionada

- **[DOCKER_IMAGE_MANAGEMENT.md](DOCKER_IMAGE_MANAGEMENT.md)** - Guía completa para gestionar, subir y actualizar imágenes
- **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - Configuración de MongoDB
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Guía de migración del proyecto

## 🔐 Checklist de Seguridad

Antes de desplegar a producción:

- [ ] El repositorio Docker Hub es PRIVADO
- [ ] El `.env` no contiene credenciales de desarrollo/prueba
- [ ] Las credenciales de producción son diferentes a las de desarrollo
- [ ] Se usa HTTPS en producción
- [ ] Los puertos están correctamente configurados en el firewall
- [ ] Se tienen backups de la base de datos
- [ ] Se monitorean los logs del contenedor

## 📝 Notas Adicionales

- Puerto por defecto: **3000**
- La imagen usa Node.js 20 Alpine (ligera)
- Build multi-stage para optimizar tamaño
- Usuario no-root (`nextjs`) por seguridad
- Reinicio automático configurado
- El `.env` se copia en el stage final del build
