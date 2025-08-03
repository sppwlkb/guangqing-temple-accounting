<template>
  <div class="performance-test">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">效能測試</h1>
        <p class="page-description">監控和測試應用程式的效能指標</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="startTest">
          開始測試
        </el-button>
        <el-button @click="clearMetrics">
          清除數據
        </el-button>
      </div>
    </div>

    <!-- 即時效能指標 -->
    <FormCard title="即時效能指標">
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-title">FPS</div>
          <div class="metric-value" :class="getFPSClass(metrics.fps)">
            {{ metrics.fps || 0 }}
          </div>
          <div class="metric-desc">幀率</div>
        </div>

        <div class="metric-card">
          <div class="metric-title">記憶體使用</div>
          <div class="metric-value">
            {{ formatMemory(metrics.memory?.used) }}
          </div>
          <div class="metric-desc">
            / {{ formatMemory(metrics.memory?.total) }}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-title">長任務</div>
          <div class="metric-value" :class="getLongTaskClass(metrics.longTasks)">
            {{ metrics.longTasks || 0 }}
          </div>
          <div class="metric-desc">次數</div>
        </div>

        <div class="metric-card">
          <div class="metric-title">載入時間</div>
          <div class="metric-value">
            {{ formatTime(loadTime) }}
          </div>
          <div class="metric-desc">毫秒</div>
        </div>
      </div>
    </FormCard>

    <!-- 效能圖表 */
    <FormCard title="效能趨勢圖">
      <div class="chart-container">
        <div class="chart-placeholder">
          <el-icon class="chart-icon"><TrendCharts /></el-icon>
          <p>FPS 和記憶體使用趨勢圖</p>
          <p>顯示最近 60 秒的效能變化</p>
        </div>
      </div>
    </FormCard>

    <!-- 效能測試項目 -->
    <FormCard title="效能測試項目">
      <div class="test-items">
        <div 
          v-for="test in performanceTests" 
          :key="test.id"
          class="test-item"
        >
          <div class="test-info">
            <div class="test-name">{{ test.name }}</div>
            <div class="test-desc">{{ test.description }}</div>
          </div>
          <div class="test-actions">
            <el-button 
              size="small" 
              :loading="test.running"
              @click="runTest(test)"
            >
              {{ test.running ? '測試中...' : '執行測試' }}
            </el-button>
          </div>
          <div class="test-result">
            <span v-if="test.result" :class="getResultClass(test.result.status)">
              {{ test.result.message }}
            </span>
          </div>
        </div>
      </div>
    </FormCard>

    <!-- 效能建議 -->
    <FormCard title="效能建議">
      <div class="recommendations">
        <div 
          v-for="(recommendation, index) in recommendations" 
          :key="index"
          class="recommendation-item"
          :class="recommendation.type"
        >
          <div class="recommendation-icon">
            <el-icon>
              <component :is="recommendation.icon" />
            </el-icon>
          </div>
          <div class="recommendation-content">
            <div class="recommendation-title">{{ recommendation.title }}</div>
            <div class="recommendation-desc">{{ recommendation.description }}</div>
          </div>
        </div>
      </div>
    </FormCard>

    <!-- 詳細報告 -->
    <FormCard title="詳細報告">
      <div class="detailed-report">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="效能指標" name="metrics">
            <div class="metrics-table">
              <el-table :data="metricsHistory" stripe>
                <el-table-column label="時間" prop="timestamp" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.timestamp) }}
                  </template>
                </el-table-column>
                <el-table-column label="FPS" prop="fps" width="80" />
                <el-table-column label="記憶體 (MB)" prop="memory" width="120">
                  <template #default="{ row }">
                    {{ formatMemory(row.memory) }}
                  </template>
                </el-table-column>
                <el-table-column label="長任務" prop="longTasks" width="80" />
                <el-table-column label="狀態" prop="status" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.status)">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="網路請求" name="network">
            <div class="network-info">
              <p>網路請求監控功能開發中...</p>
            </div>
          </el-tab-pane>

          <el-tab-pane label="資源載入" name="resources">
            <div class="resources-info">
              <p>資源載入分析功能開發中...</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </FormCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { TrendCharts, SuccessFilled, Warning, InfoFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import FormCard from '@/components/common/FormCard.vue'
import { usePerformanceMonitor } from '@/composables/usePerformance'
import { performanceMonitor } from '@/utils/performance'

// 效能監控
const { metrics, isMonitoring } = usePerformanceMonitor()

// 狀態
const activeTab = ref('metrics')
const loadTime = ref(0)
const metricsHistory = ref([])

// 效能測試項目
const performanceTests = ref([
  {
    id: 1,
    name: '大量數據渲染測試',
    description: '測試渲染 1000 筆記錄的效能',
    running: false,
    result: null
  },
  {
    id: 2,
    name: '記憶體洩漏測試',
    description: '檢查是否存在記憶體洩漏問題',
    running: false,
    result: null
  },
  {
    id: 3,
    name: '響應時間測試',
    description: '測試用戶操作的響應時間',
    running: false,
    result: null
  },
  {
    id: 4,
    name: '滾動效能測試',
    description: '測試長列表滾動的流暢度',
    running: false,
    result: null
  }
])

// 效能建議
const recommendations = ref([
  {
    type: 'success',
    icon: 'SuccessFilled',
    title: '效能良好',
    description: '當前應用程式效能表現良好，FPS 穩定在 60 左右'
  },
  {
    type: 'warning',
    icon: 'Warning',
    title: '記憶體使用偏高',
    description: '建議檢查是否有未釋放的資源或記憶體洩漏'
  },
  {
    type: 'info',
    icon: 'InfoFilled',
    title: '優化建議',
    description: '可以考慮使用虛擬滾動來提升大列表的渲染效能'
  }
])

// 格式化記憶體
const formatMemory = (bytes) => {
  if (!bytes) return '0'
  return Math.round(bytes).toLocaleString()
}

// 格式化時間
const formatTime = (ms) => {
  return Math.round(ms).toLocaleString()
}

// 格式化日期時間
const formatDateTime = (timestamp) => {
  return dayjs(timestamp).format('HH:mm:ss')
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

// 獲取結果樣式類別
const getResultClass = (status) => {
  switch (status) {
    case 'pass': return 'result-pass'
    case 'warning': return 'result-warning'
    case 'fail': return 'result-fail'
    default: return ''
  }
}

// 獲取狀態標籤類型
const getStatusTagType = (status) => {
  switch (status) {
    case 'good': return 'success'
    case 'warning': return 'warning'
    case 'poor': return 'danger'
    default: return 'info'
  }
}

// 開始測試
const startTest = () => {
  ElMessage.info('開始效能監控...')
  
  // 記錄載入時間
  loadTime.value = performance.now()
  
  // 開始收集指標歷史
  collectMetricsHistory()
}

// 清除指標
const clearMetrics = () => {
  metricsHistory.value = []
  ElMessage.success('效能數據已清除')
}

// 執行測試
const runTest = async (test) => {
  test.running = true
  test.result = null
  
  try {
    // 模擬測試過程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模擬測試結果
    const results = [
      { status: 'pass', message: '測試通過' },
      { status: 'warning', message: '效能一般，建議優化' },
      { status: 'fail', message: '測試失敗，需要改進' }
    ]
    
    test.result = results[Math.floor(Math.random() * results.length)]
    
  } catch (error) {
    test.result = { status: 'fail', message: '測試執行失敗' }
  } finally {
    test.running = false
  }
}

// 收集指標歷史
const collectMetricsHistory = () => {
  const interval = setInterval(() => {
    if (metrics.value.fps !== undefined) {
      const record = {
        timestamp: Date.now(),
        fps: metrics.value.fps,
        memory: metrics.value.memory?.used || 0,
        longTasks: metrics.value.longTasks || 0,
        status: getPerformanceStatus()
      }
      
      metricsHistory.value.unshift(record)
      
      // 保留最近 100 條記錄
      if (metricsHistory.value.length > 100) {
        metricsHistory.value = metricsHistory.value.slice(0, 100)
      }
    }
  }, 1000)
  
  // 組件卸載時清除定時器
  onUnmounted(() => {
    clearInterval(interval)
  })
}

// 獲取效能狀態
const getPerformanceStatus = () => {
  const fps = metrics.value.fps || 0
  const longTasks = metrics.value.longTasks || 0
  
  if (fps >= 55 && longTasks === 0) return 'good'
  if (fps >= 30 && longTasks <= 3) return 'warning'
  return 'poor'
}

// 初始化
onMounted(() => {
  // 自動開始監控
  startTest()
})
</script>

<style scoped>
.performance-test {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.metric-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 4px;
  font-family: monospace;
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

.metric-desc {
  font-size: 12px;
  color: #909399;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.test-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.test-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.test-info {
  flex: 1;
}

.test-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.test-desc {
  font-size: 14px;
  color: #606266;
}

.test-actions {
  margin: 0 16px;
}

.test-result {
  min-width: 120px;
  text-align: right;
}

.result-pass {
  color: #67c23a;
}

.result-warning {
  color: #e6a23c;
}

.result-fail {
  color: #f56c6c;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.recommendation-item.success {
  background: #f0f9ff;
  border-color: #67c23a;
}

.recommendation-item.warning {
  background: #fdf6ec;
  border-color: #e6a23c;
}

.recommendation-item.info {
  background: #f4f4f5;
  border-color: #909399;
}

.recommendation-icon {
  font-size: 20px;
  margin-top: 2px;
}

.recommendation-item.success .recommendation-icon {
  color: #67c23a;
}

.recommendation-item.warning .recommendation-icon {
  color: #e6a23c;
}

.recommendation-item.info .recommendation-icon {
  color: #909399;
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.recommendation-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.detailed-report {
  margin-top: 16px;
}

.metrics-table {
  margin-top: 16px;
}

.network-info,
.resources-info {
  text-align: center;
  padding: 40px;
  color: #909399;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .performance-test {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .test-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .test-actions {
    margin: 0;
    align-self: stretch;
  }
  
  .test-result {
    min-width: auto;
    text-align: left;
  }
}
</style>
