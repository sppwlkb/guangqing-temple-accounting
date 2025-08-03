# 基礎功能完善需求規格 (最終版)

## 1. 概述

### 1.1 目標
完善廣清宮快速記帳軟體的基礎功能，包括實現缺少的頁面組件、建立完整的支出管理系統、確保系統架構的穩定性，為後續階段的功能開發奠定堅實基礎。

### 1.2 範圍
- 實現所有缺少的核心頁面組件
- 建立完整的支出管理系統
- 完善資料存取和狀態管理架構
- 統一 UI 設計模式和用戶體驗
- 建立錯誤處理和效能優化機制

## 2. 功能需求 (EARS 格式)

### 2.1 收入管理 UI 組件

**REQ-UI-001**: 收入新增頁面
- **WHEN** 用戶點擊"新增收入"按鈕或導航到 `/income/add`
- **THE SYSTEM SHALL** 顯示收入新增表單頁面
- **WHERE** 表單包含類別選擇、金額輸入、日期選擇、捐款人、說明等欄位
- **AND** 提供表單驗證和提交功能

**REQ-UI-002**: 收入類別管理頁面  
- **WHEN** 用戶導航到 `/income/categories`
- **THE SYSTEM SHALL** 顯示收入類別管理界面
- **WHERE** 用戶可以新增、編輯、刪除收入類別
- **AND** 顯示每個類別的顏色和描述

### 2.2 支出管理 UI 組件

**REQ-UI-003**: 支出記錄列表頁面
- **WHEN** 用戶導航到 `/expense/list`  
- **THE SYSTEM SHALL** 顯示支出記錄列表
- **WHERE** 包含篩選、搜尋、分頁功能
- **AND** 提供編輯、刪除操作

**REQ-UI-004**: 支出新增頁面
- **WHEN** 用戶導航到 `/expense/add`
- **THE SYSTEM SHALL** 顯示支出新增表單
- **WHERE** 表單結構與收入表單類似但適用於支出
- **AND** 支援發票照片上傳功能

**REQ-UI-005**: 支出類別管理頁面
- **WHEN** 用戶導航到 `/expense/categories`
- **THE SYSTEM SHALL** 顯示支出類別管理界面
- **WHERE** 功能與收入類別管理相似
- **AND** 預設包含人員薪水、房租、水電費等類別

### 2.3 其他核心頁面

**REQ-UI-006**: 結餘管理頁面
- **WHEN** 用戶導航到 `/balance`
- **THE SYSTEM SHALL** 顯示期初期末結餘管理界面
- **WHERE** 顯示當前結餘狀況
- **AND** 提供結餘調整功能

**REQ-UI-007**: 個人設定頁面
- **WHEN** 用戶導航到 `/profile`
- **THE SYSTEM SHALL** 顯示個人設定界面
- **WHERE** 用戶可以修改個人資訊和偏好設定
- **AND** 包含密碼修改功能

**REQ-UI-008**: 系統設定頁面
- **WHEN** 用戶導航到 `/settings`
- **THE SYSTEM SHALL** 顯示系統設定界面
- **WHERE** 包含備份設定、同步設定等選項
- **AND** 提供系統維護功能

### 2.4 支出管理業務邏輯

**REQ-EXP-001**: 支出資料模型
- **WHEN** 系統處理支出資料
- **THE SYSTEM SHALL** 使用標準化的支出資料結構
- **WHERE** 包含 id, categoryId, amount, date, description, vendor, receipt, attachments 等欄位
- **AND** 與收入資料模型保持一致的設計模式

**REQ-EXP-002**: 支出類別預設值
- **WHEN** 系統初始化支出類別
- **THE SYSTEM SHALL** 建立預設支出類別
- **WHERE** 包含人員薪水、房租、水電費、雜項開支、參訪金、修繕費、管理費、其他
- **AND** 每個類別具有對應的顏色和描述

**REQ-EXP-003**: 支出統計計算
- **WHEN** 用戶查看支出統計
- **THE SYSTEM SHALL** 提供即時統計計算
- **WHERE** 包含總支出、月支出、平均支出、類別分布
- **AND** 與收入統計整合計算淨收入

### 2.5 系統架構需求

**REQ-ARCH-001**: 統一資料存取
- **WHEN** 組件需要存取資料
- **THE SYSTEM SHALL** 使用統一的 Pinia store 模式
- **WHERE** 所有 CRUD 操作通過標準化介面
- **AND** 支援本地儲存和未來雲端同步

**REQ-ARCH-002**: 錯誤處理機制
- **WHEN** 系統發生錯誤
- **THE SYSTEM SHALL** 使用統一的錯誤處理
- **WHERE** 提供用戶友好的錯誤訊息
- **AND** 記錄詳細的錯誤日誌

### 2.6 UI 一致性需求

**REQ-UI-009**: 設計模式統一
- **WHEN** 實現任何新的 UI 組件
- **THE SYSTEM SHALL** 遵循現有的設計模式
- **WHERE** 使用相同的顏色主題、字體、間距
- **AND** 保持與現有組件的視覺一致性

**REQ-UI-010**: 響應式設計
- **WHEN** 在不同螢幕尺寸下使用
- **THE SYSTEM SHALL** 提供適當的響應式布局
- **WHERE** 支援桌面、平板、手機等設備
- **AND** 確保功能在各種設備上都可正常使用

## 3. 非功能需求

### 3.1 可用性
- 所有表單應提供即時驗證
- 錯誤訊息應清晰易懂
- 載入狀態應有適當的視覺回饋

### 3.2 效能
- 頁面載入時間應在 2 秒內
- 表單提交應有載入指示器
- 大量資料應支援分頁或虛擬滾動

### 3.3 相容性
- 支援現代瀏覽器 (Chrome, Firefox, Safari, Edge)
- 支援 Electron 桌面環境
- 準備未來的手機 App 整合

## 4. 約束條件

### 4.1 技術約束
- 必須使用 Vue 3 + Element Plus
- 遵循現有的 Pinia store 模式
- 保持與現有路由配置的相容性

### 4.2 設計約束  
- 保持宮廟主題的視覺風格
- 使用繁體中文界面
- 符合台灣用戶的使用習慣

### 4.3 效能約束
- 頁面載入時間 < 2 秒
- 資料查詢響應時間 < 1 秒
- 支援至少 10,000 筆記錄
- 記憶體使用 < 200MB

## 5. 資料模型

### 5.1 支出記錄結構
```javascript
Expense {
  id: Number,           // 唯一識別碼
  categoryId: Number,   // 類別ID
  amount: Number,       // 金額 (正數)
  date: String,         // 支出日期 (YYYY-MM-DD)
  description: String,  // 說明
  vendor: String,       // 廠商/收款人
  receipt: String,      // 收據編號
  attachments: Array,   // 附件列表
  createdAt: String,    // 建立時間 (ISO)
  updatedAt: String,    // 更新時間 (ISO)
  status: String        // 狀態 (active/deleted)
}
```

### 5.2 支出類別結構
```javascript
ExpenseCategory {
  id: Number,           // 唯一識別碼
  name: String,         // 類別名稱
  color: String,        // 顯示顏色 (hex)
  description: String,  // 類別描述
  isDefault: Boolean,   // 是否為預設類別
  sortOrder: Number     // 排序順序
}
```

## 6. 驗收標準

### 6.1 功能驗收
- [ ] 所有路由都有對應的頁面實現
- [ ] 收入和支出 CRUD 功能完整
- [ ] 表單驗證正常運作
- [ ] 統計計算準確無誤
- [ ] 錯誤處理機制完善

### 6.2 UI 驗收
- [ ] 視覺設計與現有頁面一致
- [ ] 響應式布局在各設備正常
- [ ] 無明顯的 UI 錯誤或異常
- [ ] 用戶體驗流暢自然

### 6.3 技術驗收
- [ ] 代碼結構清晰可維護
- [ ] 效能指標符合要求
- [ ] 資料一致性維護良好
- [ ] 系統整合運作正常
