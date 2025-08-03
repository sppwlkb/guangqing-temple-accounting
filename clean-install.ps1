# 廣清宮記帳軟體 - 清理安裝腳本
Write-Host "正在清理舊的依賴..." -ForegroundColor Yellow

# 停止所有可能使用node_modules的進程
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# 等待一下讓進程完全停止
Start-Sleep -Seconds 2

# 強制刪除node_modules
if (Test-Path "node_modules") {
    Write-Host "刪除 node_modules..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    
    # 如果還有殘留，使用robocopy清理
    if (Test-Path "node_modules") {
        $emptyDir = New-Item -ItemType Directory -Path "temp_empty" -Force
        robocopy $emptyDir.FullName "node_modules" /MIR /NFL /NDL /NJH /NJS /NC /NS /NP
        Remove-Item -Path "temp_empty" -Force
        Remove-Item -Path "node_modules" -Force -ErrorAction SilentlyContinue
    }
}

# 刪除package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "刪除 package-lock.json..." -ForegroundColor Yellow
    Remove-Item "package-lock.json" -Force
}

# 清理npm緩存
Write-Host "清理 npm 緩存..." -ForegroundColor Yellow
npm cache clean --force

# 設置npm配置以避免權限問題
npm config set fund false
npm config set audit false

Write-Host "開始安裝依賴..." -ForegroundColor Green

# 使用--legacy-peer-deps來避免依賴衝突
npm install --legacy-peer-deps --no-optional

if ($LASTEXITCODE -eq 0) {
    Write-Host "安裝成功！" -ForegroundColor Green
    Write-Host "現在可以運行: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "安裝失敗，請檢查錯誤信息" -ForegroundColor Red
}