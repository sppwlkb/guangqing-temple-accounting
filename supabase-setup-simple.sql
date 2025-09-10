-- 廣清宮記帳軟體 Supabase 資料庫設定 (簡化版)
-- 如果標準版有問題，請使用此簡化版本

-- 1. 建立主要資料表
CREATE TABLE temple_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    data JSONB NOT NULL,
    last_modified BIGINT NOT NULL,
    version TEXT DEFAULT '2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 建立索引提升查詢效能
CREATE INDEX idx_temple_data_device_id ON temple_data(device_id);
CREATE INDEX idx_temple_data_updated_at ON temple_data(updated_at DESC);
CREATE INDEX idx_temple_data_last_modified ON temple_data(last_modified DESC);

-- 3. 啟用RLS (Row Level Security)
ALTER TABLE temple_data ENABLE ROW LEVEL SECURITY;

-- 4. 建立RLS政策 - 允許所有操作（宮廟內部使用）
CREATE POLICY "temple_data_policy" 
ON temple_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. 建立自動更新時間戳的函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 建立觸發器
CREATE TRIGGER update_temple_data_updated_at 
    BEFORE UPDATE ON temple_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 完成訊息
SELECT 'Supabase 資料庫設定完成！' as message;