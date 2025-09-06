# iOS 安裝指南 - 廣清宮記帳軟體

## 📱 方法一：直接PWA安裝（需要電腦開機一次）

### 步驟1：在iPhone上訪問
1. 打開 **Safari 瀏覽器**（必須是Safari）
2. 輸入網址：`http://192.168.1.124:8000/index-enhanced.html`
3. 等待頁面完全載入

### 步驟2：安裝到主畫面
1. 點擊底部的 **分享按鈕** 📤
2. 向下滑動找到 **「加入主畫面」**
3. 點擊「加入主畫面」
4. 確認應用名稱：「廣清宮記帳」
5. 點擊右上角 **「新增」**

### 步驟3：使用應用
- 桌面會出現應用圖標
- 點擊即可開啟，**完全離線使用**
- 不需要電腦開機！

## 🌐 方法二：雲端部署（推薦）

### 為什麼推薦雲端部署？
- ✅ 完全不依賴電腦開機
- ✅ 任何時候都能重新安裝
- ✅ 可以分享給其他人使用
- ✅ 自動備份和更新

### GitHub Pages 部署步驟

#### 1. 創建GitHub帳號
- 前往：https://github.com
- 註冊免費帳號

#### 2. 創建新倉庫
- 點擊右上角 "+" → "New repository"
- 倉庫名稱：`guangqing-temple-app`
- 設為 **Public**
- 勾選 "Add a README file"
- 點擊 "Create repository"

#### 3. 上傳文件
將以下文件上傳到倉庫：
```
index-enhanced.html
manifest.json
service-worker.js
cloud-sync.js
qrcode-generator.js
icon-192.png
icon-512.png
```

#### 4. 啟用GitHub Pages
- 進入倉庫 Settings
- 左側選單找到 "Pages"
- Source 選擇 "Deploy from a branch"
- Branch 選擇 "main"
- 點擊 "Save"

#### 5. 獲得永久網址
- 等待幾分鐘後可訪問：
- `https://yourusername.github.io/guangqing-temple-app/index-enhanced.html`

### 在iPhone上安裝雲端版本

1. **用Safari訪問雲端網址**
2. **按照上述PWA安裝步驟**
3. **完成後完全離線使用**

## 🔧 方法三：Netlify 快速部署

### 最簡單的部署方式：

1. **前往 Netlify**
   - 訪問：https://netlify.com
   - 註冊免費帳號

2. **拖拽部署**
   - 將整個專案資料夾壓縮成 ZIP
   - 直接拖拽到 Netlify 部署區域
   - 自動獲得網址，如：`https://amazing-name-123456.netlify.app`

3. **在iPhone上安裝**
   - 用Safari訪問獲得的網址
   - 按照PWA安裝步驟操作

## 📋 iOS PWA 特色功能

安裝後您的應用將具備：

### ✅ 原生應用體驗
- 獨立的應用圖標
- 全螢幕運行（無瀏覽器界面）
- 在應用切換器中顯示
- 支援多工處理

### ✅ 離線功能
- 完全離線使用
- 數據保存在iPhone本地
- 不需要網路連接

### ✅ iOS 整合
- 支援 iOS 通知（如果啟用）
- 響應式設計適配所有iPhone尺寸
- 支援深色模式
- 符合iOS設計規範

## ⚠️ 注意事項

### iOS PWA 限制：
- 必須使用 Safari 瀏覽器安裝
- 不支援 App Store 分發
- 某些原生功能受限

### 建議：
- 優先使用雲端部署方案
- 定期備份數據到雲端
- 保持Safari瀏覽器更新

## 🆘 需要協助？

如果您需要協助：
1. 我可以幫您設置GitHub倉庫
2. 協助上傳和部署文件
3. 測試iOS安裝流程
4. 解決任何技術問題

選擇最適合您的方案，我會提供詳細的協助！
