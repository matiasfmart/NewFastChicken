# Configuración de MongoDB

Este proyecto soporta tanto **MongoDB local** (para desarrollo) como **MongoDB Atlas** (cloud, para producción).

## 🏗️ Arquitectura de Conexión

La conexión a MongoDB está implementada con las siguientes características:

- ✅ **Singleton Pattern**: Reutiliza la misma conexión en desarrollo (HMR)
- ✅ **Build-time safety**: No intenta conectar durante `next build`
- ✅ **Validación de variables**: Verifica todas las variables necesarias en runtime
- ✅ **Pool de conexiones**: Optimizado para rendimiento
- ✅ **Compatibilidad Windows**: Configuración SSL/TLS ajustada

## 📋 Opción 1: MongoDB Local (Development)

### Requisitos previos:
- Tener MongoDB instalado localmente
- MongoDB corriendo en `localhost:27017`

### Configuración en `.env`:

```env
# MongoDB Local
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=fastchicken
```

### Verificar que MongoDB esté corriendo:

```bash
# En macOS/Linux con Homebrew
brew services list | grep mongodb

# O verificar directamente
mongosh --eval "db.adminCommand('ping')"
```

## ☁️ Opción 2: MongoDB Atlas (Cloud)

### Paso 1: Crear cuenta en MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (tier M0 gratuito)

### Paso 2: Configurar acceso

1. **Crear usuario de base de datos:**
   - En Atlas, ve a "Database Access"
   - Click "Add New Database User"
   - Crea un usuario con permisos de "Read and Write to any database"
   - Guarda el usuario y contraseña

2. **Configurar IP whitelist:**
   - Ve a "Network Access"
   - Click "Add IP Address"
   - Para desarrollo: permite todas las IPs (`0.0.0.0/0`)
   - Para producción: solo IPs específicas

### Paso 3: Obtener cadena de conexión

1. En tu cluster, click "Connect"
2. Selecciona "Connect your application"
3. Copia la cadena de conexión:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Paso 4: Configurar variables de entorno

En tu archivo `.env`, **comenta la configuración local** y agrega:

```env
# MongoDB Atlas (Cloud)
MONGODB_USER=tu-usuario
MONGODB_PASSWORD=tu-password
MONGODB_CLUSTER_URL=cluster0.xxxxx.mongodb.net
MONGODB_DB_NAME=fastchicken
```

**Importante:**
- Reemplaza `tu-usuario` con tu usuario de MongoDB Atlas
- Reemplaza `tu-password` con tu contraseña
- Reemplaza `cluster0.xxxxx.mongodb.net` con tu cluster URL
- **NO incluyas** `mongodb+srv://` ni el path `/database` en estas variables

### Ejemplo completo:

Si tu cadena de conexión de Atlas es:
```
mongodb+srv://miusuario:mipassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

Tu `.env` debe quedar así:

```env
# MongoDB Atlas
MONGODB_USER=miusuario
MONGODB_PASSWORD=mipassword123
MONGODB_CLUSTER_URL=cluster0.abc123.mongodb.net
MONGODB_DB_NAME=fastchicken
```

## 🔄 Migrar datos de Local a Atlas

Si ya tienes datos en MongoDB local y quieres migrarlos a Atlas:

### 1. Exportar desde MongoDB local:

```bash
mongodump --uri="mongodb://localhost:27017/fastchicken" --out=./backup
```

### 2. Importar a MongoDB Atlas:

```bash
mongorestore --uri="mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/fastchicken" ./backup/fastchicken
```

**Nota:** Reemplaza `usuario`, `password` y `cluster0.xxxxx.mongodb.net` con tus credenciales reales.

## 🔧 Solución de problemas

### Error: "Invalid/Missing environment variable"

**Causa:** Falta alguna variable de entorno requerida.

**Solución:** Verifica que tengas configuradas:
- Para MongoDB local: `MONGODB_URI` y `MONGODB_DB_NAME`
- Para MongoDB Atlas: `MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_CLUSTER_URL`, y `MONGODB_DB_NAME`

### Error: "MongoServerSelectionError: connection timed out"

**Causa:** No puede conectarse a MongoDB.

**Solución:**
- **Local:** Verifica que MongoDB esté corriendo
- **Atlas:** Verifica que tu IP esté en la whitelist

### Error durante `npm run build`

**Causa:** Intentando conectar a MongoDB durante el build.

**Solución:** Este error ya está resuelto. El código detecta la fase de build y usa un cliente mock. Si persiste, verifica que `NEXT_PHASE` esté configurado correctamente.

## 📚 Archivos relevantes

- [`src/lib/mongodb-config.ts`](../src/lib/mongodb-config.ts) - Configuración y validación
- [`src/lib/mongodb.ts`](../src/lib/mongodb.ts) - Connection manager singleton
- [`.env.example`](../.env.example) - Plantilla de variables de entorno

## 🔐 Seguridad

**IMPORTANTE:**
- ❌ **NUNCA** commitees el archivo `.env` con credenciales reales
- ✅ El archivo `.env` ya está en `.gitignore`
- ✅ Usa `.env.example` como referencia sin credenciales reales
- ✅ En producción, usa variables de entorno del hosting (Vercel, etc.)
