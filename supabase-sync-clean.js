/**
 * 廣清宮記帳軟體 - Supabase雲端同步服務
 * 提供真正的雲端數據庫同步功能
 * 清理版本 - 移除所有 ES6 模組語法
 */

// Supabase配置 - 支援環境變數和多重來源
const SUPABASE_CONFIG = {
    url: (() => {
        // 優先順序：全域變數 > 實際環境變數 > 預設值
        if (window.SUPABASE_URL && !window.SUPABASE_URL.includes('your-project')) {
            return window.SUPABASE_URL;
        }
        // 檢查全域環境變數
        if (typeof window !== 'undefined' && window.NEXT_PUBLIC_SUPABASE_URL) {
            return window.NEXT_PUBLIC_SUPABASE_URL;
        }
        // 最後使用預設的實際 URL（從登入時獲得）
        return 'https://nfncwofzfjdvyhdfjbzw.supabase.co';
    })(),
    key: (() => {
        // 優先順序：全域變數 > 實際環境變數 > 預設值
        if (window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.includes('your-anon-key')) {
            return window.SUPABASE_ANON_KEY;
        }
        // 檢查全域環境變數
        if (typeof window !== 'undefined' && window.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return window.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        }
        // 最後使用預設的實際 Key（從登入時獲得）
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbmN3b2Z6ZmpkdnloZGZqYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjM0MDcsImV4cCI6MjA3MzA5OTQwN30.ZyLtV91pG618utDhJhGJbZpbFPZ_IEx2mBPc7GVfkH4';
    })(),
    tableName: 'temple_data'
};

class SupabaseSyncService {
    constructor() {
        this.supabase = null;
        this.deviceId = this.getOrCreateDeviceId();
        this.isOnline = navigator.onLine;
        this.lastSyncTime = null;
        this.syncInProgress = false;
        
        // 監聽網路狀態
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.autoSync();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // 初始化Supabase客戶端
        this.initSupabase();
    }
    
    /**
     * 初始化Supabase客戶端
     */
    async initSupabase() {
        try {
            // 檢查Supabase是否可用
            if (typeof window.supabase !== 'undefined') {
                this.supabase = window.supabase.createClient(
                    SUPABASE_CONFIG.url,
                    SUPABASE_CONFIG.key
                );
                console.log('Supabase客戶端初始化成功');
                
                // 測試連接
                await this.testConnection();
            } else {
                console.warn('Supabase SDK未載入，將使用本地存儲模式');
                // 降級到原有的cloud-sync服務
                this.fallbackToLocalSync();
            }
        } catch (error) {
            console.error('Supabase初始化失敗:', error);
            this.fallbackToLocalSync();
        }
    }
    
    /**
     * 測試Supabase連接
     */
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .select('count')
                .limit(1);
            
            if (error) {
                throw error;
            }
            
            console.log('Supabase連接測試成功');
            return true;
        } catch (error) {
            console.error('Supabase連接測試失敗:', error);
            return false;
        }
    }
    
    /**
     * 降級到本地同步服務
     */
    fallbackToLocalSync() {
        if (typeof window.cloudSync !== 'undefined') {
            console.log('降級使用本地同步服務');
            // 將方法代理到原有的cloudSync服務
            this.syncToCloud = () => window.cloudSync.syncToCloud();
            this.syncFromCloud = () => window.cloudSync.syncFromCloud();
            this.exportData = () => window.cloudSync.exportData();
            this.loadDataFromFile = () => window.cloudSync.loadDataFromFile();
        }
    }
    
    /**
     * 生成或獲取設備ID
     */
    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('temple-device-id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('temple-device-id', deviceId);
        }
        return deviceId;
    }
    
    /**
     * 收集本地數據
     */
    collectLocalData() {
        return {
            records: JSON.parse(localStorage.getItem('temple-records') || '[]'),
            believers: JSON.parse(localStorage.getItem('temple-believers') || '[]'),
            reminders: JSON.parse(localStorage.getItem('temple-reminders') || '[]'),
            inventory: JSON.parse(localStorage.getItem('temple-inventory') || '[]'),
            stockMovements: JSON.parse(localStorage.getItem('temple-stock-movements') || '[]'),
            events: JSON.parse(localStorage.getItem('temple-events') || '[]'),
            customCategories: JSON.parse(localStorage.getItem('temple-custom-categories') || '[]'),
            lastModified: Date.now(),
            deviceId: this.deviceId,
            version: '2.0'
        };
    }
    
    /**
     * 同步數據到雲端
     */
    async syncToCloud() {
        if (!this.isOnline) {
            throw new Error('無網路連接');
        }
        
        if (this.syncInProgress) {
            throw new Error('同步進行中，請稍候');
        }
        
        this.syncInProgress = true;
        
        try {
            const localData = this.collectLocalData();
            
            if (this.supabase) {
                // 使用Supabase同步
                return await this.syncToSupabase(localData);
            } else {
                // 降級到本地存儲
                return await this.syncToLocalStorage(localData);
            }
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * 同步到Supabase
     */
    async syncToSupabase(data) {
        try {
            // 先檢查是否有現有記錄
            const { data: existing, error: selectError } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .select('*')
                .eq('device_id', this.deviceId)
                .order('created_at', { ascending: false })
                .limit(1);
            
            if (selectError) {
                throw selectError;
            }
            
            // 簡單的衝突解決：檢查時間戳
            if (existing && existing.length > 0) {
                const cloudLastModified = existing[0].last_modified;
                const localLastModified = data.lastModified;
                
                // 如果雲端數據比本地新，警告用戶
                if (cloudLastModified > localLastModified) {
                    const shouldOverwrite = confirm(
                        '檢測到雲端有更新的數據！\n' +
                        `雲端最後修改：${new Date(cloudLastModified).toLocaleString('zh-TW')}\n` +
                        `本地最後修改：${new Date(localLastModified).toLocaleString('zh-TW')}\n\n` +
                        '是否要覆蓋雲端數據？選擇「取消」將會載入雲端數據到本地。'
                    );
                    
                    if (!shouldOverwrite) {
                        // 用戶選擇載入雲端數據
                        throw new Error('SYNC_CONFLICT_LOAD_CLOUD');
                    }
                }
            }
            
            const syncData = {
                device_id: this.deviceId,
                data: data,
                last_modified: data.lastModified,
                version: data.version,
                updated_at: new Date().toISOString()
            };
            
            let result;
            if (existing && existing.length > 0) {
                // 更新現有記錄
                const { data: updateData, error: updateError } = await this.supabase
                    .from(SUPABASE_CONFIG.tableName)
                    .update(syncData)
                    .eq('device_id', this.deviceId);
                
                if (updateError) {
                    throw updateError;
                }
                result = updateData;
            } else {
                // 創建新記錄
                const { data: insertData, error: insertError } = await this.supabase
                    .from(SUPABASE_CONFIG.tableName)
                    .insert([{
                        ...syncData,
                        created_at: new Date().toISOString()
                    }]);
                
                if (insertError) {
                    throw insertError;
                }
                result = insertData;
            }
            
            this.lastSyncTime = Date.now();
            localStorage.setItem('temple-last-sync-supabase', this.lastSyncTime.toString());
            
            return {
                success: true,
                message: '數據已成功同步到雲端',
                syncTime: new Date().toLocaleString('zh-TW'),
                deviceId: this.deviceId,
                provider: 'Supabase'
            };
        } catch (error) {
            console.error('Supabase同步錯誤:', error);
            throw error;
        }
    }
    
    /**
     * 從雲端同步數據
     */
    async syncFromCloud(deviceId = null) {
        if (!this.isOnline) {
            throw new Error('無網路連接');
        }
        
        if (this.syncInProgress) {
            throw new Error('同步進行中，請稍候');
        }
        
        this.syncInProgress = true;
        
        try {
            const targetDeviceId = deviceId || this.deviceId;
            
            if (this.supabase) {
                return await this.syncFromSupabase(targetDeviceId);
            } else {
                return await this.syncFromLocalStorage(targetDeviceId);
            }
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * 從Supabase同步數據
     */
    async syncFromSupabase(deviceId) {
        try {
            const { data: cloudData, error } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .select('*')
                .eq('device_id', deviceId)
                .order('updated_at', { ascending: false })
                .limit(1);
            
            if (error) {
                throw error;
            }
            
            if (!cloudData || cloudData.length === 0) {
                throw new Error('找不到雲端數據');
            }
            
            const syncData = cloudData[0].data;
            
            // 備份現有數據
            this.backupLocalData();
            
            // 更新本地數據
            localStorage.setItem('temple-records', JSON.stringify(syncData.records || []));
            localStorage.setItem('temple-believers', JSON.stringify(syncData.believers || []));
            localStorage.setItem('temple-reminders', JSON.stringify(syncData.reminders || []));
            localStorage.setItem('temple-inventory', JSON.stringify(syncData.inventory || []));
            localStorage.setItem('temple-stock-movements', JSON.stringify(syncData.stockMovements || []));
            localStorage.setItem('temple-events', JSON.stringify(syncData.events || []));
            localStorage.setItem('temple-custom-categories', JSON.stringify(syncData.customCategories || []));
            
            this.lastSyncTime = Date.now();
            localStorage.setItem('temple-last-sync-supabase', this.lastSyncTime.toString());
            
            return {
                success: true,
                message: '數據已成功從雲端同步',
                syncTime: new Date().toLocaleString('zh-TW'),
                recordsCount: syncData.records?.length || 0,
                believersCount: syncData.believers?.length || 0,
                provider: 'Supabase',
                sourceDevice: deviceId
            };
        } catch (error) {
            console.error('Supabase同步錯誤:', error);
            throw error;
        }
    }
    
    /**
     * 降級：同步到本地存儲
     */
    async syncToLocalStorage(data) {
        const cloudKey = `temple-cloud-${this.deviceId}`;
        localStorage.setItem(cloudKey, JSON.stringify(data));
        localStorage.setItem('temple-cloud-key', cloudKey);
        
        this.lastSyncTime = Date.now();
        localStorage.setItem('temple-last-sync', this.lastSyncTime.toString());
        
        return {
            success: true,
            message: '數據已備份到本地存儲',
            syncTime: new Date().toLocaleString('zh-TW'),
            deviceId: this.deviceId,
            provider: 'LocalStorage'
        };
    }
    
    /**
     * 降級：從本地存儲同步
     */
    async syncFromLocalStorage(deviceId) {
        const cloudKey = `temple-cloud-${deviceId}`;
        const cloudData = localStorage.getItem(cloudKey);
        
        if (!cloudData) {
            throw new Error('找不到本地備份數據');
        }
        
        const syncData = JSON.parse(cloudData);
        
        // 備份現有數據
        this.backupLocalData();
        
        // 更新本地數據
        localStorage.setItem('temple-records', JSON.stringify(syncData.records || []));
        localStorage.setItem('temple-believers', JSON.stringify(syncData.believers || []));
        localStorage.setItem('temple-reminders', JSON.stringify(syncData.reminders || []));
        localStorage.setItem('temple-inventory', JSON.stringify(syncData.inventory || []));
        localStorage.setItem('temple-stock-movements', JSON.stringify(syncData.stockMovements || []));
        localStorage.setItem('temple-events', JSON.stringify(syncData.events || []));
        localStorage.setItem('temple-custom-categories', JSON.stringify(syncData.customCategories || []));
        
        this.lastSyncTime = Date.now();
        localStorage.setItem('temple-last-sync', this.lastSyncTime.toString());
        
        return {
            success: true,
            message: '數據已從本地備份恢復',
            syncTime: new Date().toLocaleString('zh-TW'),
            recordsCount: syncData.records?.length || 0,
            believersCount: syncData.believers?.length || 0,
            provider: 'LocalStorage'
        };
    }
    
    /**
     * 匯出數據
     */
    async exportData() {
        const data = this.collectLocalData();
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
            message: '數據已匯出為文件',
            provider: this.supabase ? 'Supabase' : 'LocalStorage'
        };
    }
    
    /**
     * 載入數據文件
     */
    async loadDataFromFile() {
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
                        const loadedData = JSON.parse(e.target.result);
                        
                        // 備份現有數據
                        this.backupLocalData();
                        
                        // 更新本地數據
                        localStorage.setItem('temple-records', JSON.stringify(loadedData.records || []));
                        localStorage.setItem('temple-believers', JSON.stringify(loadedData.believers || []));
                        localStorage.setItem('temple-reminders', JSON.stringify(loadedData.reminders || []));
                        localStorage.setItem('temple-inventory', JSON.stringify(loadedData.inventory || []));
                        localStorage.setItem('temple-stock-movements', JSON.stringify(loadedData.stockMovements || []));
                        localStorage.setItem('temple-events', JSON.stringify(loadedData.events || []));
                        localStorage.setItem('temple-custom-categories', JSON.stringify(loadedData.customCategories || []));
                        
                        resolve({
                            success: true,
                            message: '數據已成功載入',
                            recordsCount: loadedData.records?.length || 0,
                            believersCount: loadedData.believers?.length || 0
                        });
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
     * 自動同步
     */
    async autoSync() {
        if (!this.isOnline || this.syncInProgress) return;
        
        try {
            // 檢查是否有本地更改需要同步
            const lastModified = localStorage.getItem('temple-last-modified');
            const lastSync = localStorage.getItem('temple-last-sync-supabase') || localStorage.getItem('temple-last-sync');
            
            if (lastModified && (!lastSync || parseInt(lastModified) > parseInt(lastSync))) {
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
        const lastSync = localStorage.getItem('temple-last-sync-supabase') || localStorage.getItem('temple-last-sync');
        return {
            isOnline: this.isOnline,
            deviceId: this.deviceId,
            lastSyncTime: lastSync ? new Date(parseInt(lastSync)).toLocaleString('zh-TW') : '從未同步',
            provider: this.supabase ? 'Supabase' : 'LocalStorage',
            syncInProgress: this.syncInProgress
        };
    }
    
    /**
     * 生成QR碼數據
     */
    generateQRData() {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('device_id', this.deviceId);
        currentUrl.searchParams.set('sync_provider', this.supabase ? 'supabase' : 'local');
        
        return {
            url: currentUrl.toString(),
            deviceId: this.deviceId,
            appName: '廣清宮快速記帳軟體',
            provider: this.supabase ? 'Supabase' : 'LocalStorage',
            timestamp: Date.now()
        };
    }
}

// 創建全局實例
window.supabaseSync = new SupabaseSyncService();

// 檢查URL中的設備同步參數
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    const syncProvider = urlParams.get('sync_provider');
    
    if (deviceId && deviceId !== window.supabaseSync.deviceId) {
        const providerText = syncProvider === 'supabase' ? 'Supabase雲端' : '本地存儲';
        if (confirm(`檢測到來自其他設備的${providerText}數據，是否要同步數據？\n注意：這將會覆蓋本地數據。`)) {
            window.supabaseSync.syncFromCloud(deviceId).then(result => {
                if (result.success) {
                    alert(`數據同步成功！\n來源：${result.provider}\n記錄數：${result.recordsCount}\n信眾數：${result.believersCount}`);
                    // 清除URL參數並重新載入
                    const url = new URL(window.location.href);
                    url.searchParams.delete('device_id');
                    url.searchParams.delete('sync_provider');
                    window.location.href = url.toString();
                } else {
                    alert('數據同步失敗：' + result.message);
                }
            }).catch(error => {
                alert('數據同步失敗：' + error.message);
            });
        }
    }
});