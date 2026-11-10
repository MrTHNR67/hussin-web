@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   Siyaj  -  local server
echo ============================================
if not exist node_modules (
  echo Installing dependencies, please wait...
  call npm install
)
echo.
echo Open your browser at:  http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.
node server.mjs
pause

