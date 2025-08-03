import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { debounce, memoize } from '@/utils/performance'
import {
  formatAmount,
  generateId,
  sumBy,
  groupBy,
  safeJsonParse,
  safeJsonStringify
} from '@/utils/helpers'
import {
  STORAGE_KEYS,
  DEFAULT_CATEGORIES,
  LOADING_MESSAGES
} from '@/constants'

export const useIncomeStore = defineStore('income', () => {
  // 狀態
  const incomes = ref([])
  const categories = ref([
    { id: 1, name: '香油錢', color: '#67C23A', description: '信眾香油錢捐獻' },
    { id: 2, name: '點光明燈', color: '#E6A23C', description: '點光明燈費用' },
    { id: 3, name: '屬名紅包', color: '#F56C6C', description: '有署名的紅包捐獻' },
    { id: 4, name: '未屬名紅包', color: '#909399', description: '未署名的紅包捐獻' },
    { id: 5, name: '祝壽', color: '#409EFF', description: '神明祝壽捐獻' },
    { id: 6, name: '看風水', color: '#9C27B0', description: '風水諮詢費用' },
    { id: 7, name: '停車費', color: '#FF9800', description: '停車場收入' },
    { id: 8, name: '感謝神尊', color: '#4CAF50', description: '感謝神尊捐獻' },
    { id: 9, name: '其他', color: '#607D8B', description: '其他收入來源' }
  ])
  const loading = ref(false)

  // 計算屬性
  const totalIncome = computed(() => {
    return incomes.value.reduce((sum, income) => sum + income.amount, 0)
  })

  const monthlyIncome = computed(() => {
    const currentMonth = dayjs().format('YYYY-MM')
    return incomes.value
      .filter(income => dayjs(income.date).format('YYYY-MM') === currentMonth)
      .reduce((sum, income) => sum + income.amount, 0)
  })

  // 使用記憶化優化類別統計計算
  const calculateCategoryIncome = memoize((categoryId, incomeList) => {
    return sumBy(
      incomeList.filter(income => income.categoryId === categoryId),
      'amount'
    )
  })

  const incomeByCategory = computed(() => {
    const result = {}
    categories.value.forEach(category => {
      result[category.name] = calculateCategoryIncome(category.id, incomes.value)
    })
    return result
  })

  const recentIncomes = computed(() => {
    return incomes.value
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 10)
  })

  // 方法
  const loadIncomes = async () => {
    loading.value = true
    try {
      // 從本地儲存載入
      const savedIncomes = localStorage.getItem(STORAGE_KEYS.INCOMES)
      if (savedIncomes) {
        incomes.value = safeJsonParse(savedIncomes, [])
      }
      
      // 如果沒有資料，載入示例資料
      if (incomes.value.length === 0) {
        await loadSampleData()
      }
    } catch (error) {
      console.error('載入收入資料失敗:', error)
      ElMessage.error('載入收入資料失敗')
    } finally {
      loading.value = false
    }
  }

  const saveIncomes = async () => {
    try {
      localStorage.setItem(STORAGE_KEYS.INCOMES, safeJsonStringify(incomes.value))
    } catch (error) {
      console.error('儲存收入資料失敗:', error)
      throw error
    }
  }

  // 防抖儲存，避免頻繁寫入
  const debouncedSave = debounce(saveIncomes, 1000)

  const addIncome = async (incomeData) => {
    try {
      const newIncome = {
        id: generateId('income'),
        ...incomeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      incomes.value.push(newIncome)
      await saveIncomes()
      
      ElMessage.success('收入記錄已新增')
      return newIncome
    } catch (error) {
      console.error('新增收入失敗:', error)
      ElMessage.error('新增收入失敗')
      throw error
    }
  }

  const updateIncome = async (id, incomeData) => {
    try {
      const index = incomes.value.findIndex(income => income.id === id)
      if (index === -1) {
        throw new Error('找不到指定的收入記錄')
      }
      
      incomes.value[index] = {
        ...incomes.value[index],
        ...incomeData,
        updatedAt: new Date().toISOString()
      }
      
      await saveIncomes()
      ElMessage.success('收入記錄已更新')
      return incomes.value[index]
    } catch (error) {
      console.error('更新收入失敗:', error)
      ElMessage.error('更新收入失敗')
      throw error
    }
  }

  const deleteIncome = async (id) => {
    try {
      const index = incomes.value.findIndex(income => income.id === id)
      if (index === -1) {
        throw new Error('找不到指定的收入記錄')
      }
      
      incomes.value.splice(index, 1)
      await saveIncomes()
      
      ElMessage.success('收入記錄已刪除')
    } catch (error) {
      console.error('刪除收入失敗:', error)
      ElMessage.error('刪除收入失敗')
      throw error
    }
  }

  const addCategory = async (categoryData) => {
    try {
      const newCategory = {
        id: Math.max(...categories.value.map(c => c.id), 0) + 1,
        ...categoryData
      }
      
      categories.value.push(newCategory)
      await saveCategories()
      
      ElMessage.success('收入類別已新增')
      return newCategory
    } catch (error) {
      console.error('新增收入類別失敗:', error)
      ElMessage.error('新增收入類別失敗')
      throw error
    }
  }

  const updateCategory = async (id, categoryData) => {
    try {
      const index = categories.value.findIndex(category => category.id === id)
      if (index === -1) {
        throw new Error('找不到指定的���入類別')
      }
      
      categories.value[index] = {
        ...categories.value[index],
        ...categoryData
      }
      
      await saveCategories()
      ElMessage.success('收入類別已更新')
      return categories.value[index]
    } catch (error) {
      console.error('更新收入類別失敗:', error)
      ElMessage.error('更新收入類別失敗')
      throw error
    }
  }

  const deleteCategory = async (id) => {
    try {
      // 檢查是否有收入記錄使用此類別
      const hasIncomes = incomes.value.some(income => income.categoryId === id)
      if (hasIncomes) {
        throw new Error('此類別仍有收入記錄，無法刪除')
      }
      
      const index = categories.value.findIndex(category => category.id === id)
      if (index === -1) {
        throw new Error('找不到指定的收入類別')
      }
      
      categories.value.splice(index, 1)
      await saveCategories()
      
      ElMessage.success('收入類別已刪除')
    } catch (error) {
      console.error('刪除收入類別失敗:', error)
      ElMessage.error('刪除收入類別失敗: ' + error.message)
      throw error
    }
  }

  const saveCategories = async () => {
    try {
      localStorage.setItem('temple-income-categories', JSON.stringify(categories.value))
    } catch (error) {
      console.error('儲存收入類別失敗:', error)
      throw error
    }
  }

  const loadCategories = async () => {
    try {
      const savedCategories = localStorage.getItem('temple-income-categories')
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories)
      }
    } catch (error) {
      console.error('載入收入類別失敗:', error)
    }
  }

  const loadSampleData = async () => {
    const sampleIncomes = [
      {
        id: 1,
        categoryId: 1,
        amount: 5000,
        date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
        description: '信眾香油錢',
        donor: '善心人士',
        createdAt: dayjs().subtract(1, 'day').toISOString(),
        updatedAt: dayjs().subtract(1, 'day').toISOString()
      },
      {
        id: 2,
        categoryId: 2,
        amount: 3600,
        date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
        description: '光明燈點燈費',
        donor: '王小明',
        createdAt: dayjs().subtract(2, 'day').toISOString(),
        updatedAt: dayjs().subtract(2, 'day').toISOString()
      },
      {
        id: 3,
        categoryId: 3,
        amount: 10000,
        date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
        description: '紅包捐獻',
        donor: '李大華',
        createdAt: dayjs().subtract(3, 'day').toISOString(),
        updatedAt: dayjs().subtract(3, 'day').toISOString()
      }
    ]
    
    incomes.value = sampleIncomes
    await saveIncomes()
  }

  const getCategoryById = (id) => {
    return categories.value.find(category => category.id === id)
  }

  const getIncomesByDateRange = (startDate, endDate) => {
    return incomes.value.filter(income => {
      const incomeDate = dayjs(income.date)
      return incomeDate.isAfter(dayjs(startDate).subtract(1, 'day')) && 
             incomeDate.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  return {
    // 狀態
    incomes,
    categories,
    loading,
    
    // 計算屬性
    totalIncome,
    monthlyIncome,
    incomeByCategory,
    recentIncomes,
    
    // 方法
    loadIncomes,
    saveIncomes,
    addIncome,
    updateIncome,
    deleteIncome,
    addCategory,
    updateCategory,
    deleteCategory,
    loadCategories,
    getCategoryById,
    getIncomesByDateRange
  }
})