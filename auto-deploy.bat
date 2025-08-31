@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 廣清宮快速記帳軟體 - 自動部署工具
echo ========================================
echo.

echo 📋 檢查部署前置條件...

REM 檢查是否在正確的目錄
if not exist "package.json" (
    echo ❌ 錯誤：請在專案根目錄執行此腳本
    pause
    exit /b 1
)

REM 檢查Git狀態
echo 🔍 檢查Git狀態...
git status --porcelain > temp_status.txt
for %%i in (temp_status.txt) do set size=%%~zi
del temp_status.txt

if %size% gtr 0 (
    echo ⚠️  發現未提交的變更，將自動提交...
    git add -A
    set /p commit_msg="📝 請輸入提交訊息 (直接按Enter使用預設訊息): "
    if "!commit_msg!"=="" set commit_msg=更新專案 - 自動部署
    git commit -m "!commit_msg!"
    echo ✅ 變更已提交
) else (
    echo ✅ 沒有未提交的變更
)

echo.
echo 🚀 開始自動部署...
echo.

REM 推送到主分支觸發GitHub Actions
echo 📤 推送程式碼到GitHub...
git push origin main

if errorlevel 1 (
    echo ❌ 推送失敗，請檢查網路連接和Git配置
    pause
    exit /b 1
)

echo ✅ 程式碼已推送到GitHub
echo.
echo 🔄 GitHub Actions將自動開始部署...
echo 📊 您可以在以下網址查看部署進度：
echo    https://github.com/sppwlkb/guangqing-temple-accounting/actions
echo.
echo 🌐 部署完成後，您的網站將可在以下網址訪問：
echo    https://sppwlkb.github.io/guangqing-temple-accounting/
echo.
echo 💡 提示：GitHub Actions通常需要1-3分鐘完成部署
echo.

REM 詢問是否要打開瀏覽器
set /p open_browser="🌐 是否要打開GitHub Actions頁面查看部署狀態？(y/n): "
if /i "%open_browser%"=="y" (
    start https://github.com/sppwlkb/guangqing-temple-accounting/actions
)

echo.
echo 🎉 自動部署流程已啟動！
echo.
pause 