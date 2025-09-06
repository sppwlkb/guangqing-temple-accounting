import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { useIncomeStore } from '@/stores/income'
import { useExpenseStore } from '@/stores/expense'
import { formatAmount } from '@/utils/helpers'

export function useTrendChart(chartRef) {
  const incomeStore = useIncomeStore()
  const expenseStore = useExpenseStore()
  let chartInstance = null

  const generateChartData = () => {
    const dates = []
    const incomeData = []
    const expenseData = []

    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day')
      dates.push(date.format('MM/DD'))

      const dayIncomes = incomeStore.incomes.filter(income => 
        dayjs(income.date).isSame(date, 'day')
      )
      const dayExpenses = expenseStore.expenses.filter(expense => 
        dayjs(expense.date).isSame(date, 'day')
      )

      incomeData.push(dayIncomes.reduce((sum, item) => sum + item.amount, 0))
      expenseData.push(dayExpenses.reduce((sum, item) => sum + item.amount, 0))
    }
    return { dates, incomeData, expenseData }
  }

  const initChart = () => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)

    const { dates, incomeData, expenseData } = generateChartData()

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let result = params[0].name + '<br/>'
          params.forEach(param => {
            result += `${param.marker} ${param.seriesName}: ${formatAmount(param.value)}<br/>`
          })
          return result
        }
      },
      legend: {
        data: ['收入', '支出']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => formatAmount(value, 'TWD', false)
        }
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: incomeData,
          itemStyle: { color: '#67C23A' },
          areaStyle: { opacity: 0.3 },
          smooth: true
        },
        {
          name: '支出',
          type: 'line',
          data: expenseData,
          itemStyle: { color: '#F56C6C' },
          areaStyle: { opacity: 0.3 },
          smooth: true
        }
      ]
    }
    chartInstance.setOption(option)
  }

  const resizeChart = () => {
    chartInstance?.resize()
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resizeChart)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resizeChart)
    chartInstance?.dispose()
  })

  // Watch for data changes to re-render chart
  // This can be implemented if needed

  return {
    initChart
  }
}
