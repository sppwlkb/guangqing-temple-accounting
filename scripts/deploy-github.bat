@echo off
REM GitHub Pages 部署腳本 (Windows)
REM 使用方法: scripts\deploy-github.bat

echo 🚀 開始部署到 GitHub Pages...

REM 檢查是否有未提交的變更
git status --porcelain > temp.txt
for /f %%i in ("temp.txt") do set size=%%~zi
del temp.txt
if %size% gtr 0 (
    echo ❌ 有未提交的變更，請先提交所有變更
    exit /b 1
)

REM 顯示當前分支
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 📍 當前分支: %CURRENT_BRANCH%

REM 建置專案
echo 🔨 建置專案...
call npm run build:prod

REM 檢查建置結果
if not exist "dist" (
    echo ❌ 建置失敗，找不到 dist 目錄
    exit /b 1
)

REM 進入建置目錄
cd dist

REM 初始化 git（如果需要）
if not exist ".git" (
    git init
    git checkout -b gh-pages
)

REM 添加 .nojekyll 檔案
echo. > .nojekyll

REM 提交建置結果
git add -A
git commit -m "Deploy to GitHub Pages - %date% %time%"

REM 推送到 GitHub Pages
echo 📤 推送到 GitHub Pages...
git push -f origin gh-pages

REM 回到專案根目錄
cd ..

echo ✅ 部署完成！
echo 🌐 您的網站將在幾分鐘內可用：
echo    https://your-username.github.io/temple-finance-management

REM 清理
rmdir /s /q dist\.git

pause
