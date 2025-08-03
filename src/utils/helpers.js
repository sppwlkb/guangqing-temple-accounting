/**
 * 通用工具函數
 * 提供常用的工具方法，減少代碼重複
 */

import dayjs from 'dayjs'

/**
 * 格式化金額
 * @param {number} amount 金額
 * @param {string} currency 貨幣符號
 * @param {boolean} showSymbol 是否顯示貨幣符號
 * @returns {string} 格式化後的金額
 */
export function formatAmount(amount, currency = 'NT$', showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${currency} 0` : '0'
  }
  
  const formattedNumber = Number(amount).toLocaleString('zh-TW')
  return showSymbol ? `${currency} ${formattedNumber}` : formattedNumber
}

/**
 * 格式化日期
 * @param {string|Date} date 日期
 * @param {string} format 格式
 * @returns {string} 格式化後的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期時間
 * @param {string|Date} datetime 日期時間
 * @param {string} format 格式
 * @returns {string} 格式化後的日期時間
 */
export function formatDateTime(datetime, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!datetime) return ''
  return dayjs(datetime).format(format)
}

/**
 * 格式化相對時間
 * @param {string|Date} date 日期
 * @returns {string} 相對時間
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  
  const now = dayjs()
  const target = dayjs(date)
  const diffDays = now.diff(target, 'day')
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays === -1) {
    return '明天'
  } else if (diffDays > 0 && diffDays <= 7) {
    return `${diffDays} 天前`
  } else if (diffDays < 0 && diffDays >= -7) {
    return `${Math.abs(diffDays)} 天後`
  } else {
    return target.format('MM-DD')
  }
}

/**
 * 生成唯一 ID
 * @param {string} prefix 前綴
 * @returns {string} 唯一 ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

/**
 * 深拷貝對象
 * @param {any} obj 要拷貝的對象
 * @returns {any} 拷貝後的對象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const cloned = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 檢查是否為空值
 * @param {any} value 值
 * @returns {boolean} 是否為空
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true
  }
  
  if (typeof value === 'string') {
    return value.trim() === ''
  }
  
  if (Array.isArray(value)) {
    return value.length === 0
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  
  return false
}

/**
 * 安全的 JSON 解析
 * @param {string} jsonString JSON 字符串
 * @param {any} defaultValue 默認值
 * @returns {any} 解析結果
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('JSON 解析失敗:', error)
    return defaultValue
  }
}

/**
 * 安全的 JSON 字符串化
 * @param {any} obj 對象
 * @param {string} defaultValue 默認值
 * @returns {string} JSON 字符串
 */
export function safeJsonStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.warn('JSON 字符串化失敗:', error)
    return defaultValue
  }
}

/**
 * 數組去重
 * @param {Array} array 數組
 * @param {string} key 去重的鍵（對象數組）
 * @returns {Array} 去重後的數組
 */
export function uniqueArray(array, key = null) {
  if (!Array.isArray(array)) {
    return []
  }
  
  if (key) {
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }
  
  return [...new Set(array)]
}

/**
 * 數組分組
 * @param {Array} array 數組
 * @param {string|Function} key 分組鍵或函數
 * @returns {Object} 分組結果
 */
export function groupBy(array, key) {
  if (!Array.isArray(array)) {
    return {}
  }
  
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key]
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {})
}

/**
 * 數組排序
 * @param {Array} array 數組
 * @param {string|Function} key 排序鍵或函數
 * @param {string} order 排序順序 'asc' | 'desc'
 * @returns {Array} 排序後的數組
 */
export function sortBy(array, key, order = 'asc') {
  if (!Array.isArray(array)) {
    return []
  }
  
  const sorted = [...array].sort((a, b) => {
    const valueA = typeof key === 'function' ? key(a) : a[key]
    const valueB = typeof key === 'function' ? key(b) : b[key]
    
    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1
    }
    if (valueA > valueB) {
      return order === 'asc' ? 1 : -1
    }
    return 0
  })
  
  return sorted
}

/**
 * 計算數組總和
 * @param {Array} array 數組
 * @param {string|Function} key 求和鍵或函數
 * @returns {number} 總和
 */
export function sumBy(array, key) {
  if (!Array.isArray(array)) {
    return 0
  }
  
  return array.reduce((sum, item) => {
    const value = typeof key === 'function' ? key(item) : item[key]
    return sum + (Number(value) || 0)
  }, 0)
}

/**
 * 計算數組平均值
 * @param {Array} array 數組
 * @param {string|Function} key 計算鍵或函數
 * @returns {number} 平均值
 */
export function averageBy(array, key) {
  if (!Array.isArray(array) || array.length === 0) {
    return 0
  }
  
  const sum = sumBy(array, key)
  return sum / array.length
}

/**
 * 獲取數組最大值
 * @param {Array} array 數組
 * @param {string|Function} key 比較鍵或函數
 * @returns {any} 最大值項目
 */
export function maxBy(array, key) {
  if (!Array.isArray(array) || array.length === 0) {
    return null
  }
  
  return array.reduce((max, item) => {
    const valueMax = typeof key === 'function' ? key(max) : max[key]
    const valueItem = typeof key === 'function' ? key(item) : item[key]
    return valueItem > valueMax ? item : max
  })
}

/**
 * 獲取數組最小值
 * @param {Array} array 數組
 * @param {string|Function} key 比較鍵或函數
 * @returns {any} 最小值項目
 */
export function minBy(array, key) {
  if (!Array.isArray(array) || array.length === 0) {
    return null
  }
  
  return array.reduce((min, item) => {
    const valueMin = typeof key === 'function' ? key(min) : min[key]
    const valueItem = typeof key === 'function' ? key(item) : item[key]
    return valueItem < valueMin ? item : min
  })
}

/**
 * 字符串截斷
 * @param {string} str 字符串
 * @param {number} length 長度
 * @param {string} suffix 後綴
 * @returns {string} 截斷後的字符串
 */
export function truncate(str, length = 50, suffix = '...') {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  if (str.length <= length) {
    return str
  }
  
  return str.slice(0, length) + suffix
}

/**
 * 首字母大寫
 * @param {string} str 字符串
 * @returns {string} 首字母大寫的字符串
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 駝峰轉換
 * @param {string} str 字符串
 * @returns {string} 駝峰格式字符串
 */
export function camelCase(str) {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^[A-Z]/, char => char.toLowerCase())
}

/**
 * 下劃線轉換
 * @param {string} str 字符串
 * @returns {string} 下劃線格式字符串
 */
export function snakeCase(str) {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '')
}

/**
 * 短橫線轉換
 * @param {string} str 字符串
 * @returns {string} 短橫線格式字符串
 */
export function kebabCase(str) {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '')
}

/**
 * 隨機字符串
 * @param {number} length 長度
 * @param {string} chars 字符集
 * @returns {string} 隨機字符串
 */
export function randomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 隨機數字
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 隨機數字
 */
export function randomNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 隨機選擇
 * @param {Array} array 數組
 * @returns {any} 隨機選擇的項目
 */
export function randomChoice(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null
  }
  
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 延遲執行
 * @param {number} ms 毫秒
 * @returns {Promise} Promise
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重試執行
 * @param {Function} fn 函數
 * @param {number} times 重試次數
 * @param {number} delay 延遲時間
 * @returns {Promise} Promise
 */
export async function retry(fn, times = 3, delayMs = 1000) {
  let lastError
  
  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < times - 1) {
        await delay(delayMs)
      }
    }
  }
  
  throw lastError
}

export default {
  formatAmount,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  generateId,
  deepClone,
  isEmpty,
  safeJsonParse,
  safeJsonStringify,
  uniqueArray,
  groupBy,
  sortBy,
  sumBy,
  averageBy,
  maxBy,
  minBy,
  truncate,
  capitalize,
  camelCase,
  snakeCase,
  kebabCase,
  randomString,
  randomNumber,
  randomChoice,
  delay,
  retry
}
