@echo off
echo ========================================
echo 廣清宮快速記帳軟體 - Node.js 降級指南
echo ========================================
echo.
echo 當前 Node.js 版本：
node --version
echo.
echo 當前 npm 版本：
npm --version
echo.
echo ========================================
echo 請按照以下步驟操作：
echo ========================================
echo.
echo 1. 下載 Node.js 18.17.0：
echo    https://nodejs.org/download/release/v18.17.0/
echo    檔案：node-v18.17.0-x64.msi
echo.
echo 2. 安裝完成後，重新開啟命令提示字元
echo.
echo 3. 驗證版本：
echo    node --version  (應顯示 v18.17.0)
echo    npm --version   (應顯示 9.x)
echo.
echo 4. 清理並重新安裝依賴：
echo    npm run clean-install
echo.
echo ========================================
pause
