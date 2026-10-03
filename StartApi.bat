@echo off
title GigRadar REST API Backend (Port 5555)
echo ========================================================
echo   GIGRADAR REST API SERVER (Port 5555)
echo ========================================================
echo.

cd /d "%~dp0GigRadarApi"

REM 1. Cek apakah dotnet SDK terpasang
where dotnet >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] .NET SDK terdeteksi. Menjalankan C# ASP.NET Core Web API...
    start http://localhost:5555/swagger
    dotnet run --urls "http://0.0.0.0:5555"
    goto :done
)

REM 2. Cek apakah Node.js terpasang
set "NODE_CMD="
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "NODE_CMD=node"
) else (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    )
)

if defined NODE_CMD (
    echo [INFO] .NET SDK belum terpasang di komputer ini.
    echo [OK] Menjalankan GigRadar REST API Engine via Node.js di port 5555...
    echo.
    echo Membuka Swagger / Status API di browser: http://localhost:5555/swagger
    start http://localhost:5555/swagger
    "%NODE_CMD%" server.js
    goto :done
)

echo [ERROR] Baik .NET SDK maupun Node.js tidak ditemukan di sistem.
echo Silakan pasang Node.js dari https://nodejs.org/ atau .NET SDK.
echo.

:done
pause
