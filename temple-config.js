/**
 * 廣清宮記帳軟體 - 配置管理器
 * 處理應用程式初始設定和配置
 */

class TempleConfigManager {
    constructor() {
        console.log('TempleConfigManager 初始化...');
        try {
            this.initializeConfig();
        } catch (error) {
            console.warn('配置管理器初始化錯誤:', error);
        }
    }
    
    initializeConfig() {
        // 檢查是否為首次使用
        const isFirstTime = !localStorage.getItem('temple-config-initialized');
        
        if (isFirstTime) {
            console.log('檢測到首次使用，初始化基本配置...');
            this.setupDefaultConfig();
        }
        
        // 標記為已初始化
        localStorage.setItem('temple-config-initialized', 'true');
    }
    
    setupDefaultConfig() {
        // 設定預設配置
        const defaultConfig = {
            appName: '廣清宮快速記帳軟體',
            version: '2.0',
            language: 'zh-TW',
            theme: 'default',
            initialized: true,
            setupDate: new Date().toISOString()
        };
        
        localStorage.setItem('temple-app-config', JSON.stringify(defaultConfig));
        
        // 初始化空的數據結構
        this.initializeDataStructures();
    }
    
    initializeDataStructures() {
        const dataKeys = [
            'temple-records',
            'temple-believers', 
            'temple-reminders',
            'temple-inventory',
            'temple-stock-movements',
            'temple-events',
            'temple-custom-categories'
        ];
        
        dataKeys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    }
    
    showSetupWizard() {
        // 安全的設定精靈顯示
        try {
            const targetElement = document.querySelector('body') || document.documentElement;
            if (!targetElement) {
                console.warn('找不到目標元素來顯示設定精靈');
                return;
            }
            
            // 創建簡單的歡迎訊息
            const welcomeDiv = document.createElement('div');
            welcomeDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Microsoft JhengHei', sans-serif;
                max-width: 300px;
            `;
            
            welcomeDiv.innerHTML = `
                <h4 style="margin: 0 0 10px 0;">🏮 歡迎使用廣清宮記帳軟體</h4>
                <p style="margin: 0; font-size: 14px;">系統已完成初始化設定！</p>
                <button onclick="this.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    margin-top: 10px;
                    cursor: pointer;
                ">確定</button>
            `;
            
            targetElement.appendChild(welcomeDiv);
            
            // 5秒後自動移除
            setTimeout(() => {
                if (welcomeDiv.parentElement) {
                    welcomeDiv.remove();
                }
            }, 5000);
            
        } catch (error) {
            console.warn('設定精靈顯示錯誤:', error);
        }
    }
    
    getConfig() {
        try {
            const config = localStorage.getItem('temple-app-config');
            return config ? JSON.parse(config) : this.getDefaultConfig();
        } catch (error) {
            console.warn('讀取配置錯誤:', error);
            return this.getDefaultConfig();
        }
    }
    
    getDefaultConfig() {
        return {
            appName: '廣清宮快速記帳軟體',
            version: '2.0',
            language: 'zh-TW',
            theme: 'default',
            initialized: false
        };
    }
    
    updateConfig(newConfig) {
        try {
            const currentConfig = this.getConfig();
            const updatedConfig = { ...currentConfig, ...newConfig };
            localStorage.setItem('temple-app-config', JSON.stringify(updatedConfig));
            return true;
        } catch (error) {
            console.warn('更新配置錯誤:', error);
            return false;
        }
    }
}

// 拖拽功能初始化函數
function initDragFeature() {
    console.log('初始化拖拽功能...');
    
    // 基本的拖拽功能實現
    const draggableElements = document.querySelectorAll('[draggable="true"]');
    
    draggableElements.forEach(element => {
        element.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.id || 'dragged-element');
            this.style.opacity = '0.5';
        });
        
        element.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
        });
    });
    
    // 放置區域設定
    const dropZones = document.querySelectorAll('[data-drop-zone]');
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.background = 'rgba(102, 126, 234, 0.1)';
        });
        
        zone.addEventListener('dragleave', function(e) {
            this.style.background = '';
        });
        
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.background = '';
            
            const draggedData = e.dataTransfer.getData('text/plain');
            console.log('拖拽完成:', draggedData);
            
            // 觸發自定義事件
            const dropEvent = new CustomEvent('templeItemDropped', {
                detail: { data: draggedData, target: this }
            });
            document.dispatchEvent(dropEvent);
        });
    });
    
    console.log(`✅ 拖拽功能已初始化 (${draggableElements.length} 個可拖拽元素, ${dropZones.length} 個放置區域)`);
}

// 全域錯誤處理
function handleGlobalErrors() {
    window.addEventListener('error', function(e) {
        console.warn('JavaScript 錯誤已捕獲:', e.error);
        
        // 防止錯誤中斷應用程式運行
        if (e.error && e.error.message.includes('temple-config')) {
            console.log('配置相關錯誤已處理，應用程式繼續運行');
            e.preventDefault();
        }
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.warn('Promise 拒絕已捕獲:', e.reason);
        e.preventDefault();
    });
}

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('開始初始化廣清宮記帳軟體配置...');
    
    // 初始化全域錯誤處理
    handleGlobalErrors();
    
    // 延遲初始化，避免與其他腳本衝突
    setTimeout(() => {
        try {
            // 初始化配置管理器
            window.templeConfig = new TempleConfigManager();
            
            // 初始化拖拽功能
            initDragFeature();
            
            console.log('✅ 廣清宮記帳軟體配置初始化完成');
        } catch (error) {
            console.warn('初始化過程中發生錯誤:', error);
        }
    }, 1000);
});

// 導出給全域使用
window.TempleConfigManager = TempleConfigManager;
window.initDragFeature = initDragFeature;

console.log('temple-config.js 腳本已載入');