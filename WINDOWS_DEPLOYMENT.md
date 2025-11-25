# Despliegue en Windows - FastChicken

Guía para usuarios finales de Windows que necesitan ejecutar la aplicación FastChicken.

## 📋 Prerequisitos (Solo Primera Vez)

### 1. Instalar Docker Desktop

1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Ejecuta el instalador
3. Reinicia la computadora si es necesario
4. Abre Docker Desktop y espera a que inicie completamente

**Verificar instalación:**
```cmd
docker --version
```

Deberías ver algo como: `Docker version 24.x.x`

---

## 🚀 Iniciar la Aplicación (Método Fácil)

### Opción 1: Usando el Script Automático (RECOMENDADO)

1. **Descarga el archivo `start-fastchicken.bat`** a tu computadora

2. **IMPORTANTE: Edita el archivo** antes de ejecutarlo:
   - Click derecho → "Editar" o "Editar con Notepad"
   - Busca la línea que dice: `set IMAGE_NAME=tuusuario/fastchicken-app`
   - Reemplaza `tuusuario` con el nombre real de usuario de Docker Hub
   - Guarda y cierra

3. **Doble click en `start-fastchicken.bat`**

4. **El script automáticamente:**
   - ✅ Verifica que Docker esté instalado
   - ✅ Verifica que Docker esté corriendo
   - ✅ Descarga la última versión de la aplicación
   - ✅ Detiene versiones anteriores si existen
   - ✅ Inicia la aplicación
   - ✅ Abre el navegador en http://localhost:3000

5. **¡Listo!** La aplicación se abrirá automáticamente en tu navegador

---

## 🛠️ Iniciar Manualmente (Método Avanzado)

Si prefieres hacerlo manualmente, sigue estos pasos:

### 1. Abrir PowerShell o CMD

Presiona `Win + R`, escribe `cmd` y presiona Enter

### 2. Descargar la Última Versión

```cmd
docker pull tuusuario/fastchicken-app:latest
```

**Nota:** Reemplaza `tuusuario` con el nombre real del usuario de Docker Hub

### 3. Detener Versión Anterior (si existe)

```cmd
docker stop fastchicken
docker rm fastchicken
```

### 4. Iniciar la Aplicación

```cmd
docker run -d --name fastchicken -p 3000:3000 --restart unless-stopped tuusuario/fastchicken-app:latest
```

### 5. Abrir en el Navegador

Abre tu navegador y ve a: http://localhost:3000

---

## 🔄 Actualizar a la Última Versión

### Usando el Script (Fácil)

Simplemente **ejecuta `start-fastchicken.bat` nuevamente**. El script automáticamente:
- Descarga la última versión
- Detiene la versión anterior
- Inicia la nueva versión

### Manualmente

```cmd
REM 1. Detener la aplicación
docker stop fastchicken
docker rm fastchicken

REM 2. Descargar última versión
docker pull tuusuario/fastchicken-app:latest

REM 3. Iniciar nuevamente
docker run -d --name fastchicken -p 3000:3000 --restart unless-stopped tuusuario/fastchicken-app:latest
```

---

## 📊 Comandos Útiles

### Ver si la Aplicación Está Corriendo

```cmd
docker ps
```

Deberías ver `fastchicken` en la lista.

### Ver Logs de la Aplicación

```cmd
docker logs fastchicken
```

Ver logs en tiempo real:
```cmd
docker logs -f fastchicken
```

Presiona `Ctrl + C` para salir.

### Detener la Aplicación

```cmd
docker stop fastchicken
```

### Iniciar la Aplicación (ya descargada)

```cmd
docker start fastchicken
```

### Reiniciar la Aplicación

```cmd
docker restart fastchicken
```

### Eliminar la Aplicación Completamente

```cmd
docker stop fastchicken
docker rm fastchicken
docker rmi tuusuario/fastchicken-app
```

---

## 🛡️ Solución de Problemas

### "Docker no está instalado"

**Solución:**
1. Instala Docker Desktop: https://www.docker.com/products/docker-desktop
2. Reinicia tu PC
3. Ejecuta el script nuevamente

### "Docker no está corriendo"

**Solución:**
1. Busca "Docker Desktop" en el menú inicio
2. Ábrelo y espera a que inicie (ícono de Docker en la bandeja del sistema)
3. Ejecuta el script nuevamente

### "No se puede conectar al puerto 3000"

**El puerto 3000 ya está en uso.**

**Solución 1:** Detén la aplicación que usa el puerto 3000

**Solución 2:** Usa otro puerto:
```cmd
docker run -d --name fastchicken -p 8080:3000 tuusuario/fastchicken-app:latest
```

Luego abre: http://localhost:8080

### "La aplicación no carga / Página en blanco"

**Solución:**
1. Espera 10-15 segundos más (el servidor puede tardar en iniciar)
2. Verifica los logs:
   ```cmd
   docker logs fastchicken
   ```
3. Si hay errores, detén y reinicia:
   ```cmd
   docker stop fastchicken
   docker rm fastchicken
   ```
   Luego ejecuta el script nuevamente

### "Error al descargar la imagen"

**Posibles causas:**
1. **No hay internet:** Verifica tu conexión
2. **Nombre incorrecto:** Asegúrate de usar el nombre correcto de la imagen
3. **Imagen no existe:** Contacta al desarrollador para verificar que la imagen esté publicada

### La aplicación se cierra sola

**Solución:**
```cmd
REM Ver por qué se cerró
docker logs fastchicken

REM Reiniciar
docker start fastchicken
```

---

## 🔧 Configuración Avanzada

### Cambiar el Puerto

Si el puerto 3000 no está disponible:

**En el script `.bat`:**
```bat
set PORT=8080
```

**Manualmente:**
```cmd
docker run -d --name fastchicken -p 8080:3000 tuusuario/fastchicken-app:latest
```

Luego accede a: http://localhost:8080

### Iniciar Automáticamente con Windows

La opción `--restart unless-stopped` hace que Docker inicie el contenedor automáticamente cuando:
- Se reinicia la PC
- Docker Desktop se inicia
- El contenedor se cierra inesperadamente

Para desactivar el reinicio automático:
```cmd
docker update --restart no fastchicken
```

### Ver Uso de Recursos

```cmd
docker stats fastchicken
```

Presiona `Ctrl + C` para salir.

---

## 📱 Acceso desde Otros Dispositivos en la Red Local

Si quieres acceder a la aplicación desde otro dispositivo en la misma red:

1. **Obtén la IP de tu PC Windows:**
   ```cmd
   ipconfig
   ```
   Busca "Dirección IPv4", ejemplo: `192.168.1.100`

2. **Abre en otro dispositivo:**
   ```
   http://192.168.1.100:3000
   ```

**Nota:** Asegúrate de que el Firewall de Windows permita conexiones en el puerto 3000.

---

## 📋 Checklist de Verificación

Antes de contactar soporte, verifica:

- [ ] Docker Desktop está instalado
- [ ] Docker Desktop está corriendo (ícono en bandeja del sistema)
- [ ] Editaste `start-fastchicken.bat` con el nombre correcto de la imagen
- [ ] El puerto 3000 no está ocupado por otra aplicación
- [ ] Tienes conexión a internet (para descargar la imagen)
- [ ] Revisaste los logs con `docker logs fastchicken`

---

## 🎯 Resumen Quick Reference

### Primera Vez
```cmd
1. Instalar Docker Desktop
2. Editar start-fastchicken.bat (cambiar "tuusuario")
3. Doble click en start-fastchicken.bat
4. Abrir http://localhost:3000
```

### Actualizar
```cmd
1. Doble click en start-fastchicken.bat
2. Esperar descarga
3. Listo!
```

### Comandos Básicos
```cmd
Ver estado:     docker ps
Ver logs:       docker logs -f fastchicken
Detener:        docker stop fastchicken
Iniciar:        docker start fastchicken
Reiniciar:      docker restart fastchicken
```

---

## 💡 Consejos

1. **Siempre usa el script `.bat`** - Es más fácil y seguro
2. **Guarda el archivo `.bat`** en un lugar accesible (Escritorio, por ejemplo)
3. **No cierres Docker Desktop** mientras uses la aplicación
4. **Para actualizar**, solo ejecuta el script nuevamente - es seguro y rápido
5. **Si algo falla**, detén todo (`docker stop fastchicken`) y ejecuta el script de nuevo

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs:**
   ```cmd
   docker logs fastchicken
   ```

2. **Copia el error** y envíalo al soporte

3. **Información útil para soporte:**
   - Versión de Docker: `docker --version`
   - Versión de Windows: `winver`
   - Logs del contenedor: `docker logs fastchicken`
   - Estado de Docker: `docker ps -a`

---

## 🎉 ¡Eso es Todo!

Con el script `start-fastchicken.bat`, actualizar y ejecutar FastChicken es tan simple como **hacer doble click**.

**La aplicación se abrirá automáticamente en tu navegador** cada vez que ejecutes el script.
