/**
 * 錯誤處理工具
 * 統一處理應用程式中的錯誤，提供友好的用戶提示
 */

import { ElMessage, ElNotification } from 'element-plus'

// 錯誤類型定義
export const ERROR_TYPES = {
  NETWORK: 'network',
  PERMISSION: 'permission', 
  VALIDATION: 'validation',
  RUNTIME: 'runtime',
  UNKNOWN: 'unknown'
}

// 錯誤級別定義
export const ERROR_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
}

/**
 * 主要錯誤處理函數
 * @param {Error} error 錯誤對象
 * @param {string} context 錯誤上下文
 * @param {Object} options 選項
 */
export function handleError(error, context = 'Unknown', options = {}) {
  const {
    showMessage = true,
    showNotification = false,
    logToConsole = true,
    level = ERROR_LEVELS.ERROR,
    customMessage = null
  } = options

  // 解析錯誤信息
  const errorInfo = parseError(error, context)
  
  // 記錄到控制台
  if (logToConsole) {
    logError(errorInfo)
  }
  
  // 顯示用戶提示
  if (showMessage) {
    showErrorMessage(errorInfo, customMessage)
  }
  
  if (showNotification) {
    showErrorNotification(errorInfo, customMessage)
  }
  
  // 上報錯誤（如果需要）
  reportError(errorInfo)
  
  return errorInfo
}

/**
 * 解析錯誤對象
 * @param {Error} error 錯誤對象
 * @param {string} context 上下文
 * @returns {Object} 解析後的錯誤信息
 */
function parseError(error, context) {
  const errorInfo = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    context,
    type: ERROR_TYPES.UNKNOWN,
    level: ERROR_LEVELS.ERROR,
    message: '未知錯誤',
    originalError: error,
    stack: null,
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  if (error instanceof Error) {
    errorInfo.message = error.message
    errorInfo.stack = error.stack
    errorInfo.name = error.name
    
    // 根據錯誤類型分類
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      errorInfo.type = ERROR_TYPES.NETWORK
      errorInfo.message = '網路連線錯誤，請檢查網路狀態'
    } else if (error.name === 'ValidationError') {
      errorInfo.type = ERROR_TYPES.VALIDATION
      errorInfo.level = ERROR_LEVELS.WARNING
    } else if (error.name === 'PermissionError') {
      errorInfo.type = ERROR_TYPES.PERMISSION
      errorInfo.message = '權限不足，無法執行此操作'
    } else {
      errorInfo.type = ERROR_TYPES.RUNTIME
    }
  } else if (typeof error === 'string') {
    errorInfo.message = error
  } else if (error && typeof error === 'object') {
    errorInfo.message = error.message || JSON.stringify(error)
    errorInfo.code = error.code
    errorInfo.status = error.status
  }

  return errorInfo
}

/**
 * 記錄錯誤到控制台
 * @param {Object} errorInfo 錯誤信息
 */
function logError(errorInfo) {
  const logMethod = errorInfo.level === ERROR_LEVELS.WARNING ? 'warn' : 'error'
  
  console.group(`🚨 ${errorInfo.context} Error`)
  console[logMethod]('Message:', errorInfo.message)
  console[logMethod]('Type:', errorInfo.type)
  console[logMethod]('Level:', errorInfo.level)
  console[logMethod]('Timestamp:', errorInfo.timestamp)
  
  if (errorInfo.stack) {
    console[logMethod]('Stack:', errorInfo.stack)
  }
  
  if (errorInfo.originalError) {
    console[logMethod]('Original Error:', errorInfo.originalError)
  }
  
  console.groupEnd()
}

/**
 * 顯示錯誤消息
 * @param {Object} errorInfo 錯誤信息
 * @param {string} customMessage 自定義消息
 */
function showErrorMessage(errorInfo, customMessage) {
  const message = customMessage || getUserFriendlyMessage(errorInfo)
  
  const messageType = errorInfo.level === ERROR_LEVELS.WARNING ? 'warning' : 'error'
  
  ElMessage({
    type: messageType,
    message,
    duration: errorInfo.level === ERROR_LEVELS.CRITICAL ? 0 : 5000,
    showClose: true
  })
}

/**
 * 顯示錯誤通知
 * @param {Object} errorInfo 錯誤信息
 * @param {string} customMessage 自定義消息
 */
function showErrorNotification(errorInfo, customMessage) {
  const message = customMessage || getUserFriendlyMessage(errorInfo)
  
  ElNotification({
    type: errorInfo.level === ERROR_LEVELS.WARNING ? 'warning' : 'error',
    title: `${errorInfo.context} 錯誤`,
    message,
    duration: errorInfo.level === ERROR_LEVELS.CRITICAL ? 0 : 8000,
    position: 'top-right'
  })
}

/**
 * 獲取用戶友好的錯誤消息
 * @param {Object} errorInfo 錯誤信息
 * @returns {string} 用戶友好的消息
 */
function getUserFriendlyMessage(errorInfo) {
  const messageMap = {
    [ERROR_TYPES.NETWORK]: '網路連線異常，請檢查網路設定後重試',
    [ERROR_TYPES.PERMISSION]: '權限不足，請聯繫管理員',
    [ERROR_TYPES.VALIDATION]: '輸入資料有誤，請檢查後重新提交',
    [ERROR_TYPES.RUNTIME]: '系統執行錯誤，請稍後重試'
  }
  
  return messageMap[errorInfo.type] || errorInfo.message || '發生未知錯誤'
}

/**
 * 生成錯誤ID
 * @returns {string} 錯誤ID
 */
function generateErrorId() {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 上報錯誤（可選）
 * @param {Object} errorInfo 錯誤信息
 */
function reportError(errorInfo) {
  // 這裡可以實現錯誤上報邏輯
  // 例如發送到錯誤監控服務
  
  try {
    // 儲存到本地存儲以供調試
    const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]')
    errorLogs.push(errorInfo)
    
    // 只保留最近100條錯誤記錄
    if (errorLogs.length > 100) {
      errorLogs.splice(0, errorLogs.length - 100)
    }
    
    localStorage.setItem('error_logs', JSON.stringify(errorLogs))
  } catch (e) {
    console.warn('Failed to save error log:', e)
  }
}

/**
 * 網路錯誤處理
 * @param {Error} error 網路錯誤
 * @param {Object} options 選項
 */
export function handleNetworkError(error, options = {}) {
  return handleError(error, 'Network', {
    ...options,
    type: ERROR_TYPES.NETWORK
  })
}

/**
 * 驗證錯誤處理
 * @param {Error} error 驗證錯誤
 * @param {Object} options 選項
 */
export function handleValidationError(error, options = {}) {
  return handleError(error, 'Validation', {
    ...options,
    type: ERROR_TYPES.VALIDATION,
    level: ERROR_LEVELS.WARNING
  })
}

/**
 * 權限錯誤處理
 * @param {Error} error 權限錯誤
 * @param {Object} options 選項
 */
export function handlePermissionError(error, options = {}) {
  return handleError(error, 'Permission', {
    ...options,
    type: ERROR_TYPES.PERMISSION
  })
}

/**
 * 獲取錯誤日誌
 * @returns {Array} 錯誤日誌列表
 */
export function getErrorLogs() {
  try {
    return JSON.parse(localStorage.getItem('error_logs') || '[]')
  } catch (e) {
    console.warn('Failed to get error logs:', e)
    return []
  }
}

/**
 * 清除錯誤日誌
 */
export function clearErrorLogs() {
  try {
    localStorage.removeItem('error_logs')
  } catch (e) {
    console.warn('Failed to clear error logs:', e)
  }
}

/**
 * 全域錯誤處理器
 */
export function setupGlobalErrorHandler() {
  // 捕獲未處理的 Promise 拒絕
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, 'Unhandled Promise Rejection', {
      level: ERROR_LEVELS.CRITICAL
    })
  })
  
  // 捕獲全域 JavaScript 錯誤
  window.addEventListener('error', (event) => {
    handleError(event.error || event.message, 'Global Error', {
      level: ERROR_LEVELS.CRITICAL
    })
  })
  
  // Vue 錯誤處理（如果使用 Vue）
  if (window.Vue) {
    window.Vue.config.errorHandler = (error, instance, info) => {
      handleError(error, `Vue Error (${info})`, {
        level: ERROR_LEVELS.ERROR
      })
    }
  }
}

export default {
  handleError,
  handleNetworkError,
  handleValidationError,
  handlePermissionError,
  getErrorLogs,
  clearErrorLogs,
  setupGlobalErrorHandler,
  ERROR_TYPES,
  ERROR_LEVELS
}