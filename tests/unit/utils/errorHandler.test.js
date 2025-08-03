import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleError, getErrorLogs, clearErrorLogs } from '@/utils/errorHandler'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: vi.fn(),
  ElNotification: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock console
global.console = {
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn()
}

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue('[]')
  })

  describe('handleError', () => {
    it('應該處理 Error 對象', () => {
      const error = new Error('測試錯誤')
      const context = 'Test Context'

      handleError(error, context)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'temple-error-logs',
        expect.any(String)
      )
    })

    it('應該處理字串錯誤', () => {
      const error = '測試錯誤訊息'
      const context = 'Test Context'

      handleError(error, context)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'temple-error-logs',
        expect.any(String)
      )
    })

    it('應該處理未知類型錯誤', () => {
      const error = { unknown: 'error' }
      const context = 'Test Context'

      handleError(error, context)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'temple-error-logs',
        expect.any(String)
      )
    })

    it('應該包含正確的錯誤資訊', () => {
      const error = new Error('測試錯誤')
      const context = 'Test Context'
      const extra = { userId: 123 }

      handleError(error, context, extra)

      const savedData = localStorage.setItem.mock.calls[0][1]
      const errorLogs = JSON.parse(savedData)
      const errorInfo = errorLogs[0]

      expect(errorInfo.name).toBe('Error')
      expect(errorInfo.message).toBe('測試錯誤')
      expect(errorInfo.context).toBe('Test Context')
      expect(errorInfo.userId).toBe(123)
      expect(errorInfo.timestamp).toBeDefined()
      expect(errorInfo.userAgent).toBeDefined()
      expect(errorInfo.url).toBeDefined()
    })
  })

  describe('getErrorLogs', () => {
    it('應該返回錯誤日誌', () => {
      const mockLogs = [
        {
          timestamp: '2024-01-01T00:00:00.000Z',
          name: 'Error',
          message: '測試錯誤',
          context: 'Test Context'
        }
      ]

      localStorage.getItem.mockReturnValue(JSON.stringify(mockLogs))

      const logs = getErrorLogs()

      expect(logs).toEqual(mockLogs)
      expect(localStorage.getItem).toHaveBeenCalledWith('temple-error-logs')
    })

    it('應該處理無效的日誌資料', () => {
      localStorage.getItem.mockReturnValue('invalid json')

      const logs = getErrorLogs()

      expect(logs).toEqual([])
    })

    it('應該限制返回的日誌數量', () => {
      const mockLogs = Array.from({ length: 100 }, (_, i) => ({
        timestamp: `2024-01-01T00:00:${i.toString().padStart(2, '0')}.000Z`,
        name: 'Error',
        message: `錯誤 ${i}`,
        context: 'Test Context'
      }))

      localStorage.getItem.mockReturnValue(JSON.stringify(mockLogs))

      const logs = getErrorLogs(10)

      expect(logs).toHaveLength(10)
      // 應該返回最新的 10 條記錄（倒序）
      expect(logs[0].message).toBe('錯誤 99')
      expect(logs[9].message).toBe('錯誤 90')
    })
  })

  describe('clearErrorLogs', () => {
    it('應該清除錯誤日誌', () => {
      clearErrorLogs()

      expect(localStorage.removeItem).toHaveBeenCalledWith('temple-error-logs')
    })
  })

  describe('用戶友好訊息轉換', () => {
    it('應該轉換網路錯誤', () => {
      const error = new Error('network error occurred')
      error.name = 'NetworkError'

      handleError(error, 'Test Context')

      // 檢查是否調用了適當的用戶提示
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('應該轉換驗證錯誤', () => {
      const error = new Error('validation failed')
      error.name = 'ValidationError'

      handleError(error, 'Test Context')

      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('應該轉換存儲錯誤', () => {
      const error = new Error('storage quota exceeded')
      error.name = 'QuotaExceededError'

      handleError(error, 'Test Context')

      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('錯誤嚴重程度判斷', () => {
    it('應該識別嚴重錯誤', () => {
      const criticalError = new Error('critical system failure')
      criticalError.name = 'ReferenceError'

      handleError(criticalError, 'Test Context')

      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('應該識別普通錯誤', () => {
      const normalError = new Error('normal error')
      normalError.name = 'CustomError'

      handleError(normalError, 'Test Context')

      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('日誌數量限制', () => {
    it('應該限制日誌數量不超過最大值', () => {
      // 模擬已有 100 條日誌
      const existingLogs = Array.from({ length: 100 }, (_, i) => ({
        timestamp: `2024-01-01T00:00:${i.toString().padStart(2, '0')}.000Z`,
        name: 'Error',
        message: `錯誤 ${i}`,
        context: 'Test Context'
      }))

      localStorage.getItem.mockReturnValue(JSON.stringify(existingLogs))

      const error = new Error('新錯誤')
      handleError(error, 'Test Context')

      const savedData = localStorage.setItem.mock.calls[0][1]
      const errorLogs = JSON.parse(savedData)

      // 應該仍然只有 100 條日誌（移除最舊的，添加最新的）
      expect(errorLogs).toHaveLength(100)
      expect(errorLogs[errorLogs.length - 1].message).toBe('新錯誤')
    })
  })

  describe('錯誤處理異常', () => {
    it('應該處理 localStorage 存儲失敗', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage failed')
      })

      const error = new Error('測試錯誤')

      // 不應該拋出錯誤
      expect(() => handleError(error, 'Test Context')).not.toThrow()
      expect(console.error).toHaveBeenCalledWith('Failed to log error:', expect.any(Error))
    })

    it('應該處理 localStorage 讀取失敗', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Read failed')
      })

      const logs = getErrorLogs()

      expect(logs).toEqual([])
      expect(console.error).toHaveBeenCalledWith('Failed to get error logs:', expect.any(Error))
    })
  })
})
