<template>
  <div class="error-boundary">
    <!-- 正常內容 -->
    <slot v-if="!hasError" />
    
    <!-- 錯誤狀態 -->
    <div v-else class="error-content">
      <div class="error-container">
        <!-- 錯誤圖標 -->
        <div class="error-icon">
          <el-icon class="icon-large">
            <component :is="getErrorIcon()" />
          </el-icon>
        </div>
        
        <!-- 錯誤標題 -->
        <h3 class="error-title">
          {{ getErrorTitle() }}
        </h3>
        
        <!-- 錯誤描述 -->
        <p class="error-description">
          {{ getErrorDescription() }}
        </p>
        
        <!-- 錯誤詳情（開發模式） -->
        <div v-if="showDetails && isDevelopment" class="error-details">
          <el-collapse>
            <el-collapse-item title="錯誤詳情" name="details">
              <div class="error-stack">
                <pre>{{ errorInfo.stack }}</pre>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        
        <!-- 操作按鈕 -->
        <div class="error-actions">
          <el-button type="primary" @click="handleRetry">
            <el-icon><Refresh /></el-icon>
            重試
          </el-button>
          
          <el-button @click="handleGoBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          
          <el-button 
            v-if="showReportButton" 
            type="warning" 
            @click="handleReport"
          >
            <el-icon><Warning /></el-icon>
            回報問題
          </el-button>
          
          <el-button 
            v-if="isDevelopment" 
            link 
            @click="showDetails = !showDetails"
          >
            {{ showDetails ? '隱藏' : '顯示' }}詳情
          </el-button>
        </div>
        
        <!-- 建議操作 -->
        <div v-if="suggestions.length > 0" class="error-suggestions">
          <h4>建議解決方案：</h4>
          <ul>
            <li v-for="(suggestion, index) in suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Refresh, ArrowLeft, Warning, WarningFilled, 
  CircleCloseFilled, InfoFilled 
} from '@element-plus/icons-vue'

const props = defineProps({
  fallback: {
    type: [String, Object],
    default: null
  },
  showReportButton: {
    type: Boolean,
    default: true
  },
  onError: {
    type: Function,
    default: null
  },
  onRetry: {
    type: Function,
    default: null
  },
  customSuggestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['error', 'retry', 'report'])

const router = useRouter()

// 狀態
const hasError = ref(false)
const errorInfo = ref({})
const showDetails = ref(false)
const retryCount = ref(0)
const isDevelopment = import.meta.env.DEV

// 錯誤類型
const ErrorTypes = {
  NETWORK: 'network',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  RUNTIME: 'runtime',
  UNKNOWN: 'unknown'
}

// 錯誤分類
const getErrorType = (error) => {
  if (!error) return ErrorTypes.UNKNOWN
  
  const message = error.message?.toLowerCase() || ''
  
  if (message.includes('network') || message.includes('fetch')) {
    return ErrorTypes.NETWORK
  }
  
  if (message.includes('permission') || message.includes('unauthorized')) {
    return ErrorTypes.PERMISSION
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorTypes.VALIDATION
  }
  
  return ErrorTypes.RUNTIME
}

// 錯誤圖標
const getErrorIcon = () => {
  const type = getErrorType(errorInfo.value.error)
  
  switch (type) {
    case ErrorTypes.NETWORK:
      return 'Warning'
    case ErrorTypes.PERMISSION:
      return 'CircleCloseFilled'
    case ErrorTypes.VALIDATION:
      return 'InfoFilled'
    default:
      return 'WarningFilled'
  }
}

// 錯誤標題
const getErrorTitle = () => {
  const type = getErrorType(errorInfo.value.error)
  
  switch (type) {
    case ErrorTypes.NETWORK:
      return '網路連線問題'
    case ErrorTypes.PERMISSION:
      return '權限不足'
    case ErrorTypes.VALIDATION:
      return '資料驗證錯誤'
    case ErrorTypes.RUNTIME:
      return '程式執行錯誤'
    default:
      return '發生未知錯誤'
  }
}

// 錯誤描述
const getErrorDescription = () => {
  const type = getErrorType(errorInfo.value.error)
  
  switch (type) {
    case ErrorTypes.NETWORK:
      return '無法連接到伺服器，請檢查您的網路連線。'
    case ErrorTypes.PERMISSION:
      return '您沒有執行此操作的權限，請聯繫管理員。'
    case ErrorTypes.VALIDATION:
      return '輸入的資料格式不正確，請檢查後重試。'
    case ErrorTypes.RUNTIME:
      return '程式執行時發生錯誤，請稍後重試。'
    default:
      return '系統發生未預期的錯誤，請稍後重試或聯繫技術支援。'
  }
}

// 建議解決方案
const suggestions = computed(() => {
  if (props.customSuggestions.length > 0) {
    return props.customSuggestions
  }
  
  const type = getErrorType(errorInfo.value.error)
  
  switch (type) {
    case ErrorTypes.NETWORK:
      return [
        '檢查網路連線是否正常',
        '重新整理頁面',
        '稍後再試'
      ]
    case ErrorTypes.PERMISSION:
      return [
        '確認您已登入系統',
        '聯繫管理員確認權限',
        '嘗試重新登入'
      ]
    case ErrorTypes.VALIDATION:
      return [
        '檢查輸入資料的格式',
        '確認必填欄位已填寫',
        '參考範例格式'
      ]
    default:
      return [
        '重新整理頁面',
        '清除瀏覽器快取',
        '聯繫技術支援'
      ]
  }
})

// 捕獲錯誤
onErrorCaptured((error, instance, info) => {
  console.error('ErrorBoundary 捕獲錯誤:', error)
  
  hasError.value = true
  errorInfo.value = {
    error,
    instance,
    info,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  // 觸發錯誤事件
  emit('error', errorInfo.value)
  
  // 執行自訂錯誤處理
  if (props.onError) {
    props.onError(errorInfo.value)
  }
  
  // 阻止錯誤繼續向上傳播
  return false
})

// 重試操作
const handleRetry = () => {
  retryCount.value++
  
  if (retryCount.value > 3) {
    ElMessage.warning('重試次數過多，請稍後再試')
    return
  }
  
  hasError.value = false
  errorInfo.value = {}
  showDetails.value = false
  
  // 觸發重試事件
  emit('retry', retryCount.value)
  
  // 執行自訂重試處理
  if (props.onRetry) {
    props.onRetry()
  }
  
  ElMessage.info('正在重試...')
}

// 返回操作
const handleGoBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// 回報問題
const handleReport = () => {
  const reportData = {
    error: errorInfo.value.error?.message,
    stack: errorInfo.value.stack,
    timestamp: errorInfo.value.timestamp,
    userAgent: errorInfo.value.userAgent,
    url: errorInfo.value.url,
    retryCount: retryCount.value
  }
  
  // 觸發回報事件
  emit('report', reportData)
  
  // 這裡可以實作實際的錯誤回報邏輯
  // 例如發送到錯誤追蹤服務
  
  ElMessage.success('問題已回報，感謝您的反饋')
}

// 重置錯誤狀態
const resetError = () => {
  hasError.value = false
  errorInfo.value = {}
  showDetails.value = false
  retryCount.value = 0
}

// 暴露方法
defineExpose({
  resetError,
  hasError,
  errorInfo
})
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-xxl);
}

.error-container {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-icon {
  margin-bottom: var(--spacing-xl);
}

.icon-large {
  font-size: 64px;
  color: var(--danger-color);
}

.error-title {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.error-description {
  margin: 0 0 var(--spacing-xl) 0;
  font-size: var(--font-size-base);
  color: var(--text-regular);
  line-height: var(--line-height-large);
}

.error-details {
  margin: var(--spacing-xl) 0;
  text-align: left;
}

.error-stack {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-base);
  overflow-x: auto;
}

.error-stack pre {
  margin: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.error-suggestions {
  text-align: left;
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-base);
  border-left: 4px solid var(--warning-color);
}

.error-suggestions h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.error-suggestions ul {
  margin: 0;
  padding-left: var(--spacing-xl);
}

.error-suggestions li {
  margin-bottom: var(--spacing-sm);
  color: var(--text-regular);
  line-height: var(--line-height-base);
}

.error-suggestions li:last-child {
  margin-bottom: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .error-content {
    padding: var(--spacing-lg);
    min-height: 300px;
  }
  
  .icon-large {
    font-size: 48px;
  }
  
  .error-title {
    font-size: var(--font-size-lg);
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .el-button {
    width: 100%;
    max-width: 200px;
  }
}

/* 深色模式支援 */
@media (prefers-color-scheme: dark) {
  .error-stack {
    background: var(--bg-tertiary);
  }
  
  .error-suggestions {
    background: var(--bg-tertiary);
  }
}
</style>
