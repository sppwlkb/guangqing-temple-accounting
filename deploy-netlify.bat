@echo off
chcp 65001 > nul
echo ==========================================
echo 廣清宮快速記帳軟體 - Netlify部署助手
echo ==========================================
echo.

echo 🚀 準備部署到Netlify...
echo.

REM 檢查是否有git
git --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安裝Git，請先安裝Git後再執行此腳本
    pause
    exit /b 1
)

echo ✅ Git已安裝

REM 檢查是否在git倉庫中
git status > nul 2>&1
if %errorlevel% neq 0 (
    echo 📁 初始化Git倉庫...
    git init
    echo # 廣清宮快速記帳軟體 > README.md
    git add .
    git commit -m "初始提交 - 廣清宮快速記帳軟體"
    echo ✅ Git倉庫已初始化
) else (
    echo ✅ 已在Git倉庫中
    echo 📝 提交最新更改...
    git add .
    git commit -m "更新：完善雲端同步功能" -q
    echo ✅ 更改已提交
)

echo.
echo 📋 部署選項：
echo 1. 手動部署（推薦）- 打包檔案供手動上傳
echo 2. GitHub連接部署 - 推送到GitHub供自動部署
echo 3. 查看部署說明
echo.

set /p choice="請選擇部署方式 (1/2/3): "

if "%choice%"=="1" goto :manual_deploy
if "%choice%"=="2" goto :github_deploy  
if "%choice%"=="3" goto :show_instructions
goto :invalid_choice

:manual_deploy
echo.
echo 📦 準備手動部署檔案...

REM 創建部署資料夾
if exist "netlify-deploy" rmdir /s /q netlify-deploy
mkdir netlify-deploy

REM 複製必要檔案
copy "index-enhanced.html" "netlify-deploy\" > nul
copy "cloud-sync.js" "netlify-deploy\" > nul
copy "supabase-sync.js" "netlify-deploy\" > nul
copy "qrcode-generator.js" "netlify-deploy\" > nul
copy "manifest.json" "netlify-deploy\" > nul
copy "service-worker.js" "netlify-deploy\" > nul
copy "netlify.toml" "netlify-deploy\" > nul
if exist "icon-192.png" copy "icon-192.png" "netlify-deploy\" > nul
if exist "icon-512.png" copy "icon-512.png" "netlify-deploy\" > nul

echo ✅ 檔案已準備完成
echo.
echo 📋 接下來的步驟：
echo 1. 前往 https://www.netlify.com/
echo 2. 註冊/登入帳號
echo 3. 點擊 "Add new site" → "Deploy manually"
echo 4. 將 netlify-deploy 資料夾拖拽到部署區域
echo 5. 等待部署完成
echo.
echo 💡 提示：部署後記得設置Supabase配置！
goto :end

:github_deploy
echo.
echo 🔗 GitHub連接部署...

set /p repo_url="請輸入GitHub倉庫URL (如: https://github.com/username/repo.git): "

if "%repo_url%"=="" (
    echo ❌ 未提供倉庫URL
    goto :end
)

echo 📤 推送到GitHub...
git remote remove origin 2>nul
git remote add origin %repo_url%
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo ✅ 程式碼已推送到GitHub
    echo.
    echo 📋 接下來的步驟：
    echo 1. 前往 https://www.netlify.com/
    echo 2. 點擊 "Add new site" → "Import from Git"
    echo 3. 選擇GitHub並授權
    echo 4. 選擇您的倉庫
    echo 5. 設置構建參數後點擊部署
) else (
    echo ❌ 推送失敗，請檢查倉庫URL和權限
)
goto :end

:show_instructions
echo.
echo 📖 詳細部署說明請查看：
echo - DEPLOYMENT.md 檔案
echo - 或訪問項目文檔
echo.
goto :end

:invalid_choice
echo ❌ 無效選擇，請重新執行腳本
goto :end

:end
echo.
echo 🎉 部署助手執行完成！
echo ⚠️  重要提醒：
echo    - 部署後請設置Supabase配置
echo    - 確保HTTPS正常工作
echo    - 測試PWA安裝功能
echo.
pause