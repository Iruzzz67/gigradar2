@echo off
REM Membangun GigRadarUI dan menyinkronkannya ke folder asset wwwroot MAUI
echo [1/2] Membangun bundel produksi GigRadarUI...
cd /d "%~dp0GigRadarUI"
call npm run build

echo [2/2] Menyinkronkan aset ke GigRadarMobile\Resources\Raw\wwwroot...
cd /d "%~dp0"
if not exist "GigRadarMobile\Resources\Raw\wwwroot" mkdir "GigRadarMobile\Resources\Raw\wwwroot"
xcopy /E /I /Y "GigRadarUI\dist\*" "GigRadarMobile\Resources\Raw\wwwroot\"

echo Selesai! Aset web siap disajikan oleh WebView .NET MAUI.
pause
