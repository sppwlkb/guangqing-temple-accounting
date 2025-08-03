<template>
  <div class="reports-analysis">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">財務分析</h1>
        <p class="page-description">深度分析宮廟的財務狀況和趨勢</p>
      </div>
    </div>

    <!-- 分析概覽 -->
    <FormCard title="財務健康度">
      <div class="health-indicators">
        <div class="indicator">
          <div class="indicator-title">收支平衡度</div>
          <div class="indicator-value">
            <el-progress 
              :percentage="balanceRatio" 
              :color="getBalanceColor(balanceRatio)"
              :stroke-width="8"
            />
          </div>
          <div class="indicator-desc">{{ getBalanceDesc(balanceRatio) }}</div>
        </div>

        <div class="indicator">
          <div class="indicator-title">收入穩定性</div>
          <div class="indicator-value">
            <el-progress 
              :percentage="incomeStability" 
              color="#67c23a"
              :stroke-width="8"
            />
          </div>
          <div class="indicator-desc">{{ getStabilityDesc(incomeStability) }}</div>
        </div>

        <div class="indicator">
          <div class="indicator-title">支出控制度</div>
          <div class="indicator-value">
            <el-progress 
              :percentage="expenseControl" 
              color="#e6a23c"
              :stroke-width="8"
            />
          </div>
          <div class="indicator-desc">{{ getControlDesc(expenseControl) }}</div>
        </div>
      </div>
    </FormCard>

    <!-- 收入分析 -->
    <FormCard title="收入結構分析">
      <div class="analysis-grid">
        <div class="chart-section">
          <h4>收入來源分佈</h4>
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><PieChart /></el-icon>
            <p>圓餅圖：各類別收入佔比</p>
          </div>
        </div>

        <div class="stats-section">
          <h4>收入統計</h4>
          <div class="stat-list">
            <div class="stat-row">
              <span class="stat-label">主要收入來源</span>
              <span class="stat-value">{{ primaryIncomeSource }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">收入集中度</span>
              <span class="stat-value">{{ incomeConcentration }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">月平均收入</span>
              <span class="stat-value income-amount">NT$ {{ formatAmount(avgMonthlyIncome) }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">收入成長率</span>
              <span class="stat-value" :class="incomeGrowthRate >= 0 ? 'positive' : 'negative'">
                {{ incomeGrowthRate >= 0 ? '+' : '' }}{{ incomeGrowthRate }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </FormCard>

    <!-- 支出分析 -->
    <FormCard title="支出結構分析">
      <div class="analysis-grid">
        <div class="chart-section">
          <h4>支出類別分佈</h4>
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><PieChart /></el-icon>
            <p>圓餅圖：各類別支出佔比</p>
          </div>
        </div>

        <div class="stats-section">
          <h4>支出統計</h4>
          <div class="stat-list">
            <div class="stat-row">
              <span class="stat-label">主要支出項目</span>
              <span class="stat-value">{{ primaryExpenseCategory }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">支出集中度</span>
              <span class="stat-value">{{ expenseConcentration }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">月平均支出</span>
              <span class="stat-value expense-amount">NT$ {{ formatAmount(avgMonthlyExpense) }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">支出成長率</span>
              <span class="stat-value" :class="expenseGrowthRate >= 0 ? 'negative' : 'positive'">
                {{ expenseGrowthRate >= 0 ? '+' : '' }}{{ expenseGrowthRate }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </FormCard>

    <!-- 趨勢分析 -->
    <FormCard title="趨勢分析">
      <div class="trend-analysis">
        <div class="trend-chart">
          <h4>收支趨勢圖</h4>
          <div class="chart-placeholder large">
            <el-icon class="chart-icon"><TrendCharts /></el-icon>
            <p>折線圖：收入與支出月度趨勢</p>
            <p>將顯示最近12個月的收支變化</p>
          </div>
        </div>
      </div>
    </FormCard>

    <!-- 預測分析 -->
    <FormCard title="預測分析">
      <div class="prediction-section">
        <el-alert
          title="預測功能"
          type="info"
          description="基於歷史數據預測未來3個月的收支狀況"
          show-icon
          :closable="false"
        />

        <div class="prediction-grid">
          <div class="prediction-card">
            <div class="prediction-title">下月預測收入</div>
            <div class="prediction-value income-amount">NT$ {{ formatAmount(predictedIncome) }}</div>
            <div class="prediction-confidence">信心度：{{ incomeConfidence }}%</div>
          </div>

          <div class="prediction-card">
            <div class="prediction-title">下月預測支出</div>
            <div class="prediction-value expense-amount">NT$ {{ formatAmount(predictedExpense) }}</div>
            <div class="prediction-confidence">信心度：{{ expenseConfidence }}%</div>
          </div>

          <div class="prediction-card">
            <div class="prediction-title">預測淨收益</div>
            <div class="prediction-value" :class="predictedNet >= 0 ? 'income-amount' : 'expense-amount'">
              NT$ {{ formatAmount(Math.abs(predictedNet)) }}
            </div>
            <div class="prediction-confidence">
              {{ predictedNet >= 0 ? '盈餘' : '虧損' }}
            </div>
          </div>
        </div>
      </div>
    </FormCard>

    <!-- 建議事項 -->
    <FormCard title="財務建議">
      <div class="recommendations">
        <div 
          v-for="(recommendation, index) in recommendations" 
          :key="index"
          class="recommendation-item"
        >
          <div class="recommendation-icon">
            <el-icon :class="recommendation.type">
              <component :is="recommendation.icon" />
            </el-icon>
          </div>
          <div class="recommendation-content">
            <div class="recommendation-title">{{ recommendation.title }}</div>
            <div class="recommendation-desc">{{ recommendation.description }}</div>
          </div>
        </div>
      </div>
    </FormCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PieChart, TrendCharts, Warning, SuccessFilled, InfoFilled 
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

// 財務健康度指標
const balanceRatio = computed(() => {
  const totalIncome = incomeStore.totalIncome
  const totalExpense = expenseStore.totalExpense
  if (totalIncome === 0) return 0
  return Math.min(100, Math.round((totalIncome / (totalIncome + totalExpense)) * 100))
})

const incomeStability = ref(75) // 模擬數據
const expenseControl = ref(82) // 模擬數據

// 收入分析
const primaryIncomeSource = computed(() => {
  if (incomeStore.categories.length === 0) return '無資料'
  
  const categoryAmounts = incomeStore.categories.map(category => ({
    name: category.name,
    amount: incomeStore.incomes
      .filter(income => income.categoryId === category.id)
      .reduce((sum, income) => sum + income.amount, 0)
  }))
  
  const maxCategory = categoryAmounts.reduce((max, current) => 
    current.amount > max.amount ? current : max
  )
  
  return maxCategory.name
})

const incomeConcentration = ref(65) // 模擬數據
const avgMonthlyIncome = computed(() => incomeStore.totalIncome / 12)
const incomeGrowthRate = ref(12.5) // 模擬數據

// 支出分析
const primaryExpenseCategory = computed(() => {
  if (expenseStore.categories.length === 0) return '無資料'
  
  const categoryAmounts = expenseStore.categories.map(category => ({
    name: category.name,
    amount: expenseStore.expenses
      .filter(expense => expense.categoryId === category.id)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }))
  
  const maxCategory = categoryAmounts.reduce((max, current) => 
    current.amount > max.amount ? current : max
  )
  
  return maxCategory.name
})

const expenseConcentration = ref(45) // 模擬數據
const avgMonthlyExpense = computed(() => expenseStore.totalExpense / 12)
const expenseGrowthRate = ref(8.3) // 模擬數據

// 預測數據
const predictedIncome = ref(150000) // 模擬數據
const predictedExpense = ref(120000) // 模擬數據
const predictedNet = computed(() => predictedIncome.value - predictedExpense.value)
const incomeConfidence = ref(85) // 模擬數據
const expenseConfidence = ref(78) // 模擬數據

// 建議事項
const recommendations = computed(() => {
  const items = []
  
  if (balanceRatio.value < 60) {
    items.push({
      type: 'warning',
      icon: 'Warning',
      title: '收支失衡警告',
      description: '支出佔比過高，建議檢視支出項目並進行優化'
    })
  }
  
  if (incomeConcentration.value > 70) {
    items.push({
      type: 'info',
      icon: 'InfoFilled',
      title: '收入來源多元化',
      description: '收入過度集中於單一來源，建議開拓多元化收入管道'
    })
  }
  
  if (expenseGrowthRate.value > 15) {
    items.push({
      type: 'warning',
      icon: 'Warning',
      title: '支出成長過快',
      description: '支出成長率偏高，建議加強成本控制'
    })
  }
  
  items.push({
    type: 'success',
    icon: 'SuccessFilled',
    title: '財務狀況良好',
    description: '整體財務狀況穩定，建議持續監控並優化'
  })
  
  return items
})

// 輔助函數
const formatAmount = (amount) => {
  return amount.toLocaleString()
}

const getBalanceColor = (ratio) => {
  if (ratio >= 70) return '#67c23a'
  if (ratio >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getBalanceDesc = (ratio) => {
  if (ratio >= 70) return '收支平衡良好'
  if (ratio >= 50) return '收支基本平衡'
  return '收支失衡，需要關注'
}

const getStabilityDesc = (stability) => {
  if (stability >= 80) return '收入非常穩定'
  if (stability >= 60) return '收入較為穩定'
  return '收入波動較大'
}

const getControlDesc = (control) => {
  if (control >= 80) return '支出控制良好'
  if (control >= 60) return '支出控制一般'
  return '支出控制需要改善'
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
    handleError(error, 'Reports Analysis', { operation: 'initialization' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.reports-analysis {
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

.health-indicators {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.indicator {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.indicator-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.indicator-value {
  margin-bottom: 12px;
}

.indicator-desc {
  font-size: 14px;
  color: #606266;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.chart-section h4,
.stats-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #909399;
}

.chart-placeholder.large {
  height: 300px;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-weight: 500;
  color: #303133;
}

.income-amount {
  color: #67c23a;
}

.expense-amount {
  color: #f56c6c;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

.trend-analysis {
  margin-top: 16px;
}

.trend-chart h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.prediction-section {
  margin-top: 16px;
}

.prediction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.prediction-card {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.prediction-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.prediction-value {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.prediction-confidence {
  font-size: 12px;
  color: #909399;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.recommendation-icon {
  font-size: 20px;
  margin-top: 2px;
}

.recommendation-icon.warning {
  color: #e6a23c;
}

.recommendation-icon.success {
  color: #67c23a;
}

.recommendation-icon.info {
  color: #409eff;
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.recommendation-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .reports-analysis {
    padding: 16px;
  }
  
  .health-indicators {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .prediction-grid {
    grid-template-columns: 1fr;
  }
}
</style>
