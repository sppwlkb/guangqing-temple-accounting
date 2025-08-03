import { ref, reactive } from 'vue'

/**
 * 全域載入狀態管理
 * 提供統一的載入狀態控制
 */

// 全域狀態
const globalLoadingState = reactive({
  visible: false,
  message: '載入中...',
  progress: 0,
  showProgress: false,
  showCancel: false,
  cancelable: false,
  messages: [],
  messageInterval: 2000
})

// 載入堆疊，支援多個同時載入
const loadingStack = ref([])

// 取消回調函數
let cancelCallback = null

/**
 * 全域載入管理器
 */
export function useGlobalLoading() {
  
  /**
   * 顯示載入指示器
   * @param {Object} options 載入選項
   */
  const showLoading = (options = {}) => {
    const loadingId = Date.now().toString()
    
    const loadingOptions = {
      id: loadingId,
      message: '載入中...',
      progress: 0,
      showProgress: false,
      showCancel: false,
      cancelable: false,
      messages: [],
      messageInterval: 2000,
      ...options
    }
    
    // 添加到載入堆疊
    loadingStack.value.push(loadingOptions)
    
    // 更新全域狀態（使用最新的載入選項）
    updateGlobalState(loadingOptions)
    
    return loadingId
  }
  
  /**
   * 隱藏載入指示器
   * @param {string} loadingId 載入 ID
   */
  const hideLoading = (loadingId) => {
    if (loadingId) {
      // 移除特定的載入
      const index = loadingStack.value.findIndex(item => item.id === loadingId)
      if (index > -1) {
        loadingStack.value.splice(index, 1)
      }
    } else {
      // 移除最後一個載入
      loadingStack.value.pop()
    }
    
    // 更新全域狀態
    if (loadingStack.value.length > 0) {
      const latestLoading = loadingStack.value[loadingStack.value.length - 1]
      updateGlobalState(latestLoading)
    } else {
      globalLoadingState.visible = false
    }
  }
  
  /**
   * 隱藏所有載入指示器
   */
  const hideAllLoading = () => {
    loadingStack.value = []
    globalLoadingState.visible = false
  }
  
  /**
   * 更新載入訊息
   * @param {string} message 新訊息
   * @param {string} loadingId 載入 ID
   */
  const updateMessage = (message, loadingId) => {
    if (loadingId) {
      const loading = loadingStack.value.find(item => item.id === loadingId)
      if (loading) {
        loading.message = message
        if (loading === loadingStack.value[loadingStack.value.length - 1]) {
          globalLoadingState.message = message
        }
      }
    } else {
      globalLoadingState.message = message
    }
  }
  
  /**
   * 更新進度
   * @param {number} progress 進度百分比 (0-100)
   * @param {string} loadingId 載入 ID
   */
  const updateProgress = (progress, loadingId) => {
    const clampedProgress = Math.max(0, Math.min(100, progress))
    
    if (loadingId) {
      const loading = loadingStack.value.find(item => item.id === loadingId)
      if (loading) {
        loading.progress = clampedProgress
        if (loading === loadingStack.value[loadingStack.value.length - 1]) {
          globalLoadingState.progress = clampedProgress
        }
      }
    } else {
      globalLoadingState.progress = clampedProgress
    }
  }
  
  /**
   * 設置取消回調
   * @param {Function} callback 取消回調函數
   */
  const setCancelCallback = (callback) => {
    cancelCallback = callback
  }
  
  /**
   * 處理取消操作
   */
  const handleCancel = () => {
    if (cancelCallback) {
      cancelCallback()
    }
    hideAllLoading()
  }
  
  /**
   * 處理背景點擊
   */
  const handleBackdropClick = () => {
    if (globalLoadingState.cancelable) {
      handleCancel()
    }
  }
  
  /**
   * 更新全域狀態
   * @param {Object} options 載入選項
   */
  const updateGlobalState = (options) => {
    Object.assign(globalLoadingState, {
      visible: true,
      ...options
    })
  }
  
  /**
   * 包裝異步函數，自動顯示載入狀態
   * @param {Function} asyncFn 異步函數
   * @param {Object} options 載入選項
   */
  const withLoading = async (asyncFn, options = {}) => {
    const loadingId = showLoading(options)
    
    try {
      const result = await asyncFn((progress) => {
        updateProgress(progress, loadingId)
      })
      return result
    } finally {
      hideLoading(loadingId)
    }
  }
  
  /**
   * 步驟式載入
   * @param {Array} steps 步驟陣列
   * @param {Object} options 載入選項
   */
  const withSteps = async (steps, options = {}) => {
    const loadingId = showLoading({
      showProgress: true,
      ...options
    })
    
    try {
      const results = []
      const totalSteps = steps.length
      
      for (let i = 0; i < totalSteps; i++) {
        const step = steps[i]
        
        // 更新訊息
        if (step.message) {
          updateMessage(step.message, loadingId)
        }
        
        // 更新進度
        const progress = Math.round((i / totalSteps) * 100)
        updateProgress(progress, loadingId)
        
        // 執行步驟
        const result = await step.action()
        results.push(result)
        
        // 短暫延遲，讓用戶看到進度變化
        if (step.delay) {
          await new Promise(resolve => setTimeout(resolve, step.delay))
        }
      }
      
      // 完成
      updateProgress(100, loadingId)
      
      return results
    } finally {
      hideLoading(loadingId)
    }
  }
  
  return {
    // 狀態
    globalLoadingState,
    
    // 方法
    showLoading,
    hideLoading,
    hideAllLoading,
    updateMessage,
    updateProgress,
    setCancelCallback,
    handleCancel,
    handleBackdropClick,
    withLoading,
    withSteps
  }
}

/**
 * 預設載入訊息
 */
export const LoadingMessages = {
  LOADING: '載入中...',
  SAVING: '儲存中...',
  DELETING: '刪除中...',
  UPLOADING: '上傳中...',
  DOWNLOADING: '下載中...',
  PROCESSING: '處理中...',
  CONNECTING: '連接中...',
  SYNCING: '同步中...',
  EXPORTING: '匯出中...',
  IMPORTING: '匯入中...',
  VALIDATING: '驗證中...',
  CALCULATING: '計算中...'
}

/**
 * 預設載入步驟
 */
export const createLoadingSteps = (steps) => {
  return steps.map((step, index) => ({
    message: step.message || `步驟 ${index + 1}`,
    action: step.action,
    delay: step.delay || 500
  }))
}

/**
 * 常用載入配置
 */
export const LoadingPresets = {
  // 基本載入
  basic: {
    message: LoadingMessages.LOADING
  },
  
  // 帶進度的載入
  withProgress: {
    message: LoadingMessages.PROCESSING,
    showProgress: true
  },
  
  // 可取消的載入
  cancelable: {
    message: LoadingMessages.PROCESSING,
    showCancel: true,
    cancelable: true
  },
  
  // 檔案上傳
  upload: {
    message: LoadingMessages.UPLOADING,
    showProgress: true,
    showCancel: true,
    cancelable: true
  },
  
  // 資料同步
  sync: {
    messages: [
      '正在連接伺服器...',
      '正在同步資料...',
      '正在驗證資料...',
      '即將完成...'
    ],
    messageInterval: 1500,
    showProgress: true
  },
  
  // 報表生成
  report: {
    messages: [
      '正在收集資料...',
      '正在分析資料...',
      '正在生成報表...',
      '正在格式化...'
    ],
    messageInterval: 2000,
    showProgress: true
  }
}

// 全域實例（單例模式）
let globalLoadingInstance = null

/**
 * 獲取全域載入實例
 */
export function getGlobalLoading() {
  if (!globalLoadingInstance) {
    globalLoadingInstance = useGlobalLoading()
  }
  return globalLoadingInstance
}

export default useGlobalLoading
