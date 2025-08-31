# 宮廟記帳軟體 - 自動建立宮廟專屬網站腳本
param(
    [string]$TempleName,
    [string]$TempleEnglish, 
    [string]$GitHubUsername,
    [string]$DPOName,
    [string]$TempleAddress = "",
    [string]$TemplePhone = "",
    [string]$MainDeity = ""
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🏛️ 宮廟記帳軟體 - 專屬網站產生器" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 檢查必要參數
if (-not $TempleName -or -not $TempleEnglish -or -not $GitHubUsername -or -not $DPOName) {
    Write-Host "❌ 缺少必要參數" -ForegroundColor Red
    Write-Host ""
    Write-Host "使用方法：" -ForegroundColor Yellow
    Write-Host ".\create-temple-site.ps1 -TempleName '廣清宮' -TempleEnglish 'guangqing' -GitHubUsername 'yourusername' -DPOName '李佳芬'"
    Write-Host ""
    Write-Host "選填參數：" -ForegroundColor Cyan
    Write-Host "-TempleAddress '宮廟地址'"
    Write-Host "-TemplePhone '聯絡電話'"
    Write-Host "-MainDeity '主祀神明'"
    Write-Host ""
    exit 1
}

$RepoName = "$TempleEnglish-temple"
$WebsiteUrl = "https://$GitHubUsername.github.io/$RepoName/"

Write-Host "📋 宮廟資訊確認：" -ForegroundColor Yellow
Write-Host "宮廟名稱：$TempleName"
Write-Host "英文名稱：$TempleEnglish"
Write-Host "GitHub用戶：$GitHubUsername"
Write-Host "倉庫名稱：$RepoName"
Write-Host "網站網址：$WebsiteUrl"
Write-Host "個資負責人：$DPOName"
Write-Host ""

$confirm = Read-Host "確認以上資訊正確嗎？(y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ 操作已取消" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 開始產生專屬網站檔案..." -ForegroundColor Yellow

# 建立專案目錄
$ProjectDir = "./$RepoName"
if (Test-Path $ProjectDir) {
    Write-Host "⚠️ 目錄 $ProjectDir 已存在" -ForegroundColor Yellow
    $overwrite = Read-Host "是否覆蓋？(y/n)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        Remove-Item -Recurse -Force $ProjectDir
    } else {
        Write-Host "❌ 操作已取消" -ForegroundColor Red
        exit 1
    }
}

New-Item -ItemType Directory -Path $ProjectDir | Out-Null
New-Item -ItemType Directory -Path "$ProjectDir/.github" | Out-Null
New-Item -ItemType Directory -Path "$ProjectDir/.github/workflows" | Out-Null

Write-Host "✅ 專案目錄已建立：$ProjectDir" -ForegroundColor Green

# 產生 index.html
$IndexContent = @"
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$TempleName - 記帳管理系統</title>
    <meta name="description" content="${TempleName}專屬的記帳管理系統">
    
    <style>
        body {
            font-family: 'Microsoft JhengHei', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .welcome-container {
            text-align: center;
            background: white;
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            max-width: 600px;
        }
        .temple-name {
            font-size: 48px;
            color: #8b4513;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .subtitle {
            font-size: 24px;
            color: #d4af37;
            margin-bottom: 30px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
            text-align: left;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #d4af37;
        }
        .info-label {
            font-weight: bold;
            color: #8b4513;
            margin-bottom: 5px;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: #d4af37;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            margin: 10px;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background: #b8941f;
        }
        .btn-secondary {
            background: #28a745;
        }
        .btn-secondary:hover {
            background: #1e7e34;
        }
    </style>
</head>
<body>
    <div class="welcome-container">
        <div class="temple-name">🏛️ $TempleName</div>
        <div class="subtitle">記帳管理系統</div>
        
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">🏛️ 宮廟名稱</div>
                <div>$TempleName</div>
            </div>
            $(if ($MainDeity) { "<div class='info-item'><div class='info-label'>🙏 主祀神明</div><div>$MainDeity</div></div>" })
            $(if ($TempleAddress) { "<div class='info-item'><div class='info-label'>📍 地址</div><div>$TempleAddress</div></div>" })
            $(if ($TemplePhone) { "<div class='info-item'><div class='info-label'>📞 電話</div><div>$TemplePhone</div></div>" })
            <div class="info-item">
                <div class="info-label">🛡️ 個資負責人</div>
                <div>$DPOName</div>
            </div>
        </div>
        
        <div style="margin: 40px 0;">
            <a href="https://sppwlkb.github.io/guangqing-temple-accounting/?temple=$TempleEnglish" class="btn">
                🚀 進入記帳系統
            </a>
            <a href="https://sppwlkb.github.io/guangqing-temple-accounting/privacy-policy.html" class="btn btn-secondary">
                🛡️ 隱私政策
            </a>
        </div>
        
        <div style="color: #666; font-size: 14px; margin-top: 30px;">
            <p>✨ 本系統具備完整的個人資料保護功能</p>
            <p>🔐 所有信眾資料都經過加密保護</p>
            <p>⚖️ 完全符合台灣個人資料保護法</p>
        </div>
    </div>
    
    <script>
        // 記錄宮廟訪問
        console.log('🏛️ $TempleName 記帳系統已載入');
        
        // 可以在這裡添加宮廟專屬的初始化代碼
        window.templeInfo = {
            name: '$TempleName',
            english: '$TempleEnglish',
            address: '$TempleAddress',
            phone: '$TemplePhone',
            mainDeity: '$MainDeity',
            dpoName: '$DPOName'
        };
    </script>
</body>
</html>
"@

Set-Content -Path "$ProjectDir/index.html" -Value $IndexContent -Encoding UTF8

# 產生 GitHub Actions
$ActionsContent = @"
name: 🚀 $TempleName 自動部署

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 檢出程式碼
      uses: actions/checkout@v4
      
    - name: 🏗️ 準備部署檔案
      run: |
        echo "準備 $TempleName 的部署檔案"
        mkdir -p dist
        cp *.html dist/ 2>/dev/null || true
        cp *.css dist/ 2>/dev/null || true
        cp *.js dist/ 2>/dev/null || true
        cp *.json dist/ 2>/dev/null || true
        echo "" > dist/.nojekyll
        
    - name: 🌐 部署到 GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: `${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        publish_branch: gh-pages
        
    - name: 🎉 部署完成
      run: |
        echo "🎉 $TempleName 部署成功！"
        echo "🌐 網站地址：$WebsiteUrl"
"@

Set-Content -Path "$ProjectDir/.github/workflows/deploy.yml" -Value $ActionsContent -Encoding UTF8

# 產生 README.md
$ReadmeContent = @"
# 🏛️ $TempleName - 記帳管理系統

## 📋 簡介

這是 $TempleName 的專屬記帳管理系統，基於宮廟快速記帳軟體打造。

## 🌐 線上使用

**網址：** $WebsiteUrl

## 📞 聯絡資訊

- **宮廟名稱：** $TempleName
- **主祀神明：** $MainDeity
- **地址：** $TempleAddress  
- **電話：** $TemplePhone
- **個資負責人：** $DPOName

## 🔐 個資保護

本系統完全符合台灣個人資料保護法規範，所有信眾資料都受到完整保護。

## 🧧 功能等級

- 🆓 **基礎功能：** 免費使用
- 🧧 **進階功能：** 小紅包贊助 (NT`$ 888/年)
- 🎊 **專業功能：** 大紅包贊助 (NT`$ 1,688/年)

## 📈 技術支援

如有問題請聯絡：
- GitHub Issues: https://github.com/$GitHubUsername/$RepoName/issues
- 原始專案: https://github.com/sppwlkb/guangqing-temple-accounting

---

*基於宮廟快速記帳軟體 v2.0.0*  
*建立時間：$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')*
"@

Set-Content -Path "$ProjectDir/README.md" -Value $ReadmeContent -Encoding UTF8

# 產生 package.json
$PackageContent = @"
{
  "name": "$RepoName",
  "version": "1.0.0",
  "description": "$TempleName 專屬記帳管理系統",
  "keywords": ["temple", "accounting", "$TempleName", "$TempleEnglish"],
  "author": "$TempleName 開發團隊",
  "license": "MIT",
  "homepage": "$WebsiteUrl",
  "repository": {
    "type": "git",
    "url": "https://github.com/$GitHubUsername/$RepoName.git"
  }
}
"@

Set-Content -Path "$ProjectDir/package.json" -Value $PackageContent -Encoding UTF8

Write-Host ""
Write-Host "✅ 專屬網站檔案已產生完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📁 產生的檔案：" -ForegroundColor Cyan
Write-Host "  ├── index.html (宮廟專屬首頁)"
Write-Host "  ├── README.md (說明文件)"
Write-Host "  ├── package.json (專案配置)"
Write-Host "  └── .github/workflows/deploy.yml (自動部署)"
Write-Host ""

Write-Host "🚀 接下來的步驟：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 在GitHub建立新倉庫：" -ForegroundColor Cyan
Write-Host "   倉庫名稱：$RepoName"
Write-Host "   網址：https://github.com/$GitHubUsername/$RepoName"
Write-Host ""
Write-Host "2. 上傳產生的檔案到倉庫"
Write-Host ""
Write-Host "3. 啟用GitHub Pages："
Write-Host "   Settings → Pages → Source: Deploy from a branch → Branch: gh-pages"
Write-Host ""
Write-Host "4. 完成！您的宮廟網站將在以下網址上線："
Write-Host "   $WebsiteUrl" -ForegroundColor Green
Write-Host ""

# 詢問是否要自動初始化Git
$initGit = Read-Host "是否要自動初始化Git倉庫？(y/n)"
if ($initGit -eq "y" -or $initGit -eq "Y") {
    Set-Location $ProjectDir
    
    Write-Host ""
    Write-Host "🔧 初始化Git倉庫..." -ForegroundColor Yellow
    
    git init
    git add -A
    git commit -m "🏛️ 初始化 $TempleName 記帳管理系統

🎯 宮廟資訊：
- 名稱：$TempleName
- 英文：$TempleEnglish  
- 主祀：$MainDeity
- 負責人：$DPOName

🌐 網站地址：$WebsiteUrl
🔐 個資保護：完全符合個資法
🧧 支援紅包贊助功能"
    
    Write-Host ""
    Write-Host "✅ Git倉庫初始化完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 接下來請執行：" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/$GitHubUsername/$RepoName.git"
    Write-Host "git branch -M main"  
    Write-Host "git push -u origin main"
    Write-Host ""
    
    Set-Location ..
}

Write-Host "🎉 $TempleName 專屬網站產生完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步驟檢查清單：" -ForegroundColor Yellow
Write-Host "□ 在GitHub建立倉庫：$RepoName"
Write-Host "□ 上傳檔案到倉庫"
Write-Host "□ 啟用GitHub Pages"
Write-Host "□ 等待5-10分鐘讓網站生效"
Write-Host "□ 訪問：$WebsiteUrl"
Write-Host ""
Write-Host "💡 提示：每個宮廟都會有自己獨立的網址和資料！" -ForegroundColor Cyan
Write-Host ""

Read-Host "按任意鍵繼續" 