@echo off
REM Lance le backend (Flask) et le frontend (Vite) automatiquement
REM Utilisation: double-clic sur start.bat depuis la racine du projet (NEXUS/)

cd /d "%~dp0"

echo ===================================
echo   NEXUS - Demarrage Backend + Frontend
echo ===================================
echo.

REM Lancer le backend dans une nouvelle fenetre, en restant dans ce dossier
start "MatchPro - Backend (Flask)" cmd /k "cd /d "%~dp0backend" && python app.py"

REM Petite pause pour laisser le backend demarrer
timeout /t 2 /nobreak >nul

REM Lancer le frontend dans une nouvelle fenetre
start "Nexus - Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Backend  : http://localhost:5000
echo Frontend : http://localhost:5173
echo.
echo Deux fenetres viennent de s'ouvrir. Fermez-les pour arreter les serveurs.
echo Cette fenetre peut etre fermee.
pause