# 廣清宮快速記帳軟體 - PowerShell自動部署腳本
param(
    [string]$CommitMessage = "更新專案 - 自動部署",
    [switch]$SkipConfirmation
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "廣清宮快速記帳軟體 - 自動部署工具" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 檢查是否在正確的目錄
if (-not (Test-Path "package.json")) {
    Write-Host "錯誤：請在專案根目錄執行此腳本" -ForegroundColor Red
    if (-not $SkipConfirmation) {
        Read-Host "Press any key to continue"
    }
    exit 1
}

Write-Host "檢查部署前置條件..." -ForegroundColor Yellow

# 檢查Git狀態
Write-Host "檢查Git狀態..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "發現未提交的變更，將自動提交..." -ForegroundColor Yellow
    
    # 顯示變更的檔案
    Write-Host "變更的檔案：" -ForegroundColor Cyan
    $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    
    if (-not $SkipConfirmation) {
        $userCommitMsg = Read-Host "請輸入提交訊息 (直接按Enter使用預設訊息)"
        if ($userCommitMsg) {
            $CommitMessage = $userCommitMsg
        }
    }
    
    git add -A
    git commit -m $CommitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "變更已提交：$CommitMessage" -ForegroundColor Green
    } else {
        Write-Host "提交失敗" -ForegroundColor Red
        if (-not $SkipConfirmation) {
            Read-Host "Press any key to continue"
        }
        exit 1
    }
} else {
    Write-Host "沒有未提交的變更" -ForegroundColor Green
}

Write-Host ""
Write-Host "開始自動部署..." -ForegroundColor Yellow
Write-Host ""

# 推送到主分支觸發GitHub Actions
Write-Host "推送程式碼到GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "程式碼已推送到GitHub" -ForegroundColor Green
} else {
    Write-Host "推送失敗，請檢查網路連接和Git配置" -ForegroundColor Red
    if (-not $SkipConfirmation) {
        Read-Host "Press any key to continue"
    }
    exit 1
}

Write-Host ""
Write-Host "GitHub Actions將自動開始部署..." -ForegroundColor Yellow
Write-Host "您可以在以下網址查看部署進度：" -ForegroundColor Cyan
Write-Host "   https://github.com/sppwlkb/guangqing-temple-accounting/actions" -ForegroundColor Blue
Write-Host ""
Write-Host "部署完成後，您的網站將可在以下網址訪問：" -ForegroundColor Cyan
Write-Host "   https://sppwlkb.github.io/guangqing-temple-accounting/" -ForegroundColor Blue
Write-Host ""
Write-Host "提示：GitHub Actions通常需要1-3分鐘完成部署" -ForegroundColor Yellow
Write-Host ""

# 詢問是否要打開瀏覽器
if (-not $SkipConfirmation) {
    $openBrowser = Read-Host "是否要打開GitHub Actions頁面查看部署狀態？(y/n)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
        Start-Process "https://github.com/sppwlkb/guangqing-temple-accounting/actions"
        Write-Host "已打開GitHub Actions頁面" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "自動部署流程已啟動！" -ForegroundColor Green
Write-Host ""

if (-not $SkipConfirmation) {
    Read-Host "Press any key to continue"
} 