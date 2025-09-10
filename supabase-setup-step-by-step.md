# Supabase 設定步驟指南

如果 SQL 腳本執行有問題，請按照以下步驟一步一步執行：

## 步驟1：建立主表

```sql
CREATE TABLE temple_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    data JSONB NOT NULL,
    last_modified BIGINT NOT NULL,
    version TEXT DEFAULT '2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 步驟2：建立索引

```sql
CREATE INDEX idx_temple_data_device_id ON temple_data(device_id);
```

```sql
CREATE INDEX idx_temple_data_updated_at ON temple_data(updated_at DESC);
```

```sql
CREATE INDEX idx_temple_data_last_modified ON temple_data(last_modified DESC);
```

## 步驟3：啟用 Row Level Security

```sql
ALTER TABLE temple_data ENABLE ROW LEVEL SECURITY;
```

## 步驟4：建立存取政策

```sql
CREATE POLICY "temple_data_policy" 
ON temple_data 
FOR ALL 
USING (true) 
WITH CHECK (true);
```

## 步驟5：建立更新時間戳函數

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## 步驟6：建立觸發器

```sql
CREATE TRIGGER update_temple_data_updated_at 
    BEFORE UPDATE ON temple_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 驗證設定

```sql
-- 檢查表是否建立成功
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'temple_data';

-- 檢查政策是否建立成功
SELECT policyname FROM pg_policies 
WHERE tablename = 'temple_data';
```

## 測試插入數據

```sql
-- 測試插入一筆資料
INSERT INTO temple_data (device_id, data, last_modified) 
VALUES ('test_device', '{"test": true}', EXTRACT(EPOCH FROM NOW()) * 1000);

-- 檢查資料是否插入成功
SELECT * FROM temple_data;
```

如果以上步驟都成功，表示 Supabase 設定完成！