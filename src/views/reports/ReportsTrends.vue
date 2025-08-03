<template>
  <div class="reports-trends">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">趨勢分析</h1>
        <p class="page-description">分析宮廟財務的長期趨勢和變化模式</p>
      </div>
    </div>

    <!-- 趨勢概覽 -->
    <FormCard title="趨勢概覽">
      <div class="trend-overview">
        <div class="overview-item">
          <div class="overview-title">收入趨勢</div>
          <div class="overview-value income-trend">
            <el-icon><TrendCharts /></el-icon>
            <span>{{ incomeDirection }}</span>
          </div>
          <div class="overview-desc">{{ incomeDescription }}</div>
        </div>

        <div class="overview-item">
          <div class="overview-title">支出趨勢</div>
          <div class="overview-value expense-trend">
            <el-icon><TrendCharts /></el-icon>
            <span>{{ expenseDirection }}</span>
          </div>
          <div class="overview-desc">{{ expenseDescription }}</div>
        </div>

        <div class="overview-item">
          <div class="overview-title">淨收益趨勢</div>
          <div class="overview-value" :class="netDirection === '上升' ? 'income-trend' : 'expense-trend'">
            <el-icon><TrendCharts /></el-icon>
            <span>{{ netDirection }}</span>
          </div>
          <div class="overview-desc">{{ netDescription }}</div>
        </div>
      </div>
    </FormCard>

    <!-- 月度趨勢圖 -->
    <FormCard title="月度趨勢圖">
      <div class="chart-controls">
        <el-radio-group v-model="chartType" @change="handleChartTypeChange">
          <el-radio-button label="line">折線圖</el-radio-button>
          <el-radio-button label="bar">柱狀圖</el-radio-button>
          <el-radio-button label="area">面積圖</el-radio-button>
        </el-radio-group>
        
        <el-select v-model="timeRange" @change="handleTimeRangeChange" style="width: 150px">
          <el-option label="最近6個月" value="6months" />
          <el-option label="最近12個月" value="12months" />
          <el-option label="最近24個月" value="24months" />
        </el-select>
      </div>

      <div class="trend-chart">
        <div class="chart-placeholder">
          <el-icon class="chart-icon"><TrendCharts /></el-icon>
          <p>{{ chartType === 'line' ? '折線圖' : chartType === 'bar' ? '柱狀圖' : '面積圖' }}：收支月度趨勢</p>
          <p>顯示{{ timeRangeText }}的收入、支出變化趨勢</p>
        </div>
      </div>
    </FormCard>

    <!-- 季度對比 -->
    <FormCard title="季度對比分析">
      <div class="quarterly-comparison">
        <div class="comparison-table">
          <el-table :data="quarterlyData" stripe>
            <el-table-column label="季度" prop="quarter" width="100" />
            <el-table-column label="收入" prop="income" align="right">
              <template #default="{ row }">
                <span class="income-amount">NT$ {{ formatAmount(row.income) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="支出" prop="expense" align="right">
              <template #default="{ row }">
                <span class="expense-amount">NT$ {{ formatAmount(row.expense) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="淨收益" prop="net" align="right">
              <template #default="{ row }">
                <span :class="row.net >= 0 ? 'income-amount' : 'expense-amount'">
                  NT$ {{ formatAmount(Math.abs(row.net)) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="收入成長" prop="incomeGrowth" align="center">
              <template #default="{ row }">
                <span :class="row.incomeGrowth >= 0 ? 'positive' : 'negative'">
                  {{ row.incomeGrowth >= 0 ? '+' : '' }}{{ row.incomeGrowth }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column label="支出成長" prop="expenseGrowth" align="center">
              <template #default="{ row }">
                <span :class="row.expenseGrowth >= 0 ? 'negative' : 'positive'">
                  {{ row.expenseGrowth >= 0 ? '+' : '' }}{{ row.expenseGrowth }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </FormCard>

    <!-- 年度對比 -->
    <FormCard title="年度對比分析">
      <div class="yearly-comparison">
        <div class="comparison-chart">
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><BarChart /></el-icon>
            <p>柱狀圖：年度收支對比</p>
            <p>顯示最近3年的收支變化</p>
          </div>
        </div>

        <div class="yearly-stats">
          <div class="stat-card">
            <div class="stat-title">年平均收入</div>
            <div class="stat-value income-amount">NT$ {{ formatAmount(avgYearlyIncome) }}</div>
            <div class="stat-change positive">
              <el-icon><ArrowUp /></el-icon>
              年成長 {{ yearlyIncomeGrowth }}%
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-title">年平均支出</div>
            <div class="stat-value expense-amount">NT$ {{ formatAmount(avgYearlyExpense) }}</div>
            <div class="stat-change negative">
              <el-icon><ArrowUp /></el-icon>
              年成長 {{ yearlyExpenseGrowth }}%
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-title">年平均淨收益</div>
            <div class="stat-value" :class="avgYearlyNet >= 0 ? 'income-amount' : 'expense-amount'">
              NT$ {{ formatAmount(Math.abs(avgYearlyNet)) }}
            </div>
            <div class="stat-change" :class="yearlyNetGrowth >= 0 ? 'positive' : 'negative'">
              <el-icon v-if="yearlyNetGrowth >= 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              年變化 {{ yearlyNetGrowth >= 0 ? '+' : '' }}{{ yearlyNetGrowth }}%
            </div>
          </div>
        </div>
      </div>
    </FormCard>

    <!-- 趨勢預測 -->
    <FormCard title="趨勢預測">
      <div class="prediction-section">
        <el-alert
          title="趨勢預測"
          type="info"
          description="基於歷史趨勢預測未來6個月的財務走向"
          show-icon
          :closable="false"
        />

        <div class="prediction-chart">
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><TrendCharts /></el-icon>
            <p>預測圖表：未來6個月趨勢預測</p>
            <p>包含收入、支出的預測曲線和信心區間</p>
          </div>
        </div>

        <div class="prediction-summary">
          <div class="prediction-item">
            <div class="prediction-label">預測趨勢</div>
            <div class="prediction-value">{{ predictedTrend }}</div>
          </div>
          <div class="prediction-item">
            <div class="prediction-label">風險評估</div>
            <div class="prediction-value">{{ riskAssessment }}</div>
          </div>
          <div class="prediction-item">
            <div class="prediction-label">建議行動</div>
            <div class="prediction-value">{{ recommendedAction }}</div>
          </div>
        </div>
      </div>
    </FormCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  TrendCharts, BarChart, ArrowUp, ArrowDown 
} from '@element-plus/icons-vue'
import { useIncomeStore } from '@/stores/income'
import { useExpenseStore } from '@/stores/expense'
import FormCard from '@/components/common/FormCard.vue'
import { handleError } from '@/utils/errorHandler'

// Stores
const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()

// 載入狀態
const loading = ref(false)

// 圖表控制
const chartType = ref('line')
const timeRange = ref('12months')

// 趨勢方向（模擬數據）
const incomeDirection = ref('上升')
const expenseDirection = ref('穩定')
const netDirection = ref('上升')

const incomeDescription = ref('收入呈現穩定上升趨勢，主要來自捐款增加')
const expenseDescription = ref('支出保持穩定，控制良好')
const netDescription = ref('淨收益持續改善，財務狀況良好')

// 時間範圍文字
const timeRangeText = computed(() => {
  switch (timeRange.value) {
    case '6months': return '最近6個月'
    case '12months': return '最近12個月'
    case '24months': return '最近24個月'
    default: return '最近12個月'
  }
})

// 季度數據（模擬）
const quarterlyData = ref([
  {
    quarter: '2024 Q1',
    income: 450000,
    expense: 380000,
    net: 70000,
    incomeGrowth: 12.5,
    expenseGrowth: 8.3
  },
  {
    quarter: '2023 Q4',
    income: 400000,
    expense: 350000,
    net: 50000,
    incomeGrowth: 8.1,
    expenseGrowth: 5.2
  },
  {
    quarter: '2023 Q3',
    income: 370000,
    expense: 332000,
    net: 38000,
    incomeGrowth: 15.6,
    expenseGrowth: 12.1
  },
  {
    quarter: '2023 Q2',
    income: 320000,
    expense: 296000,
    net: 24000,
    incomeGrowth: 6.7,
    expenseGrowth: 3.5
  }
])

// 年度統計（模擬數據）
const avgYearlyIncome = ref(1500000)
const avgYearlyExpense = ref(1200000)
const avgYearlyNet = computed(() => avgYearlyIncome.value - avgYearlyExpense.value)

const yearlyIncomeGrowth = ref(10.2)
const yearlyExpenseGrowth = ref(7.8)
const yearlyNetGrowth = ref(18.5)

// 趨勢預測（模擬數據）
const predictedTrend = ref('收入持續增長，支出穩定控制')
const riskAssessment = ref('低風險，財務狀況穩健')
const recommendedAction = ref('維持現有策略，適度擴大收入來源')

// 格式化金額
const formatAmount = (amount) => {
  return amount.toLocaleString()
}

// 處理圖表類型變化
const handleChartTypeChange = () => {
  // 重新渲染圖表
}

// 處理時間範圍變化
const handleTimeRangeChange = () => {
  // 重新載入數據
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      incomeStore.loadIncomes(),
      expenseStore.loadExpenses()
    ])
  } catch (error) {
    handleError(error, 'Reports Trends', { operation: 'initialization' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.reports-trends {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
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

.trend-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.overview-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.overview-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.overview-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.income-trend {
  color: #67c23a;
}

.expense-trend {
  color: #f56c6c;
}

.overview-desc {
  font-size: 14px;
  color: #606266;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.trend-chart,
.comparison-chart,
.prediction-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.quarterly-comparison {
  margin-top: 16px;
}

.yearly-comparison {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.yearly-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.income-amount {
  color: #67c23a;
}

.expense-amount {
  color: #f56c6c;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

.prediction-section {
  margin-top: 16px;
}

.prediction-chart {
  margin: 20px 0;
}

.prediction-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.prediction-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.prediction-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.prediction-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .reports-trends {
    padding: 16px;
  }
  
  .trend-overview {
    grid-template-columns: 1fr;
  }
  
  .chart-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .yearly-comparison {
    grid-template-columns: 1fr;
  }
  
  .prediction-summary {
    grid-template-columns: 1fr;
  }
}
</style>
