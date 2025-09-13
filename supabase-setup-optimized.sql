-- 廣清宮記帳軟體 Supabase 資料庫設定 (優化版)
-- 請在 Supabase 控制台的 SQL Editor 中執行此腳本

-- 1. 建立主要資料表
CREATE TABLE IF NOT EXISTS temple_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    data JSONB NOT NULL,
    last_modified BIGINT NOT NULL,
    version TEXT DEFAULT '2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 建立索引提升查詢效能
CREATE INDEX IF NOT EXISTS idx_temple_data_device_id ON temple_data(device_id);
CREATE INDEX IF NOT EXISTS idx_temple_data_updated_at ON temple_data(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_temple_data_last_modified ON temple_data(last_modified DESC);

-- 3. 建立觸發器自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 移除舊的觸發器（如果存在）
DROP TRIGGER IF EXISTS update_temple_data_updated_at ON temple_data;

-- 建立新的觸發器
CREATE TRIGGER update_temple_data_updated_at 
    BEFORE UPDATE ON temple_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. 啟用 Row Level Security (RLS)
ALTER TABLE temple_data ENABLE ROW LEVEL SECURITY;

-- 5. 移除所有現有的 RLS 政策
DROP POLICY IF EXISTS "Allow all operations for all users" ON temple_data;
DROP POLICY IF EXISTS "Allow all operations for temple_data" ON temple_data;
DROP POLICY IF EXISTS "Enable all operations for all users" ON temple_data;

-- 6. 建立新的 RLS 政策（允許匿名用戶進行所有操作）
CREATE POLICY "Enable all operations for authenticated and anonymous users" 
    ON temple_data 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 7. 確保匿名用戶有足夠權限
GRANT ALL ON temple_data TO anon;
GRANT ALL ON temple_data TO authenticated;
GRANT USAGE ON SEQUENCE temple_data_id_seq TO anon;
GRANT USAGE ON SEQUENCE temple_data_id_seq TO authenticated;

-- 8. 插入測試資料以驗證設置
INSERT INTO temple_data (device_id, data, last_modified, version) 
VALUES (
    'setup_test_' || EXTRACT(EPOCH FROM NOW()),
    '{"setup_test": true, "message": "Supabase 設定成功", "timestamp": ' || EXTRACT(EPOCH FROM NOW()) * 1000 || '}',
    EXTRACT(EPOCH FROM NOW()) * 1000,
    '2.0'
) ON CONFLICT DO NOTHING;

-- 9. 驗證設置結果
SELECT 
    'Supabase 設定完成!' as status,
    COUNT(*) as total_records,
    MAX(created_at) as latest_record_time
FROM temple_data;

-- 10. 顯示資料表結構
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'temple_data'
ORDER BY ordinal_position;