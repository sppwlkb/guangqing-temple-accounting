<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">總覽儀表板</h1>
      <p class="page-description">廣清宮財務狀況一覽</p>
    </div>

    <!-- 統計卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8" :md="8">
        <div class="stat-card income">
          <div class="stat-value">{{ formatAmount(incomeStore.monthlyIncome, 'TWD') }}</div>
          <div class="stat-label">本月收入</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8" :md="8">
        <div class="stat-card expense">
          <div class="stat-value">{{ formatAmount(expenseStore.monthlyExpense, 'TWD') }}</div>
          <div class="stat-label">本月支出</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8" :md="8">
        <div class="stat-card balance">
          <div class="stat-value">{{ formatAmount(monthlyBalance, 'TWD') }}</div>
          <div class="stat-label">本月結餘</div>
        </div>
      </el-col>
    </el-row>

    <!-- 圖表區域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="12">
        <div class="chart-container">
          <h3 class="chart-title">收支趨勢 (近7天)</h3>
          <div ref="trendChartEl" style="height: 300px;"></div>
        </div>
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="chart-container">
          <h3 class="chart-title">收入類別分布</h3>
          <div ref="incomeChartEl" style="height: 300px;"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 最近記錄 -->
    <el-row :gutter="20" class="recent-records">
      <el-col :xs="24" :md="12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">最近收入</h3>
            <el-button type="primary" size="small" @click="$router.push('/income/add')">
              新增收入
            </el-button>
          </div>
          <el-table :data="incomeStore.recentIncomes.slice(0, 5)" style="width: 100%">
            <el-table-column prop="date" label="日期" width="100">
              <template #default="{ row }">
                {{ formatDate(row.date, 'MM/DD') }}
              </template>
            </el-table-column>
            <el-table-column prop="categoryId" label="類別" width="100">
              <template #default="{ row }">
                <el-tag 
                  :color="getCategoryColor(row.categoryId, 'income')"
                  size="small"
                  style="color: white;"
                >
                  {{ getCategoryName(row.categoryId, 'income') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金額" align="right">
              <template #default="{ row }">
                <span class="amount income">+{{ formatAmount(row.amount, 'TWD') }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="incomeStore.recentIncomes.length === 0" class="empty-state">
            <el-icon class="empty-state-icon"><DocumentRemove /></el-icon>
            <p class="empty-state-text">暫無收入記錄</p>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">最近支出</h3>
            <el-button type="primary" size="small" @click="$router.push('/expense/add')">
              新增支出
            </el-button>
          </div>
          <el-table :data="expenseStore.recentExpenses.slice(0, 5)" style="width: 100%">
            <el-table-column prop="date" label="日期" width="100">
              <template #default="{ row }">
                {{ formatDate(row.date, 'MM/DD') }}
              </template>
            </el-table-column>
            <el-table-column prop="categoryId" label="類別" width="100">
              <template #default="{ row }">
                <el-tag 
                  :color="getCategoryColor(row.categoryId, 'expense')"
                  size="small"
                  style="color: white;"
                >
                  {{ getCategoryName(row.categoryId, 'expense') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金額" align="right">
              <template #default="{ row }">
                <span class="amount expense">-{{ formatAmount(row.amount, 'TWD') }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="expenseStore.recentExpenses.length === 0" class="empty-state">
            <el-icon class="empty-state-icon"><DocumentRemove /></el-icon>
            <p class="empty-state-text">暫無支出記錄</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">快速操作</h3>
      </div>
      <div class="quick-actions">
        <el-button type="primary" @click="$router.push('/income/add')">
          <el-icon><Plus /></el-icon>
          新增收入
        </el-button>
        <el-button type="warning" @click="$router.push('/expense/add')">
          <el-icon><Minus /></el-icon>
          新增支出
        </el-button>
        <el-button type="info" @click="$router.push('/reports/summary')">
          <el-icon><Document /></el-icon>
          查看報表
        </el-button>
        <el-button type="success" @click="$router.push('/reports/export')">
          <el-icon><Download /></el-icon>
          匯出資料
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useIncomeStore } from '@/stores/income'
import { useExpenseStore } from '@/stores/expense'
import { useTrendChart } from '@/composables/useTrendChart'
import { useIncomeChart } from '@/composables/useIncomeChart'
import { formatAmount, formatDate } from '@/utils/helpers'
import { 
  Plus, Minus, Document, Download, DocumentRemove 
} from '@element-plus/icons-vue'

const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()

// Refs for chart elements
const trendChartEl = ref(null)
const incomeChartEl = ref(null)

// Use composables to manage charts
useTrendChart(trendChartEl)
useIncomeChart(incomeChartEl)

const monthlyBalance = computed(() => {
  return incomeStore.monthlyIncome - expenseStore.monthlyExpense
})

const getCategoryName = (categoryId, type) => {
  const store = type === 'income' ? incomeStore : expenseStore
  const category = store.categories.find(c => c.id === categoryId)
  return category ? category.name : '未知'
}

const getCategoryColor = (categoryId, type) => {
  const store = type === 'income' ? incomeStore : expenseStore
  const category = store.categories.find(c => c.id === categoryId)
  return category ? category.color : '#909399'
}

// Load data on component mount
onMounted(() => {
  // Data loading is now more centralized if needed, but can still be triggered here
  // The chart composables will automatically initialize on mount.
  Promise.all([
    incomeStore.loadIncomes(),
    incomeStore.loadCategories(),
    expenseStore.loadExpenses(),
    expenseStore.loadCategories()
  ])
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 24px;
}

.charts-row {
  margin-bottom: 24px;
}

.recent-records {
  margin-bottom: 24px;
}

.quick-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-actions .el-button {
    width: 100%;
  }
}
</style>