@echo off
title PHISHGUARD - Cybersecurity Awareness Training Platform
color 0B
echo =======================================================================
echo    PHISHGUARD - Phishing Awareness & Cybersecurity Training Platform
echo               Educational & Defensive Training Project
echo =======================================================================
echo.
echo [1/2] Checking Python runtime...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found in your system PATH.
    echo Please install Python 3.8+ to run the backend server.
    pause
    exit /b
)

echo [2/2] Launching PHISHGUARD Server (Standard Library / Zero Dependencies)...
start "" http://localhost:5000/
python app.py

pause

