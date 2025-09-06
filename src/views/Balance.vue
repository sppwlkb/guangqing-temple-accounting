<template>
  <div class="balance-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">結餘管理</h1>
      <p class="page-description">查看和管理宮廟的財務結餘狀況</p>
    </div>

    <!-- 結餘總覽 -->
    <el-row :gutter="20" class="balance-overview">
      <el-col :xs="24" :sm="8">
        <div class="balance-card total">
          <div class="card-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(totalBalance) }}</div>
            <div class="card-label">總結餘</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="8">
        <div class="balance-card income">
          <div class="card-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(totalIncome) }}</div>
            <div class="card-label">總收入</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="8">
        <div class="balance-card expense">
          <div class="card-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(totalExpense) }}</div>
            <div class="card-label">總支出</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 月度結餘趨勢 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">月度結餘趨勢</h3>
        <div class="header-actions">
          <el-date-picker
            v-model="selectedYear"
            type="year"
            placeholder="選擇年份"
            format="YYYY年"
            value-format="YYYY"
            @change="loadBalanceData"
          />
        </div>
      </div>
      <div ref="balanceChart" style="height: 400px;"></div>
    </div>

    <!-- 結餘詳情表格 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">結餘詳情</h3>
        <div class="header-actions">
          <el-button type="primary" @click="exportBalance">
            <el-icon><Download /></el-icon>
            匯出結餘報表
          </el-button>
        </div>
      </div>
      
      <el-table :data="balanceDetails" style="width: 100%">
        <el-table-column prop="month" label="月份" width="120">
          <template #default="{ row }">
            {{ formatMonth(row.month) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="income" label="收入" align="right">
          <template #default="{ row }">
            <span class="amount income">+{{ formatCurrency(row.income) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="expense" label="支出" align="right">
          <template #default="{ row }">
            <span class="amount expense">-{{ formatCurrency(row.expense) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="balance" label="結餘" align="right">
          <template #default="{ row }">
            <span :class="['amount', row.balance >= 0 ? 'income' : 'expense']">
              {{ row.balance >= 0 ? '+' : '' }}{{ formatCurrency(row.balance) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="cumulativeBalance" label="累計結餘" align="right">
          <template #default="{ row }">
            <span :class="['amount', row.cumulativeBalance >= 0 ? 'income' : 'expense']">
              {{ row.cumulativeBalance >= 0 ? '+' : '' }}{{ formatCurrency(row.cumulativeBalance) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 結餘分析 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">收支比例</h3>
          </div>
          <div ref="pieChart" style="height: 300px;"></div>
        </div>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">結餘統計</h3>
          </div>
          <div class="balance-stats">
            <div class="stat-item">
              <span class="stat-label">平均月結餘</span>
              <span class="stat-value">{{ formatCurrency(averageBalance) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最高月結餘</span>
              <span class="stat-value">{{ formatCurrency(maxBalance) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最低月結餘</span>
              <span class="stat-value">{{ formatCurrency(minBalance) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">結餘成長率</span>
              <span :class="['stat-value', growthRate >= 0 ? 'positive' : 'negative']">
                {{ growthRate >= 0 ? '+' : '' }}{{ growthRate.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useIncomeStore } from '@/stores/income'
import { useExpenseStore } from '@/stores/expense'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { 
  Money, TrendCharts, Wallet, Download 
} from '@element-plus/icons-vue'

const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()

const balanceChart = ref(null)
const pieChart = ref(null)
const selectedYear = ref(dayjs().format('YYYY'))
const balanceDetails = ref([])

// 計算總結餘
const totalBalance = computed(() => {
  return incomeStore.totalIncome - expenseStore.totalExpense
})

const totalIncome = computed(() => incomeStore.totalIncome)
const totalExpense = computed(() => expenseStore.totalExpense)

// 計算統計數據
const averageBalance = computed(() => {
  if (balanceDetails.value.length === 0) return 0
  const sum = balanceDetails.value.reduce((acc, item) => acc + item.balance, 0)
  return sum / balanceDetails.value.length
})

const maxBalance = computed(() => {
  if (balanceDetails.value.length === 0) return 0
  return Math.max(...balanceDetails.value.map(item => item.balance))
})

const minBalance = computed(() => {
  if (balanceDetails.value.length === 0) return 0
  return Math.min(...balanceDetails.value.map(item => item.balance))
})

const growthRate = computed(() => {
  if (balanceDetails.value.length < 2) return 0
  const first = balanceDetails.value[0].balance
  const last = balanceDetails.value[balanceDetails.value.length - 1].balance
  if (first === 0) return 0
  return ((last - first) / Math.abs(first)) * 100
})

// 格式化金額
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

// 格式化月份
const formatMonth = (month) => {
  return dayjs(month).format('YYYY年MM月')
}

// 載入結餘資料
const loadBalanceData = async () => {
  try {
    // 生成12個月的資料
    const months = []
    for (let i = 0; i < 12; i++) {
      const month = dayjs(`${selectedYear.value}-01-01`).add(i, 'month')
      months.push(month.format('YYYY-MM'))
    }

    let cumulativeBalance = 0
    balanceDetails.value = months.map(month => {
      const monthIncomes = incomeStore.incomes.filter(income => 
        dayjs(income.date).format('YYYY-MM') === month
      )
      const monthExpenses = expenseStore.expenses.filter(expense => 
        dayjs(expense.date).format('YYYY-MM') === month
      )

      const income = monthIncomes.reduce((sum, item) => sum + item.amount, 0)
      const expense = monthExpenses.reduce((sum, item) => sum + item.amount, 0)
      const balance = income - expense
      cumulativeBalance += balance

      return {
        month,
        income,
        expense,
        balance,
        cumulativeBalance
      }
    })

    // 更新圖表
    await nextTick()
    initBalanceChart()
    initPieChart()
  } catch (error) {
    console.error('載入結餘資料失敗:', error)
    ElMessage.error('載入結餘資料失敗')
  }
}

// 初始化結餘趨勢圖表
const initBalanceChart = () => {
  if (!balanceChart.value) return

  const chart = echarts.init(balanceChart.value)
  
  const months = balanceDetails.value.map(item => 
    dayjs(item.month).format('MM月')
  )
  const incomeData = balanceDetails.value.map(item => item.income)
  const expenseData = balanceDetails.value.map(item => item.expense)
  const balanceData = balanceDetails.value.map(item => item.balance)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].name + '<br/>'
        params.forEach(param => {
          result += param.marker + param.seriesName + ': ' + formatCurrency(param.value) + '<br/>'
        })
        return result
      }
    },
    legend: {
      data: ['收入', '支出', '結餘']
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          return formatCurrency(value)
        }
      }
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: incomeData,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '支出',
        type: 'bar',
        data: expenseData,
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '結餘',
        type: 'line',
        data: balanceData,
        itemStyle: { color: '#409EFF' },
        lineStyle: { width: 3 }
      }
    ]
  }

  chart.setOption(option)

  // 響應式調整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化餅圖
const initPieChart = () => {
  if (!pieChart.value) return

  const chart = echarts.init(pieChart.value)
  
  const data = [
    { name: '收入', value: totalIncome.value, itemStyle: { color: '#67C23A' } },
    { name: '支出', value: totalExpense.value, itemStyle: { color: '#F56C6C' } }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return params.name + '<br/>' + 
               params.marker + formatCurrency(params.value) + 
               ' (' + params.percent + '%)'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)

  // 響應式調整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 匯出結餘報表
const exportBalance = () => {
  try {
    // 準備匯出資料
    const exportData = balanceDetails.value.map(item => ({
      '月份': formatMonth(item.month),
      '收入': item.income,
      '支出': item.expense,
      '結餘': item.balance,
      '累計結餘': item.cumulativeBalance
    }))

    // 轉換為CSV格式
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    // 下載檔案
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `結餘報表_${selectedYear.value}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('結餘報表已匯出')
  } catch (error) {
    console.error('匯出失敗:', error)
    ElMessage.error('匯出失敗')
  }
}

onMounted(async () => {
  // 載入資料
  await Promise.all([
    incomeStore.loadIncomes(),
    expenseStore.loadExpenses()
  ])
  
  // 載入結餘資料
  await loadBalanceData()
})
</script>

<style scoped>
.balance-page {
  padding: 0;
}

.balance-overview {
  margin-bottom: 24px;
}

.balance-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.balance-card:hover {
  transform: translateY(-2px);
}

.balance-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.balance-card.income {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.balance-card.expense {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.card-icon {
  font-size: 32px;
  opacity: 0.8;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  opacity: 0.9;
}

.balance-stats {
  padding: 20px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
}

.stat-value.positive {
  color: #67c23a;
}

.stat-value.negative {
  color: #f56c6c;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .balance-card {
    padding: 20px;
  }
  
  .card-value {
    font-size: 24px;
  }
  
  .card-icon {
    font-size: 28px;
  }
}
</style>