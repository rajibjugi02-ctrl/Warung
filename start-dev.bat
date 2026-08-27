@echo off
title Warung Jajanan Lenira
echo Starting Backend and Frontend...
start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Servers are starting!
echo Backend: http://localhost:5050
echo Frontend: http://localhost:5173
pause
