-- 廣清宮記帳軟體 Supabase 資料庫設定
-- 請將此SQL在Supabase控制台中執行

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

-- 3. 啟用RLS (Row Level Security)
ALTER TABLE temple_data ENABLE ROW LEVEL SECURITY;

-- 4. 建立RLS政策 - 允許匿名訪問（因為是宮廟內部使用）
CREATE POLICY IF NOT EXISTS "Allow all operations for all users" 
ON temple_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. 建立觸發器自動更新updated_at
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

-- 6. 建立用戶認證相關表 (可選，如需要用戶系統)
CREATE TABLE IF NOT EXISTS temple_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    device_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temple_users_email ON temple_users(email);

-- 啟用用戶表的RLS
ALTER TABLE temple_users ENABLE ROW LEVEL SECURITY;

-- 用戶表的RLS政策
CREATE POLICY IF NOT EXISTS "Users can view own data" 
ON temple_users 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY IF NOT EXISTS "Users can update own data" 
ON temple_users 
FOR UPDATE 
USING (auth.uid()::text = id::text);