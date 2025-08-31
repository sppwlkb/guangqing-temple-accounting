/**
 * 宮廟軟體用戶支援系統
 * 自動檢測問題、提供解決方案、收集用戶反饋
 */

class UserSupportSystem {
    constructor() {
        this.knownIssues = [
            {
                id: 'indexeddb-index-error',
                name: 'IndexedDB索引錯誤',
                pattern: /Failed to execute 'index' on 'IDBObjectStore'/,
                severity: 'critical',
                solution: {
                    title: 'IndexedDB資料庫重置',
                    description: '重置資料庫結構可以解決索引問題',
                    action: 'indexeddb-reset.html',
                    autoFix: true
                }
            },
            {
                id: 'custom-category-lost',
                name: '自訂類別消失',
                pattern: /發財金|自訂類別/,
                severity: 'high',
                solution: {
                    title: '類別恢復工具',
                    description: '使用類別修復工具恢復遺失的類別',
                    action: 'facai-fix.html',
                    autoFix: true
                }
            },
            {
                id: 'storage-quota-exceeded',
                name: '儲存空間不足',
                pattern: /QuotaExceededError|storage quota/i,
                severity: 'medium',
                solution: {
                    title: '清理儲存空間',
                    description: '清理不必要的資料釋放空間',
                    action: 'cleanup',
                    autoFix: false
                }
            },
            {
                id: 'browser-compatibility',
                name: '瀏覽器兼容性問題',
                pattern: /not supported|undefined.*function/i,
                severity: 'medium',
                solution: {
                    title: '更新瀏覽器',
                    description: '建議使用最新版本的Chrome、Firefox或Edge',
                    action: 'browser-update',
                    autoFix: false
                }
            }
        ];
        
        this.userReports = [];
        this.errorLog = [];
        this.autoFixEnabled = true;
        
        this.initializeSupport();
    }

    /**
     * 初始化支援系統
     */
    initializeSupport() {
        this.setupErrorHandler();
        this.setupUserFeedback();
        this.startHealthMonitoring();
        console.log('✅ 用戶支援系統已啟動');
    }

    /**
     * 設置全局錯誤處理
     */
    setupErrorHandler() {
        // 捕獲未處理的錯誤
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                type: 'javascript'
            });
        });

        // 捕獲未處理的Promise錯誤
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: event.reason.message || event.reason,
                type: 'promise',
                stack: event.reason.stack
            });
        });

        // 重寫console.error來捕獲手動記錄的錯誤
        const originalError = console.error;
        console.error = (...args) => {
            this.handleError({
                message: args.join(' '),
                type: 'console',
                timestamp: new Date().toISOString()
            });
            originalError.apply(console, args);
        };
    }

    /**
     * 處理錯誤
     */
    handleError(errorInfo) {
        const error = {
            id: `error_${Date.now()}`,
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.getUserId()
        };

        this.errorLog.push(error);
        
        // 檢查是否是已知問題
        const knownIssue = this.identifyKnownIssue(error.message);
        if (knownIssue) {
            this.handleKnownIssue(knownIssue, error);
        } else {
            this.handleUnknownIssue(error);
        }

        // 記錄到個資保護日誌
        if (window.privacyManager) {
            window.privacyManager.logActivity('support_system', 'error_detected', `錯誤檢測: ${error.message.substring(0, 100)}`);
        }
    }

    /**
     * 識別已知問題
     */
    identifyKnownIssue(message) {
        return this.knownIssues.find(issue => issue.pattern.test(message));
    }

    /**
     * 處理已知問題
     */
    handleKnownIssue(issue, error) {
        console.log(`🔍 檢測到已知問題：${issue.name}`);
        
        // 顯示解決方案
        this.showSolutionDialog(issue, error);
        
        // 如果啟用自動修復且問題支援自動修復
        if (this.autoFixEnabled && issue.solution.autoFix) {
            setTimeout(() => {
                this.executeAutoFix(issue);
            }, 3000); // 3秒後自動修復
        }
    }

    /**
     * 處理未知問題
     */
    handleUnknownIssue(error) {
        console.log('❓ 檢測到未知問題，收集資訊中...');
        
        // 收集系統資訊
        const systemInfo = this.collectSystemInfo();
        
        // 顯示回報對話框
        this.showReportDialog(error, systemInfo);
    }

    /**
     * 顯示解決方案對話框
     */
    showSolutionDialog(issue, error) {
        const dialogHTML = `
            <div id="solution-dialog" style="
                position: fixed; 
                top: 0; left: 0; 
                width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); 
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: white;
                    padding: 30px; 
                    border-radius: 15px; 
                    max-width: 500px; 
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">
                        ${issue.severity === 'critical' ? '🚨' : issue.severity === 'high' ? '⚠️' : '💡'}
                    </div>
                    <h2 style="color: #dc3545; margin-bottom: 15px;">
                        檢測到系統問題
                    </h2>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                        <strong>問題：</strong>${issue.name}<br>
                        <strong>嚴重程度：</strong>${this.getSeverityText(issue.severity)}<br>
                        <strong>影響：</strong>${error.message.substring(0, 100)}...
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                        <strong>💡 解決方案：</strong><br>
                        ${issue.solution.description}
                    </div>
                    
                    <div style="margin-top: 20px;">
                        ${issue.solution.autoFix ? `
                        <button onclick="executeAutoFixFromDialog('${issue.id}')" style="
                            background: #28a745; 
                            color: white; 
                            border: none; 
                            padding: 12px 25px; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            cursor: pointer;
                            margin-right: 10px;
                        ">🔧 自動修復</button>
                        ` : ''}
                        
                        <button onclick="openSolutionPage('${issue.solution.action}')" style="
                            background: #007bff; 
                            color: white; 
                            border: none; 
                            padding: 12px 25px; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            cursor: pointer;
                            margin-right: 10px;
                        ">🛠️ 手動修復</button>
                        
                        <button onclick="closeSolutionDialog()" style="
                            background: #6c757d; 
                            color: white; 
                            border: none; 
                            padding: 12px 25px; 
                            border-radius: 8px; 
                            cursor: pointer;
                        ">稍後處理</button>
                    </div>
                    
                    <div style="margin-top: 15px; font-size: 12px; color: #666;">
                        💝 我們致力於提供最佳的用戶體驗<br>
                        如果問題持續，請聯絡技術支援
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    }

    /**
     * 收集系統資訊
     */
    collectSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            localStorage: this.getStorageInfo(),
            templeConfig: window.templeConfig?.getConfig() || null,
            donationTier: window.donationManager?.getCurrentTier() || 'unknown',
            errorCount: this.errorLog.length
        };
    }

    /**
     * 取得儲存資訊
     */
    getStorageInfo() {
        const info = {
            totalKeys: localStorage.length,
            categoryKeys: 0,
            configKeys: 0,
            dataKeys: 0
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('categor')) info.categoryKeys++;
            else if (key.includes('config')) info.configKeys++;
            else if (key.includes('temple-') || key.includes('record')) info.dataKeys++;
        }

        return info;
    }

    /**
     * 取得用戶ID
     */
    getUserId() {
        let userId = localStorage.getItem('user-support-id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user-support-id', userId);
        }
        return userId;
    }

    /**
     * 取得嚴重程度文字
     */
    getSeverityText(severity) {
        const texts = {
            'critical': '🔴 嚴重',
            'high': '🟠 高',
            'medium': '🟡 中等',
            'low': '🟢 輕微'
        };
        return texts[severity] || '❓ 未知';
    }

    /**
     * 設置用戶反饋系統
     */
    setupUserFeedback() {
        // 添加反饋按鈕到頁面
        setTimeout(() => {
            this.addFeedbackButton();
        }, 3000);
    }

    /**
     * 添加反饋按鈕
     */
    addFeedbackButton() {
        if (document.getElementById('user-feedback-btn')) return;
        
        const button = document.createElement('button');
        button.id = 'user-feedback-btn';
        button.innerHTML = '💬 問題回報';
        button.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9998;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-size: 14px;
        `;
        
        button.onclick = () => this.showFeedbackDialog();
        document.body.appendChild(button);
    }

    /**
     * 顯示反饋對話框
     */
    showFeedbackDialog() {
        const dialogHTML = `
            <div id="feedback-dialog" style="
                position: fixed; 
                top: 0; left: 0; 
                width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); 
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: white;
                    padding: 30px; 
                    border-radius: 15px; 
                    max-width: 500px; 
                    width: 90%;
                ">
                    <h3 style="margin-top: 0; color: #007bff;">💬 用戶問題回報</h3>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">問題類型：</label>
                        <select id="issue-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="bug">🐛 系統錯誤</option>
                            <option value="category">📋 類別問題</option>
                            <option value="data">💾 資料問題</option>
                            <option value="feature">✨ 功能建議</option>
                            <option value="other">❓ 其他問題</option>
                        </select>
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">問題描述：</label>
                        <textarea id="issue-description" placeholder="請詳細描述您遇到的問題..." style="
                            width: 100%; 
                            height: 100px; 
                            padding: 8px; 
                            border: 1px solid #ddd; 
                            border-radius: 4px;
                            resize: vertical;
                        "></textarea>
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">聯絡方式（選填）：</label>
                        <input type="text" id="contact-info" placeholder="Email或電話（方便我們聯絡您）" style="
                            width: 100%; 
                            padding: 8px; 
                            border: 1px solid #ddd; 
                            border-radius: 4px;
                        ">
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 12px; color: #666;">
                        <strong>📊 系統資訊：</strong><br>
                        瀏覽器：${navigator.userAgent.split(' ')[0]}<br>
                        版本：宮廟軟體 v2.0.0<br>
                        時間：${new Date().toLocaleString('zh-TW')}
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="submitFeedback()" style="
                            background: #007bff; 
                            color: white; 
                            border: none; 
                            padding: 12px 25px; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            cursor: pointer;
                            margin-right: 10px;
                        ">📤 提交回報</button>
                        
                        <button onclick="closeFeedbackDialog()" style="
                            background: #6c757d; 
                            color: white; 
                            border: none; 
                            padding: 12px 25px; 
                            border-radius: 8px; 
                            cursor: pointer;
                        ">取消</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    }

    /**
     * 提交用戶反饋
     */
    submitFeedback() {
        const type = document.getElementById('issue-type').value;
        const description = document.getElementById('issue-description').value;
        const contact = document.getElementById('contact-info').value;
        
        if (!description.trim()) {
            alert('請填寫問題描述');
            return;
        }
        
        const feedback = {
            id: `feedback_${Date.now()}`,
            type: type,
            description: description,
            contact: contact,
            timestamp: new Date().toISOString(),
            systemInfo: this.collectSystemInfo(),
            recentErrors: this.errorLog.slice(-5) // 最近5個錯誤
        };
        
        this.userReports.push(feedback);
        this.saveFeedbackToStorage(feedback);
        
        // 關閉對話框
        this.closeFeedbackDialog();
        
        // 顯示感謝訊息
        this.showThankYouMessage();
        
        console.log('📤 用戶反饋已提交', feedback);
    }

    /**
     * 儲存反饋到本地
     */
    saveFeedbackToStorage(feedback) {
        try {
            const existingFeedback = JSON.parse(localStorage.getItem('user-feedback') || '[]');
            existingFeedback.push(feedback);
            localStorage.setItem('user-feedback', JSON.stringify(existingFeedback));
        } catch (error) {
            console.error('儲存反饋失敗:', error);
        }
    }

    /**
     * 顯示感謝訊息
     */
    showThankYouMessage() {
        const messageHTML = `
            <div id="thank-you-message" style="
                position: fixed; 
                top: 20px; right: 20px; 
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 20px; 
                border-radius: 10px; 
                max-width: 300px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10002;
            ">
                <div style="font-size: 24px; text-align: center; margin-bottom: 10px;">🙏</div>
                <div style="font-weight: bold; text-align: center; margin-bottom: 10px;">
                    感謝您的反饋！
                </div>
                <div style="font-size: 14px; text-align: center;">
                    我們會儘快處理您的問題<br>
                    並持續改善軟體品質
                </div>
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="closeThankYouMessage()" style="
                        background: rgba(255,255,255,0.2); 
                        color: white; 
                        border: 1px solid rgba(255,255,255,0.3); 
                        padding: 8px 15px; 
                        border-radius: 5px; 
                        cursor: pointer;
                    ">關閉</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', messageHTML);
        
        setTimeout(() => {
            const message = document.getElementById('thank-you-message');
            if (message) message.remove();
        }, 5000);
    }

    /**
     * 開始健康監控
     */
    startHealthMonitoring() {
        // 每30秒檢查一次關鍵功能
        setInterval(() => {
            this.performQuickHealthCheck();
        }, 30000);
        
        // 每5分鐘檢查用戶活動狀況
        setInterval(() => {
            this.checkUserActivity();
        }, 300000);
    }

    /**
     * 快速健康檢查
     */
    async performQuickHealthCheck() {
        try {
            // 檢查發財金類別
            const facaiExists = this.checkFacaiCategoryExists();
            if (!facaiExists) {
                console.log('⚠️ 快速檢查：發財金類別遺失');
                if (window.emergencyFixCategories) {
                    window.emergencyFixCategories();
                }
            }
            
            // 檢查 IndexedDB 狀態
            if (window.offlineStorage && !window.offlineStorage.isInitialized) {
                console.log('⚠️ 快速檢查：IndexedDB未初始化');
            }
            
        } catch (error) {
            console.warn('快速健康檢查失敗:', error);
        }
    }

    /**
     * 檢查發財金類別是否存在
     */
    checkFacaiCategoryExists() {
        const keys = ['custom-income-categories', 'temple-default-custom-income-categories'];
        
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

    /**
     * 檢查用戶活動
     */
    checkUserActivity() {
        const now = Date.now();
        const lastActivity = localStorage.getItem('last-user-activity');
        
        if (lastActivity) {
            const timeSinceActivity = now - parseInt(lastActivity);
            // 如果超過1小時無活動，執行預防性檢查
            if (timeSinceActivity > 3600000) {
                this.performQuickHealthCheck();
            }
        }
        
        localStorage.setItem('last-user-activity', now.toString());
    }

    /**
     * 取得支援統計
     */
    getSupportStats() {
        return {
            totalErrors: this.errorLog.length,
            totalReports: this.userReports.length,
            recentErrors: this.errorLog.filter(e => 
                new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length,
            knownIssueCount: this.knownIssues.length,
            autoFixEnabled: this.autoFixEnabled
        };
    }

    // 關閉對話框函數
    closeSolutionDialog() {
        const dialog = document.getElementById('solution-dialog');
        if (dialog) dialog.remove();
    }

    closeFeedbackDialog() {
        const dialog = document.getElementById('feedback-dialog');
        if (dialog) dialog.remove();
    }

    closeThankYouMessage() {
        const message = document.getElementById('thank-you-message');
        if (message) message.remove();
    }
}

// 全局函數供HTML調用
window.executeAutoFixFromDialog = function(issueId) {
    window.userSupport.executeAutoFix(window.userSupport.knownIssues.find(i => i.id === issueId));
    window.userSupport.closeSolutionDialog();
};

window.openSolutionPage = function(action) {
    if (action.endsWith('.html')) {
        window.open(action, '_blank');
    } else {
        alert('請聯絡技術支援');
    }
    window.userSupport.closeSolutionDialog();
};

window.submitFeedback = function() {
    window.userSupport.submitFeedback();
};

window.closeSolutionDialog = function() {
    window.userSupport.closeSolutionDialog();
};

window.closeFeedbackDialog = function() {
    window.userSupport.closeFeedbackDialog();
};

window.closeThankYouMessage = function() {
    window.userSupport.closeThankYouMessage();
};

// 創建全局用戶支援系統
window.userSupport = new UserSupportSystem(); 