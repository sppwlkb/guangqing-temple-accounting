# 廣清宮快速記帳軟體 - 部署指南

## 🚀 快速部署到 Netlify

### 方法一：直接拖拽部署
1. 打包整個專案資料夾為ZIP檔案
2. 前往 [Netlify](https://www.netlify.com/)
3. 拖拽ZIP檔案到Netlify Dashboard
4. 等待部署完成

### 方法二：Git連接自動部署
1. 將代碼推送到GitHub倉庫
2. 在Netlify中選擇「New site from Git」
3. 連接GitHub倉庫
4. 設置構建參數：
   - Build command: `echo 'No build needed'`
   - Publish directory: `.`
5. 點擊「Deploy site」

## 🔧 Supabase雲端數據庫設置

### 1. 創建Supabase專案
1. 前往 [Supabase](https://supabase.com/)
2. 點擊「Start your project」
3. 創建新組織和專案
4. 等待數據庫初始化完成

### 2. 創建數據表
在Supabase SQL編輯器中執行以下SQL：

```sql
-- 創建temple_data表
CREATE TABLE temple_data (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    data JSONB NOT NULL,
    last_modified BIGINT NOT NULL,
    version TEXT DEFAULT '2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX temple_data_device_id_idx ON temple_data(device_id);
CREATE INDEX temple_data_updated_at_idx ON temple_data(updated_at DESC);

-- 設置RLS (Row Level Security)
ALTER TABLE temple_data ENABLE ROW LEVEL SECURITY;

-- 創建策略：用戶只能訪問自己設備的數據
CREATE POLICY "Users can access own device data" ON temple_data
    FOR ALL USING (auth.uid()::text = device_id OR device_id LIKE 'device_%');
```

### 3. 獲取API金鑰
1. 在Supabase Dashboard中，前往「Settings」→「API」
2. 複製「Project URL」和「anon public」金鑰

### 4. 配置應用
修改 `supabase-sync.js` 檔案中的配置：

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co', // 替換為您的Project URL
    key: 'your-anon-key', // 替換為您的anon key
    tableName: 'temple_data'
};
```

## 🌐 環境變數設置

### Netlify環境變數
在Netlify Dashboard中設置以下環境變數：
- `SUPABASE_URL`: 您的Supabase專案URL
- `SUPABASE_ANON_KEY`: 您的Supabase anon金鑰

### GitHub Actions自動部署
如果使用GitHub Actions，需要在GitHub Repository的Secrets中設置：
- `NETLIFY_AUTH_TOKEN`: Netlify個人訪問令牌
- `NETLIFY_SITE_ID`: Netlify站點ID

## 📱 PWA功能

應用已配置為PWA（漸進式Web應用），用戶可以：
1. 在手機瀏覽器中打開網站
2. 點擊瀏覽器的「加到主螢幕」
3. 像原生應用一樣使用

## 🔐 安全設置

### HTTPS
- Netlify自動提供HTTPS
- 確保所有外部API調用使用HTTPS

### CORS設置
如果使用自定義API，確保正確設置CORS策略。

### 敏感資訊
- 不要在前端代碼中存放敏感資訊
- 使用環境變數管理API金鑰
- Supabase的anon key是安全的，可以在前端使用

## 🐛 故障排除

### 常見問題
1. **同步功能不工作**
   - 檢查Supabase配置是否正確
   - 確認網路連接
   - 檢查瀏覽器控制台錯誤訊息

2. **PWA安裝失敗**
   - 確認HTTPS連接
   - 檢查manifest.json檔案
   - 驗證Service Worker註冊

3. **資料不同步**
   - 檢查用戶是否已登入
   - 確認自動同步機制是否啟動
   - 查看同步狀態顯示

### 除錯步驟
1. 打開瀏覽器開發者工具
2. 查看Console選項卡的錯誤訊息
3. 檢查Network選項卡的網路請求
4. 確認Application選項卡的localStorage內容

## 📞 技術支援

如遇到部署問題，請檢查：
1. 瀏覽器控制台錯誤訊息
2. Netlify部署日誌
3. Supabase Dashboard錯誤記錄

## 🔄 更新部署

### 自動更新（推薦）
如果使用Git連接部署，每次推送代碼到main分支都會自動觸發重新部署。

### 手動更新
1. 下載最新版本的檔案
2. 拖拽到Netlify Dashboard進行更新
3. 等待部署完成

---

**注意**: 首次設置時，建議先在本地測試所有功能，確認無誤後再進行線上部署。