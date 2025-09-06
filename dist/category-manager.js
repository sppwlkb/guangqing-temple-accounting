/**
 * 宮廟記帳軟體 - 統一類別管理系統
 * 解決自訂類別消失問題，支援多宮廟資料隔離
 */

class CategoryManager {
    constructor() {
        this.defaultIncomeCategories = [
            { id: 1, name: '香油錢', color: '#67C23A', description: '信眾香油錢捐獻', isDefault: true },
            { id: 2, name: '點光明燈', color: '#E6A23C', description: '點光明燈費用', isDefault: true },
            { id: 3, name: '屬名紅包', color: '#F56C6C', description: '有署名的紅包捐獻', isDefault: true },
            { id: 4, name: '未屬名紅包', color: '#909399', description: '未署名的紅包捐獻', isDefault: true },
            { id: 5, name: '祝壽', color: '#409EFF', description: '神明祝壽捐獻', isDefault: true },
            { id: 6, name: '看風水', color: '#9C27B0', description: '風水諮詢費用', isDefault: true },
            { id: 7, name: '停車費', color: '#FF9800', description: '停車場收入', isDefault: true },
            { id: 8, name: '感謝神尊', color: '#4CAF50', description: '感謝神尊捐獻', isDefault: true },
            { id: 9, name: '其他', color: '#607D8B', description: '其他收入來源', isDefault: true }
        ];

        this.defaultExpenseCategories = [
            { id: 1, name: '供品', color: '#FF6B6B', description: '祭祀用供品', isDefault: true },
            { id: 2, name: '水電費', color: '#4ECDC4', description: '水電瓦斯費用', isDefault: true },
            { id: 3, name: '維修費', color: '#45B7D1', description: '建築維修費用', isDefault: true },
            { id: 4, name: '清潔用品', color: '#96CEB4', description: '清潔維護用品', isDefault: true },
            { id: 5, name: '文具用品', color: '#FFEAA7', description: '辦公文具用品', isDefault: true },
            { id: 6, name: '交通費', color: '#DDA0DD', description: '交通運輸費用', isDefault: true },
            { id: 7, name: '活動費用', color: '#98D8C8', description: '法會活動費用', isDefault: true },
            { id: 8, name: '其他', color: '#F7DC6F', description: '其他支出項目', isDefault: true }
        ];

        this.customIncomeCategories = [];
        this.customExpenseCategories = [];
        
        this.nextCustomId = 1000; // 自訂類別從1000開始編號
        this.storagePrefix = this.getStoragePrefix();
        
        this.initializeCategories();
    }

    /**
     * 獲取儲存前綴（支援多宮廟）
     */
    getStoragePrefix() {
        if (window.templeConfig) {
            const config = window.templeConfig.getConfig();
            return `temple-${config.templeId || 'default'}-`;
        }
        return 'temple-default-';
    }

    /**
     * 初始化類別系統
     */
    async initializeCategories() {
        try {
            await this.loadCustomCategories();
            this.updateNextCustomId();
            console.log('✅ 類別管理系統初始化完成');
            
            // 記錄到個資保護日誌
            if (window.privacyManager) {
                window.privacyManager.logActivity('system', 'category_system_init', '類別管理系統初始化');
            }
        } catch (error) {
            console.error('❌ 類別管理系統初始化失敗:', error);
        }
    }

    /**
     * 載入自訂類別
     */
    async loadCustomCategories() {
        try {
            // 檢查多個可能的儲存位置（向下相容）
            const storageKeys = [
                `${this.storagePrefix}custom-income-categories`,  // 新的多宮廟格式
                'custom-income-categories',                       // 舊格式
                'temple-income-categories'                        // Vue store格式
            ];

            let loadedIncomeCategories = [];
            let loadedExpenseCategories = [];

            // 嘗試從不同位置載入
            for (const key of storageKeys) {
                const saved = localStorage.getItem(key);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                            // 檢查是否包含自訂類別（非預設類別）
                            const customOnly = parsed.filter(cat => !cat.isDefault);
                            if (customOnly.length > 0) {
                                loadedIncomeCategories = customOnly;
                                console.log(`✅ 從 ${key} 載入了 ${customOnly.length} 個自訂收入類別`);
                                break;
                            }
                        }
                    } catch (error) {
                        console.warn(`載入 ${key} 失敗:`, error);
                    }
                }
            }

            // 載入支出類別（同樣邏輯）
            const expenseKeys = [
                `${this.storagePrefix}custom-expense-categories`,
                'custom-expense-categories',
                'temple-expense-categories'
            ];

            for (const key of expenseKeys) {
                const saved = localStorage.getItem(key);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                            const customOnly = parsed.filter(cat => !cat.isDefault);
                            if (customOnly.length > 0) {
                                loadedExpenseCategories = customOnly;
                                console.log(`✅ 從 ${key} 載入了 ${customOnly.length} 個自訂支出類別`);
                                break;
                            }
                        }
                    } catch (error) {
                        console.warn(`載入 ${key} 失敗:`, error);
                    }
                }
            }

            this.customIncomeCategories = loadedIncomeCategories;
            this.customExpenseCategories = loadedExpenseCategories;

            console.log(`📊 類別載入完成 - 收入：${this.customIncomeCategories.length} 個，支出：${this.customExpenseCategories.length} 個`);

        } catch (error) {
            console.error('載入自訂類別失敗:', error);
        }
    }

    /**
     * 儲存自訂類別
     */
    async saveCustomCategories() {
        try {
            const incomeKey = `${this.storagePrefix}custom-income-categories`;
            const expenseKey = `${this.storagePrefix}custom-expense-categories`;
            
            // 儲存到新的多宮廟格式
            localStorage.setItem(incomeKey, JSON.stringify(this.customIncomeCategories));
            localStorage.setItem(expenseKey, JSON.stringify(this.customExpenseCategories));
            
            // 同時儲存到舊格式（向下相容）
            localStorage.setItem('custom-income-categories', JSON.stringify(this.customIncomeCategories));
            localStorage.setItem('custom-expense-categories', JSON.stringify(this.customExpenseCategories));
            
            console.log(`✅ 自訂類別已儲存 - 收入：${this.customIncomeCategories.length} 個，支出：${this.customExpenseCategories.length} 個`);
            
            // 記錄到個資保護日誌
            if (window.privacyManager) {
                window.privacyManager.logActivity('system', 'categories_saved', 
                    `儲存自訂類別 - 收入：${this.customIncomeCategories.length}，支出：${this.customExpenseCategories.length}`);
            }
            
            // 觸發更新事件
            window.dispatchEvent(new CustomEvent('categoriesUpdated', {
                detail: {
                    incomeCategories: this.getAllIncomeCategories(),
                    expenseCategories: this.getAllExpenseCategories()
                }
            }));
            
        } catch (error) {
            console.error('儲存自訂類別失敗:', error);
            throw error;
        }
    }

    /**
     * 新增收入類別
     */
    addIncomeCategory(name, color = '#67C23A', description = '') {
        try {
            // 檢查是否已存在
            const exists = this.getAllIncomeCategories().some(cat => cat.name === name);
            if (exists) {
                throw new Error(`收入類別「${name}」已存在`);
            }

            const newCategory = {
                id: this.nextCustomId++,
                name: name,
                color: color,
                description: description,
                isDefault: false,
                isCustom: true,
                createdAt: new Date().toISOString(),
                createdBy: window.accessControl?.currentUser?.name || 'system'
            };

            this.customIncomeCategories.push(newCategory);
            this.saveCustomCategories();
            
            console.log(`✅ 新增收入類別：${name}`);
            
            // 記錄到個資保護日誌
            if (window.privacyManager) {
                window.privacyManager.logActivity(
                    window.accessControl?.currentUser?.id || 'system', 
                    'income_category_added', 
                    `新增收入類別：${name}`
                );
            }
            
            return newCategory;
        } catch (error) {
            console.error('新增收入類別失敗:', error);
            throw error;
        }
    }

    /**
     * 新增支出類別
     */
    addExpenseCategory(name, color = '#FF6B6B', description = '') {
        try {
            const exists = this.getAllExpenseCategories().some(cat => cat.name === name);
            if (exists) {
                throw new Error(`支出類別「${name}」已存在`);
            }

            const newCategory = {
                id: this.nextCustomId++,
                name: name,
                color: color,
                description: description,
                isDefault: false,
                isCustom: true,
                createdAt: new Date().toISOString(),
                createdBy: window.accessControl?.currentUser?.name || 'system'
            };

            this.customExpenseCategories.push(newCategory);
            this.saveCustomCategories();
            
            console.log(`✅ 新增支出類別：${name}`);
            
            if (window.privacyManager) {
                window.privacyManager.logActivity(
                    window.accessControl?.currentUser?.id || 'system', 
                    'expense_category_added', 
                    `新增支出類別：${name}`
                );
            }
            
            return newCategory;
        } catch (error) {
            console.error('新增支出類別失敗:', error);
            throw error;
        }
    }

    /**
     * 刪除自訂類別
     */
    deleteCustomCategory(id, type) {
        try {
            const categories = type === 'income' ? this.customIncomeCategories : this.customExpenseCategories;
            const index = categories.findIndex(cat => cat.id === id);
            
            if (index === -1) {
                throw new Error('找不到指定的類別');
            }
            
            const category = categories[index];
            if (category.isDefault) {
                throw new Error('無法刪除預設類別');
            }
            
            categories.splice(index, 1);
            this.saveCustomCategories();
            
            console.log(`✅ 刪除${type === 'income' ? '收入' : '支出'}類別：${category.name}`);
            
            if (window.privacyManager) {
                window.privacyManager.logActivity(
                    window.accessControl?.currentUser?.id || 'system', 
                    `${type}_category_deleted`, 
                    `刪除${type === 'income' ? '收入' : '支出'}類別：${category.name}`
                );
            }
            
            return true;
        } catch (error) {
            console.error('刪除類別失敗:', error);
            throw error;
        }
    }

    /**
     * 取得所有收入類別（預設+自訂）
     */
    getAllIncomeCategories() {
        return [...this.defaultIncomeCategories, ...this.customIncomeCategories];
    }

    /**
     * 取得所有支出類別（預設+自訂）
     */
    getAllExpenseCategories() {
        return [...this.defaultExpenseCategories, ...this.customExpenseCategories];
    }

    /**
     * 取得類別（依ID）
     */
    getCategoryById(id, type) {
        const categories = type === 'income' ? this.getAllIncomeCategories() : this.getAllExpenseCategories();
        return categories.find(cat => cat.id === id);
    }

    /**
     * 更新自訂ID計數器
     */
    updateNextCustomId() {
        const allCustomIds = [
            ...this.customIncomeCategories.map(cat => cat.id),
            ...this.customExpenseCategories.map(cat => cat.id)
        ];
        
        if (allCustomIds.length > 0) {
            this.nextCustomId = Math.max(...allCustomIds) + 1;
        }
    }

    /**
     * 匯出類別設定
     */
    exportCategories() {
        const exportData = {
            exportedAt: new Date().toISOString(),
            exportedBy: window.accessControl?.currentUser?.name || 'system',
            templeId: window.templeConfig?.getConfig()?.templeId || 'default',
            templeName: window.templeConfig?.getConfig()?.templeName || '未知宮廟',
            categories: {
                income: {
                    default: this.defaultIncomeCategories,
                    custom: this.customIncomeCategories
                },
                expense: {
                    default: this.defaultExpenseCategories,
                    custom: this.customExpenseCategories
                }
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportData.templeName}_類別設定_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ 類別設定已匯出');
        return exportData;
    }

    /**
     * 匯入類別設定
     */
    async importCategories(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (importData.categories) {
                        // 匯入自訂類別
                        if (importData.categories.income?.custom) {
                            this.customIncomeCategories = importData.categories.income.custom;
                        }
                        if (importData.categories.expense?.custom) {
                            this.customExpenseCategories = importData.categories.expense.custom;
                        }
                        
                        this.updateNextCustomId();
                        await this.saveCustomCategories();
                        
                        console.log('✅ 類別設定匯入成功');
                        resolve(importData);
                    } else {
                        throw new Error('無效的類別設定檔案');
                    }
                } catch (error) {
                    console.error('匯入類別設定失敗:', error);
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * 重置自訂類別
     */
    resetCustomCategories() {
        if (confirm('確定要重置所有自訂類別嗎？這將刪除所有您新增的類別。')) {
            this.customIncomeCategories = [];
            this.customExpenseCategories = [];
            this.nextCustomId = 1000;
            
            this.saveCustomCategories();
            
            console.log('✅ 自訂類別已重置');
            
            if (window.privacyManager) {
                window.privacyManager.logActivity(
                    window.accessControl?.currentUser?.id || 'system', 
                    'categories_reset', 
                    '重置所有自訂類別'
                );
            }
            
            return true;
        }
        return false;
    }

    /**
     * 取得類別統計
     */
    getCategoryStats() {
        return {
            income: {
                default: this.defaultIncomeCategories.length,
                custom: this.customIncomeCategories.length,
                total: this.getAllIncomeCategories().length
            },
            expense: {
                default: this.defaultExpenseCategories.length,
                custom: this.customExpenseCategories.length,
                total: this.getAllExpenseCategories().length
            },
            storagePrefix: this.storagePrefix,
            nextCustomId: this.nextCustomId
        };
    }

    /**
     * 修復類別儲存問題的工具
     */
    async repairCategoryStorage() {
        try {
            console.log('🔧 開始修復類別儲存問題...');
            
            // 清理舊的儲存格式
            const oldKeys = [
                'custom-income-categories',
                'custom-expense-categories', 
                'temple-income-categories',
                'temple-expense-categories'
            ];
            
            let recoveredCategories = { income: [], expense: [] };
            
            // 嘗試從舊格式恢復資料
            oldKeys.forEach(key => {
                const saved = localStorage.getItem(key);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                            const customOnly = parsed.filter(cat => !cat.isDefault && cat.name);
                            if (customOnly.length > 0) {
                                if (key.includes('income')) {
                                    recoveredCategories.income.push(...customOnly);
                                } else if (key.includes('expense')) {
                                    recoveredCategories.expense.push(...customOnly);
                                }
                            }
                        }
                    } catch (error) {
                        console.warn(`恢復 ${key} 失敗:`, error);
                    }
                }
            });
            
            // 去重複並合併
            const uniqueIncome = this.removeDuplicateCategories([
                ...this.customIncomeCategories,
                ...recoveredCategories.income
            ]);
            
            const uniqueExpense = this.removeDuplicateCategories([
                ...this.customExpenseCategories,
                ...recoveredCategories.expense
            ]);
            
            this.customIncomeCategories = uniqueIncome;
            this.customExpenseCategories = uniqueExpense;
            
            // 重新分配ID
            this.reassignCustomIds();
            
            // 儲存到新格式
            await this.saveCustomCategories();
            
            console.log(`✅ 類別儲存修復完成 - 恢復收入類別：${uniqueIncome.length} 個，支出類別：${uniqueExpense.length} 個`);
            
            return {
                recoveredIncome: uniqueIncome.length,
                recoveredExpense: uniqueExpense.length,
                message: '類別儲存已修復'
            };
            
        } catch (error) {
            console.error('修復類別儲存失敗:', error);
            throw error;
        }
    }

    /**
     * 移除重複的類別
     */
    removeDuplicateCategories(categories) {
        const seen = new Set();
        return categories.filter(cat => {
            const key = cat.name.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * 重新分配自訂類別ID
     */
    reassignCustomIds() {
        let currentId = 1000;
        
        this.customIncomeCategories.forEach(cat => {
            if (!cat.isDefault) {
                cat.id = currentId++;
            }
        });
        
        this.customExpenseCategories.forEach(cat => {
            if (!cat.isDefault) {
                cat.id = currentId++;
            }
        });
        
        this.nextCustomId = currentId;
    }

    /**
     * 檢查並修復發財金類別
     */
    async checkAndRestoreFacaiCategory() {
        const facaiCategory = this.customIncomeCategories.find(cat => cat.name === '發財金');
        
        if (!facaiCategory) {
            console.log('🔍 未找到發財金類別，嘗試恢復...');
            
            // 嘗試從各種可能的位置恢復
            const possibleKeys = [
                'custom-income-categories',
                'temple-income-categories',
                `${this.storagePrefix}custom-income-categories`
            ];
            
            for (const key of possibleKeys) {
                const saved = localStorage.getItem(key);
                if (saved) {
                    try {
                        const categories = JSON.parse(saved);
                        const facai = categories.find(cat => cat.name === '發財金');
                        if (facai) {
                            console.log(`✅ 從 ${key} 恢復發財金類別`);
                            this.customIncomeCategories.push({
                                ...facai,
                                id: this.nextCustomId++,
                                isCustom: true,
                                restoredAt: new Date().toISOString()
                            });
                            await this.saveCustomCategories();
                            return facai;
                        }
                    } catch (error) {
                        console.warn(`從 ${key} 恢復失敗:`, error);
                    }
                }
            }
            
            // 如果都找不到，重新建立
            console.log('🆕 重新建立發財金類別');
            return this.addIncomeCategory('發財金', '#FFD700', '發財金收入');
        } else {
            console.log('✅ 發財金類別存在');
            return facaiCategory;
        }
    }
}

// 創建全局類別管理器
window.categoryManager = new CategoryManager();

// 頁面載入時自動檢查發財金類別
window.addEventListener('load', function() {
    setTimeout(async () => {
        if (window.categoryManager) {
            try {
                await window.categoryManager.checkAndRestoreFacaiCategory();
                console.log('🔍 發財金類別檢查完成');
            } catch (error) {
                console.error('發財金類別檢查失敗:', error);
            }
        }
    }, 2000); // 等待其他系統初始化完成
}); 