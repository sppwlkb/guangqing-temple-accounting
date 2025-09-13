-- 廣清宮記帳軟體 Supabase 資料庫設定 (修復版)
-- 請在 Supabase 控制台的 SQL Editor 中執行此腳本

-- 1. 先清理可能存在的舊資料表和政策
DROP POLICY IF EXISTS "Allow all operations for all users" ON temple_data;
DROP POLICY IF EXISTS "Allow all operations for temple_data" ON temple_data;
DROP POLICY IF EXISTS "Enable all operations for all users" ON temple_data;
DROP POLICY IF EXISTS "Enable all operations for authenticated and anonymous users" ON temple_data;
DROP TRIGGER IF EXISTS update_temple_data_updated_at ON temple_data;
DROP TABLE IF EXISTS temple_data CASCADE;

-- 2. 建立主要資料表 (使用 UUID 主鍵)
CREATE TABLE temple_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    data JSONB NOT NULL,
    last_modified BIGINT NOT NULL,
    version TEXT DEFAULT '3.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 建立索引提升查詢效能
CREATE INDEX idx_temple_data_device_id ON temple_data(device_id);
CREATE INDEX idx_temple_data_updated_at ON temple_data(updated_at DESC);
CREATE INDEX idx_temple_data_last_modified ON temple_data(last_modified DESC);

-- 4. 建立觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. 建立觸發器
CREATE TRIGGER update_temple_data_updated_at 
    BEFORE UPDATE ON temple_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 啟用 Row Level Security (RLS)
ALTER TABLE temple_data ENABLE ROW LEVEL SECURITY;

-- 7. 建立 RLS 政策（允許所有用戶進行所有操作）
CREATE POLICY "Enable all operations for all users" 
    ON temple_data 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 8. 授予權限（不需要序列權限，因為使用 UUID）
GRANT ALL ON temple_data TO anon;
GRANT ALL ON temple_data TO authenticated;
GRANT ALL ON temple_data TO service_role;

-- 9. 插入測試資料
INSERT INTO temple_data (device_id, data, last_modified, version) 
VALUES (
    'setup_test_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    jsonb_build_object(
        'setup_test', true, 
        'message', 'Supabase 設定成功', 
        'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000
    ),
    EXTRACT(EPOCH FROM NOW()) * 1000,
    '3.0'
);

-- 10. 驗證設置
SELECT 
    'Supabase 設定完成!' as status,
    COUNT(*) as total_records,
    MAX(created_at) as latest_record_time,
    'temple_data 資料表已成功建立' as message
FROM temple_data;

-- 11. 顯示資料表結構確認
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'temple_data'
ORDER BY ordinal_position;

-- 12. 檢查 RLS 政策
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'temple_data';