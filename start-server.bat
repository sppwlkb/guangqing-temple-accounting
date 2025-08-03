@echo off
echo 🏛️ 廣清宮快速記帳軟體 - 本地服務器啟動器
echo.
echo 正在檢查Python環境...

REM 檢查Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 找到Python 3
    echo 🚀 啟動HTTP服務器 (端口: 8000)
    echo.
    echo 📱 請在瀏覽器中開啟: http://localhost:8000
    echo 📱 手機請使用: http://[您的IP]:8000
    echo.
    echo 💡 提示: 按 Ctrl+C 停止服務器
    echo.
    python -m http.server 8000
    goto :end
)

REM 檢查Python 2
python2 --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 找到Python 2
    echo 🚀 啟動HTTP服務器 (端口: 8000)
    echo.
    echo 📱 請在瀏覽器中開啟: http://localhost:8000
    echo 📱 手機請使用: http://[您的IP]:8000
    echo.
    echo 💡 提示: 按 Ctrl+C 停止服務器
    echo.
    python2 -m SimpleHTTPServer 8000
    goto :end
)

REM 檢查Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 找到Node.js
    echo 🚀 啟動HTTP服務器 (端口: 8000)
    echo.
    echo 📱 請在瀏覽器中開啟: http://localhost:8000
    echo 📱 手機請使用: http://[您的IP]:8000
    echo.
    echo 💡 提示: 按 Ctrl+C 停止服務器
    echo.
    npx http-server -p 8000
    goto :end
)

echo ❌ 未找到Python或Node.js
echo.
echo 📥 請安裝以下任一軟體:
echo   • Python 3: https://www.python.org/downloads/
echo   • Node.js: https://nodejs.org/
echo.
echo 或者使用其他HTTP服務器軟體
echo.

:end
pause
