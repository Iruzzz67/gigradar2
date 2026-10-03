@echo off
title GigRadar v2 - Skena Music & Spatial Gig Radar (Port 3333)
echo ========================================================
echo   GIGRADAR v2 - Skena Music & Spatial Gig Radar
echo   Frontend UI & APK Simulator : Port 3333
echo ========================================================
echo.
echo Membuka GigRadar di browser: http://localhost:3333 ...
start http://localhost:3333
echo.
echo Menjalankan Vite Development Server di http://localhost:3333 ...
cd /d "%~dp0GigRadarUI"
call npm.cmd run dev
pause
