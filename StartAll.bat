@echo off
title GigRadar v2 - Full Stack Launcher
echo ========================================================
echo   GIGRADAR v2 - FULL STACK LAUNCHER
echo ========================================================
echo.
echo [1/2] Menjalankan GigRadar REST API Backend (Port 5555)...
start "GigRadar REST API (Port 5555)" cmd /k "%~dp0StartApi.bat"

timeout /t 2 /nobreak >nul

echo [2/2] Menjalankan GigRadar UI Frontend (Port 3333)...
start "GigRadar UI (Port 3333)" cmd /k "%~dp0StartUI.bat"

echo.
echo ========================================================
echo   KEDUA SISTEM TELAH DILUNCURKAN!
echo   - Web UI & Simulator : http://localhost:3333
echo   - Backend REST API   : http://localhost:5555/swagger
echo ========================================================
echo.
pause
