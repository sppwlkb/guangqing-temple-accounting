import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExpenseStore } from '@/stores/expense'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('Expense Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初始狀態', () => {
    it('應該有正確的初始狀態', () => {
      const store = useExpenseStore()
      
      expect(store.expenses).toEqual([])
      expect(store.categories).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.totalExpense).toBe(0)
      expect(store.monthlyExpense).toBe(0)
    })
  })

  describe('支出管理', () => {
    it('應該能夠新增支出', async () => {
      const store = useExpenseStore()
      
      const expenseData = {
        categoryId: 1,
        amount: 1000,
        date: '2024-01-01',
        description: '測試支出',
        vendor: '測試廠商'
      }

      await store.addExpense(expenseData)

      expect(store.expenses).toHaveLength(1)
      expect(store.expenses[0]).toMatchObject(expenseData)
      expect(store.expenses[0].id).toBeDefined()
      expect(store.expenses[0].createdAt).toBeDefined()
    })

    it('應該能夠更新支出', async () => {
      const store = useExpenseStore()
      
      // 先新增一筆支出
      const expenseData = {
        categoryId: 1,
        amount: 1000,
        date: '2024-01-01',
        description: '測試支出'
      }
      await store.addExpense(expenseData)
      
      const expenseId = store.expenses[0].id
      const updateData = {
        amount: 2000,
        description: '更新後的支出'
      }

      await store.updateExpense(expenseId, updateData)

      expect(store.expenses[0].amount).toBe(2000)
      expect(store.expenses[0].description).toBe('更新後的支出')
      expect(store.expenses[0].updatedAt).toBeDefined()
    })

    it('應該能夠刪除支出', async () => {
      const store = useExpenseStore()
      
      // 先新增一筆支出
      const expenseData = {
        categoryId: 1,
        amount: 1000,
        date: '2024-01-01',
        description: '測試支出'
      }
      await store.addExpense(expenseData)
      
      const expenseId = store.expenses[0].id
      await store.deleteExpense(expenseId)

      expect(store.expenses).toHaveLength(0)
    })
  })

  describe('類別管理', () => {
    it('應該能夠新增類別', async () => {
      const store = useExpenseStore()
      
      const categoryData = {
        name: '測試類別',
        color: '#FF0000',
        description: '測試類別描述'
      }

      await store.addCategory(categoryData)

      expect(store.categories).toHaveLength(1)
      expect(store.categories[0]).toMatchObject(categoryData)
      expect(store.categories[0].id).toBeDefined()
    })

    it('應該能夠更新類別', async () => {
      const store = useExpenseStore()
      
      // 先新增一個類別
      const categoryData = {
        name: '測試類別',
        color: '#FF0000',
        description: '測試類別描述'
      }
      await store.addCategory(categoryData)
      
      const categoryId = store.categories[0].id
      const updateData = {
        name: '更新後的類別',
        color: '#00FF00'
      }

      await store.updateCategory(categoryId, updateData)

      expect(store.categories[0].name).toBe('更新後的類別')
      expect(store.categories[0].color).toBe('#00FF00')
    })

    it('應該能夠刪除類別', async () => {
      const store = useExpenseStore()
      
      // 先新增一個類別
      const categoryData = {
        name: '測試類別',
        color: '#FF0000',
        description: '測試類別描述'
      }
      await store.addCategory(categoryData)
      
      const categoryId = store.categories[0].id
      await store.deleteCategory(categoryId)

      expect(store.categories).toHaveLength(0)
    })
  })

  describe('統計計算', () => {
    it('應該正確計算總支出', async () => {
      const store = useExpenseStore()
      
      // 新增多筆支出
      await store.addExpense({
        categoryId: 1,
        amount: 1000,
        date: '2024-01-01',
        description: '支出1'
      })
      
      await store.addExpense({
        categoryId: 1,
        amount: 2000,
        date: '2024-01-02',
        description: '支出2'
      })

      expect(store.totalExpense).toBe(3000)
    })

    it('應該正確計算月度支出', async () => {
      const store = useExpenseStore()
      
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      
      // 新增本月支出
      await store.addExpense({
        categoryId: 1,
        amount: 1000,
        date: `${currentMonth}-01`,
        description: '本月支出'
      })
      
      // 新增上月支出
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const lastMonthStr = lastMonth.toISOString().slice(0, 7)
      
      await store.addExpense({
        categoryId: 1,
        amount: 2000,
        date: `${lastMonthStr}-01`,
        description: '上月支出'
      })

      expect(store.monthlyExpense).toBe(1000)
    })

    it('應該正確計算類別支出統計', async () => {
      const store = useExpenseStore()
      
      // 新增類別
      await store.addCategory({
        name: '類別1',
        color: '#FF0000'
      })
      
      await store.addCategory({
        name: '類別2',
        color: '#00FF00'
      })
      
      const category1Id = store.categories[0].id
      const category2Id = store.categories[1].id
      
      // 新增不同類別的支出
      await store.addExpense({
        categoryId: category1Id,
        amount: 1000,
        date: '2024-01-01',
        description: '類別1支出'
      })
      
      await store.addExpense({
        categoryId: category2Id,
        amount: 2000,
        date: '2024-01-02',
        description: '類別2支出'
      })

      const stats = store.expenseByCategory
      expect(stats['類別1']).toBe(1000)
      expect(stats['類別2']).toBe(2000)
    })
  })

  describe('資料持久化', () => {
    it('應該儲存支出資料到 localStorage', async () => {
      const store = useExpenseStore()
      
      const expenseData = {
        categoryId: 1,
        amount: 1000,
        date: '2024-01-01',
        description: '測試支出'
      }

      await store.addExpense(expenseData)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'temple-expenses',
        expect.any(String)
      )
    })

    it('應該從 localStorage 載入支出資料', async () => {
      const mockExpenses = [
        {
          id: 1,
          categoryId: 1,
          amount: 1000,
          date: '2024-01-01',
          description: '測試支出',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ]

      localStorage.getItem.mockReturnValue(JSON.stringify(mockExpenses))

      const store = useExpenseStore()
      await store.loadExpenses()

      expect(store.expenses).toEqual(mockExpenses)
    })
  })

  describe('錯誤處理', () => {
    it('應該處理新增支出時的錯誤', async () => {
      const store = useExpenseStore()
      
      // Mock localStorage.setItem 拋出錯誤
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const expenseData = {
        categoryId: 1,
        amount: 1000,
        date: '2024-01-01',
        description: '測試支出'
      }

      await expect(store.addExpense(expenseData)).rejects.toThrow('Storage error')
    })

    it('應該處理載入資料時的錯誤', async () => {
      const store = useExpenseStore()
      
      // Mock localStorage.getItem 返回無效 JSON
      localStorage.getItem.mockReturnValue('invalid json')

      // 應該不會拋出錯誤，而是載入示例資料
      await store.loadExpenses()
      
      expect(store.expenses).toBeDefined()
    })
  })
})
