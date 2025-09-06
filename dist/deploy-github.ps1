Write-Host "========================================" -ForegroundColor Green
Write-Host "廣清宮快速記帳軟體 - GitHub 部署工具" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "步驟 1: 創建 GitHub 倉庫" -ForegroundColor Yellow
Write-Host "請前往 https://github.com 並登入您的帳戶"
Write-Host "點擊右上角的 '+' 按鈕，選擇 'New repository'"
Write-Host "填寫倉庫資訊："
Write-Host "  - Repository name: guangqing-temple-accounting"
Write-Host "  - Description: 廣清宮快速記帳軟體 - 專為宮廟設計的記帳系統"
Write-Host "  - Visibility: 選擇 Public"
Write-Host "  - 不要勾選 'Add a README file'"
Write-Host "點擊 'Create repository'"
Write-Host ""

$username = Read-Host "請輸入您的 GitHub 用戶名"

Write-Host ""
Write-Host "步驟 2: 設置遠端倉庫..." -ForegroundColor Yellow

try {
    git remote add origin "https://github.com/$username/guangqing-temple-accounting.git"
    git branch -M main
    git push -u origin main
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "部署步驟完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "接下來請：" -ForegroundColor Yellow
    Write-Host "1. 前往您的 GitHub 倉庫頁面"
    Write-Host "2. 點擊 'Settings' 標籤"
    Write-Host "3. 在左側選單中找到 'Pages'"
    Write-Host "4. 在 'Source' 部分，選擇 'Deploy from a branch'"
    Write-Host "5. 在 'Branch' 下拉選單中選擇 'gh-pages'"
    Write-Host "6. 點擊 'Save'"
    Write-Host ""
    Write-Host "部署完成後，您的應用將可在以下網址訪問：" -ForegroundColor Cyan
    Write-Host "https://$username.github.io/guangqing-temple-accounting/" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "錯誤：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host "請檢查您的 GitHub 用戶名是否正確，以及倉庫是否已創建。" -ForegroundColor Red
}

Read-Host "按任意鍵繼續" 