/**
 * 廣清宮記帳軟體 - 本地同步服務
 * 提供數據本地存儲、匯出和匯入功能（適用於GitHub Pages靜態環境）
 */

class CloudSyncService {
    constructor() {
        // 靜態環境下使用本地存儲和文件匯出/匯入
        this.syncId = null;
        this.lastSyncTime = null;
        this.isOnline = navigator.onLine;
        this.useLocalStorage = true; // 靜態環境只能使用本地存儲
        
        // 監聽網路狀態
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.autoSync();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // 初始化同步ID
        this.initSyncId();
    }
    
    /**
     * 初始化同步ID
     */
    initSyncId() {
        this.syncId = localStorage.getItem('temple-sync-id');
        if (!this.syncId) {
            this.syncId = this.generateSyncId();
            localStorage.setItem('temple-sync-id', this.syncId);
        }
        this.lastSyncTime = localStorage.getItem('temple-last-sync');
    }
    
    /**
     * 生成唯一的同步ID
     */
    generateSyncId() {
        return 'temple_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 獲取當前網址（用於QR Code）
     */
    getCurrentUrl() {
        const url = new URL(window.location.href);

        // 如果是localhost，替換為實際IP地址
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            // 使用您的實際IP地址
            url.hostname = '192.168.1.124';
        }

        url.searchParams.set('sync_id', this.syncId);
        return url.toString();
    }
    
    /**
     * 從URL參數獲取同步ID
     */
    getSyncIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('sync_id');
    }
    
    /**
     * 收集所有本地數據
     */
    collectLocalData() {
        return {
            records: JSON.parse(localStorage.getItem('temple-records') || '[]'),
            believers: JSON.parse(localStorage.getItem('temple-believers') || '[]'),
            reminders: JSON.parse(localStorage.getItem('temple-reminders') || '[]'),
            inventory: JSON.parse(localStorage.getItem('temple-inventory') || '[]'),
            stockMovements: JSON.parse(localStorage.getItem('temple-stock-movements') || '[]'),
            events: JSON.parse(localStorage.getItem('temple-events') || '[]'),
            lastModified: Date.now(),
            syncId: this.syncId
        };
    }
    
    /**
     * 備份數據到本地存儲
     */
    async uploadToCloud(data) {
        try {
            // 在靜態環境下，只能使用本地存儲
            const cloudKey = `temple-cloud-${this.syncId}`;
            localStorage.setItem(cloudKey, JSON.stringify(data));
            localStorage.setItem('temple-cloud-key', cloudKey);

            this.lastSyncTime = Date.now();
            localStorage.setItem('temple-last-sync', this.lastSyncTime.toString());

            return {
                success: true,
                id: cloudKey,
                timestamp: this.lastSyncTime
            };
        } catch (error) {
            console.error('本地備份錯誤:', error);
            throw error;
        }
    }

    /**
     * 匯出數據為JSON文件
     */
    async exportToFile(data) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `廣清宮記帳數據_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return {
                success: true,
                message: '數據已匯出為文件'
            };
        } catch (error) {
            console.error('匯出錯誤:', error);
            throw error;
        }
    }
    
    /**
     * 從本地存儲讀取數據
     */
    async downloadFromCloud(syncId = null) {
        try {
            const targetSyncId = syncId || this.syncId;
            const cloudKey = `temple-cloud-${targetSyncId}`;
            const cloudData = localStorage.getItem(cloudKey);

            if (!cloudData) {
                throw new Error('找不到本地備份數據');
            }

            return JSON.parse(cloudData);
        } catch (error) {
            console.error('讀取本地數據錯誤:', error);
            throw error;
        }
    }

    /**
     * 從文件匯入數據
     */
    async importFromFile() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) {
                    reject(new Error('未選擇文件'));
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        resolve(data);
                    } catch (error) {
                        reject(new Error('文件格式錯誤'));
                    }
                };
                reader.onerror = () => reject(new Error('文件讀取失敗'));
                reader.readAsText(file);
            };

            input.click();
        });
    }
    
    /**
     * 備份數據到本地存儲
     */
    async syncToCloud() {
        try {
            const localData = this.collectLocalData();
            const result = await this.uploadToCloud(localData);

            return {
                success: true,
                message: '數據已成功備份到本地存儲',
                syncTime: new Date().toLocaleString('zh-TW'),
                syncId: this.syncId
            };
        } catch (error) {
            return {
                success: false,
                message: `備份失敗: ${error.message}`,
                error: error
            };
        }
    }

    /**
     * 匯出數據到文件
     */
    async exportData() {
        try {
            const localData = this.collectLocalData();
            const result = await this.exportToFile(localData);

            return {
                success: true,
                message: '數據已成功匯出為文件',
                syncTime: new Date().toLocaleString('zh-TW')
            };
        } catch (error) {
            return {
                success: false,
                message: `匯出失敗: ${error.message}`,
                error: error
            };
        }
    }
    
    /**
     * 從本地備份恢復數據
     */
    async syncFromCloud(syncId = null) {
        try {
            const cloudData = await this.downloadFromCloud(syncId);

            if (cloudData) {
                // 備份現有數據
                this.backupLocalData();

                // 更新本地數據
                localStorage.setItem('temple-records', JSON.stringify(cloudData.records || []));
                localStorage.setItem('temple-believers', JSON.stringify(cloudData.believers || []));
                localStorage.setItem('temple-reminders', JSON.stringify(cloudData.reminders || []));
                localStorage.setItem('temple-inventory', JSON.stringify(cloudData.inventory || []));
                localStorage.setItem('temple-stock-movements', JSON.stringify(cloudData.stockMovements || []));
                localStorage.setItem('temple-events', JSON.stringify(cloudData.events || []));

                // 如果是從其他設備同步，更新同步ID
                if (syncId && syncId !== this.syncId) {
                    this.syncId = syncId;
                    localStorage.setItem('temple-sync-id', this.syncId);
                }

                this.lastSyncTime = Date.now();
                localStorage.setItem('temple-last-sync', this.lastSyncTime.toString());

                return {
                    success: true,
                    message: '數據已成功從本地備份恢復',
                    syncTime: new Date().toLocaleString('zh-TW'),
                    recordsCount: cloudData.records?.length || 0,
                    believersCount: cloudData.believers?.length || 0
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `恢復失敗: ${error.message}`,
                error: error
            };
        }
    }

    /**
     * 從文件匯入數據
     */
    async importData() {
        try {
            const importedData = await this.importFromFile();

            if (importedData) {
                // 備份現有數據
                this.backupLocalData();

                // 更新本地數據
                localStorage.setItem('temple-records', JSON.stringify(importedData.records || []));
                localStorage.setItem('temple-believers', JSON.stringify(importedData.believers || []));
                localStorage.setItem('temple-reminders', JSON.stringify(importedData.reminders || []));
                localStorage.setItem('temple-inventory', JSON.stringify(importedData.inventory || []));
                localStorage.setItem('temple-stock-movements', JSON.stringify(importedData.stockMovements || []));
                localStorage.setItem('temple-events', JSON.stringify(importedData.events || []));

                this.lastSyncTime = Date.now();
                localStorage.setItem('temple-last-sync', this.lastSyncTime.toString());

                return {
                    success: true,
                    message: '數據已成功從文件匯入',
                    syncTime: new Date().toLocaleString('zh-TW'),
                    recordsCount: importedData.records?.length || 0,
                    believersCount: importedData.believers?.length || 0
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `匯入失敗: ${error.message}`,
                error: error
            };
        }
    }

    /**
     * 從文件匯入數據
     */
    async importData() {
        try {
            const importedData = await this.importFromFile();

            if (importedData) {
                // 備份現有數據
                this.backupLocalData();

                // 更新本地數據
                localStorage.setItem('temple-records', JSON.stringify(importedData.records || []));
                localStorage.setItem('temple-believers', JSON.stringify(importedData.believers || []));
                localStorage.setItem('temple-reminders', JSON.stringify(importedData.reminders || []));
                localStorage.setItem('temple-inventory', JSON.stringify(importedData.inventory || []));
                localStorage.setItem('temple-stock-movements', JSON.stringify(importedData.stockMovements || []));
                localStorage.setItem('temple-events', JSON.stringify(importedData.events || []));

                this.lastSyncTime = Date.now();
                localStorage.setItem('temple-last-sync', this.lastSyncTime.toString());

                return {
                    success: true,
                    message: '數據已成功從文件匯入',
                    syncTime: new Date().toLocaleString('zh-TW'),
                    recordsCount: importedData.records?.length || 0,
                    believersCount: importedData.believers?.length || 0
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `匯入失敗: ${error.message}`,
                error: error
            };
        }
    }
    
    /**
     * 備份本地數據
     */
    backupLocalData() {
        const timestamp = Date.now();
        const localData = this.collectLocalData();
        localStorage.setItem(`temple-backup-${timestamp}`, JSON.stringify(localData));
        
        // 只保留最近5個備份
        const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('temple-backup-'));
        if (backupKeys.length > 5) {
            backupKeys.sort().slice(0, -5).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }
    
    /**
     * 自動同步（在網路恢復時觸發）
     */
    async autoSync() {
        if (!this.isOnline) return;
        
        try {
            // 檢查是否有本地更改需要上傳
            const lastModified = localStorage.getItem('temple-last-modified');
            if (lastModified && (!this.lastSyncTime || parseInt(lastModified) > parseInt(this.lastSyncTime))) {
                await this.syncToCloud();
            }
        } catch (error) {
            console.warn('自動同步失敗:', error);
        }
    }
    
    /**
     * 獲取同步狀態
     */
    getSyncStatus() {
        const cloudKey = localStorage.getItem('temple-cloud-key');
        return {
            isOnline: this.isOnline,
            syncId: this.syncId,
            lastSyncTime: this.lastSyncTime ? new Date(parseInt(this.lastSyncTime)).toLocaleString('zh-TW') : '從未同步',
            hasCloudData: !!cloudKey,
            useLocalStorage: this.useLocalStorage
        };
    }
    
    /**
     * 生成QR Code數據
     */
    generateQRData() {
        return {
            url: this.getCurrentUrl(),
            syncId: this.syncId,
            appName: '廣清宮快速記帳軟體',
            timestamp: Date.now()
        };
    }
}

// 創建全局實例
window.cloudSync = new CloudSyncService();

// 檢查URL中是否有同步ID（手機掃描QR Code後）
document.addEventListener('DOMContentLoaded', () => {
    const urlSyncId = window.cloudSync.getSyncIdFromUrl();
    if (urlSyncId && urlSyncId !== window.cloudSync.syncId) {
        // 顯示同步確認對話框
        if (confirm('檢測到其他設備的數據，是否要同步數據？\n注意：這將會覆蓋本地數據。')) {
            window.cloudSync.syncFromCloud(urlSyncId).then(result => {
                if (result.success) {
                    alert('數據同步成功！');
                    // 移除URL參數並重新載入
                    const url = new URL(window.location.href);
                    url.searchParams.delete('sync_id');
                    window.location.href = url.toString();
                } else {
                    alert('數據同步失敗：' + result.message);
                }
            });
        }
    }
});
