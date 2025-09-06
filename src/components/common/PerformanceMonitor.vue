<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <span class="monitor-title">效能監控</span>
      <el-button
        size="small"
        :icon="Close"
        circle
        @click="hideMonitor"
      />
    </div>

    <div class="monitor-content">
      <!-- FPS 監控 -->
      <div class="metric-item">
        <span class="metric-label">FPS:</span>
        <span class="metric-value" :class="getFPSClass(metrics.fps)">
          {{ metrics.fps || 0 }}
        </span>
      </div>

      <!-- 記憶體使用 -->
      <div class="metric-item">
        <span class="metric-label">記憶體:</span>
        <span class="metric-value">
          {{ formatMemory(metrics.memory?.used) }}MB
        </span>
      </div>

      <!-- 長任務計數 -->
      <div class="metric-item">
        <span class="metric-label">長任務:</span>
        <span class="metric-value" :class="getLongTaskClass(longTaskCount)">
          {{ longTaskCount }}
        </span>
      </div>

      <!-- 載入時間 -->
      <div class="metric-item">
        <span class="metric-label">載入:</span>
        <span class="metric-value">
          {{ formatTime(loadTime) }}ms
        </span>
      </div>

      <!-- 網路狀態 -->
      <div class="metric-item">
        <span class="metric-label">網路:</span>
        <span class="metric-value" :class="getNetworkClass(networkStatus)">
          {{ networkStatus }}
        </span>
      </div>
    </div>

    <div class="monitor-actions">
      <el-button size="small" @click="clearMetrics">
        清除
      </el-button>
      <el-button size="small" @click="exportMetrics">
        匯出
      </el-button>
    </div>
  </div>

  <!-- 浮動開關按鈕 -->
  <el-button
    v-if="!showMonitor && isDevelopment"
    class="monitor-toggle"
    size="small"
    :icon="Monitor"
    circle
    @click="showMonitor = true"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Close, Monitor } from '@element-plus/icons-vue'
import { usePerformanceMonitor, useMemoryOptimization } from '@/composables/useOptimization'
import { performanceMonitor } from '@/utils/performance'

// 狀態
const showMonitor = ref(false)
const longTaskCount = ref(0)
const loadTime = ref(0)
const networkStatus = ref('online')
const isDevelopment = import.meta.env.DEV

// 使用效能監控
const { metrics } = usePerformanceMonitor()
const { memoryUsage, startMonitoring } = useMemoryOptimization()

// 監控定時器
let monitoringInterval = null

// 格式化記憶體
const formatMemory = (bytes) => {
  if (!bytes) return '0'
  return Math.round(bytes)
}

// 格式化時間
const formatTime = (ms) => {
  if (!ms) return '0'
  return Math.round(ms)
}

// 獲取 FPS 樣式類別
const getFPSClass = (fps) => {
  if (fps >= 55) return 'good'
  if (fps >= 30) return 'warning'
  return 'poor'
}

// 獲取長任務樣式類別
const getLongTaskClass = (count) => {
  if (count === 0) return 'good'
  if (count <= 3) return 'warning'
  return 'poor'
}

// 獲取網路狀態樣式類別
const getNetworkClass = (status) => {
  switch (status) {
    case 'online': return 'good'
    case 'slow': return 'warning'
    case 'offline': return 'poor'
    default: return 'unknown'
  }
}

// 隱藏監控器
const hideMonitor = () => {
  showMonitor.value = false
}

// 清除指標
const clearMetrics = () => {
  longTaskCount.value = 0
  loadTime.value = 0
  
  // 清除效能監控器的指標
  if (performanceMonitor) {
    performanceMonitor.metrics?.clear()
  }
}

// 匯出指標
const exportMetrics = () => {
  const data = {
    timestamp: new Date().toISOString(),
    metrics: {
      fps: metrics.value.fps,
      memory: metrics.value.memory,
      longTasks: longTaskCount.value,
      loadTime: loadTime.value,
      networkStatus: networkStatus.value
    },
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-metrics-${Date.now()}.json`
  a.click()
  
  URL.revokeObjectURL(url)
}

// 監控長任務
const setupLongTaskMonitoring = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 50) {
            longTaskCount.value++
          }
        })
      })
      
      observer.observe({ entryTypes: ['longtask'] })
      
      return () => observer.disconnect()
    } catch (error) {
      console.warn('長任務監控不支援:', error)
    }
  }
  return () => {}
}

// 監控網路狀態
const setupNetworkMonitoring = () => {
  const updateNetworkStatus = () => {
    if (!navigator.onLine) {
      networkStatus.value = 'offline'
      return
    }

    // 檢測網路速度（簡單實現）
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
      const effectiveType = connection.effectiveType
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        networkStatus.value = 'slow'
      } else {
        networkStatus.value = 'online'
      }
    } else {
      networkStatus.value = 'online'
    }
  }

  updateNetworkStatus()
  
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  
  if (navigator.connection) {
    navigator.connection.addEventListener('change', updateNetworkStatus)
  }

  return () => {
    window.removeEventListener('online', updateNetworkStatus)
    window.removeEventListener('offline', updateNetworkStatus)
    if (navigator.connection) {
      navigator.connection.removeEventListener('change', updateNetworkStatus)
    }
  }
}

// 測量載入時間
const measureLoadTime = () => {
  const navigation = performance.getEntriesByType('navigation')[0]
  if (navigation) {
    loadTime.value = navigation.loadEventEnd - navigation.loadEventStart
  }
}

// 開始監控
const startPerformanceMonitoring = () => {
  // 啟動記憶體監控
  startMonitoring()
  
  // 測量載入時間
  measureLoadTime()
  
  // 設置長任務監控
  const cleanupLongTask = setupLongTaskMonitoring()
  
  // 設置網路監控
  const cleanupNetwork = setupNetworkMonitoring()
  
  // 定期更新指標
  monitoringInterval = setInterval(() => {
    // 這裡可以添加其他定期更新的指標
  }, 1000)

  return () => {
    cleanupLongTask()
    cleanupNetwork()
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
    }
  }
}

// 生命週期
onMounted(() => {
  const cleanup = startPerformanceMonitoring()
  
  onUnmounted(() => {
    cleanup()
  })
})

// 鍵盤快捷鍵
const handleKeydown = (event) => {
  // Ctrl + Shift + P 切換效能監控器
  if (event.ctrlKey && event.shiftKey && event.key === 'P') {
    event.preventDefault()
    showMonitor.value = !showMonitor.value
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 200px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  font-family: monospace;
  z-index: 9999;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.monitor-title {
  font-weight: bold;
  font-size: 13px;
}

.monitor-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: #ccc;
}

.metric-value {
  font-weight: bold;
}

.metric-value.good {
  color: #67c23a;
}

.metric-value.warning {
  color: #e6a23c;
}

.metric-value.poor {
  color: #f56c6c;
}

.metric-value.unknown {
  color: #909399;
}

.monitor-actions {
  display: flex;
  gap: 4px;
  justify-content: space-between;
}

.monitor-actions .el-button {
  flex: 1;
  font-size: 11px;
  padding: 4px 8px;
}

.monitor-toggle {
  position: fixed;
  bottom: 140px;
  right: 24px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.monitor-toggle:hover {
  background: rgba(0, 0, 0, 0.9);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .performance-monitor {
    top: 10px;
    right: 10px;
    width: 180px;
    font-size: 11px;
  }
  
  .monitor-toggle {
    bottom: 120px;
    right: 16px;
  }
}
</style>
