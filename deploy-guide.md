# 廣清宮記帳軟體 - 雲端部署指南

## 🌐 方案一：GitHub Pages 部署

### 步驟1：創建GitHub帳號
1. 前往 https://github.com
2. 註冊免費帳號

### 步驟2：創建新倉庫
1. 點擊右上角 "+" → "New repository"
2. 倉庫名稱：`guangqing-temple-accounting`
3. 設為 Public
4. 勾選 "Add a README file"
5. 點擊 "Create repository"

### 步驟3：上傳文件
1. 點擊 "uploading an existing file"
2. 將以下文件拖拽上傳：
   - index-enhanced.html
   - manifest.json
   - service-worker.js
   - cloud-sync.js
   - qrcode-generator.js
   - icon-192.png
   - icon-512.png
   - 所有其他相關文件

### 步驟4：啟用GitHub Pages
1. 進入倉庫設定 (Settings)
2. 左側選單找到 "Pages"
3. Source 選擇 "Deploy from a branch"
4. Branch 選擇 "main"
5. 點擊 "Save"

### 步驟5：獲得網址
- 等待幾分鐘後，您的應用將可在以下網址訪問：
- `https://yourusername.github.io/guangqing-temple-accounting/index-enhanced.html`

## 📱 方案二：Netlify 部署（更簡單）

### 步驟1：前往 Netlify
1. 訪問 https://netlify.com
2. 註冊免費帳號

### 步驟2：拖拽部署
1. 將整個專案資料夾壓縮成 ZIP
2. 直接拖拽到 Netlify 部署區域
3. 自動獲得網址，如：`https://amazing-name-123456.netlify.app`

## 🔧 方案三：Vercel 部署

### 步驟1：前往 Vercel
1. 訪問 https://vercel.com
2. 使用GitHub帳號登入

### 步驟2：導入專案
1. 點擊 "New Project"
2. 導入您的GitHub倉庫
3. 自動部署並獲得網址

## 📱 安裝到手機

部署完成後：

### Android 手機：
1. 用Chrome瀏覽器訪問您的網址
2. 點擊瀏覽器選單 → "安裝應用程式"
3. 確認安裝
4. 應用將出現在桌面，可離線使用

### iPhone：
1. 用Safari瀏覽器訪問您的網址
2. 點擊分享按鈕 → "加入主畫面"
3. 確認添加
4. 應用將出現在桌面，可離線使用

## ✅ 完成後的優勢

- ✅ 完全不依賴電腦開機
- ✅ 真正安裝到手機桌面
- ✅ 支援離線使用
- ✅ 自動更新功能
- ✅ 跨設備同步（如果啟用雲端同步）
- ✅ 免費且穩定

## 🆘 需要協助？

如果您需要協助部署，我可以：
1. 幫您創建GitHub倉庫
2. 協助上傳文件
3. 設定自動部署
4. 測試安裝流程
