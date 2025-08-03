/**
 * 應用程式常量定義
 * 統一管理所有常量，避免魔法數字和字符串
 */

// 應用程式資訊
export const APP_INFO = {
  NAME: '宮廟財務管理系統',
  VERSION: '1.0.0',
  DESCRIPTION: '專為宮廟設計的財務管理系統',
  AUTHOR: 'Temple Management Team',
  COPYRIGHT: '© 2024 Temple Management System'
}

// 路由路徑
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  
  // 收入管理
  INCOME: {
    ROOT: '/income',
    LIST: '/income/list',
    ADD: '/income/add',
    EDIT: '/income/edit',
    CATEGORIES: '/income/categories'
  },
  
  // 支出管理
  EXPENSE: {
    ROOT: '/expense',
    LIST: '/expense/list',
    ADD: '/expense/add',
    EDIT: '/expense/edit',
    CATEGORIES: '/expense/categories'
  },
  
  // 報表分析
  REPORTS: {
    ROOT: '/reports',
    SUMMARY: '/reports/summary',
    ANALYSIS: '/reports/analysis',
    TRENDS: '/reports/trends',
    EXPORT: '/reports/export'
  },
  
  // 設定
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    SYSTEM: '/settings/system',
    REMINDERS: '/reminders'
  },
  
  // 其他
  BALANCE: '/balance',
  PERFORMANCE: '/performance-test'
}

// 本地存儲鍵名
export const STORAGE_KEYS = {
  // 資料
  INCOME_CATEGORIES: 'temple-income-categories',
  EXPENSE_CATEGORIES: 'temple-expense-categories',
  INCOMES: 'temple-incomes',
  EXPENSES: 'temple-expenses',
  
  // 設定
  PROFILE: 'temple-profile',
  PREFERENCES: 'temple-preferences',
  THEME: 'temple-theme',
  
  // 系統
  REMINDERS: 'temple-reminders',
  PERFORMANCE_REPORT: 'performance-report',
  USER_FEEDBACKS: 'user-feedbacks',
  USER_RATINGS: 'user-ratings',
  
  // 快取
  CACHE_PREFIX: 'temple-cache-',
  SESSION_ID: 'session-id',
  LAST_RATING_TIME: 'last-rating-time'
}

// 預設類別
export const DEFAULT_CATEGORIES = {
  INCOME: [
    { id: 1, name: '香油錢', color: '#67c23a', description: '信眾捐獻的香油錢' },
    { id: 2, name: '功德金', color: '#409eff', description: '法會功德金' },
    { id: 3, name: '點燈費', color: '#e6a23c', description: '點燈祈福費用' },
    { id: 4, name: '建廟捐款', color: '#f56c6c', description: '建廟專用捐款' },
    { id: 5, name: '其他收入', color: '#909399', description: '其他雜項收入' }
  ],
  
  EXPENSE: [
    { id: 1, name: '水電費', color: '#409eff', description: '水費和電費' },
    { id: 2, name: '供品費', color: '#67c23a', description: '祭祀供品費用' },
    { id: 3, name: '維修費', color: '#e6a23c', description: '建築和設備維修' },
    { id: 4, name: '人事費', color: '#f56c6c', description: '人員薪資和津貼' },
    { id: 5, name: '活動費', color: '#909399', description: '宗教活動費用' }
  ]
}

// 表單驗證規則
export const VALIDATION_RULES = {
  REQUIRED: { required: true, message: '此欄位為必填', trigger: 'blur' },
  EMAIL: {
    type: 'email',
    message: '請輸入正確的電子郵件格式',
    trigger: ['blur', 'change']
  },
  PHONE: {
    pattern: /^09\d{8}$/,
    message: '請輸入正確的手機號碼格式',
    trigger: ['blur', 'change']
  },
  AMOUNT: {
    type: 'number',
    min: 0,
    message: '金額必須大於等於 0',
    trigger: ['blur', 'change']
  },
  POSITIVE_NUMBER: {
    type: 'number',
    min: 0.01,
    message: '金額必須大於 0',
    trigger: ['blur', 'change']
  },
  DATE: {
    type: 'date',
    message: '請選擇正確的日期',
    trigger: 'change'
  }
}

// 分頁設定
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 1000
}

// 檔案上傳設定
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
}

// 日期格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY',
  DISPLAY_DATE: 'MM月DD日',
  DISPLAY_DATETIME: 'MM月DD日 HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
}

// 金額格式
export const AMOUNT_FORMATS = {
  CURRENCY: 'NT$',
  DECIMAL_PLACES: 0,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.'
}

// 顏色主題
export const COLORS = {
  PRIMARY: '#409EFF',
  SUCCESS: '#67C23A',
  WARNING: '#E6A23C',
  DANGER: '#F56C6C',
  INFO: '#909399',
  
  // 收入相關
  INCOME: '#67C23A',
  INCOME_LIGHT: '#95D475',
  INCOME_DARK: '#529B2E',
  
  // 支出相關
  EXPENSE: '#F56C6C',
  EXPENSE_LIGHT: '#F78989',
  EXPENSE_DARK: '#C45656',
  
  // 類別預設顏色
  CATEGORY_COLORS: [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
    '#8E44AD', '#3498DB', '#2ECC71', '#F39C12', '#E74C3C',
    '#95A5A6', '#34495E', '#16A085', '#27AE60', '#2980B9'
  ]
}

// 響應式斷點
export const BREAKPOINTS = {
  XS: 480,
  SM: 768,
  MD: 992,
  LG: 1200,
  XL: 1920
}

// 動畫時間
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
}

// 錯誤類型
export const ERROR_TYPES = {
  NETWORK: 'network',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  RUNTIME: 'runtime',
  UNKNOWN: 'unknown'
}

// 載入訊息
export const LOADING_MESSAGES = {
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

// 通知類型
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
}

// 提醒類型
export const REMINDER_TYPES = {
  FINANCIAL: 'financial',
  BACKUP: 'backup',
  MEETING: 'meeting',
  OTHER: 'other'
}

// 提醒優先級
export const REMINDER_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// 報表類型
export const REPORT_TYPES = {
  SUMMARY: 'summary',
  INCOME: 'income',
  EXPENSE: 'expense',
  ANALYSIS: 'analysis',
  TRENDS: 'trends'
}

// 匯出格式
export const EXPORT_FORMATS = {
  EXCEL: 'excel',
  PDF: 'pdf',
  CSV: 'csv',
  JSON: 'json'
}

// 系統設定預設值
export const DEFAULT_SETTINGS = {
  PROFILE: {
    name: '',
    position: '',
    email: '',
    phone: ''
  },
  
  PREFERENCES: {
    dateFormat: DATE_FORMATS.DATE,
    currencyFormat: `${AMOUNT_FORMATS.CURRENCY} {amount}`,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    themeColor: COLORS.PRIMARY,
    showWelcomeMessage: true,
    autoSave: true,
    soundEnabled: false
  }
}

// 效能監控設定
export const PERFORMANCE = {
  FPS_THRESHOLD: {
    GOOD: 55,
    WARNING: 30,
    POOR: 0
  },
  
  MEMORY_THRESHOLD: {
    WARNING: 100, // MB
    CRITICAL: 200 // MB
  },
  
  LONG_TASK_THRESHOLD: 50, // ms
  
  MONITORING_INTERVAL: 1000 // ms
}

// 快取設定
export const CACHE = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 分鐘
  MAX_SIZE: 50,
  CLEANUP_INTERVAL: 10 * 60 * 1000 // 10 分鐘
}

// API 設定
export const API = {
  TIMEOUT: 10000, // 10 秒
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000 // 1 秒
}

// 正則表達式
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^09\d{8}$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
  POSITIVE_NUMBER: /^[1-9]\d*(\.\d{1,2})?$/,
  CHINESE: /[\u4e00-\u9fa5]/,
  ENGLISH: /[a-zA-Z]/,
  NUMBER: /\d/
}

// 鍵盤快捷鍵
export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  CANCEL: 'Escape',
  SEARCH: 'Ctrl+F',
  NEW: 'Ctrl+N',
  EDIT: 'Ctrl+E',
  DELETE: 'Delete',
  REFRESH: 'F5',
  PERFORMANCE_MONITOR: 'Ctrl+Shift+P'
}

export default {
  APP_INFO,
  ROUTES,
  STORAGE_KEYS,
  DEFAULT_CATEGORIES,
  VALIDATION_RULES,
  PAGINATION,
  FILE_UPLOAD,
  DATE_FORMATS,
  AMOUNT_FORMATS,
  COLORS,
  BREAKPOINTS,
  ANIMATION,
  ERROR_TYPES,
  LOADING_MESSAGES,
  NOTIFICATION_TYPES,
  REMINDER_TYPES,
  REMINDER_PRIORITIES,
  REPORT_TYPES,
  EXPORT_FORMATS,
  DEFAULT_SETTINGS,
  PERFORMANCE,
  CACHE,
  API,
  REGEX,
  KEYBOARD_SHORTCUTS
}
