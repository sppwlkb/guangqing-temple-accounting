/**
 * 測試資料生成器
 * 為用戶測試提供模擬資料
 */

import dayjs from 'dayjs'

export class TestDataGenerator {
  constructor() {
    this.incomeCategories = [
      { id: 1, name: '香油錢', color: '#67c23a', description: '信眾捐獻的香油錢' },
      { id: 2, name: '功德金', color: '#409eff', description: '法會功德金' },
      { id: 3, name: '點燈費', color: '#e6a23c', description: '點燈祈福費用' },
      { id: 4, name: '建廟捐款', color: '#f56c6c', description: '建廟專用捐款' },
      { id: 5, name: '其他收入', color: '#909399', description: '其他雜項收入' }
    ]

    this.expenseCategories = [
      { id: 1, name: '水電費', color: '#409eff', description: '水費和電費' },
      { id: 2, name: '供品費', color: '#67c23a', description: '祭祀供品費用' },
      { id: 3, name: '維修費', color: '#e6a23c', description: '建築和設備維修' },
      { id: 4, name: '人事費', color: '#f56c6c', description: '人員薪資和津貼' },
      { id: 5, name: '活動費', color: '#909399', description: '宗教活動費用' }
    ]

    this.donors = [
      '陳信眾', '林善心', '王虔誠', '李慈悲', '張功德',
      '劉福德', '黃慧心', '吳善念', '蔡慈愛', '鄭虔敬',
      '謝感恩', '許祈福', '何慈善', '呂善行', '孫慈心'
    ]

    this.vendors = [
      '台電公司', '自來水公司', '中華電信', '統一超商', '全家便利商店',
      '建築公司', '清潔公司', '水果行', '花店', '香燭店',
      '音響設備公司', '印刷公司', '餐飲公司', '保全公司', '園藝公司'
    ]

    this.descriptions = {
      income: [
        '每日香油錢', '法會功德金', '點燈祈福', '平安符', '消災祈福',
        '求財運', '求健康', '求學業', '求姻緣', '求平安',
        '建廟捐款', '修繕捐款', '慈善捐款', '急難救助', '獎學金'
      ],
      expense: [
        '電費繳納', '水費繳納', '電話費', '網路費', '瓦斯費',
        '供品採購', '鮮花採購', '香燭採購', '清潔用品', '辦公用品',
        '建築維修', '電器維修', '音響維修', '冷氣維修', '照明維修',
        '法會活動', '慶典活動', '義工餐費', '交通費', '雜支'
      ]
    }
  }

  // 生成隨機日期
  generateRandomDate(daysBack = 365) {
    const today = dayjs()
    const randomDays = Math.floor(Math.random() * daysBack)
    return today.subtract(randomDays, 'day').format('YYYY-MM-DD')
  }

  // 生成隨機金額
  generateRandomAmount(min = 100, max = 50000) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // 生成隨機選擇
  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  // 生成收入記錄
  generateIncomeRecord() {
    const category = this.getRandomItem(this.incomeCategories)
    const donor = this.getRandomItem(this.donors)
    const description = this.getRandomItem(this.descriptions.income)
    
    return {
      id: Date.now() + Math.random(),
      categoryId: category.id,
      amount: this.generateRandomAmount(100, 10000),
      date: this.generateRandomDate(180), // 最近半年
      donor: Math.random() > 0.3 ? donor : '', // 70% 機率有捐款人
      description: Math.random() > 0.2 ? description : '', // 80% 機率有說明
      receipt: Math.random() > 0.5 ? `R${Date.now().toString().slice(-8)}` : '', // 50% 機率有收據
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  // 生成支出記錄
  generateExpenseRecord() {
    const category = this.getRandomItem(this.expenseCategories)
    const vendor = this.getRandomItem(this.vendors)
    const description = this.getRandomItem(this.descriptions.expense)
    
    return {
      id: Date.now() + Math.random(),
      categoryId: category.id,
      amount: this.generateRandomAmount(500, 20000),
      date: this.generateRandomDate(180), // 最近半年
      vendor: Math.random() > 0.2 ? vendor : '', // 80% 機率有廠商
      description: Math.random() > 0.1 ? description : '', // 90% 機率有說明
      receipt: Math.random() > 0.4 ? `E${Date.now().toString().slice(-8)}` : '', // 60% 機率有收據
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  // 生成批量收入記錄
  generateIncomeRecords(count = 50) {
    const records = []
    for (let i = 0; i < count; i++) {
      records.push(this.generateIncomeRecord())
    }
    return records.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
  }

  // 生成批量支出記錄
  generateExpenseRecords(count = 50) {
    const records = []
    for (let i = 0; i < count; i++) {
      records.push(this.generateExpenseRecord())
    }
    return records.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
  }

  // 生成完整測試資料集
  generateFullTestData() {
    return {
      incomeCategories: this.incomeCategories,
      expenseCategories: this.expenseCategories,
      incomes: this.generateIncomeRecords(100),
      expenses: this.generateExpenseRecords(80),
      settings: {
        profile: {
          name: '測試管理員',
          position: '財務組長',
          email: 'test@temple.org',
          phone: '02-1234-5678'
        },
        preferences: {
          dateFormat: 'YYYY-MM-DD',
          currencyFormat: 'NT$ {amount}',
          pageSize: 20,
          themeColor: '#409EFF',
          showWelcomeMessage: true,
          autoSave: true,
          soundEnabled: false
        }
      },
      reminders: [
        {
          id: 1,
          title: '月度結算提醒',
          description: '請記得進行本月的收支結算',
          type: 'financial',
          dueTime: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm'),
          priority: 'high'
        },
        {
          id: 2,
          title: '資料備份提醒',
          description: '定期備份重要財務資料',
          type: 'backup',
          dueTime: dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm'),
          priority: 'medium'
        }
      ]
    }
  }

  // 載入測試資料到系統
  async loadTestData() {
    try {
      const testData = this.generateFullTestData()
      
      // 儲存到 localStorage
      localStorage.setItem('temple-income-categories', JSON.stringify(testData.incomeCategories))
      localStorage.setItem('temple-expense-categories', JSON.stringify(testData.expenseCategories))
      localStorage.setItem('temple-incomes', JSON.stringify(testData.incomes))
      localStorage.setItem('temple-expenses', JSON.stringify(testData.expenses))
      localStorage.setItem('temple-profile', JSON.stringify(testData.settings.profile))
      localStorage.setItem('temple-preferences', JSON.stringify(testData.settings.preferences))
      localStorage.setItem('temple-reminders', JSON.stringify(testData.reminders))
      
      console.log('✅ 測試資料載入成功')
      console.log(`📊 生成了 ${testData.incomes.length} 筆收入記錄`)
      console.log(`📊 生成了 ${testData.expenses.length} 筆支出記錄`)
      
      return testData
    } catch (error) {
      console.error('❌ 測試資料載入失敗:', error)
      throw error
    }
  }

  // 清除測試資料
  clearTestData() {
    try {
      const keys = [
        'temple-income-categories',
        'temple-expense-categories', 
        'temple-incomes',
        'temple-expenses',
        'temple-profile',
        'temple-preferences',
        'temple-reminders'
      ]
      
      keys.forEach(key => localStorage.removeItem(key))
      
      console.log('🗑️ 測試資料已清除')
    } catch (error) {
      console.error('❌ 清除測試資料失敗:', error)
      throw error
    }
  }

  // 生成特定月份的資料
  generateMonthlyData(year, month, incomeCount = 20, expenseCount = 15) {
    const startDate = dayjs(`${year}-${month}-01`)
    const endDate = startDate.endOf('month')
    
    const incomes = []
    const expenses = []
    
    // 生成收入記錄
    for (let i = 0; i < incomeCount; i++) {
      const randomDay = Math.floor(Math.random() * endDate.date()) + 1
      const record = this.generateIncomeRecord()
      record.date = startDate.date(randomDay).format('YYYY-MM-DD')
      incomes.push(record)
    }
    
    // 生成支出記錄
    for (let i = 0; i < expenseCount; i++) {
      const randomDay = Math.floor(Math.random() * endDate.date()) + 1
      const record = this.generateExpenseRecord()
      record.date = startDate.date(randomDay).format('YYYY-MM-DD')
      expenses.push(record)
    }
    
    return {
      incomes: incomes.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()),
      expenses: expenses.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    }
  }

  // 生成效能測試資料
  generatePerformanceTestData(recordCount = 1000) {
    console.log(`🚀 生成 ${recordCount} 筆效能測試資料...`)
    
    const incomes = this.generateIncomeRecords(recordCount / 2)
    const expenses = this.generateExpenseRecords(recordCount / 2)
    
    return { incomes, expenses }
  }
}

// 創建全域實例
export const testDataGenerator = new TestDataGenerator()

// 在開發環境中自動載入測試資料
if (import.meta.env.DEV) {
  // 檢查是否已有測試資料
  const hasTestData = localStorage.getItem('temple-incomes')
  
  if (!hasTestData) {
    console.log('🔧 開發環境：自動載入測試資料')
    testDataGenerator.loadTestData()
  }
}

export default TestDataGenerator
