<template>
  <div class="reports-summary">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">收支總表</h1>
      <p class="page-description">查看宮廟的收支總覽和詳細報表</p>
    </div>

    <!-- 篩選條件 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">篩選條件</h3>
      </div>
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <el-form-item label="日期範圍">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="loadReportData"
              />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="8">
            <el-form-item label="報表類型">
              <el-select v-model="reportType" @change="loadReportData">
                <el-option label="全部" value="all" />
                <el-option label="收入" value="income" />
                <el-option label="支出" value="expense" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="8">
            <el-form-item label="分組方式">
              <el-select v-model="groupBy" @change="loadReportData">
                <el-option label="按日期" value="date" />
                <el-option label="按類別" value="category" />
                <el-option label="按月份" value="month" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="filter-actions">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="loadReportData">查詢</el-button>
          <el-button type="success" @click="exportReport">
            <el-icon><Download /></el-icon>
            匯出報表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 統計摘要 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :xs="24" :sm="6">
        <div class="summary-card income">
          <div class="card-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(summaryData.totalIncome) }}</div>
            <div class="card-label">總收入</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="6">
        <div class="summary-card expense">
          <div class="card-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(summaryData.totalExpense) }}</div>
            <div class="card-label">總支出</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="6">
        <div class="summary-card balance">
          <div class="card-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(summaryData.balance) }}</div>
            <div class="card-label">結餘</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="6">
        <div class="summary-card count">
          <div class="card-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ summaryData.totalRecords }}</div>
            <div class="card-label">總筆數</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 圖表分析 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">收支趨勢</h3>
          </div>
          <div ref="trendChart" style="height: 350px;"></div>
        </div>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">類別分布</h3>
          </div>
          <div ref="categoryChart" style="height: 350px;"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 詳細資料表格 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">詳細資料</h3>
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜尋..."
            style="width: 200px;"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
      
      <el-table
        :data="filteredTableData"
        style="width: 100%"
        :loading="loading"
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column prop="date" label="日期" width="120" sortable>
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="類型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="categoryName" label="類別" width="120">
          <template #default="{ row }">
            <span 
              class="category-tag"
              :style="{ backgroundColor: row.categoryColor }"
            >
              {{ row.categoryName }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="金額" align="right" width="120" sortable>
          <template #default="{ row }">
            <span :class="['amount', row.type]">
              {{ row.type === 'income' ? '+' : '-' }}{{ formatCurrency(row.amount) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="說明" min-width="150" />
        
        <el-table-column prop="donor" label="捐款人/廠商" width="120">
          <template #default="{ row }">
            {{ row.donor || row.vendor || '-' }}
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分頁 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
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
  TrendCharts, Wallet, Money, Document, Download, Search 
} from '@element-plus/icons-vue'

const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()

// 篩選條件
const dateRange = ref([
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])
const reportType = ref('all')
const groupBy = ref('date')
const searchKeyword = ref('')

// 圖表引用
const trendChart = ref(null)
const categoryChart = ref(null)

// 表格資料
const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

// 統計摘要資料
const summaryData = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  totalRecords: 0
})

// 計算屬性
const filteredTableData = computed(() => {
  let data = tableData.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    data = data.filter(item => 
      item.description.toLowerCase().includes(keyword) ||
      item.categoryName.toLowerCase().includes(keyword) ||
      (item.donor && item.donor.toLowerCase().includes(keyword)) ||
      (item.vendor && item.vendor.toLowerCase().includes(keyword))
    )
  }
  
  // 分頁
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

const totalRecords = computed(() => {
  return tableData.value.length
})

// 格式化金額
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 載入報表資料
const loadReportData = async () => {
  loading.value = true
  
  try {
    // 合併收入和支出資料
    const allData = []
    
    // 處理收入資料
    if (reportType.value === 'all' || reportType.value === 'income') {
      const incomes = incomeStore.incomes.filter(income => {
        if (!dateRange.value || dateRange.value.length !== 2) return true
        const incomeDate = dayjs(income.date)
        return incomeDate.isAfter(dayjs(dateRange.value[0]).subtract(1, 'day')) &&
               incomeDate.isBefore(dayjs(dateRange.value[1]).add(1, 'day'))
      })
      
      incomes.forEach(income => {
        const category = incomeStore.getCategoryById(income.categoryId)
        allData.push({
          ...income,
          type: 'income',
          categoryName: category?.name || '未知',
          categoryColor: category?.color || '#909399'
        })
      })
    }
    
    // 處理支出資料
    if (reportType.value === 'all' || reportType.value === 'expense') {
      const expenses = expenseStore.expenses.filter(expense => {
        if (!dateRange.value || dateRange.value.length !== 2) return true
        const expenseDate = dayjs(expense.date)
        return expenseDate.isAfter(dayjs(dateRange.value[0]).subtract(1, 'day')) &&
               expenseDate.isBefore(dayjs(dateRange.value[1]).add(1, 'day'))
      })
      
      expenses.forEach(expense => {
        const category = expenseStore.getCategoryById(expense.categoryId)
        allData.push({
          ...expense,
          type: 'expense',
          categoryName: category?.name || '未知',
          categoryColor: category?.color || '#909399'
        })
      })
    }
    
    // 排序
    allData.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    
    tableData.value = allData
    
    // 計算統計摘要
    const totalIncome = allData
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const totalExpense = allData
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
    
    summaryData.value = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalRecords: allData.length
    }
    
    // 更新圖表
    await nextTick()
    initTrendChart()
    initCategoryChart()
    
  } catch (error) {
    console.error('載入報表資料失敗:', error)
    ElMessage.error('載入報表資料失敗')
  } finally {
    loading.value = false
  }
}

// 初始化趨勢圖表
const initTrendChart = () => {
  if (!trendChart.value) return
  
  const chart = echarts.init(trendChart.value)
  
  // 按日期分組資料
  const groupedData = {}
  tableData.value.forEach(item => {
    const date = item.date
    if (!groupedData[date]) {
      groupedData[date] = { income: 0, expense: 0 }
    }
    if (item.type === 'income') {
      groupedData[date].income += item.amount
    } else {
      groupedData[date].expense += item.amount
    }
  })
  
  const dates = Object.keys(groupedData).sort()
  const incomeData = dates.map(date => groupedData[date].income)
  const expenseData = dates.map(date => groupedData[date].expense)
  
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
      data: ['收入', '支出']
    },
    xAxis: {
      type: 'category',
      data: dates.map(date => dayjs(date).format('MM/DD'))
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
        type: 'line',
        data: incomeData,
        itemStyle: { color: '#67C23A' },
        areaStyle: { opacity: 0.3 }
      },
      {
        name: '支出',
        type: 'line',
        data: expenseData,
        itemStyle: { color: '#F56C6C' },
        areaStyle: { opacity: 0.3 }
      }
    ]
  }
  
  chart.setOption(option)
  
  // 響應式調整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化類別圖表
const initCategoryChart = () => {
  if (!categoryChart.value) return
  
  const chart = echarts.init(categoryChart.value)
  
  // 按類別分組資料
  const categoryData = {}
  tableData.value.forEach(item => {
    const category = item.categoryName
    if (!categoryData[category]) {
      categoryData[category] = {
        value: 0,
        color: item.categoryColor
      }
    }
    categoryData[category].value += item.amount
  })
  
  const data = Object.keys(categoryData).map(category => ({
    name: category,
    value: categoryData[category].value,
    itemStyle: { color: categoryData[category].color }
  }))
  
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

// 重置篩選條件
const resetFilters = () => {
  dateRange.value = [
    dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ]
  reportType.value = 'all'
  groupBy.value = 'date'
  searchKeyword.value = ''
  currentPage.value = 1
  loadReportData()
}

// 搜尋處理
const handleSearch = () => {
  currentPage.value = 1
}

// 分頁處理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 表格摘要計算
const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []
  
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '總計'
      return
    }
    
    if (column.property === 'amount') {
      const values = data.map(item => Number(item[column.property]))
      if (!values.every(value => isNaN(value))) {
        sums[index] = formatCurrency(values.reduce((prev, curr) => {
          const value = Number(curr)
          if (!isNaN(value)) {
            return prev + value
          } else {
            return prev
          }
        }, 0))
      } else {
        sums[index] = 'N/A'
      }
    } else {
      sums[index] = ''
    }
  })
  
  return sums
}

// 匯出報表
const exportReport = () => {
  try {
    // 準備匯出資料
    const exportData = tableData.value.map(item => ({
      '日期': formatDate(item.date),
      '類型': item.type === 'income' ? '收入' : '支出',
      '類別': item.categoryName,
      '金額': item.amount,
      '說明': item.description,
      '捐款人/廠商': item.donor || item.vendor || ''
    }))

    // 轉換為CSV格式
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n')

    // 下載檔案
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `收支總���_${dayjs().format('YYYY-MM-DD')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('報表已匯出')
  } catch (error) {
    console.error('匯出失敗:', error)
    ElMessage.error('匯出失敗')
  }
}

onMounted(async () => {
  // 載入資料
  await Promise.all([
    incomeStore.loadIncomes(),
    incomeStore.loadCategories(),
    expenseStore.loadExpenses(),
    expenseStore.loadCategories()
  ])
  
  // 載入報表資料
  await loadReportData()
})
</script>

<style scoped>
.reports-summary {
  padding: 0;
}

.filter-section {
  padding: 20px;
}

.filter-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.summary-cards {
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card.income {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.summary-card.expense {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.summary-card.balance {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #303133;
}

.summary-card.count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-icon {
  font-size: 28px;
  opacity: 0.8;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  opacity: 0.9;
}

.category-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .filter-actions {
    flex-direction: column;
  }
  
  .summary-card {
    padding: 16px;
  }
  
  .card-value {
    font-size: 20px;
  }
  
  .card-icon {
    font-size: 24px;
  }
}
</style>