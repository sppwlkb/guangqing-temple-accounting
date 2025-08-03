# 🚀 廣清宮財務管理系統 - 部署指南

本指南將協助您將廣清宮財務管理系統部署到各種平台。

## 📋 部署前準備

### 1. 環境需求
- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本
- Git

### 2. 安裝依賴
```bash
npm install
```

### 3. 建置專案
```bash
# 生產環境建置
npm run build:prod

# 測試環境建置
npm run build:staging
```

## 🌐 部署選項

### 選項 1: Vercel (推薦 - 免費)

Vercel 是最簡單的部署方式，提供免費的靜態網站託管。

#### 方法 A: 使用 Vercel CLI
```bash
# 安裝 Vercel CLI
npm install -g vercel

# 登入 Vercel
vercel login

# 部署
npm run deploy:vercel
```

#### 方法 B: 使用 GitHub 整合
1. 將專案推送到 GitHub
2. 前往 [Vercel](https://vercel.com)
3. 點擊 "New Project"
4. 選擇您的 GitHub 倉庫
5. Vercel 會自動偵測設定並部署

#### Vercel 設定
- 建置命令: `npm run build:prod`
- 輸出目錄: `dist`
- Node.js 版本: 18.x

### 選項 2: Netlify (免費)

Netlify 提供優秀的靜態網站託管服務。

#### 方法 A: 使用 Netlify CLI
```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 登入 Netlify
netlify login

# 部署
npm run deploy:netlify
```

#### 方法 B: 拖放部署
1. 執行 `npm run build:prod`
2. 前往 [Netlify](https://netlify.com)
3. 將 `dist` 資料夾拖放到部署區域

#### 方法 C: GitHub 整合
1. 將專案推送到 GitHub
2. 在 Netlify 中連接 GitHub 倉庫
3. 設定建置命令和發布目錄

### 選項 3: GitHub Pages (免費)

適合開源專案或個人使用。

```bash
# 使用腳本部署
./scripts/deploy-github.sh

# 或在 Windows
scripts\deploy-github.bat

# 或使用 npm 腳本
npm run deploy:github
```

#### 手動設定 GitHub Pages
1. 將專案推送到 GitHub
2. 前往倉庫設定 > Pages
3. 選擇 `gh-pages` 分支作為來源
4. 儲存設定

### 選項 4: Surge.sh (免費)

簡單快速的靜態網站部署。

```bash
# 安裝 Surge
npm install -g surge

# 部署
npm run deploy:surge
```

### 選項 5: Firebase Hosting (免費額度)

Google 的靜態網站託管服務。

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化專案
firebase init hosting

# 部署
firebase deploy
```

## 🔧 環境變數設定

### 生產環境 (.env.production)
```env
VITE_APP_TITLE=廣清宮財務管理系統
VITE_API_BASE_URL=https://api.your-domain.com
VITE_ENABLE_CONSOLE=false
VITE_ENABLE_DEVTOOLS=false
```

### 測試環境 (.env.staging)
```env
VITE_APP_TITLE=廣清宮財務管理系統 (測試版)
VITE_API_BASE_URL=https://staging-api.your-domain.com
VITE_ENABLE_CONSOLE=true
VITE_ENABLE_DEVTOOLS=true
```

## 🛡️ 安全設定

### 1. 環境變數
- 不要在前端暴露敏感資訊
- 使用 `VITE_` 前綴的環境變數
- 在部署平台設定環境變數

### 2. HTTP 標頭
已在配置檔案中設定安全標頭：
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

### 3. HTTPS
- 所有部署平台都支援免費 SSL
- 確保啟用 HTTPS 重定向

## 📊 效能優化

### 1. 建置優化
- 代碼分割
- 樹搖優化
- 資源壓縮
- 快取策略

### 2. CDN 設定
大部分平台都提供全球 CDN：
- Vercel: 自動啟用
- Netlify: 自動啟用
- GitHub Pages: 透過 CloudFlare

## 🔍 監控設定

### 1. 錯誤追蹤
建議整合 Sentry 或類似服務：
```env
VITE_SENTRY_DSN=your-sentry-dsn
```

### 2. 分析工具
整合 Google Analytics：
```env
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
```

## 🚨 故障排除

### 常見問題

#### 1. 路由問題
確保設定 SPA 重定向：
- Vercel: 已在 `vercel.json` 設定
- Netlify: 已在 `netlify.toml` 設定
- GitHub Pages: 需要 404.html 重定向

#### 2. 環境變數未生效
- 檢查變數名稱是否有 `VITE_` 前綴
- 重新建置專案
- 檢查部署平台的環境變數設定

#### 3. 建置失敗
```bash
# 清除快取
npm run clean
rm -rf node_modules
npm install

# 重新建置
npm run build:prod
```

#### 4. 靜態資源載入失敗
檢查 `vite.config.js` 中的 `base` 設定：
```js
export default defineConfig({
  base: '/your-repo-name/', // GitHub Pages
  // 或
  base: '/', // 其他平台
})
```

## 📝 部署檢查清單

- [ ] 環境變數設定完成
- [ ] 建置成功無錯誤
- [ ] 路由正常運作
- [ ] 靜態資源載入正常
- [ ] HTTPS 啟用
- [ ] 安全標頭設定
- [ ] 效能測試通過
- [ ] 錯誤追蹤設定
- [ ] 監控工具設定
- [ ] 備份策略確認

## 🔄 持續部署

建議設定自動部署：
1. 推送到 main 分支自動部署到生產環境
2. 推送到 develop 分支自動部署到測試環境
3. Pull Request 自動建立預覽部署

## 📞 支援

如果遇到部署問題，請：
1. 檢查本指南的故障排除章節
2. 查看部署平台的文檔
3. 聯繫開發團隊

---

**祝您部署順利！** 🎉
