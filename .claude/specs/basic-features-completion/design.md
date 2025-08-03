# 基礎功能完善設計文檔 (最終版)

## 1. 設計概述

### 1.1 設計目標
建立完整的基礎功能設計方案，包括用戶界面設計、資料架構設計和系統整合設計，確保所有新增功能與現有系統的無縫整合，提供優秀的用戶體驗和穩固的技術基礎。

### 1.2 設計原則
- **一致性**：遵循現有的設計語言和技術架構模式
- **簡潔性**：介面簡潔明瞭，代碼結構清晰
- **效率性**：優化操作流程和系統效能
- **可擴展性**：為未來功能擴展預留空間
- **可維護性**：確保代碼易於理解和修改

## 2. UI 組件設計

### 2.1 收入管理組件設計

#### 2.1.1 收入新增頁面 (IncomeAdd.vue)
```
頁面結構：
┌─────────────────────────────────────┐
│ 頁面標題：新增收入                    │
├─────────────────────────────────────┤
│ 表單區域                            │
│ ┌─────────────┬─────────────────────┐ │
│ │ 類別選擇     │ 金額輸入             │ │
│ ├─────────────┼─────────────────────┤ │
│ │ 日期選擇     │ 捐款人               │ │
│ ├─────────────┴─────────────────────┤ │
│ │ 說明 (多行文字輸入)                │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 操作按鈕：[取消] [儲存]              │
└─────────────────────────────────────┘
```

**設計要點：**
- 使用 Element Plus 的 el-form 組件
- 表單採用兩欄布局，響應式調整
- 類別選擇使用下拉選單，顯示顏色標識
- 金額輸入使用數字輸入框，支援千分位顯示
- 表單驗證即時顯示，錯誤訊息清晰

#### 2.1.2 收入類別管理頁面 (IncomeCategories.vue)
```
頁面結構：
┌─────────────────────────────────────┐
│ 頁面標題：收入類別管理 [新增類別]     │
├─────────────────────────────────────┤
│ 類別列表                            │
│ ┌─────┬──────────┬────────┬────────┐ │
│ │顏色 │ 類別名稱  │ 描述    │ 操作   │ │
│ ├─────┼──────────┼────────┼────────┤ │
│ │ ●   │ 香油錢    │ 信眾... │[編輯]  │ │
│ │ ●   │ 點光明燈  │ 點燈... │[編輯]  │ │
│ └─────┴──────────┴────────┴────────┘ │
└─────────────────────────────────────┘
```

### 2.2 支出管理組件設計

#### 2.2.1 支出記錄列表頁面 (ExpenseList.vue)
```
頁面結構：
┌─────────────────────────────────────┐
│ 頁面標題：支出記錄                   │
├─────────────────────────────────────┤
│ 工具列                              │
│ [日期範圍] [類別篩選] [搜尋] [新增]   │
├─────────────────────────────────────┤
│ 統計摘要                            │
│ [記錄筆數] [總金額] [平均] [最大]     │
├─────────────────────────────────────┤
│ 資料表格                            │
│ 日期 │ 類別 │ 金額 │ 廠商 │ 說明 │操作│
├─────────────────────────────────────┤
│ 分頁控制                            │
└─────────────────────────────────────┘
```

#### 2.2.2 支出新增頁面 (ExpenseAdd.vue)
```
頁面結構：
┌─────────────────────────────────────┐
│ 頁面標題：新增支出                   │
├─────────────────────────────────────┤
│ 表單區域                            │
│ ┌─────────────┬─────────────────────┐ │
│ │ 類別選擇     │ 金額輸入             │ │
│ ├─────────────┼─────────────────────┤ │
│ │ 日期選擇     │ 廠商/收款人          │ │
│ ├─────────────┼─────────────────────┤ │
│ │ 收據編號     │ 附件上傳             │ │
│ ├─────────────┴─────────────────────┤ │
│ │ 說明 (多行文字輸入)                │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 操作按鈕：[取消] [儲存]              │
└─────────────────────────────────────┘
```

### 2.3 其他核心頁面設計

#### 2.3.1 結餘管理頁面 (Balance.vue)
```
頁面結構：
┌─────────────────────────────────────┐
│ 頁面標題：結餘管理                   │
├─────────────────────────────────────┤
│ 當前結餘概覽                        │
│ ┌─────────────┬─────────────────────┐ │
│ │ 期初結餘     │ NT$ 100,000         │ │
│ ├─────────────┼─────────────────────┤ │
│ │ 本期收入     │ NT$ 50,000          │ │
│ ├─────────────┼─────────────────────┤ │
│ │ 本期支出     │ NT$ 30,000          │ │
│ ├─────────────┼─────────────────────┤ │
│ │ 期末結餘     │ NT$ 120,000         │ │
│ └─────────────┴─────────────────────┘ │
├─────────────────────────────────────┤
│ 結餘調整                            │
│ [調整金額] [調整原因] [確認調整]      │
└─────────────────────────────────────┘
```

## 3. 資料架構設計

### 3.1 支出記錄資料結構
```javascript
const ExpenseSchema = {
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

### 3.2 支出類別資料結構
```javascript
const ExpenseCategorySchema = {
  id: Number,           // 唯一識別碼
  name: String,         // 類別名稱
  color: String,        // 顯示顏色 (hex)
  description: String,  // 類別描述
  isDefault: Boolean,   // 是否為預設類別
  sortOrder: Number     // 排序順序
}
```

### 3.3 Pinia Store 設計模式
```javascript
// stores/expense.js 基本結構
export const useExpenseStore = defineStore('expense', () => {
  // 狀態
  const expenses = ref([])
  const categories = ref([])
  const loading = ref(false)
  
  // 計算屬性
  const totalExpense = computed(() => 
    expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  )
  
  const monthlyExpense = computed(() => {
    const currentMonth = dayjs().format('YYYY-MM')
    return expenses.value
      .filter(expense => dayjs(expense.date).format('YYYY-MM') === currentMonth)
      .reduce((sum, expense) => sum + expense.amount, 0)
  })
  
  // 方法
  const addExpense = async (expenseData) => { /* 實現邏輯 */ }
  const updateExpense = async (id, data) => { /* 實現邏輯 */ }
  const deleteExpense = async (id) => { /* 實現邏輯 */ }
  
  return { 
    expenses, categories, loading, 
    totalExpense, monthlyExpense,
    addExpense, updateExpense, deleteExpense 
  }
})
```

## 4. 系統整合設計

### 4.1 模組化架構
```
src/
├── components/
│   ├── common/          # 共用組件 (FormCard, DataTable, FileUpload)
│   └── business/        # 業務組件 (CategorySelector, AmountInput)
├── views/               # 頁面組件
│   ├── income/          # 收入相關頁面
│   ├── expense/         # 支出相關頁面
│   └── ...
├── stores/              # 狀態管理
├── services/            # 服務層 (API, Storage, File)
├── utils/               # 工具函數 (Validators, Formatters)
└── composables/         # 組合式函數 (useForm, useTable)
```

### 4.2 錯誤處理機制
```javascript
// utils/errorHandler.js
class ErrorHandler {
  static handle(error, context = '') {
    // 記錄錯誤
    this.logError({ error, context, timestamp: new Date() })
    
    // 顯示用戶友好訊息
    const userMessage = this.getUserFriendlyMessage(error)
    ElMessage.error(userMessage)
  }
  
  static getUserFriendlyMessage(error) {
    const errorMap = {
      'NetworkError': '網路連線異常，請檢查網路設定',
      'ValidationError': '資料格式不正確，請檢查輸入內容',
      'StorageError': '資料儲存失敗，請檢查儲存空間'
    }
    return errorMap[error.name] || '系統發生未知錯誤，請稍後再試'
  }
}
```

### 4.3 效能優化策略
- **組件懶載入**：使用動態 import 載入頁面組件
- **資料分頁**：大量資料使用分頁或虛擬滾動
- **計算快取**：快取複雜計算結果
- **圖片優化**：壓縮和縮圖處理

## 5. 視覺設計規範

### 5.1 色彩系統
- 主色：#409EFF (藍色)
- 成功：#67C23A (綠色)  
- 警告：#E6A23C (橙色)
- 危險：#F56C6C (紅色)
- 資訊：#909399 (灰色)

### 5.2 字體和間距
- 標題：16px-24px，字重 600
- 正文：14px，字重 400
- 基礎間距：8px 的倍數 (8px, 16px, 24px)

### 5.3 響應式斷點
- 桌面版：≥ 1200px (雙欄布局)
- 平板版：768px - 1199px (單欄布局)
- 手機版：< 768px (堆疊布局)

## 6. 組件復用策略

### 6.1 共用組件設計
- **FormCard**：表單卡片容器
- **DataTable**：資料表格組件
- **CategorySelector**：類別選擇器
- **AmountInput**：金額輸入組件
- **FileUpload**：檔案上傳組件

### 6.2 業務邏輯復用
```javascript
// composables/useFinancialData.js
export function useFinancialData() {
  const incomeStore = useIncomeStore()
  const expenseStore = useExpenseStore()
  
  const totalBalance = computed(() => 
    incomeStore.totalIncome - expenseStore.totalExpense
  )
  
  const monthlyBalance = computed(() => 
    incomeStore.monthlyIncome - expenseStore.monthlyExpense
  )
  
  return { totalBalance, monthlyBalance }
}
```

## 7. 設計驗收標準

### 7.1 UI 驗收
- [ ] 與現有頁面視覺風格一致
- [ ] 色彩使用符合設計規範
- [ ] 字體和間距統一
- [ ] 操作流程直觀順暢
- [ ] 響應式設計在各設備正常

### 7.2 功能驗收
- [ ] 所有 CRUD 操作正常
- [ ] 資料驗證機制完整
- [ ] 統計計算準確
- [ ] 錯誤處理友好

### 7.3 技術驗收
- [ ] 代碼結構清晰可維護
- [ ] 效能指標符合要求
- [ ] 模組整合運作正常
- [ ] 測試覆蓋率充足
