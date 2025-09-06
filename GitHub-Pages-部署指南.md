# 廣清宮快速記帳軟體 - GitHub Pages 部署指南

## 📋 部署前準備

### 1. 確認文件結構
確保您的專案資料夾包含以下重要文件：
```
廣清宮快速記帳軟體/
├── index-enhanced.html     # 主要應用頁面
├── manifest.json          # PWA 配置文件
├── icon.svg              # 應用圖標
├── cloud-sync.js         # 同步服務（已修復）
├── service-worker.js     # Service Worker
├── style.css             # 樣式文件
└── 其他文件...
```

### 2. 需要的工具
- GitHub 帳號
- Git 軟體（或使用 GitHub Desktop）
- 網頁瀏覽器

## 🚀 部署步驟

### 步驟 1：創建 GitHub 倉庫

1. **登入 GitHub**
   - 前往 [github.com](https://github.com)
   - 登入您的 GitHub 帳號

2. **創建新倉庫**
   - 點擊右上角的 "+" 號
   - 選擇 "New repository"
   - 倉庫名稱建議：`guangqing-temple-accounting`
   - 設為 Public（GitHub Pages 免費版需要公開倉庫）
   - 勾選 "Add a README file"
   - 點擊 "Create repository"

### 步驟 2：上傳代碼

#### 方法 A：使用 GitHub 網頁界面（簡單）

1. **進入倉庫頁面**
   - 在新創建的倉庫頁面
   - 點擊 "uploading an existing file"

2. **上傳文件**
   - 將所有專案文件拖拽到上傳區域
   - 或點擊 "choose your files" 選擇文件
   - 重要：確保上傳所有文件，包括子資料夾

3. **提交更改**
   - 在頁面底部填寫提交訊息：`初始部署：廣清宮快速記帳軟體`
   - 點擊 "Commit changes"

#### 方法 B：使用 Git 命令行（進階）

```bash
# 1. 複製倉庫到本地
git clone https://github.com/您的用戶名/guangqing-temple-accounting.git

# 2. 進入倉庫資料夾
cd guangqing-temple-accounting

# 3. 複製所有專案文件到這個資料夾

# 4. 添加所有文件
git add .

# 5. 提交更改
git commit -m "初始部署：廣清宮快速記帳軟體"

# 6. 推送到 GitHub
git push origin main
```

### 步驟 3：設置 GitHub Pages

1. **進入倉庫設置**
   - 在倉庫頁面點擊 "Settings" 標籤
   - 在左側選單找到 "Pages"

2. **配置 Pages 設置**
   - Source：選擇 "Deploy from a branch"
   - Branch：選擇 "main"
   - Folder：選擇 "/ (root)"
   - 點擊 "Save"

3. **等待部署**
   - GitHub 會開始部署過程
   - 通常需要 1-5 分鐘
   - 部署完成後會顯示網站 URL

### 步驟 4：訪問您的網站

1. **獲取網站 URL**
   - 部署完成後，在 Pages 設置頁面會顯示：
   - `https://您的用戶名.github.io/guangqing-temple-accounting/`

2. **訪問應用**
   - 點擊 URL 或在瀏覽器中輸入
   - 應該會看到您的廣清宮記帳軟體

## 🔧 重要配置

### 設置主頁面
如果您希望直接訪問 `index-enhanced.html`，需要：

1. **重命名文件**
   - 將 `index-enhanced.html` 重命名為 `index.html`
   - 或者創建一個 `index.html` 重定向到 `index-enhanced.html`

2. **創建重定向頁面**
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=./index-enhanced.html">
    <title>廣清宮快速記帳軟體</title>
</head>
<body>
    <p>正在跳轉到應用...</p>
    <a href="./index-enhanced.html">如果沒有自動跳轉，請點擊這裡</a>
</body>
</html>
```

## 📱 PWA 安裝

部署完成後，用戶可以：

1. **手機安裝**
   - 用手機瀏覽器訪問網站
   - 瀏覽器會提示「加入主畫面」
   - 安裝後可像原生 App 一樣使用

2. **電腦安裝**
   - 在 Chrome/Edge 瀏覽器中訪問
   - 地址欄會出現安裝圖標
   - 點擊安裝到桌面

## 🔍 測試部署結果

1. **功能測試**
   - 訪問 `您的網站URL/test-github-pages.html`
   - 檢查所有測試項目是否通過

2. **控制台檢查**
   - 按 F12 打開開發者工具
   - 查看 Console 標籤
   - 確認沒有錯誤訊息

## 📝 更新網站

當您需要更新網站時：

1. **修改本地文件**
2. **重新上傳到 GitHub**
   - 使用網頁界面上傳
   - 或使用 Git 推送更改
3. **等待自動部署**
   - GitHub Pages 會自動重新部署
   - 通常需要 1-5 分鐘

## ⚠️ 注意事項

1. **文件大小限制**
   - 單個文件不超過 100MB
   - 整個倉庫不超過 1GB

2. **訪問限制**
   - 每月 100GB 流量限制
   - 每小時 10 次部署限制

3. **HTTPS**
   - GitHub Pages 自動提供 HTTPS
   - 確保所有外部資源也使用 HTTPS

4. **自定義域名**（可選）
   - 可以設置自己的域名
   - 需要在 DNS 設置中添加 CNAME 記錄

## 🎉 完成！

部署完成後，您的廣清宮快速記帳軟體就可以在網路上使用了！

**您的網站地址：**
`https://您的GitHub用戶名.github.io/倉庫名稱/`

記得將這個地址分享給需要使用的人員。
