import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { handleError } from '@/utils/errorHandler'
import { debounce, memoize } from '@/utils/performance'

export const useExpenseStore = defineStore('expense', () => {
  // 狀態
  const expenses = ref([])
  const categories = ref([
    { id: 1, name: '人員薪水', color: '#F56C6C', description: '員工薪資支出' },
    { id: 2, name: '房租', color: '#E6A23C', description: '場地租金' },
    { id: 3, name: '水電費', color: '#409EFF', description: '水電瓦斯費用' },
    { id: 4, name: '雜項開支', color: '#909399', description: '其他雜項支出' },
    { id: 5, name: '參訪金', color: '#67C23A', description: '參訪活動費用' },
    { id: 6, name: '修繕費', color: '#9C27B0', description: '設施修繕費用' },
    { id: 7, name: '管理費', color: '#FF9800', description: '日常管理費用' },
    { id: 8, name: '其他', color: '#607D8B', description: '其他支出項目' }
  ])
  const loading = ref(false)

  // 計算屬性
  const totalExpense = computed(() => {
    return expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  })

  const monthlyExpense = computed(() => {
    const currentMonth = dayjs().format('YYYY-MM')
    return expenses.value
      .filter(expense => dayjs(expense.date).format('YYYY-MM') === currentMonth)
      .reduce((sum, expense) => sum + expense.amount, 0)
  })

  // 使用記憶化優化類別統計計算
  const calculateCategoryExpense = memoize((categoryId, expenseList) => {
    return expenseList
      .filter(expense => expense.categoryId === categoryId)
      .reduce((sum, expense) => sum + expense.amount, 0)
  })

  const expenseByCategory = computed(() => {
    const result = {}
    categories.value.forEach(category => {
      result[category.name] = calculateCategoryExpense(category.id, expenses.value)
    })
    return result
  })

  const recentExpenses = computed(() => {
    return expenses.value
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 10)
  })

  // 方法
  const loadExpenses = async () => {
    loading.value = true
    try {
      // 從本地儲存載入
      const savedExpenses = localStorage.getItem('temple-expenses')
      if (savedExpenses) {
        expenses.value = JSON.parse(savedExpenses)
      }

      // 如果沒有資料，載入示例資料
      if (expenses.value.length === 0) {
        await loadSampleData()
      }
    } catch (error) {
      handleError(error, 'Expense Management', { operation: 'loadExpenses' })
    } finally {
      loading.value = false
    }
  }

  const saveExpenses = async () => {
    try {
      localStorage.setItem('temple-expenses', JSON.stringify(expenses.value))
    } catch (error) {
      handleError(error, 'Data Storage', { operation: 'saveExpenses' })
      throw error
    }
  }

  // 防抖儲存，避免頻繁寫入
  const debouncedSave = debounce(saveExpenses, 1000)

  const addExpense = async (expenseData) => {
    try {
      const newExpense = {
        id: Date.now(),
        ...expenseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      expenses.value.push(newExpense)
      await debouncedSave()
      
      ElMessage.success('支出記錄已新增')
      return newExpense
    } catch (error) {
      console.error('新增支出失敗:', error)
      ElMessage.error('新增支出失敗')
      throw error
    }
  }

  const updateExpense = async (id, expenseData) => {
    try {
      const index = expenses.value.findIndex(expense => expense.id === id)
      if (index === -1) {
        throw new Error('找不到指定的支出記錄')
      }
      
      expenses.value[index] = {
        ...expenses.value[index],
        ...expenseData,
        updatedAt: new Date().toISOString()
      }
      
      await saveExpenses()
      ElMessage.success('支出記錄已更新')
      return expenses.value[index]
    } catch (error) {
      console.error('更新支出失敗:', error)
      ElMessage.error('更新支出失敗')
      throw error
    }
  }

  const deleteExpense = async (id) => {
    try {
      const index = expenses.value.findIndex(expense => expense.id === id)
      if (index === -1) {
        throw new Error('找不到指定的支出記錄')
      }
      
      expenses.value.splice(index, 1)
      await saveExpenses()
      
      ElMessage.success('支出記錄已刪除')
    } catch (error) {
      console.error('刪除支出失敗:', error)
      ElMessage.error('刪除支出失敗')
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
      
      ElMessage.success('支出類別已新增')
      return newCategory
    } catch (error) {
      console.error('新增支出類別失敗:', error)
      ElMessage.error('新增支出類別失敗')
      throw error
    }
  }

  const updateCategory = async (id, categoryData) => {
    try {
      const index = categories.value.findIndex(category => category.id === id)
      if (index === -1) {
        throw new Error('找不到指定的支出類別')
      }
      
      categories.value[index] = {
        ...categories.value[index],
        ...categoryData
      }
      
      await saveCategories()
      ElMessage.success('支出類別已更新')
      return categories.value[index]
    } catch (error) {
      console.error('更新支出類別失敗:', error)
      ElMessage.error('更新支出類別失敗')
      throw error
    }
  }

  const deleteCategory = async (id) => {
    try {
      // 檢查是否有支出記錄使用此類別
      const hasExpenses = expenses.value.some(expense => expense.categoryId === id)
      if (hasExpenses) {
        throw new Error('此類別仍有支出記錄，無法刪除')
      }
      
      const index = categories.value.findIndex(category => category.id === id)
      if (index === -1) {
        throw new Error('找不到指定的支出類別')
      }
      
      categories.value.splice(index, 1)
      await saveCategories()
      
      ElMessage.success('支出類別已刪除')
    } catch (error) {
      console.error('刪除支出類別失敗:', error)
      ElMessage.error('刪除支出類別失敗: ' + error.message)
      throw error
    }
  }

  const saveCategories = async () => {
    try {
      localStorage.setItem('temple-expense-categories', JSON.stringify(categories.value))
    } catch (error) {
      console.error('儲存支出類別失敗:', error)
      throw error
    }
  }

  const loadCategories = async () => {
    try {
      const savedCategories = localStorage.getItem('temple-expense-categories')
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories)
      }
    } catch (error) {
      console.error('載入支出類別失敗:', error)
    }
  }

  const loadSampleData = async () => {
    const sampleExpenses = [
      {
        id: 1,
        categoryId: 1,
        amount: 30000,
        date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
        description: '員工月薪',
        vendor: '人事部',
        createdAt: dayjs().subtract(1, 'day').toISOString(),
        updatedAt: dayjs().subtract(1, 'day').toISOString()
      },
      {
        id: 2,
        categoryId: 3,
        amount: 2500,
        date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
        description: '電費',
        vendor: '台電公司',
        createdAt: dayjs().subtract(2, 'day').toISOString(),
        updatedAt: dayjs().subtract(2, 'day').toISOString()
      },
      {
        id: 3,
        categoryId: 6,
        amount: 8000,
        date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
        description: '屋頂修繕',
        vendor: '建築公司',
        createdAt: dayjs().subtract(5, 'day').toISOString(),
        updatedAt: dayjs().subtract(5, 'day').toISOString()
      }
    ]
    
    expenses.value = sampleExpenses
    await saveExpenses()
  }

  const getCategoryById = (id) => {
    return categories.value.find(category => category.id === id)
  }

  const getExpensesByDateRange = (startDate, endDate) => {
    return expenses.value.filter(expense => {
      const expenseDate = dayjs(expense.date)
      return expenseDate.isAfter(dayjs(startDate).subtract(1, 'day')) && 
             expenseDate.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  return {
    // 狀態
    expenses,
    categories,
    loading,
    
    // 計算屬性
    totalExpense,
    monthlyExpense,
    expenseByCategory,
    recentExpenses,
    
    // 方法
    loadExpenses,
    saveExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    loadCategories,
    getCategoryById,
    getExpensesByDateRange
  }
})