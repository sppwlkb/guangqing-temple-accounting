import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useIncomeStore } from '@/stores/income'
import { formatAmount } from '@/utils/helpers'

export function useIncomeChart(chartRef) {
  const incomeStore = useIncomeStore()
  let chartInstance = null

  const initChart = () => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)

    const data = incomeStore.categories.map(category => ({
      name: category.name,
      value: incomeStore.incomeByCategory[category.name] || 0,
      itemStyle: { color: category.color }
    })).filter(item => item.value > 0)

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `${params.name}<br/>${params.marker}${formatAmount(params.value)} (${params.percent}%)`
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(item => item.name)
      },
      series: [
        {
          name: '收入類別',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data
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

  return {
    initChart
  }
}
