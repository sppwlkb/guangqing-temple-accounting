/**
 * 廣清宮記帳軟體 - 最終版 Supabase 雲端同步服務
 * 整合所有功能，優化錯誤處理和用戶體驗
 * 版本：Final v3.0
 */

// 配置常數
const SUPABASE_CONFIG_FINAL = {
    url: 'https://nfncwofzfjdvyhdfjbzw.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbmN3b2Z6ZmpkdnloZGZqYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjM0MDcsImV4cCI6MjA3MzA5OTQwN30.ZyLtV91pG618utDhJhGJbZpbFPZ_IEx2mBPc7GVfkH4',
    tableName: 'temple_data',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 2000
};

class SupabaseSyncServiceFinal {
    constructor() {
        this.supabase = null;
        this.deviceId = this.getOrCreateDeviceId();
        this.isOnline = navigator.onLine;
        this.lastSyncTime = null;
        this.syncInProgress = false;
        this.initPromise = null;
        
        // 監聽網路狀態
        this.setupNetworkListeners();
        
        // 異步初始化
        this.initPromise = this.initializeService();
    }
    
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('網路已連接，準備自動同步');
            this.autoSync();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('網路已斷線');
        });
    }
    
    async initializeService() {
        try {
            console.log('🚀 初始化 Supabase 同步服務...');
            
            // 等待 SDK 載入
            await this.waitForSupabaseSDK();
            
            // 建立客戶端
            this.supabase = window.supabase.createClient(
                SUPABASE_CONFIG_FINAL.url,
                SUPABASE_CONFIG_FINAL.key
            );
            
            // 測試連接
            await this.testConnection();
            
            console.log('✅ Supabase 同步服務初始化完成');
            return true;
        } catch (error) {
            console.error('❌ Supabase 同步服務初始化失敗:', error);
            this.fallbackToLocalSync();
            return false;
        }
    }
    
    async waitForSupabaseSDK(maxWait = 10000) {
        const startTime = Date.now();
        while (!window.supabase && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!window.supabase) {
            throw new Error('Supabase SDK 載入超時');
        }
    }
    
    async testConnection() {
        try {
            const { data, error } = await Promise.race([
                this.supabase.from(SUPABASE_CONFIG_FINAL.tableName).select('count').limit(1),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('連接測試超時')), SUPABASE_CONFIG_FINAL.timeout)
                )
            ]);
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Supabase 連接測試成功');
            return true;
        } catch (error) {
            console.error('❌ Supabase 連接測試失敗:', error);
            
            // 提供詳細的錯誤診斷
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                throw new Error('資料表不存在：請在 Supabase 控制台執行建表腳本');
            } else if (error.message.includes('permission') || error.message.includes('policy')) {
                throw new Error('權限問題：請檢查 RLS 政策設定');
            } else if (error.message.includes('timeout') || error.name === 'AbortError') {
                throw new Error('連接超時：請檢查網路連接');
            }
            
            throw error;
        }
    }
    
    fallbackToLocalSync() {
        console.log('⬇️ 降級使用本地同步服務');
        if (typeof window.cloudSync !== 'undefined') {
            this.syncToCloud = () => window.cloudSync.syncToCloud();
            this.syncFromCloud = () => window.cloudSync.syncFromCloud();
            this.exportData = () => window.cloudSync.exportData();
            this.loadDataFromFile = () => window.cloudSync.loadDataFromFile();
        }
    }
    
    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('temple-device-id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('temple-device-id', deviceId);
        }
        return deviceId;
    }
    
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
            version: '3.0'
        };
    }
    
    async syncToCloud() {
        if (!this.isOnline) {
            throw new Error('無網路連接');
        }
        
        if (this.syncInProgress) {
            throw new Error('同步進行中，請稍候');
        }
        
        this.syncInProgress = true;
        
        try {
            // 等待服務初始化完成
            await this.initPromise;
            
            if (!this.supabase) {
                return await this.fallbackSyncToLocal();
            }
            
            const localData = this.collectLocalData();
            return await this.retryOperation(() => this.performSyncToSupabase(localData));
        } finally {
            this.syncInProgress = false;
        }
    }
    
    async performSyncToSupabase(data) {
        try {
            // 檢查現有記錄
            const { data: existing, error: selectError } = await this.supabase
                .from(SUPABASE_CONFIG_FINAL.tableName)
                .select('*')
                .eq('device_id', this.deviceId)
                .order('updated_at', { ascending: false })
                .limit(1);
            
            if (selectError) {
                throw selectError;
            }
            
            // 衝突解決
            if (existing && existing.length > 0) {
                const cloudLastModified = existing[0].last_modified;
                const localLastModified = data.lastModified;
                
                if (cloudLastModified > localLastModified) {
                    const userChoice = await this.showConflictDialog(cloudLastModified, localLastModified);
                    if (userChoice === 'load_cloud') {
                        return await this.syncFromCloud();
                    }
                }
            }
            
            // 執行同步
            const syncData = {
                device_id: this.deviceId,
                data: data,
                last_modified: data.lastModified,
                version: data.version,
                updated_at: new Date().toISOString()
            };
            
            let result;
            if (existing && existing.length > 0) {
                const { error: updateError } = await this.supabase
                    .from(SUPABASE_CONFIG_FINAL.tableName)
                    .update(syncData)
                    .eq('device_id', this.deviceId);
                
                if (updateError) throw updateError;
                result = 'updated';
            } else {
                const { error: insertError } = await this.supabase
                    .from(SUPABASE_CONFIG_FINAL.tableName)
                    .insert([{
                        ...syncData,
                        created_at: new Date().toISOString()
                    }]);
                
                if (insertError) throw insertError;
                result = 'inserted';
            }
            
            // 更新本地同步記錄
            this.lastSyncTime = Date.now();
            localStorage.setItem('temple-last-sync-supabase', this.lastSyncTime.toString());
            
            return {
                success: true,
                message: '數據已成功同步到雲端',
                syncTime: new Date().toLocaleString('zh-TW'),
                deviceId: this.deviceId,
                provider: 'Supabase',
                action: result,
                recordsCount: data.records?.length || 0,
                believersCount: data.believers?.length || 0
            };
        } catch (error) {
            console.error('Supabase 同步錯誤:', error);
            throw error;
        }
    }
    
    async showConflictDialog(cloudTime, localTime) {
        return new Promise((resolve) => {
            const cloudTimeStr = new Date(cloudTime).toLocaleString('zh-TW');
            const localTimeStr = new Date(localTime).toLocaleString('zh-TW');
            
            const shouldOverwrite = confirm(
                '🔄 檢測到雲端有更新的數據！\n\n' +
                `☁️ 雲端最後修改：${cloudTimeStr}\n` +
                `💻 本地最後修改：${localTimeStr}\n\n` +
                '選擇「確定」覆蓋雲端數據\n' +
                '選擇「取消」載入雲端數據到本地'
            );
            
            resolve(shouldOverwrite ? 'overwrite_cloud' : 'load_cloud');
        });
    }
    
    async syncFromCloud(deviceId = null) {
        if (!this.isOnline) {
            throw new Error('無網路連接');
        }
        
        if (this.syncInProgress) {
            throw new Error('同步進行中，請稍候');
        }
        
        this.syncInProgress = true;
        
        try {
            await this.initPromise;
            
            if (!this.supabase) {
                return await this.fallbackSyncFromLocal(deviceId);
            }
            
            const targetDeviceId = deviceId || this.deviceId;
            return await this.retryOperation(() => this.performSyncFromSupabase(targetDeviceId));
        } finally {
            this.syncInProgress = false;
        }
    }
    
    async performSyncFromSupabase(deviceId) {
        try {
            const { data: cloudData, error } = await this.supabase
                .from(SUPABASE_CONFIG_FINAL.tableName)
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
            
            // 備份本地數據
            this.backupLocalData();
            
            // 更新本地數據
            const dataKeys = [
                'temple-records', 'temple-believers', 'temple-reminders',
                'temple-inventory', 'temple-stock-movements', 'temple-events',
                'temple-custom-categories'
            ];
            
            const syncKeys = [
                'records', 'believers', 'reminders',
                'inventory', 'stockMovements', 'events',
                'customCategories'
            ];
            
            for (let i = 0; i < dataKeys.length; i++) {
                localStorage.setItem(dataKeys[i], JSON.stringify(syncData[syncKeys[i]] || []));
            }
            
            // 更新同步時間
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
            console.error('從 Supabase 同步錯誤:', error);
            throw error;
        }
    }
    
    // 檢查雲端資料狀態
    async checkCloudData() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG_FINAL.tableName)
                .select('data, last_modified, device_id, updated_at')
                .order('last_modified', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const cloudData = data[0];
                const parsedData = cloudData.data;
                
                return {
                    hasData: true,
                    lastModified: cloudData.last_modified,
                    deviceId: cloudData.device_id,
                    updatedAt: cloudData.updated_at,
                    recordsCount: parsedData.records?.length || 0,
                    believersCount: parsedData.believers?.length || 0,
                    remindersCount: parsedData.reminders?.length || 0,
                    eventsCount: parsedData.events?.length || 0
                };
            } else {
                return {
                    hasData: false,
                    message: '雲端暫無資料'
                };
            }
        } catch (error) {
            console.error('檢查雲端資料錯誤:', error);
            throw new Error('檢查雲端資料失敗: ' + error.message);
        }
    }
    
    async retryOperation(operation, maxRetries = SUPABASE_CONFIG_FINAL.retryAttempts) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 執行同步操作，第 ${attempt} 次嘗試...`);
                return await operation();
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ 第 ${attempt} 次嘗試失敗:`, error.message);
                
                if (attempt < maxRetries) {
                    const delay = SUPABASE_CONFIG_FINAL.retryDelay * attempt;
                    console.log(`⏰ ${delay}ms 後重試...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('❌ 所有重試嘗試都失敗了');
                }
            }
        }
        
        throw lastError;
    }
    
    async fallbackSyncToLocal() {
        const data = this.collectLocalData();
        const cloudKey = `temple-cloud-${this.deviceId}`;
        localStorage.setItem(cloudKey, JSON.stringify(data));
        localStorage.setItem('temple-cloud-key', cloudKey);
        
        this.lastSyncTime = Date.now();
        localStorage.setItem('temple-last-sync', this.lastSyncTime.toString());
        
        return {
            success: true,
            message: '數據已備份到本地存儲（Supabase 不可用）',
            syncTime: new Date().toLocaleString('zh-TW'),
            deviceId: this.deviceId,
            provider: 'LocalStorage',
            recordsCount: data.records?.length || 0,
            believersCount: data.believers?.length || 0
        };
    }
    
    async fallbackSyncFromLocal(deviceId) {
        const targetDeviceId = deviceId || this.deviceId;
        const cloudKey = `temple-cloud-${targetDeviceId}`;
        const cloudData = localStorage.getItem(cloudKey);
        
        if (!cloudData) {
            throw new Error('找不到本地備份數據');
        }
        
        const syncData = JSON.parse(cloudData);
        this.backupLocalData();
        
        // 更新本地數據
        const dataMapping = {
            'temple-records': syncData.records || [],
            'temple-believers': syncData.believers || [],
            'temple-reminders': syncData.reminders || [],
            'temple-inventory': syncData.inventory || [],
            'temple-stock-movements': syncData.stockMovements || [],
            'temple-events': syncData.events || [],
            'temple-custom-categories': syncData.customCategories || []
        };
        
        Object.entries(dataMapping).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
        });
        
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
                        
                        this.backupLocalData();
                        
                        // 更新本地數據
                        const dataMapping = {
                            'temple-records': loadedData.records || [],
                            'temple-believers': loadedData.believers || [],
                            'temple-reminders': loadedData.reminders || [],
                            'temple-inventory': loadedData.inventory || [],
                            'temple-stock-movements': loadedData.stockMovements || [],
                            'temple-events': loadedData.events || [],
                            'temple-custom-categories': loadedData.customCategories || []
                        };
                        
                        Object.entries(dataMapping).forEach(([key, value]) => {
                            localStorage.setItem(key, JSON.stringify(value));
                        });
                        
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
    
    backupLocalData() {
        const timestamp = Date.now();
        const localData = this.collectLocalData();
        localStorage.setItem(`temple-backup-${timestamp}`, JSON.stringify(localData));
        
        // 只保留最近 5 個備份
        const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('temple-backup-'));
        if (backupKeys.length > 5) {
            backupKeys.sort().slice(0, -5).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }
    
    async autoSync() {
        if (!this.isOnline || this.syncInProgress) return;
        
        try {
            const lastModified = localStorage.getItem('temple-last-modified');
            const lastSync = localStorage.getItem('temple-last-sync-supabase') || 
                           localStorage.getItem('temple-last-sync');
            
            if (lastModified && (!lastSync || parseInt(lastModified) > parseInt(lastSync))) {
                console.log('🔄 檢測到本地數據更新，開始自動同步...');
                await this.syncToCloud();
                console.log('✅ 自動同步完成');
            }
        } catch (error) {
            console.warn('⚠️ 自動同步失敗:', error.message);
        }
    }
    
    getSyncStatus() {
        const lastSync = localStorage.getItem('temple-last-sync-supabase') || 
                       localStorage.getItem('temple-last-sync');
        return {
            isOnline: this.isOnline,
            deviceId: this.deviceId,
            lastSyncTime: lastSync ? new Date(parseInt(lastSync)).toLocaleString('zh-TW') : '從未同步',
            provider: this.supabase ? 'Supabase' : 'LocalStorage',
            syncInProgress: this.syncInProgress,
            initialized: !!this.supabase
        };
    }
    
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
console.log('📦 載入 Supabase 同步服務 Final v3.0...');
window.supabaseSyncFinal = new SupabaseSyncServiceFinal();

// 向後兼容
window.supabaseSync = window.supabaseSyncFinal;
window.supabaseSyncV2 = window.supabaseSyncFinal;

console.log('✅ Supabase 同步服務 Final v3.0 已載入完成');

// 處理 URL 同步參數
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    const syncProvider = urlParams.get('sync_provider');
    
    if (deviceId && deviceId !== window.supabaseSync.deviceId) {
        const providerText = syncProvider === 'supabase' ? 'Supabase 雲端' : '本地存儲';
        
        setTimeout(() => {
            if (confirm(`🔄 檢測到來自其他設備的${providerText}數據\n\n是否要同步數據？\n\n⚠️ 注意：這將會覆蓋本地數據！`)) {
                window.supabaseSync.syncFromCloud(deviceId).then(result => {
                    if (result.success) {
                        alert(`🎉 數據同步成功！\n\n📊 統計資訊：\n• 來源：${result.provider}\n• 記錄數：${result.recordsCount}\n• 信眾數：${result.believersCount}\n• 同步時間：${result.syncTime}`);
                        
                        // 清除 URL 參數並重新載入
                        const url = new URL(window.location.href);
                        url.searchParams.delete('device_id');
                        url.searchParams.delete('sync_provider');
                        window.location.href = url.toString();
                    } else {
                        alert('❌ 數據同步失敗：' + result.message);
                    }
                }).catch(error => {
                    alert('❌ 數據同步失敗：' + error.message);
                });
            } else {
                // 清除 URL 參數
                const url = new URL(window.location.href);
                url.searchParams.delete('device_id');
                url.searchParams.delete('sync_provider');
                window.history.replaceState({}, '', url.toString());
            }
        }, 2000); // 延遲 2 秒確保頁面完全載入
    }
});