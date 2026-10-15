@echo off
title CIRCULAR - IMX26-PS07 CEDA-EPS
echo ========================================================
echo   CIRCULAR: Design Electronics for Repair & Reuse
echo   Challenge: IMX26-PS07 - CEDA-EPS
echo   Open in Browser: http://localhost:8080/
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
