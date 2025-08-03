@echo off
chcp 65001 >nul
echo ========================================
echo 廣清宮快速記帳軟體 - GitHub Pages 部署工具
echo ========================================
echo.

:: 檢查是否安裝 Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤：未找到 Git，請先安裝 Git
    echo 下載地址：https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git 已安裝

:: 獲取用戶輸入
set /p GITHUB_USERNAME="請輸入您的 GitHub 用戶名: "
set /p REPO_NAME="請輸入倉庫名稱 (建議: guangqing-temple-accounting): "

if "%REPO_NAME%"=="" set REPO_NAME=guangqing-temple-accounting

echo.
echo 📋 部署信息：
echo GitHub 用戶名: %GITHUB_USERNAME%
echo 倉庫名稱: %REPO_NAME%
echo 部署後網址: https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
echo.

set /p CONFIRM="確認部署？(y/n): "
if /i not "%CONFIRM%"=="y" (
    echo 部署已取消
    pause
    exit /b 0
)

echo.
echo 🚀 開始部署...

:: 創建臨時部署資料夾
set DEPLOY_DIR=temp_deploy_%RANDOM%
mkdir %DEPLOY_DIR%
cd %DEPLOY_DIR%

echo 📥 正在複製倉庫...
git clone https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git .
if errorlevel 1 (
    echo ❌ 錯誤：無法複製倉庫，請檢查：
    echo 1. GitHub 用戶名是否正確
    echo 2. 倉庫是否存在
    echo 3. 網路連線是否正常
    cd ..
    rmdir /s /q %DEPLOY_DIR%
    pause
    exit /b 1
)

:: 清理現有文件（保留 .git 資料夾）
echo 🧹 清理舊文件...
for /f "delims=" %%i in ('dir /b /a-d') do (
    if not "%%i"==".git" del "%%i" >nul 2>&1
)
for /f "delims=" %%i in ('dir /b /ad') do (
    if not "%%i"==".git" rmdir /s /q "%%i" >nul 2>&1
)

:: 複製專案文件
echo 📁 複製專案文件...
xcopy "..\*" . /E /H /Y /EXCLUDE:..\deploy-exclude.txt >nul 2>&1
if not exist deploy-exclude.txt (
    echo node_modules\ > deploy-exclude.txt
    echo .git\ >> deploy-exclude.txt
    echo temp_deploy_* >> deploy-exclude.txt
    echo *.log >> deploy-exclude.txt
)

:: 創建或更新 index.html 重定向
echo 🔗 創建主頁重定向...
(
echo ^<!DOCTYPE html^>
echo ^<html^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta http-equiv="refresh" content="0; url=./index-enhanced.html"^>
echo     ^<title^>廣清宮快速記帳軟體^</title^>
echo ^</head^>
echo ^<body^>
echo     ^<p^>正在跳轉到應用...^</p^>
echo     ^<a href="./index-enhanced.html"^>如果沒有自動跳轉，請點擊這裡^</a^>
echo ^</body^>
echo ^</html^>
) > index.html

:: 提交更改
echo 📤 提交更改到 GitHub...
git add .
git commit -m "部署更新: %date% %time%"
git push origin main
if errorlevel 1 (
    echo ❌ 推送失敗，請檢查：
    echo 1. GitHub 認證是否正確
    echo 2. 是否有推送權限
    echo 3. 網路連線是否正常
    cd ..
    rmdir /s /q %DEPLOY_DIR%
    pause
    exit /b 1
)

:: 清理臨時資料夾
cd ..
rmdir /s /q %DEPLOY_DIR%

echo.
echo ✅ 部署完成！
echo.
echo 📱 您的網站地址：
echo https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
echo.
echo 📋 後續步驟：
echo 1. 等待 1-5 分鐘讓 GitHub Pages 完成部署
echo 2. 訪問上述網址查看您的應用
echo 3. 如需設置 GitHub Pages，請前往：
echo    https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/settings/pages
echo.
echo 🧪 測試頁面：
echo https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/test-github-pages.html
echo.

set /p OPEN_BROWSER="是否現在打開網站？(y/n): "
if /i "%OPEN_BROWSER%"=="y" (
    start https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
)

echo.
echo 🎉 感謝使用廣清宮快速記帳軟體部署工具！
pause
