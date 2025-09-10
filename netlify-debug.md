# Netlify 部署故障排除指南

如果 Netlify 部署失敗，請按照以下步驟排除問題：

## 🔍 常見部署失敗原因

### 1. 建置依賴問題
- **問題**: `npm install` 失敗或 `vite` 找不到
- **解決方案**: 使用簡化建置腳本

### 2. 建置腳本錯誤
- **問題**: `npm run build` 執行失敗
- **解決方案**: 檢查 `package.json` 中的 build 腳本

### 3. 環境變數未設定
- **問題**: Supabase 連接失敗
- **解決方案**: 在 Netlify 中設定環境變數

## 🛠️ 解決步驟

### 步驟1: 使用簡化配置
1. 將 `netlify-simple.toml` 重命名為 `netlify.toml`
2. 或者在 Netlify 面板中手動設定：
   - Build command: `node build-simple.js`
   - Publish directory: `dist`

### 步驟2: 檢查建置日誌
在 Netlify 部署失敗後，查看詳細的建置日誌：
1. 進入 Netlify 專案面板
2. 點擊失敗的部署
3. 查看 "Deploy log" 找出具體錯誤

### 步驟3: 本地測試建置
```bash
# 測試簡化建置
node build-simple.js

# 檢查 dist 目錄是否正確創建
ls dist/
```

## 🚀 快速修復方案

### 方案A: 最簡化部署
```toml
[build]
  command = "mkdir dist && cp index-enhanced.html dist/ && cp *.js dist/"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index-enhanced.html"
  status = 200
```

### 方案B: 手動上傳
1. 在本地執行 `node build-simple.js`
2. 將 `dist/` 目錄的內容手動上傳到 Netlify

### 方案C: 直接複製文件
如果所有建置都失敗，可以直接部署原始文件：
```toml
[build]
  command = "echo 'Direct deploy'"
  publish = "."

[[redirects]]
  from = "/"
  to = "/index-enhanced.html"
  status = 200
```

## 📝 部署檢查清單

- [ ] GitHub repository 已推送最新代碼
- [ ] Netlify 已連接到正確的 GitHub repository
- [ ] 建置命令設定正確
- [ ] 發布目錄設定正確  
- [ ] 環境變數已設定（如果需要）
- [ ] 沒有語法錯誤或缺少文件

## 🆘 如果仍然失敗

請提供以下資訊：
1. 完整的 Netlify 部署錯誤日誌
2. 使用的是哪個配置文件
3. 設定的建置命令和發布目錄
4. 是否設定了環境變數

這樣我就能提供更精確的解決方案！