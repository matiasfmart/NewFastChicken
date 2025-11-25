@echo off
REM ============================================================
REM FastChicken - Launcher para Windows
REM ============================================================
REM Este script descarga y ejecuta la aplicación FastChicken
REM usando Docker
REM ============================================================

setlocal EnableDelayedExpansion

REM Configuración
set IMAGE_NAME=tuusuario/fastchicken-app
set CONTAINER_NAME=fastchicken
set PORT=3000

echo ============================================================
echo    FastChicken - Iniciando Aplicacion
echo ============================================================
echo.

REM Verificar si Docker está instalado
echo [1/5] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta instalado.
    echo.
    echo Por favor instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)
echo [OK] Docker instalado correctamente
echo.

REM Verificar si Docker está corriendo
echo [2/5] Verificando que Docker este corriendo...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta corriendo.
    echo.
    echo Por favor inicia Docker Desktop y ejecuta este script nuevamente.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker esta corriendo
echo.

REM Detener y eliminar contenedor existente si existe
echo [3/5] Verificando contenedores existentes...
docker ps -a --format "{{.Names}}" | findstr /x "%CONTAINER_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Deteniendo contenedor existente...
    docker stop %CONTAINER_NAME% >nul 2>&1
    docker rm %CONTAINER_NAME% >nul 2>&1
    echo [OK] Contenedor anterior eliminado
) else (
    echo [OK] No hay contenedores anteriores
)
echo.

REM Descargar la última versión
echo [4/5] Descargando ultima version de FastChicken...
echo Esto puede tomar unos minutos la primera vez...
echo.
docker pull %IMAGE_NAME%:latest
if %errorlevel% neq 0 (
    echo [ERROR] No se pudo descargar la imagen.
    echo.
    echo Verifica que:
    echo 1. Tengas conexion a internet
    echo 2. El nombre de la imagen sea correcto: %IMAGE_NAME%
    echo 3. La imagen exista en Docker Hub
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Imagen descargada correctamente
echo.

REM Iniciar el contenedor
echo [5/5] Iniciando FastChicken...
docker run -d ^
    --name %CONTAINER_NAME% ^
    -p %PORT%:3000 ^
    --restart unless-stopped ^
    %IMAGE_NAME%:latest

if %errorlevel% neq 0 (
    echo [ERROR] No se pudo iniciar el contenedor.
    echo.
    echo Verifica los logs con: docker logs %CONTAINER_NAME%
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo    FastChicken iniciado correctamente!
echo ============================================================
echo.
echo La aplicacion esta corriendo en: http://localhost:%PORT%
echo.

REM Esperar 3 segundos para que el servidor inicie
echo Esperando a que el servidor inicie...
timeout /t 3 /nobreak >nul

REM Abrir en el navegador
echo Abriendo en el navegador...
start http://localhost:%PORT%

echo.
echo ============================================================
echo Comandos utiles:
echo   - Ver logs:      docker logs -f %CONTAINER_NAME%
echo   - Detener:       docker stop %CONTAINER_NAME%
echo   - Reiniciar:     docker restart %CONTAINER_NAME%
echo   - Actualizar:    Ejecuta este script nuevamente
echo ============================================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
