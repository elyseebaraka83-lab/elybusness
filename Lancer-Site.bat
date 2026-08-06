@echo off
title ElyBusiness - Demarrage et Ouverture du Site
color 0A
echo =======================================================
echo     ElyBusiness - Redemarrage Serveur & Ouverture Site
echo =======================================================
echo.

echo [1/3] Nettoyage : Fermeture des anciens processus Node.js sur le port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Fermeture du processus PID: %%a sur le port 3000...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [2/3] Demarrage du serveur Backend (node server.js)...
start "Serveur ElyBusiness (Port 3000)" cmd /c "node server.js"

echo.
echo [3/3] Attente du lancement du serveur (2 secondes)...
timeout /t 2 /nobreak >nul

echo.
echo Ouverture de ElyBusiness dans votre navigateur web...
start http://localhost:3000

echo.
echo =======================================================
echo ✅ Serveur relance et site web ouvert avec succes !
echo =======================================================
echo.
timeout /t 3
