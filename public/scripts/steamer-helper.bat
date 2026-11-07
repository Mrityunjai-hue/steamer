@echo off
title Steamer 1-Click Manifest Injector
echo Starting Steamer Manifest Injector...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0steamer-helper.ps1" %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Script encountered an issue. Press any key to exit.
    pause >nul
)

