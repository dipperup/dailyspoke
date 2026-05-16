@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   DailySpoke — Starting...
echo ========================================

:: Kill existing processes on ports 8000 and 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

:: Start Python backend in a new window
echo [1/2] Starting Python TTS backend...
start "DailySpoke Backend" cmd /c "set PYTHONUTF8=1 && C:\Users\92172\AppData\Local\Programs\Python\Python312\python.exe server\tts_server.py"

:: Wait a moment for backend to start loading
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
echo [2/2] Starting frontend...
start "DailySpoke Frontend" cmd /c "npx vite --host"

:: Wait for frontend to be ready
timeout /t 5 /nobreak >nul

:: Open browser
echo Opening browser...
start http://127.0.0.1:5173

echo.
echo Both servers started!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
echo.
pause
