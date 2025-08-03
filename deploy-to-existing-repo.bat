@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo 廣清宮快速記帳軟體 - 部署到現有倉庫
echo 倉庫地址: https://github.com/sppwlkb/temple-accounting.git
echo ========================================
echo.

:: 檢查是否安裝 Git
echo 🔍 檢查 Git 安裝狀態...
git --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ 錯誤：未找到 Git，請先安裝 Git
    echo 下載地址：https://git-scm.com/download/win
    echo.
    echo 請安裝 Git 後重新執行此腳本
    echo.
    pause
    exit /b 1
)

echo ✅ Git 已安裝

echo.
echo 📋 部署信息：
echo GitHub 用戶名: sppwlkb
echo 倉庫名稱: temple-accounting
echo 部署後網址: https://sppwlkb.github.io/temple-accounting/
echo.

set /p CONFIRM="確認部署修復後的代碼到現有倉庫？(y/n): "
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

echo 📥 正在複製現有倉庫...
git clone https://github.com/sppwlkb/temple-accounting.git .
if errorlevel 1 (
    echo ❌ 錯誤：無法複製倉庫，請檢查：
    echo 1. 網路連線是否正常
    echo 2. 倉庫是否可訪問
    cd ..
    rmdir /s /q %DEPLOY_DIR%
    pause
    exit /b 1
)

:: 備份現有的重要文件
echo 💾 備份現有文件...
if exist README.md copy README.md README.md.backup >nul
if exist .gitignore copy .gitignore .gitignore.backup >nul

:: 清理現有文件（保留 .git 資料夾和重要文件）
echo 🧹 清理舊文件...
for /f "delims=" %%i in ('dir /b /a-d') do (
    if not "%%i"==".git" if not "%%i"==".gitignore" if not "%%i"=="README.md" del "%%i" >nul 2>&1
)
for /f "delims=" %%i in ('dir /b /ad') do (
    if not "%%i"==".git" rmdir /s /q "%%i" >nul 2>&1
)

:: 複製修復後的專案文件
echo 📁 複製修復後的專案文件...
xcopy "..\*" . /E /H /Y /EXCLUDE:..\deploy-exclude.txt >nul 2>&1

:: 排除不需要的文件
if exist deploy-exclude.txt del deploy-exclude.txt
if exist "deploy-to-existing-repo.bat" del "deploy-to-existing-repo.bat"
if exist "deploy-to-github.bat" del "deploy-to-github.bat"
if exist "temp_deploy_*" rmdir /s /q "temp_deploy_*" >nul 2>&1

:: 恢復重要文件
if exist README.md.backup (
    echo 📝 保留原有 README.md
    copy README.md.backup README.md >nul
    del README.md.backup
)
if exist .gitignore.backup (
    echo 📝 保留原有 .gitignore
    copy .gitignore.backup .gitignore >nul
    del .gitignore.backup
)

:: 創建或更新 .gitignore
if not exist .gitignore (
    echo 📝 創建 .gitignore...
    (
    echo node_modules/
    echo .env
    echo .env.local
    echo .DS_Store
    echo Thumbs.db
    echo *.log
    echo *.tmp
    echo *.temp
    echo .vscode/
    echo .idea/
    ) > .gitignore
)

:: 檢查並修復 Apple Touch Icon 路徑
echo 🔧 修復 Apple Touch Icon 路徑...
if exist index.html (
    powershell -Command "(Get-Content index.html) -replace 'icon-192\.png', 'icon.svg' -replace 'icon-512\.png', 'icon.svg' | Set-Content index.html"
)

:: 提交更改
echo 📤 提交修復後的代碼到 GitHub...
git add .
git commit -m "修復GitHub Pages部署問題 - %date% %time%

✅ 修復內容：
- 修復manifest.json圖標路徑問題
- 重構雲端同步為本地備份功能
- 新增數據匯出/匯入功能
- 修復Service Worker圖標引用
- 優化靜態部署配置
- 移除對後端API的依賴

🚀 新功能：
- 本地備份：數據備份到瀏覽器本地存儲
- 數據匯出：下載JSON格式數據文件
- 數據匯入：從JSON文件恢復數據
- 恢復備份：從本地備份恢復數據

📱 完全適配GitHub Pages靜態環境"

git push origin main
if errorlevel 1 (
    echo ❌ 推送失敗，可能的原因：
    echo 1. 需要 GitHub 認證（用戶名/密碼或 Personal Access Token）
    echo 2. 沒有推送權限
    echo 3. 網路連線問題
    echo.
    echo 💡 解決方案：
    echo 1. 如果提示認證，請輸入您的 GitHub 用戶名和密碼
    echo 2. 如果啟用了雙重認證，請使用 Personal Access Token 代替密碼
    echo 3. Personal Access Token 創建地址：https://github.com/settings/tokens
    echo.
    pause
    cd ..
    rmdir /s /q %DEPLOY_DIR%
    exit /b 1
)

:: 清理臨時資料夾
cd ..
rmdir /s /q %DEPLOY_DIR%

echo.
echo ✅ 部署完成！
echo.
echo 📱 您的網站地址：
echo https://sppwlkb.github.io/temple-accounting/
echo.
echo 📋 後續步驟：
echo 1. 等待 1-5 分鐘讓 GitHub Pages 完成部署
echo 2. 如果是首次設置，請前往倉庫設置啟用 GitHub Pages：
echo    https://github.com/sppwlkb/temple-accounting/settings/pages
echo    - Source: Deploy from a branch
echo    - Branch: main
echo    - Folder: / (root)
echo 3. 訪問網站查看修復結果
echo.
echo 🧪 測試頁面：
echo https://sppwlkb.github.io/temple-accounting/test-github-pages.html
echo.
echo 📊 修復報告：
echo https://sppwlkb.github.io/temple-accounting/GitHub-Pages-修復報告.md
echo.

set /p OPEN_BROWSER="是否現在打開網站？(y/n): "
if /i "%OPEN_BROWSER%"=="y" (
    start https://sppwlkb.github.io/temple-accounting/
    start https://github.com/sppwlkb/temple-accounting/settings/pages
)

echo.
echo 🎉 修復完成！您的廣清宮記帳軟體現在可以在 GitHub Pages 上正常運行了！
echo.
echo 💡 提醒：如果這是首次部署到 GitHub Pages，請記得在倉庫設置中啟用 Pages 功能。
pause
