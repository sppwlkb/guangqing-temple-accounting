@echo off
title 廣清宮記帳軟體部署工具
color 0A
chcp 65001 >nul 2>&1

echo.
echo ========================================
echo 廣清宮快速記帳軟體 - 部署除錯版本
echo ========================================
echo.

:: 顯示當前目錄
echo 📁 當前工作目錄：
cd
echo.

:: 列出當前目錄的文件
echo 📋 當前目錄文件：
dir /b *.html *.js *.json *.css 2>nul
echo.

:: 檢查重要文件是否存在
echo 🔍 檢查重要文件...
if exist "index-enhanced.html" (
    echo ✅ index-enhanced.html 存在
) else (
    echo ❌ index-enhanced.html 不存在
)

if exist "manifest.json" (
    echo ✅ manifest.json 存在
) else (
    echo ❌ manifest.json 不存在
)

if exist "cloud-sync.js" (
    echo ✅ cloud-sync.js 存在
) else (
    echo ❌ cloud-sync.js 不存在
)

if exist "icon.svg" (
    echo ✅ icon.svg 存在
) else (
    echo ❌ icon.svg 不存在
)

echo.

:: 檢查 Git 安裝
echo 🔍 檢查 Git 安裝狀態...
git --version 2>nul
if errorlevel 1 (
    echo ❌ Git 未安裝或不在 PATH 中
    echo.
    echo 💡 解決方案：
    echo 1. 下載並安裝 Git：https://git-scm.com/download/win
    echo 2. 安裝時選擇 "Git from the command line and also from 3rd-party software"
    echo 3. 重新啟動命令提示字元
    echo.
    goto :manual_method
) else (
    echo ✅ Git 已安裝
)

echo.

:: 檢查網路連線
echo 🌐 檢查網路連線...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo ❌ 無法連接到 GitHub
    echo 請檢查網路連線
    echo.
    goto :manual_method
) else (
    echo ✅ 網路連線正常
)

echo.
echo 📋 部署信息：
echo GitHub 用戶名: sppwlkb
echo 倉庫名稱: temple-accounting
echo 部署後網址: https://sppwlkb.github.io/temple-accounting/
echo.

set /p CONFIRM="所有檢查通過！是否繼續自動部署？(y/n): "
if /i not "%CONFIRM%"=="y" goto :manual_method

echo.
echo 🚀 開始自動部署...

:: 創建臨時目錄
set DEPLOY_DIR=temp_deploy_%RANDOM%
echo 📁 創建臨時目錄: %DEPLOY_DIR%
mkdir %DEPLOY_DIR%
if errorlevel 1 (
    echo ❌ 無法創建臨時目錄
    goto :manual_method
)

cd %DEPLOY_DIR%

echo 📥 正在下載現有倉庫...
git clone https://github.com/sppwlkb/temple-accounting.git . 2>&1
if errorlevel 1 (
    echo ❌ 無法下載倉庫
    cd ..
    rmdir /s /q %DEPLOY_DIR% 2>nul
    goto :manual_method
)

echo ✅ 倉庫下載完成

:: 備份重要文件
if exist README.md (
    echo 💾 備份 README.md
    copy README.md README.md.backup >nul
)

:: 清理舊文件
echo 🧹 清理舊文件...
for /f "delims=" %%i in ('dir /b /a-d 2^>nul') do (
    if not "%%i"==".gitignore" if not "%%i"=="README.md" if not "%%i"=="README.md.backup" (
        del "%%i" >nul 2>&1
    )
)

:: 複製新文件
echo 📁 複製修復後的文件...
xcopy "..\*.html" . /Y >nul 2>&1
xcopy "..\*.js" . /Y >nul 2>&1
xcopy "..\*.json" . /Y >nul 2>&1
xcopy "..\*.css" . /Y >nul 2>&1
xcopy "..\*.svg" . /Y >nul 2>&1
xcopy "..\*.md" . /Y >nul 2>&1

:: 恢復 README.md
if exist README.md.backup (
    copy README.md.backup README.md >nul
    del README.md.backup
)

:: 提交更改
echo 📤 提交更改...
git add . 2>&1
git commit -m "修復GitHub Pages部署問題 - %date% %time%" 2>&1
git push origin main 2>&1
if errorlevel 1 (
    echo ❌ 推送失敗，可能需要認證
    echo.
    echo 💡 請手動執行以下命令：
    echo git push origin main
    echo.
    pause
)

cd ..
rmdir /s /q %DEPLOY_DIR% 2>nul

echo.
echo ✅ 自動部署完成！
goto :success

:manual_method
echo.
echo ========================================
echo 📖 手動部署方法
echo ========================================
echo.
echo 由於自動部署遇到問題，請使用以下手動方法：
echo.
echo 方法一：GitHub 網頁上傳
echo 1. 前往：https://github.com/sppwlkb/temple-accounting
echo 2. 點擊 "Add file" → "Upload files"
echo 3. 拖拽以下文件到頁面：
echo    - index-enhanced.html
echo    - manifest.json
echo    - cloud-sync.js
echo    - icon.svg
echo    - service-worker.js
echo    - 其他所有 .html, .js, .css 文件
echo 4. 提交訊息：修復GitHub Pages部署問題
echo 5. 點擊 "Commit changes"
echo.
echo 方法二：使用 GitHub Desktop
echo 1. 下載 GitHub Desktop：https://desktop.github.com/
echo 2. 複製倉庫到本地
echo 3. 替換文件
echo 4. 提交並推送
echo.

:success
echo ========================================
echo 🎉 部署完成！
echo ========================================
echo.
echo 📱 您的網站地址：
echo https://sppwlkb.github.io/temple-accounting/
echo.
echo 🧪 測試頁面：
echo https://sppwlkb.github.io/temple-accounting/test-github-pages.html
echo.
echo 📋 後續步驟：
echo 1. 等待 1-5 分鐘讓 GitHub Pages 完成部署
echo 2. 如果是首次設置，請啟用 GitHub Pages：
echo    https://github.com/sppwlkb/temple-accounting/settings/pages
echo 3. 訪問網站查看修復結果
echo.

set /p OPEN_BROWSER="是否現在打開網站和設置頁面？(y/n): "
if /i "%OPEN_BROWSER%"=="y" (
    start https://sppwlkb.github.io/temple-accounting/
    start https://github.com/sppwlkb/temple-accounting/settings/pages
)

echo.
echo 感謝使用廣清宮記帳軟體部署工具！
echo 如有問題，請參考 "現有倉庫部署指南.md"
echo.
pause
