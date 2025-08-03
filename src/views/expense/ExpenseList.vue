<template>
  <div class="expense-list">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">支出記錄</h1>
        <p class="page-description">管理宮廟的所有支出記錄</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增支出
        </el-button>
      </div>
    </div>

    <!-- 工具列 -->
    <FormCard title="篩選條件">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
          <CategorySelector
            v-model="selectedCategory"
            :categories="expenseStore.categories"
            placeholder="選擇類別"
            style="width: 180px"
            @change="handleCategoryChange"
          />
          <el-input
            v-model="searchKeyword"
            placeholder="搜尋說明或廠商"
            style="width: 200px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="toolbar-right">
          <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </FormCard>

    <!-- 統計摘要 -->
    <FormCard title="統計摘要">
      <div class="stats-summary">
        <div class="stat-item">
          <div class="stat-label">記錄筆數</div>
          <div class="stat-value">{{ filteredExpenses.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">總支出</div>
          <div class="stat-value expense-amount">NT$ {{ formatAmount(totalAmount) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">平均支出</div>
          <div class="stat-value">NT$ {{ formatAmount(averageAmount) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">最大支出</div>
          <div class="stat-value">NT$ {{ formatAmount(maxAmount) }}</div>
        </div>
      </div>
    </FormCard>

    <!-- 支出列表 -->
    <FormCard title="支出記錄">
      <DataTable
        :data="filteredExpenses"
        :loading="loading"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredExpenses.length"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <!-- 日期列 -->
        <el-table-column label="日期" width="120" sortable prop="date">
          <template #default="{ row }">
            <span>{{ formatDate(row.date) }}</span>
          </template>
        </el-table-column>

        <!-- 類別列 -->
        <el-table-column label="類別" width="120">
          <template #default="{ row }">
            <div class="category-cell">
              <span 
                class="category-color"
                :style="{ backgroundColor: getCategoryColor(row.categoryId) }"
              ></span>
              <span>{{ getCategoryName(row.categoryId) }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 金額列 -->
        <el-table-column label="金額" width="120" sortable prop="amount" align="right">
          <template #default="{ row }">
            <span class="expense-amount">NT$ {{ formatAmount(row.amount) }}</span>
          </template>
        </el-table-column>

        <!-- 廠商列 -->
        <el-table-column label="廠商/收款人" min-width="120" prop="vendor">
          <template #default="{ row }">
            <span>{{ row.vendor || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 說明列 -->
        <el-table-column label="說明" min-width="150" prop="description">
          <template #default="{ row }">
            <span>{{ row.description || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 收據列 -->
        <el-table-column label="收據編號" width="120" prop="receipt">
          <template #default="{ row }">
            <span>{{ row.receipt || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <el-button
            type="primary"
            size="small"
            :icon="Edit"
            @click="handleEdit(row)"
          >
            編輯
          </el-button>
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleDelete(row)"
          >
            刪除
          </el-button>
        </template>
      </DataTable>
    </FormCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useExpenseStore } from '@/stores/expense'
import FormCard from '@/components/common/FormCard.vue'
import DataTable from '@/components/common/DataTable.vue'
import CategorySelector from '@/components/business/CategorySelector.vue'
import { handleError } from '@/utils/errorHandler'

// 路由和 Store
const router = useRouter()
const expenseStore = useExpenseStore()

// 載入狀態
const loading = ref(false)

// 篩選條件
const dateRange = ref([])
const selectedCategory = ref(null)
const searchKeyword = ref('')

// 分頁
const currentPage = ref(1)
const pageSize = ref(20)

// 篩選後的支出記錄
const filteredExpenses = computed(() => {
  let expenses = [...expenseStore.expenses]

  // 日期範圍篩選
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    expenses = expenses.filter(expense => {
      const expenseDate = dayjs(expense.date)
      return expenseDate.isAfter(dayjs(startDate).subtract(1, 'day')) && 
             expenseDate.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  // 類別篩選
  if (selectedCategory.value) {
    expenses = expenses.filter(expense => expense.categoryId === selectedCategory.value)
  }

  // 關鍵字搜尋
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    expenses = expenses.filter(expense => 
      (expense.description && expense.description.toLowerCase().includes(keyword)) ||
      (expense.vendor && expense.vendor.toLowerCase().includes(keyword))
    )
  }

  // 按日期排序（最新的在前）
  return expenses.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
})

// 統計計算
const totalAmount = computed(() => {
  return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
})

const averageAmount = computed(() => {
  const count = filteredExpenses.value.length
  return count > 0 ? totalAmount.value / count : 0
})

const maxAmount = computed(() => {
  return filteredExpenses.value.length > 0 
    ? Math.max(...filteredExpenses.value.map(expense => expense.amount))
    : 0
})

// 格式化金額
const formatAmount = (amount) => {
  return amount.toLocaleString()
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('MM/DD')
}

// 獲取類別名稱
const getCategoryName = (categoryId) => {
  const category = expenseStore.categories.find(cat => cat.id === categoryId)
  return category ? category.name : '未知類別'
}

// 獲取類別顏色
const getCategoryColor = (categoryId) => {
  const category = expenseStore.categories.find(cat => cat.id === categoryId)
  return category ? category.color : '#909399'
}

// 處理新增
const handleAdd = () => {
  router.push('/expense/add')
}

// 處理編輯
const handleEdit = (expense) => {
  router.push(`/expense/edit/${expense.id}`)
}

// 處理刪除
const handleDelete = async (expense) => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除這筆支出記錄嗎？\n金額：NT$ ${formatAmount(expense.amount)}\n說明：${expense.description || '無'}`,
      '確認刪除',
      {
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await expenseStore.deleteExpense(expense.id)
    ElMessage.success('支出記錄已刪除')
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error, 'Expense Management', { operation: 'deleteExpense' })
    }
  }
}

// 處理日期範圍變化
const handleDateRangeChange = () => {
  currentPage.value = 1
}

// 處理類別變化
const handleCategoryChange = () => {
  currentPage.value = 1
}

// 處理搜尋
const handleSearch = () => {
  currentPage.value = 1
}

// 處理刷新
const handleRefresh = async () => {
  loading.value = true
  try {
    await expenseStore.loadExpenses()
    ElMessage.success('資料已刷新')
  } catch (error) {
    handleError(error, 'Expense Management', { operation: 'loadExpenses' })
  } finally {
    loading.value = false
  }
}

// 處理分頁變化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 處理每頁大小變化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    await expenseStore.loadExpenses()
  } catch (error) {
    handleError(error, 'Expense Management', { operation: 'initialization' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.expense-list {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.expense-amount {
  color: #f56c6c;
  font-weight: 500;
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .expense-list {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left {
    justify-content: center;
  }
  
  .toolbar-right {
    justify-content: center;
  }
  
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
