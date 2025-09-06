/**
 * 效能測試腳本
 * 自動化測試應用程式的各項效能指標
 */

class PerformanceTester {
  constructor() {
    this.results = {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: {},
      fps: [],
      longTasks: [],
      networkRequests: [],
      bundleSize: 0
    }
    
    this.observer = null
    this.startTime = performance.now()
  }

  // 開始效能測試
  async startTest() {
    console.log('🚀 開始效能測試...')
    
    try {
      // 測試載入效能
      await this.testLoadPerformance()
      
      // 測試渲染效能
      await this.testRenderPerformance()
      
      // 測試記憶體使用
      await this.testMemoryUsage()
      
      // 測試 FPS
      await this.testFPS()
      
      // 測試長任務
      await this.testLongTasks()
      
      // 測試網路請求
      await this.testNetworkRequests()
      
      // 生成報告
      this.generateReport()
      
    } catch (error) {
      console.error('❌ 效能測試失敗:', error)
    }
  }

  // 測試載入效能
  async testLoadPerformance() {
    console.log('📊 測試載入效能...')
    
    const navigation = performance.getEntriesByType('navigation')[0]
    if (navigation) {
      this.results.loadTime = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        largestContentfulPaint: this.getLargestContentfulPaint()
      }
    }
  }

  // 測試渲染效能
  async testRenderPerformance() {
    console.log('🎨 測試渲染效能...')
    
    const startTime = performance.now()
    
    // 模擬大量 DOM 操作
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '-9999px'
    document.body.appendChild(container)
    
    for (let i = 0; i < 1000; i++) {
      const element = document.createElement('div')
      element.textContent = `測試元素 ${i}`
      element.className = 'test-element'
      container.appendChild(element)
    }
    
    // 強制重排
    container.offsetHeight
    
    const endTime = performance.now()
    this.results.renderTime = endTime - startTime
    
    // 清理測試元素
    document.body.removeChild(container)
  }

  // 測試記憶體使用
  async testMemoryUsage() {
    console.log('💾 測試記憶體使用...')
    
    if ('memory' in performance) {
      this.results.memoryUsage = {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      }
    } else {
      console.warn('⚠️ 瀏覽器不支援記憶體監控')
    }
  }

  // 測試 FPS
  async testFPS() {
    console.log('🎯 測試 FPS...')
    
    return new Promise((resolve) => {
      let frameCount = 0
      let lastTime = performance.now()
      const duration = 5000 // 測試 5 秒
      
      const measureFPS = (currentTime) => {
        frameCount++
        
        if (currentTime - lastTime >= 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
          this.results.fps.push(fps)
          
          frameCount = 0
          lastTime = currentTime
        }
        
        if (currentTime - this.startTime < duration) {
          requestAnimationFrame(measureFPS)
        } else {
          resolve()
        }
      }
      
      requestAnimationFrame(measureFPS)
    })
  }

  // 測試長任務
  async testLongTasks() {
    console.log('⏱️ 測試長任務...')
    
    if ('PerformanceObserver' in window) {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 50) {
              this.results.longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              })
            }
          })
        })
        
        try {
          observer.observe({ entryTypes: ['longtask'] })
          
          // 模擬長任務
          setTimeout(() => {
            const start = performance.now()
            while (performance.now() - start < 100) {
              // 阻塞主線程 100ms
            }
          }, 1000)
          
          // 5 秒後停止觀察
          setTimeout(() => {
            observer.disconnect()
            resolve()
          }, 5000)
          
        } catch (error) {
          console.warn('⚠️ 長任務監控不支援:', error)
          resolve()
        }
      })
    } else {
      console.warn('⚠️ 瀏覽器不支援長任務監控')
    }
  }

  // 測試網路請求
  async testNetworkRequests() {
    console.log('🌐 測試網路請求...')
    
    const resources = performance.getEntriesByType('resource')
    this.results.networkRequests = resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name)
    }))
  }

  // 獲取資源類型
  getResourceType(url) {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image'
    if (url.includes('.woff') || url.includes('.ttf')) return 'font'
    return 'other'
  }

  // 獲取首次繪製時間
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : 0
  }

  // 獲取首次內容繪製時間
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : 0
  }

  // 獲取最大內容繪製時間
  getLargestContentfulPaint() {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry ? lastEntry.startTime : 0)
        })
        
        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] })
          
          // 10 秒後停止觀察
          setTimeout(() => {
            observer.disconnect()
            resolve(0)
          }, 10000)
        } catch (error) {
          resolve(0)
        }
      } else {
        resolve(0)
      }
    })
  }

  // 生成效能報告
  generateReport() {
    console.log('📋 生成效能報告...')
    
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      results: this.results,
      scores: this.calculateScores(),
      recommendations: this.generateRecommendations()
    }
    
    // 輸出報告
    console.log('📊 效能測試報告:')
    console.table(report.scores)
    console.log('💡 建議事項:')
    report.recommendations.forEach(rec => {
      console.log(`${rec.type === 'warning' ? '⚠️' : 'ℹ️'} ${rec.message}`)
    })
    
    // 儲存報告到 localStorage
    localStorage.setItem('performance-report', JSON.stringify(report))
    
    return report
  }

  // 計算效能分數
  calculateScores() {
    const scores = {}
    
    // 載入效能分數 (0-100)
    const loadTime = this.results.loadTime.loadComplete || 0
    scores.loadPerformance = Math.max(0, 100 - (loadTime / 50)) // 5秒為滿分
    
    // 渲染效能分數
    scores.renderPerformance = Math.max(0, 100 - (this.results.renderTime / 10)) // 1秒為滿分
    
    // FPS 分數
    const avgFPS = this.results.fps.length > 0 
      ? this.results.fps.reduce((a, b) => a + b, 0) / this.results.fps.length 
      : 0
    scores.fpsPerformance = Math.min(100, (avgFPS / 60) * 100)
    
    // 記憶體使用分數
    const memoryUsage = this.results.memoryUsage.used || 0
    scores.memoryPerformance = Math.max(0, 100 - (memoryUsage / 100)) // 100MB 為滿分
    
    // 總分
    scores.overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    
    return scores
  }

  // 生成建議事項
  generateRecommendations() {
    const recommendations = []
    const scores = this.calculateScores()
    
    if (scores.loadPerformance < 70) {
      recommendations.push({
        type: 'warning',
        message: '載入時間過長，建議優化資源載入和代碼分割'
      })
    }
    
    if (scores.renderPerformance < 70) {
      recommendations.push({
        type: 'warning',
        message: '渲染效能不佳，建議使用虛擬滾動或減少 DOM 操作'
      })
    }
    
    if (scores.fpsPerformance < 70) {
      recommendations.push({
        type: 'warning',
        message: 'FPS 過低，建議檢查動畫和重排重繪'
      })
    }
    
    if (scores.memoryPerformance < 70) {
      recommendations.push({
        type: 'warning',
        message: '記憶體使用過高，建議檢查記憶體洩漏'
      })
    }
    
    if (this.results.longTasks.length > 5) {
      recommendations.push({
        type: 'warning',
        message: '長任務過多，建議使用 Web Workers 或任務分割'
      })
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'info',
        message: '效能表現良好，繼續保持！'
      })
    }
    
    return recommendations
  }
}

// 自動執行測試（如果在瀏覽器環境中）
if (typeof window !== 'undefined') {
  // 等待頁面載入完成後執行測試
  if (document.readyState === 'complete') {
    const tester = new PerformanceTester()
    tester.startTest()
  } else {
    window.addEventListener('load', () => {
      const tester = new PerformanceTester()
      tester.startTest()
    })
  }
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceTester
}
