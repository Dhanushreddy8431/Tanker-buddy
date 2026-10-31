@echo off
title Tanker Buddy - Bangalore's Clean Water Infrastructure Platform
echo ========================================================
echo   Tanker Buddy: Traceable & Softened Water Infrastructure
echo   Bengaluru Municipal Utility Platform
echo   Open in Browser: http://localhost:8080/
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
