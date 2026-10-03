@echo off
title Push GigRadar v2 ke GitHub (Iruzzz67/gigradar2)
echo ========================================================
echo   PUSH GIGRADAR v2 KE GITHUB REPOSITORY
echo   Remote: https://github.com/Iruzzz67/gigradar2.git
echo   Branch: main
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Memeriksa status git...
git status --short

echo.
echo [2/2] Melakukan push ke origin main...
echo (Jika muncul jendela browser / GitHub Login, silakan klik 'Sign in' / 'Authorize')
echo.

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUKSES] Seluruh kode GigRadar v2 berhasil di-push ke GitHub!
    echo Kunjungi: https://github.com/Iruzzz67/gigradar2
) else (
    echo [INFO] Jika autentikasi belum selesai, silakan coba jalankan script ini kembali.
)

echo.
pause
