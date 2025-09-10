# 廣清宮快速記帳軟體 🏛️

一款專為宮廟設計的現代化記帳管理系統，支援雲端同步、多設備共享和離線使用。

## ✨ 主要功能

### 💰 財務管理
- 收入/支出記錄管理
- 信眾捐款追蹤
- 財務報表與分析
- 類別自定義管理

### 👥 信眾管理
- 信眾基本資料管理
- 生肖與太歲查詢
- 聯絡資訊維護

### 📅 活動管理
- 宮廟活動規劃
- 活動參與者管理
- 行事曆檢視

### 📦 庫存管理
- 物品庫存追蹤
- 進出庫記錄
- 低庫存提醒

### ☁️ 雲端同步 (新功能)
- **手機端快速同步** - 首頁一鍵同步按鈕
- **多設備數據共享** - 支援手機、平板、電腦同步
- **自動備份** - 數據變更時自動上傳雲端
- **衝突解決** - 智能處理多設備數據衝突
- **QR碼同步** - 掃描QR碼快速設備配對
- **用戶認證** - 安全的登入/註冊系統

### 📱 PWA支援
- 可安裝到手機主螢幕
- 離線使用功能
- 原生應用體驗

## 🚀 快速開始

### 線上使用
1. 訪問已部署的網站
2. 點擊「登入/註冊」建立帳戶
3. 開始記帳並享受雲端同步

### 本地部署
1. 下載所有檔案
2. 使用網頁伺服器開啟 `index-enhanced.html`
3. 配置Supabase（可選，用於雲端同步）

### 一鍵部署到Netlify
```bash
# Windows用戶
deploy-netlify.bat

# 或手動拖拽到Netlify
```

## 🔧 雲端同步設置

### 1. 創建Supabase帳戶
1. 訪問 [Supabase](https://supabase.com/)
2. 創建新專案
3. 執行以下SQL建立數據表：

```sql
CREATE TABLE temple_data (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    data JSONB NOT NULL,
    last_modified BIGINT NOT NULL,
    version TEXT DEFAULT '2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX temple_data_device_id_idx ON temple_data(device_id);
CREATE INDEX temple_data_updated_at_idx ON temple_data(updated_at DESC);

ALTER TABLE temple_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own device data" ON temple_data
    FOR ALL USING (auth.uid()::text = device_id OR device_id LIKE 'device_%');
```

### 2. 配置API金鑰
修改 `supabase-sync.js` 檔案：

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co', // 您的專案URL
    key: 'your-anon-key', // 您的API金鑰
    tableName: 'temple_data'
};
```

## 📱 手機使用指南

### 安裝PWA
1. 在手機瀏覽器開啟網站
2. 點擊瀏覽器選單的「加到主螢幕」
3. 確認安裝

### 雲端同步操作
1. **快速同步** - 首頁點擊「雲端同步」按鈕
2. **設備同步** - 點擊「設備同步」→「生成QR碼」
3. **其他設備** - 掃描QR碼自動同步數據

### 多設備工作流程
```
手機記帳 → 自動同步雲端 → 電腦查看最新數據
    ↑                           ↓
電腦管理 ← 自動同步雲端 ← 平板查看報表
```

## 🔐 安全性

- **數據加密** - 所有雲端數據經過加密傳輸
- **用戶認證** - 基於Supabase的安全認證系統
- **權限控制** - 用戶只能存取自己的數據
- **本地備份** - 重要操作前自動建立本地備份

## 🛠️ 技術架構

### 前端技術
- **Vue 3** - 響應式前端框架
- **Element Plus** - UI組件庫
- **ECharts** - 數據視覺化
- **PWA** - 漸進式Web應用

### 雲端服務
- **Supabase** - 雲端數據庫與認證
- **Netlify** - 靜態網站部署
- **GitHub Actions** - 自動化部署

### 同步機制
- **實時同步** - 數據變更時自動觸發
- **衝突解決** - 基於時間戳的智能合併
- **離線支援** - 網路恢復時自動同步
- **多設備支援** - QR碼快速配對

## 📂 檔案結構

```
廣清宮快速記帳軟體/
├── index-enhanced.html          # 主應用檔案
├── supabase-sync.js            # Supabase雲端同步服務
├── cloud-sync.js               # 本地同步服務
├── qrcode-generator.js         # QR碼生成器
├── manifest.json               # PWA配置
├── service-worker.js           # PWA服務工作者
├── netlify.toml                # Netlify部署配置
├── deploy-netlify.bat          # 一鍵部署腳本
├── test-deployment.html        # 部署測試頁面
├── DEPLOYMENT.md               # 詳細部署指南
└── README.md                   # 使用說明（本檔案）
```

## 🐛 故障排除

### 同步問題
- **檢查網路連接**
- **確認Supabase配置**
- **查看瀏覽器控制台錯誤**

### PWA安裝問題
- **確保HTTPS連接**
- **檢查manifest.json檔案**
- **清除瀏覽器快取**

### 數據丟失
- **檢查本地備份**（LocalStorage中的temple-backup-*項目）
- **從雲端恢復數據**
- **使用匯入/匯出功能**

## 📞 技術支援

### 測試部署
訪問 `test-deployment.html` 檢查系統狀態

### 日誌檢查
打開瀏覽器開發者工具查看控制台輸出

### 常見問題
1. **同步失敗** - 檢查Supabase配置和網路連接
2. **登入問題** - 確認email格式和密碼長度
3. **數據衝突** - 系統會自動提示選擇解決方案

## 🔄 更新日誌

### v2.0.0 (最新版)
- ✅ 新增手機端快速同步入口
- ✅ 整合Supabase真正的雲端數據庫
- ✅ 實作用戶認證系統
- ✅ 添加自動同步機制
- ✅ 實現衝突解決機制
- ✅ 完整的Netlify部署支援
- ✅ QR碼設備配對功能

### v1.0.0
- 基本記帳功能
- 信眾管理
- 庫存管理
- 本地存儲

## 📋 使用授權

本軟體為開源專案，僅供廣清宮使用。

## 🙏 致謝

感謝所有參與開發和測試的人員，讓這個專案能夠順利完成。

---

**🏛️ 廣清宮快速記帳軟體** - 讓宮廟管理更簡單、更現代化！