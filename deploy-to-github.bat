@echo off
chcp 65001 >nul
echo ========================================
echo 廣清宮快速記帳軟體 - GitHub 部署腳本
echo ========================================
echo.

echo 請按照以下步驟完成 GitHub 部署：
echo.
echo 1. 前往 https://github.com 並登入您的帳戶
echo 2. 點擊右上角的 "+" 按鈕，選擇 "New repository"
echo 3. 填寫倉庫資訊：
echo    - Repository name: guangqing-temple-accounting
echo    - Description: 廣清宮快速記帳軟體 - 專為宮廟設計的記帳系統
echo    - Visibility: 選擇 Public
echo    - 不要勾選 "Add a README file"
echo 4. 點擊 "Create repository"
echo.
echo 創建完成後，請輸入您的 GitHub 用戶名：
set /p username=GitHub 用戶名: 

echo.
echo 正在設置遠端倉庫...
git remote add origin https://github.com/%username%/guangqing-temple-accounting.git
git branch -M main
git push -u origin main

echo.
echo ========================================
echo 部署步驟完成！
echo ========================================
echo.
echo 接下來請：
echo 1. 前往您的 GitHub 倉庫頁面
echo 2. 點擊 "Settings" 標籤
echo 3. 在左側選單中找到 "Pages"
echo 4. 在 "Source" 部分，選擇 "Deploy from a branch"
echo 5. 在 "Branch" 下拉選單中選擇 "gh-pages"
echo 6. 點擊 "Save"
echo.
echo 部署完成後，您的應用將可在以下網址訪問：
echo https://%username%.github.io/guangqing-temple-accounting/
echo.
pause
