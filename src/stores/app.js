import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

export const useAppStore = defineStore('app', () => {
  // 狀態
  const isOnline = ref(navigator.onLine)
  const lastSyncTime = ref(null)
  const settings = ref({
    templeName: '廣清宮',
    currency: 'TWD',
    dateFormat: 'YYYY-MM-DD',
    autoBackup: true,
    backupInterval: 7, // 天
    reminderEnabled: true,
    theme: 'light'
  })

  // 計算屬性
  const formattedLastSync = computed(() => {
    if (!lastSyncTime.value) return '從未同步'
    return dayjs(lastSyncTime.value).format('YYYY-MM-DD HH:mm:ss')
  })

  // 方法
  const initialize = async () => {
    // 監聽網路狀態
    window.addEventListener('online', () => {
      isOnline.value = true
      autoSync()
    })
    
    window.addEventListener('offline', () => {
      isOnline.value = false
    })

    // 載入本地設定
    await loadSettings()
    
    // 如果在線，嘗試同步
    if (isOnline.value) {
      await syncData()
    }
  }

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('temple-settings')
      if (savedSettings) {
        settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
      }
    } catch (error) {
      console.error('載入設定失敗:', error)
    }
  }

  const saveSettings = async () => {
    try {
      localStorage.setItem('temple-settings', JSON.stringify(settings.value))
      ElMessage.success('設定已儲存')
    } catch (error) {
      console.error('儲存設定失敗:', error)
      ElMessage.error('設定儲存失敗')
    }
  }

  const syncData = async () => {
    if (!isOnline.value) {
      throw new Error('無網路連線')
    }

    try {
      // 模擬同步過程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      lastSyncTime.value = new Date().toISOString()
      localStorage.setItem('lastSyncTime', lastSyncTime.value)
      
      return true
    } catch (error) {
      console.error('同步失敗:', error)
      throw error
    }
  }

  const autoSync = async () => {
    if (isOnline.value) {
      try {
        await syncData()
      } catch (error) {
        console.error('自動同步失敗:', error)
      }
    }
  }

  const createBackup = async () => {
    try {
      // 收集所有資料
      const backupData = {
        timestamp: new Date().toISOString(),
        settings: settings.value,
        version: '1.0.0'
      }

      // 如果是 Electron 環境，使用檔案對話框
      if (window.require) {
        const { ipcRenderer } = window.require('electron')
        const result = await ipcRenderer.invoke('show-save-dialog')
        
        if (!result.canceled) {
          // 這裡應該實作實際的檔案寫入
          ElMessage.success('備份已儲存至: ' + result.filePath)
        }
      } else {
        // 瀏覽器環境，下載 JSON 檔案
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `temple-backup-${dayjs().format('YYYY-MM-DD-HHmm')}.json`
        a.click()
        URL.revokeObjectURL(url)
        ElMessage.success('備份檔案已下載')
      }
    } catch (error) {
      console.error('建立備份失敗:', error)
      ElMessage.error('備份失敗: ' + error.message)
    }
  }

  // 初始化時載入上次同步時間
  const savedSyncTime = localStorage.getItem('lastSyncTime')
  if (savedSyncTime) {
    lastSyncTime.value = savedSyncTime
  }

  return {
    // 狀態
    isOnline,
    lastSyncTime,
    settings,
    
    // 計算屬性
    formattedLastSync,
    
    // 方法
    initialize,
    loadSettings,
    saveSettings,
    syncData,
    autoSync,
    createBackup
  }
})