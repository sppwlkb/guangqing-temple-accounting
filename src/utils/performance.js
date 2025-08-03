/**
 * 效能優化工具
 * 提供防抖、節流、記憶化等效能優化功能
 */

/**
 * 防抖函數
 * @param {Function} func 要防抖的函數
 * @param {number} wait 等待時間（毫秒）
 * @param {boolean} immediate 是否立即執行
 * @returns {Function} 防抖後的函數
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    
    const callNow = immediate && !timeout
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func.apply(this, args)
  }
}

/**
 * 節流函數
 * @param {Function} func 要節流的函數
 * @param {number} limit 時間限制（毫秒）
 * @returns {Function} 節流後的函數
 */
export function throttle(func, limit = 300) {
  let inThrottle
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 記憶化函數
 * @param {Function} func 要記憶化的函數
 * @param {Function} keyGenerator 鍵生成函數
 * @returns {Function} 記憶化後的函數
 */
export function memoize(func, keyGenerator = (...args) => JSON.stringify(args)) {
  const cache = new Map()
  
  return function memoizedFunction(...args) {
    const key = keyGenerator(...args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func.apply(this, args)
    cache.set(key, result)
    
    // 限制快取大小
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }
}

/**
 * 延遲執行
 * @param {number} ms 延遲時間（毫秒）
 * @returns {Promise} Promise
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 批次處理函數
 * @param {Function} func 要批次處理的函數
 * @param {number} batchSize 批次大小
 * @param {number} delay 批次間延遲
 * @returns {Function} 批次處理函數
 */
export function batchProcess(func, batchSize = 10, delayMs = 0) {
  return async function(items) {
    const results = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(func))
      results.push(...batchResults)
      
      if (delayMs > 0 && i + batchSize < items.length) {
        await delay(delayMs)
      }
    }
    
    return results
  }
}

/**
 * 重試函數
 * @param {Function} func 要重試的函數
 * @param {number} maxRetries 最大重試次數
 * @param {number} delayMs 重試間隔
 * @returns {Function} 重試函數
 */
export function retry(func, maxRetries = 3, delayMs = 1000) {
  return async function(...args) {
    let lastError
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await func.apply(this, args)
      } catch (error) {
        lastError = error
        
        if (i < maxRetries) {
          await delay(delayMs * Math.pow(2, i)) // 指數退避
        }
      }
    }
    
    throw lastError
  }
}

/**
 * 效能監控類
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
  }
  
  /**
   * 開始計時
   * @param {string} name 計時名稱
   */
  start(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    })
  }
  
  /**
   * 結束計時
   * @param {string} name 計時名稱
   * @returns {number} 持續時間
   */
  end(name) {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`)
      return 0
    }
    
    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime
    
    this.notifyObservers(name, metric)
    
    return metric.duration
  }
  
  /**
   * 獲取計時結果
   * @param {string} name 計時名稱
   * @returns {Object} 計時結果
   */
  getMetric(name) {
    return this.metrics.get(name)
  }
  
  /**
   * 獲取所有計時結果
   * @returns {Map} 所有計時結果
   */
  getAllMetrics() {
    return new Map(this.metrics)
  }
  
  /**
   * 清除計時結果
   * @param {string} name 計時名稱（可選）
   */
  clear(name) {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
  
  /**
   * 添加觀察者
   * @param {Function} observer 觀察者函數
   */
  addObserver(observer) {
    this.observers.push(observer)
  }
  
  /**
   * 移除觀察者
   * @param {Function} observer 觀察者函數
   */
  removeObserver(observer) {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }
  
  /**
   * 通知觀察者
   * @param {string} name 計時名稱
   * @param {Object} metric 計時結果
   */
  notifyObservers(name, metric) {
    this.observers.forEach(observer => {
      try {
        observer(name, metric)
      } catch (error) {
        console.error('Performance observer error:', error)
      }
    })
  }
}

/**
 * 全域效能監控實例
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * 效能裝飾器
 * @param {string} name 計時名稱
 * @returns {Function} 裝飾器函數
 */
export function measurePerformance(name) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args) {
      const metricName = name || `${target.constructor.name}.${propertyKey}`
      
      performanceMonitor.start(metricName)
      
      try {
        const result = originalMethod.apply(this, args)
        
        if (result instanceof Promise) {
          return result.finally(() => {
            performanceMonitor.end(metricName)
          })
        } else {
          performanceMonitor.end(metricName)
          return result
        }
      } catch (error) {
        performanceMonitor.end(metricName)
        throw error
      }
    }
    
    return descriptor
  }
}

/**
 * 記憶體使用監控
 */
export class MemoryMonitor {
  constructor() {
    this.samples = []
    this.maxSamples = 100
  }
  
  /**
   * 記錄記憶體使用情況
   */
  sample() {
    if (!performance.memory) {
      console.warn('Memory API not available')
      return null
    }
    
    const sample = {
      timestamp: Date.now(),
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    }
    
    this.samples.push(sample)
    
    if (this.samples.length > this.maxSamples) {
      this.samples.shift()
    }
    
    return sample
  }
  
  /**
   * 獲取記憶體使用統計
   * @returns {Object} 記憶體統計
   */
  getStats() {
    if (this.samples.length === 0) {
      return null
    }
    
    const latest = this.samples[this.samples.length - 1]
    const usedMB = latest.used / 1024 / 1024
    const totalMB = latest.total / 1024 / 1024
    const limitMB = latest.limit / 1024 / 1024
    
    return {
      used: usedMB,
      total: totalMB,
      limit: limitMB,
      usage: (usedMB / limitMB) * 100,
      samples: this.samples.length
    }
  }
  
  /**
   * 檢查記憶體洩漏
   * @returns {boolean} 是否可能有記憶體洩漏
   */
  checkMemoryLeak() {
    if (this.samples.length < 10) {
      return false
    }
    
    const recent = this.samples.slice(-10)
    const trend = recent.reduce((acc, sample, index) => {
      if (index === 0) return acc
      return acc + (sample.used - recent[index - 1].used)
    }, 0)
    
    // 如果記憶體持續增長超過 10MB，可能有洩漏
    return trend > 10 * 1024 * 1024
  }
}

/**
 * 全域記憶體監控實例
 */
export const memoryMonitor = new MemoryMonitor()

/**
 * FPS 監控
 */
export class FPSMonitor {
  constructor() {
    this.fps = 0
    this.frameCount = 0
    this.lastTime = performance.now()
    this.running = false
  }
  
  /**
   * 開始監控
   */
  start() {
    if (this.running) return
    
    this.running = true
    this.frameCount = 0
    this.lastTime = performance.now()
    this.tick()
  }
  
  /**
   * 停止監控
   */
  stop() {
    this.running = false
  }
  
  /**
   * 計算 FPS
   */
  tick() {
    if (!this.running) return
    
    this.frameCount++
    const currentTime = performance.now()
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.frameCount = 0
      this.lastTime = currentTime
    }
    
    requestAnimationFrame(() => this.tick())
  }
  
  /**
   * 獲取當前 FPS
   * @returns {number} FPS 值
   */
  getFPS() {
    return this.fps
  }
}

/**
 * 全域 FPS 監控實例
 */
export const fpsMonitor = new FPSMonitor()

export default {
  debounce,
  throttle,
  memoize,
  delay,
  batchProcess,
  retry,
  PerformanceMonitor,
  performanceMonitor,
  measurePerformance,
  MemoryMonitor,
  memoryMonitor,
  FPSMonitor,
  fpsMonitor
}