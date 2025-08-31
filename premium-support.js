/**
 * 付費用戶優先支援系統
 * 為付費用戶提供更好的支援體驗和問題解決
 */

class PremiumSupportSystem {
    constructor() {
        this.supportLevels = {
            'free': {
                name: '基礎支援',
                responseTime: '48小時',
                channels: ['GitHub Issues', '線上文檔'],
                features: ['社群支援', '常見問題'],
                priority: 'low'
            },
            'premium': {
                name: '進階支援',
                responseTime: '24小時',
                channels: ['Email', 'GitHub Issues', '線上文檔'],
                features: ['Email支援', '優先處理', '功能指導'],
                priority: 'medium'
            },
            'professional': {
                name: '專業支援',
                responseTime: '4小時',
                channels: ['專屬熱線', 'Email', '即時通訊'],
                features: ['24/7支援', '遠端協助', '客製化服務', '專屬客戶經理'],
                priority: 'high'
            }
        };
        
        this.currentUserTier = 'free';
        this.supportTickets = [];
        this.escalationRules = [];
        
        this.initializePremiumSupport();
    }

    /**
     * 初始化付費支援系統
     */
    initializePremiumSupport() {
        this.detectUserTier();
        this.setupEscalationRules();
        this.addPremiumSupportUI();
        console.log(`✅ 付費支援系統已啟動 - 當前等級: ${this.currentUserTier}`);
    }

    /**
     * 檢測用戶等級
     */
    detectUserTier() {
        if (window.donationManager) {
            this.currentUserTier = window.donationManager.getCurrentTier();
        } else {
            // 檢查localStorage中的贊助記錄
            const donations = localStorage.getItem('temple-donations');
            if (donations) {
                try {
                    const donationHistory = JSON.parse(donations);
                    const activeDonation = donationHistory.find(d => 
                        d.status === 'active' && 
                        new Date(d.expiresAt) > new Date()
                    );
                    
                    if (activeDonation) {
                        this.currentUserTier = activeDonation.tier;
                    }
                } catch (error) {
                    console.warn('檢測用戶等級失敗:', error);
                }
            }
        }
    }

    /**
     * 設置問題升級規則
     */
    setupEscalationRules() {
        this.escalationRules = [
            {
                condition: (error) => error.message.includes('IndexedDB') || error.message.includes('database'),
                action: 'immediate',
                reason: '資料庫問題影響核心功能'
            },
            {
                condition: (error) => error.message.includes('發財金') || error.message.includes('類別'),
                action: 'priority',
                reason: '類別問題影響用戶體驗'
            },
            {
                condition: (error) => this.currentUserTier === 'professional',
                action: 'immediate',
                reason: '專業版用戶享有即時支援'
            },
            {
                condition: (error) => this.currentUserTier === 'premium',
                action: 'priority',
                reason: '進階版用戶享有優先支援'
            }
        ];
    }

    /**
     * 處理付費用戶問題
     */
    handlePremiumUserIssue(error, issueType) {
        const userLevel = this.supportLevels[this.currentUserTier];
        const escalation = this.checkEscalation(error);
        
        const ticket = {
            id: `ticket_${Date.now()}`,
            userId: this.getUserId(),
            userTier: this.currentUserTier,
            issueType: issueType,
            error: error,
            escalation: escalation,
            timestamp: new Date().toISOString(),
            status: 'open',
            priority: escalation.action === 'immediate' ? 'critical' : 
                     escalation.action === 'priority' ? 'high' : userLevel.priority
        };
        
        this.supportTickets.push(ticket);
        this.saveSupportTicket(ticket);
        
        // 根據用戶等級提供不同的支援
        this.provideTieredSupport(ticket);
        
        return ticket;
    }

    /**
     * 檢查問題升級
     */
    checkEscalation(error) {
        for (const rule of this.escalationRules) {
            if (rule.condition(error)) {
                return {
                    action: rule.action,
                    reason: rule.reason,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        return {
            action: 'normal',
            reason: '一般問題處理',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 提供分級支援
     */
    provideTieredSupport(ticket) {
        const userLevel = this.supportLevels[this.currentUserTier];
        
        switch (this.currentUserTier) {
            case 'professional':
                this.provideProfessionalSupport(ticket);
                break;
            case 'premium':
                this.providePremiumSupport(ticket);
                break;
            default:
                this.provideBasicSupport(ticket);
        }
    }

    /**
     * 專業版支援
     */
    provideProfessionalSupport(ticket) {
        this.showPremiumSupportDialog({
            title: '🌟 專業版即時支援',
            message: `
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>🎊 專業版用戶專享服務</h4>
                    <ul style="text-align: left;">
                        <li>⚡ 4小時內回應</li>
                        <li>📞 專屬客服熱線</li>
                        <li>🖥️ 遠端協助服務</li>
                        <li>👨‍💼 專屬客戶經理</li>
                        <li>🛠️ 客製化解決方案</li>
                    </ul>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>📋 您的問題已記錄：</strong><br>
                    工單編號：${ticket.id}<br>
                    優先等級：${ticket.priority}<br>
                    預計回應：${userLevel.responseTime}內
                </div>
            `,
            actions: [
                { text: '📞 聯絡客服', action: () => this.contactPremiumSupport(ticket) },
                { text: '🔧 自動診斷', action: () => this.runAutoDiagnostic(ticket) },
                { text: '📧 Email支援', action: () => this.sendEmailSupport(ticket) }
            ]
        });
    }

    /**
     * 進階版支援
     */
    providePremiumSupport(ticket) {
        this.showPremiumSupportDialog({
            title: '🧧 進階版優先支援',
            message: `
                <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>🎁 進階版用戶服務</h4>
                    <ul style="text-align: left;">
                        <li>⏰ 24小時內回應</li>
                        <li>📧 Email優先支援</li>
                        <li>📋 功能使用指導</li>
                        <li>🔧 問題優先處理</li>
                    </ul>
                </div>
                
                <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>📋 您的問題已記錄：</strong><br>
                    工單編號：${ticket.id}<br>
                    優先等級：${ticket.priority}<br>
                    預計回應：${userLevel.responseTime}內
                </div>
            `,
            actions: [
                { text: '📧 Email支援', action: () => this.sendEmailSupport(ticket) },
                { text: '🔧 自動診斷', action: () => this.runAutoDiagnostic(ticket) },
                { text: '📚 查看文檔', action: () => this.openDocumentation() }
            ]
        });
    }

    /**
     * 基礎版支援
     */
    provideBasicSupport(ticket) {
        this.showPremiumSupportDialog({
            title: '🆓 基礎版社群支援',
            message: `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>📝 基礎版用戶服務</h4>
                    <ul style="text-align: left;">
                        <li>📚 線上說明文件</li>
                        <li>❓ 常見問題解答</li>
                        <li>👥 GitHub社群支援</li>
                        <li>🔧 自助修復工具</li>
                    </ul>
                </div>
                
                <div style="background: #e2e3e5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>📋 您的問題已記錄：</strong><br>
                    工單編號：${ticket.id}<br>
                    預計回應：${userLevel.responseTime}內
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>💡 升級建議：</strong><br>
                    升級到進階版可享有Email支援和優先處理<br>
                    升級到專業版可享有即時客服和遠端協助
                </div>
            `,
            actions: [
                { text: '🔧 自動診斷', action: () => this.runAutoDiagnostic(ticket) },
                { text: '📚 查看文檔', action: () => this.openDocumentation() },
                { text: '🧧 升級支援', action: () => this.showUpgradeOptions() }
            ]
        });
    }

    /**
     * 顯示付費支援對話框
     */
    showPremiumSupportDialog({ title, message, actions }) {
        const dialogHTML = `
            <div id="premium-support-dialog" style="
                position: fixed; 
                top: 0; left: 0; 
                width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); 
                z-index: 10003;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: white;
                    padding: 30px; 
                    border-radius: 15px; 
                    max-width: 600px; 
                    width: 90%;
                    text-align: center;
                ">
                    <h2 style="color: #8b4513; margin-bottom: 20px;">${title}</h2>
                    
                    ${message}
                    
                    <div style="margin-top: 25px;">
                        ${actions.map(action => `
                            <button onclick="${action.action.name}(); closePremiumDialog();" style="
                                background: #d4af37; 
                                color: white; 
                                border: none; 
                                padding: 12px 20px; 
                                border-radius: 8px; 
                                font-weight: bold; 
                                cursor: pointer;
                                margin: 5px;
                            ">${action.text}</button>
                        `).join('')}
                        
                        <button onclick="closePremiumDialog()" style="
                            background: #6c757d; 
                            color: white; 
                            border: none; 
                            padding: 12px 20px; 
                            border-radius: 8px; 
                            cursor: pointer;
                            margin: 5px;
                        ">關閉</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    }

    /**
     * 執行自動診斷
     */
    runAutoDiagnostic(ticket) {
        window.open('system-health-dashboard.html', '_blank');
    }

    /**
     * 開啟說明文檔
     */
    openDocumentation() {
        window.open('宮廟軟體使用指南.md', '_blank');
    }

    /**
     * 顯示升級選項
     */
    showUpgradeOptions() {
        window.open('donation-demo.html', '_blank');
    }

    /**
     * 聯絡付費支援
     */
    contactPremiumSupport(ticket) {
        const supportInfo = `
付費用戶支援聯絡資訊：

📧 Email: support@temple-software.com (請填入實際Email)
📞 專屬熱線: 0800-123-456 (請填入實際電話)
💬 即時通訊: LINE ID @temple-support (請填入實際LINE)

📋 工單資訊：
工單編號: ${ticket.id}
用戶等級: ${this.currentUserTier}
問題類型: ${ticket.issueType}
優先等級: ${ticket.priority}

請提供上述工單編號以獲得快速服務。
        `;
        
        alert(supportInfo);
    }

    /**
     * 發送Email支援
     */
    sendEmailSupport(ticket) {
        const subject = encodeURIComponent(`宮廟軟體支援 - 工單 ${ticket.id}`);
        const body = encodeURIComponent(`
工單編號：${ticket.id}
用戶等級：${this.currentUserTier}
問題描述：${ticket.error.message}

系統資訊：
瀏覽器：${navigator.userAgent}
時間：${new Date().toLocaleString('zh-TW')}
網址：${window.location.href}

請協助處理此問題，謝謝！
        `);
        
        window.open(`mailto:support@temple-software.com?subject=${subject}&body=${body}`);
    }

    /**
     * 儲存支援工單
     */
    saveSupportTicket(ticket) {
        try {
            const existingTickets = JSON.parse(localStorage.getItem('support-tickets') || '[]');
            existingTickets.push(ticket);
            localStorage.setItem('support-tickets', JSON.stringify(existingTickets));
        } catch (error) {
            console.error('儲存支援工單失敗:', error);
        }
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
     * 添加付費支援UI
     */
    addPremiumSupportUI() {
        // 根據用戶等級顯示不同的支援選項
        setTimeout(() => {
            this.addSupportWidget();
        }, 5000);
    }

    /**
     * 添加支援小工具
     */
    addSupportWidget() {
        if (document.getElementById('premium-support-widget')) return;
        
        const userLevel = this.supportLevels[this.currentUserTier];
        
        const widget = document.createElement('div');
        widget.id = 'premium-support-widget';
        widget.style.cssText = `
            position: fixed;
            bottom: 140px;
            right: 20px;
            background: ${this.currentUserTier === 'professional' ? '#dc3545' : 
                       this.currentUserTier === 'premium' ? '#d4af37' : '#28a745'};
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9997;
            max-width: 250px;
            font-size: 14px;
        `;
        
        widget.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">
                ${userLevel.name}
            </div>
            <div style="font-size: 12px; margin-bottom: 10px;">
                回應時間: ${userLevel.responseTime}
            </div>
            <button onclick="window.premiumSupport.showSupportOptions()" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                width: 100%;
            ">📞 聯絡支援</button>
        `;
        
        document.body.appendChild(widget);
    }

    /**
     * 顯示支援選項
     */
    showSupportOptions() {
        const userLevel = this.supportLevels[this.currentUserTier];
        
        const optionsHTML = `
            <div id="support-options-dialog" style="
                position: fixed; 
                top: 0; left: 0; 
                width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); 
                z-index: 10004;
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
                    <h3 style="margin-top: 0; color: #8b4513;">📞 ${userLevel.name}</h3>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <strong>🎯 可用支援管道：</strong><br>
                        ${userLevel.channels.map(channel => `• ${channel}`).join('<br>')}
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <strong>✨ 支援功能：</strong><br>
                        ${userLevel.features.map(feature => `• ${feature}`).join('<br>')}
                    </div>
                    
                    <div style="margin-top: 20px;">
                        ${this.currentUserTier !== 'free' ? `
                        <button onclick="window.premiumSupport.contactPremiumSupport()" style="
                            background: #d4af37; 
                            color: white; 
                            border: none; 
                            padding: 12px 20px; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            cursor: pointer;
                            margin: 5px;
                        ">📞 聯絡專屬支援</button>
                        ` : ''}
                        
                        <button onclick="window.open('system-health-dashboard.html', '_blank')" style="
                            background: #007bff; 
                            color: white; 
                            border: none; 
                            padding: 12px 20px; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            cursor: pointer;
                            margin: 5px;
                        ">🔍 系統診斷</button>
                        
                        <button onclick="closeSupportOptionsDialog()" style="
                            background: #6c757d; 
                            color: white; 
                            border: none; 
                            padding: 12px 20px; 
                            border-radius: 8px; 
                            cursor: pointer;
                            margin: 5px;
                        ">關閉</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', optionsHTML);
    }

    /**
     * 取得支援統計
     */
    getSupportStats() {
        return {
            currentTier: this.currentUserTier,
            supportLevel: this.supportLevels[this.currentUserTier],
            totalTickets: this.supportTickets.length,
            openTickets: this.supportTickets.filter(t => t.status === 'open').length,
            escalatedTickets: this.supportTickets.filter(t => t.escalation.action !== 'normal').length
        };
    }

    // 關閉對話框
    closePremiumDialog() {
        const dialog = document.getElementById('premium-support-dialog');
        if (dialog) dialog.remove();
    }

    closeSupportOptionsDialog() {
        const dialog = document.getElementById('support-options-dialog');
        if (dialog) dialog.remove();
    }
}

// 全局函數
window.closePremiumDialog = function() {
    window.premiumSupport.closePremiumDialog();
};

window.closeSupportOptionsDialog = function() {
    window.premiumSupport.closeSupportOptionsDialog();
};

// 創建全局付費支援系統
window.premiumSupport = new PremiumSupportSystem(); 