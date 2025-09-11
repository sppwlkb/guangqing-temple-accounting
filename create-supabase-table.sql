-- 廣清宮記帳軟體 Supabase 資料表設置
-- 請在 Supabase SQL Editor 中執行此腳本

-- 1. 創建主要資料表
CREATE TABLE IF NOT EXISTS temple_data (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    last_modified BIGINT NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_temple_data_device_id ON temple_data(device_id);
CREATE INDEX IF NOT EXISTS idx_temple_data_updated_at ON temple_data(updated_at);
CREATE INDEX IF NOT EXISTS idx_temple_data_last_modified ON temple_data(last_modified);

-- 3. 創建更新時間的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_temple_data_updated_at 
    BEFORE UPDATE ON temple_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. 設定 Row Level Security (RLS)
ALTER TABLE temple_data ENABLE ROW LEVEL SECURITY;

-- 5. 創建允許所有操作的政策（適用於單一宮廟使用）
-- 注意：生產環境可能需要更嚴格的安全政策
DROP POLICY IF EXISTS "Allow all operations for temple_data" ON temple_data;
CREATE POLICY "Allow all operations for temple_data" 
    ON temple_data 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 6. 確保匿名用戶有足夠權限
GRANT ALL ON temple_data TO anon;
GRANT ALL ON temple_data TO authenticated;
GRANT USAGE ON SEQUENCE temple_data_id_seq TO anon;
GRANT USAGE ON SEQUENCE temple_data_id_seq TO authenticated;

-- 7. 創建測試資料（可選）
-- INSERT INTO temple_data (device_id, data, last_modified, version) 
-- VALUES ('test_device', '{"test": true}', EXTRACT(EPOCH FROM NOW()) * 1000, '2.0');

-- 驗證設置
SELECT 
    'Table created successfully' as status,
    COUNT(*) as record_count
FROM temple_data;