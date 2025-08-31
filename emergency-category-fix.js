/**
 * 緊急修復：發財金類別消失問題
 * 這個腳本會立即修復自訂類別的儲存問題
 */

(function() {
    'use strict';
    
    console.log('🚨 啟動發財金類別緊急修復...');
    
    // 修復函數
    function emergencyFixCategories() {
        try {
            // 1. 檢查是否有發財金類別
            const customIncomeStr = localStorage.getItem('custom-income-categories');
            let customIncomeCategories = [];
            
            if (customIncomeStr) {
                try {
                    customIncomeCategories = JSON.parse(customIncomeStr);
                } catch (error) {
                    console.error('解析自訂類別失敗:', error);
                    customIncomeCategories = [];
                }
            }
            
            // 2. 檢查是否已有發財金
            const hasFacai = customIncomeCategories.some(cat => cat.name === '發財金');
            
            if (!hasFacai) {
                console.log('🔍 未找到發財金類別，正在新增...');
                
                // 3. 新增發財金類別
                const facaiCategory = {
                    id: Date.now(),
                    name: '發財金',
                    color: '#FFD700',
                    description: '發財金收入',
                    isDefault: false,
                    isCustom: true,
                    createdAt: new Date().toISOString(),
                    emergencyFixed: true
                };
                
                customIncomeCategories.push(facaiCategory);
                
                // 4. 儲存到多個位置確保不會遺失
                const storageKeys = [
                    'custom-income-categories',
                    'temple-default-custom-income-categories',
                    'temple-income-categories-backup'
                ];
                
                storageKeys.forEach(key => {
                    try {
                        localStorage.setItem(key, JSON.stringify(customIncomeCategories));
                        console.log(`✅ 發財金類別已儲存到 ${key}`);
                    } catch (error) {
                        console.error(`儲存到 ${key} 失敗:`, error);
                    }
                });
                
                console.log('✅ 發財金類別緊急修復完成！');
                
                // 5. 顯示成功通知
                if (typeof ElMessage !== 'undefined') {
                    ElMessage.success('✅ 發財金類別已恢復！');
                } else {
                    // 創建自訂通知
                    showCustomNotification('✅ 發財金類別已恢復！', 'success');
                }
                
                return true;
            } else {
                console.log('✅ 發財金類別已存在');
                return false;
            }
            
        } catch (error) {
            console.error('緊急修復失敗:', error);
            showCustomNotification('❌ 緊急修復失敗：' + error.message, 'error');
            return false;
        }
    }
    
    // 自訂通知函數
    function showCustomNotification(message, type = 'info') {
        // 移除舊通知
        const oldNotification = document.getElementById('emergency-notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#007bff'
        };
        
        const notification = document.createElement('div');
        notification.id = 'emergency-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: bold;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div>${message}</div>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
                float: right;
            ">關閉</button>
        `;
        
        // 添加動畫CSS
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 5秒後自動消失
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // 強制儲存函數
    function forceSaveCategories() {
        try {
            console.log('💾 強制儲存所有類別...');
            
            // 從頁面中取得當前的自訂類別
            let currentCustomIncome = [];
            let currentCustomExpense = [];
            
            // 嘗試從Vue應用程式取得資料
            if (window.Vue && window.Vue.version) {
                // Vue 3 應用程式
                const app = document.querySelector('#app').__vue_app__;
                if (app) {
                    const instance = app._instance;
                    if (instance && instance.ctx.customIncomeCategories) {
                        currentCustomIncome = instance.ctx.customIncomeCategories.value || [];
                        currentCustomExpense = instance.ctx.customExpenseCategories.value || [];
                    }
                }
            }
            
            // 如果無法從Vue取得，嘗試從DOM取得
            if (currentCustomIncome.length === 0) {
                const incomeSelect = document.querySelector('select[placeholder*="收入"]');
                if (incomeSelect) {
                    const options = Array.from(incomeSelect.options);
                    options.forEach(option => {
                        if (option.value && option.text === '發財金') {
                            currentCustomIncome.push({
                                id: Date.now(),
                                name: '發財金',
                                color: '#FFD700',
                                description: '發財金收入',
                                isCustom: true,
                                createdAt: new Date().toISOString(),
                                emergencyFixed: true
                            });
                        }
                    });
                }
            }
            
            // 強制儲存到所有可能的位置
            const storageTargets = [
                'custom-income-categories',
                'temple-default-custom-income-categories',
                'temple-income-categories',
                'temple-income-categories-emergency'
            ];
            
            storageTargets.forEach(key => {
                try {
                    localStorage.setItem(key, JSON.stringify(currentCustomIncome));
                    console.log(`✅ 強制儲存到 ${key}`);
                } catch (error) {
                    console.error(`強制儲存到 ${key} 失敗:`, error);
                }
            });
            
            // 同樣處理支出類別
            const expenseTargets = [
                'custom-expense-categories',
                'temple-default-custom-expense-categories',
                'temple-expense-categories',
                'temple-expense-categories-emergency'
            ];
            
            expenseTargets.forEach(key => {
                try {
                    localStorage.setItem(key, JSON.stringify(currentCustomExpense));
                    console.log(`✅ 強制儲存支出類別到 ${key}`);
                } catch (error) {
                    console.error(`強制儲存支出類別到 ${key} 失敗:`, error);
                }
            });
            
            showCustomNotification('💾 類別已強制儲存到多個位置', 'success');
            
        } catch (error) {
            console.error('強制儲存失敗:', error);
            showCustomNotification('❌ 強制儲存失敗', 'error');
        }
    }
    
    // 立即執行修復
    function executeEmergencyFix() {
        console.log('🚨 執行緊急修復...');
        
        // 先嘗試恢復發財金
        const fixed = emergencyFixCategories();
        
        // 強制儲存當前狀態
        setTimeout(forceSaveCategories, 500);
        
        // 設定定期檢查
        setInterval(() => {
            const facaiExists = checkFacaiExists();
            if (!facaiExists) {
                console.log('⚠️ 發財金類別又消失了，重新修復...');
                emergencyFixCategories();
            }
        }, 5000); // 每5秒檢查一次
        
        return fixed;
    }
    
    // 檢查發財金是否存在
    function checkFacaiExists() {
        const keys = [
            'custom-income-categories',
            'temple-default-custom-income-categories',
            'temple-income-categories'
        ];
        
        for (const key of keys) {
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    const categories = JSON.parse(saved);
                    if (categories.some(cat => cat.name === '發財金')) {
                        return true;
                    }
                } catch (error) {
                    console.warn(`檢查 ${key} 失敗:`, error);
                }
            }
        }
        return false;
    }
    
    // 添加手動修復按鈕到頁面
    function addEmergencyFixButton() {
        // 檢查是否已有按鈕
        if (document.getElementById('emergency-fix-btn')) return;
        
        const button = document.createElement('button');
        button.id = 'emergency-fix-btn';
        button.innerHTML = '🚨 緊急修復發財金';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        button.onclick = () => {
            const fixed = executeEmergencyFix();
            if (fixed) {
                showCustomNotification('✅ 發財金類別已修復！請重新載入頁面', 'success');
                button.style.background = '#28a745';
                button.innerHTML = '✅ 已修復';
                
                // 3秒後自動重新載入
                setTimeout(() => {
                    if (confirm('發財金類別已修復！是否要重新載入頁面查看結果？')) {
                        window.location.reload();
                    }
                }, 3000);
            }
        };
        
        document.body.appendChild(button);
    }
    
    // 頁面載入完成後執行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                executeEmergencyFix();
                addEmergencyFixButton();
            }, 2000);
        });
    } else {
        setTimeout(() => {
            executeEmergencyFix();
            addEmergencyFixButton();
        }, 2000);
    }
    
    // 暴露到全局供手動調用
    window.emergencyFixCategories = emergencyFixCategories;
    window.forceSaveCategories = forceSaveCategories;
    
    console.log('🚨 緊急修復腳本已載入');
    
})(); 