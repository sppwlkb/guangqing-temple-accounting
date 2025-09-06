/**
 * 宮廟軟體紅包贊助系統
 * 以宮廟文化特色的方式實現功能分級
 */

class DonationManager {
    constructor() {
        this.featureTiers = {
            // 🆓 基礎功能 - 完全免費
            free: {
                name: '基礎功能',
                description: '適合小型宮廟的基本記帳需求',
                price: 0,
                features: [
                    '基本收支記錄',
                    '簡單分類管理', 
                    '基礎報表查看',
                    '信眾基本資料',
                    '個資保護功能',
                    '本地資料儲存'
                ],
                limits: {
                    maxRecords: 1000,
                    maxBelievers: 200,
                    maxUsers: 1,
                    reportHistory: 30 // 天
                }
            },
            
            // 🧧 進階功能 - 小紅包解鎖
            premium: {
                name: '進階功能',
                description: '更豐富的管理功能，適合中型宮廟',
                price: 888, // 吉利數字
                duration: 365, // 天
                features: [
                    '✨ 所有基礎功能',
                    '📊 進階統計報表',
                    '☁️ Firebase雲端同步',
                    '👥 多使用者管理',
                    '🔔 智能提醒功能',
                    '📱 手機App功能',
                    '💾 自動備份',
                    '🎨 主題自訂'
                ],
                limits: {
                    maxRecords: 10000,
                    maxBelievers: 2000,
                    maxUsers: 5,
                    reportHistory: 365
                }
            },
            
            // 🎊 專業功能 - 大紅包訂閱
            professional: {
                name: '專業功能',
                description: '完整的宮廟管理解決方案',
                price: 1688, // 一路發發
                duration: 365,
                features: [
                    '🌟 所有進階功能',
                    '📈 深度數據分析',
                    '🔗 第三方系統整合',
                    '📋 客製化報表',
                    '🛠️ 優先技術支援',
                    '📞 電話客服',
                    '💼 專屬客戶經理',
                    '🎓 使用者培訓'
                ],
                limits: {
                    maxRecords: -1, // 無限制
                    maxBelievers: -1,
                    maxUsers: -1,
                    reportHistory: -1
                }
            }
        };
        
        this.currentTier = 'free';
        this.donationHistory = [];
        this.trialPeriods = new Map();
        this.loadDonationData();
        this.initializeDonationSystem();
    }

    /**
     * 初始化贊助系統
     */
    initializeDonationSystem() {
        this.checkCurrentTier();
        this.setupTrialPeriods();
        console.log('🧧 紅包贊助系統初始化完成');
    }

    /**
     * 檢查當前功能等級
     */
    checkCurrentTier() {
        const donations = this.getDonationHistory();
        const now = new Date();
        
        // 檢查是否有有效的專業版贊助
        const validProfessional = donations.find(d => 
            d.tier === 'professional' && 
            new Date(d.expiresAt) > now
        );
        
        if (validProfessional) {
            this.currentTier = 'professional';
            return;
        }
        
        // 檢查是否有有效的進階版贊助
        const validPremium = donations.find(d => 
            d.tier === 'premium' && 
            new Date(d.expiresAt) > now
        );
        
        if (validPremium) {
            this.currentTier = 'premium';
            return;
        }
        
        this.currentTier = 'free';
    }

    /**
     * 設定試用期
     */
    setupTrialPeriods() {
        // 每個進階功能提供7天免費試用
        const trialFeatures = ['premium', 'professional'];
        
        trialFeatures.forEach(feature => {
            if (!this.trialPeriods.has(feature)) {
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + 7);
                this.trialPeriods.set(feature, {
                    started: new Date().toISOString(),
                    expires: trialEnd.toISOString(),
                    used: false
                });
            }
        });
        
        this.saveTrialData();
    }

    /**
     * 檢查功能是否可用
     */
    checkFeatureAccess(featureName) {
        const tier = this.getCurrentTier();
        const tierConfig = this.featureTiers[tier];
        
        // 檢查是否在功能列表中
        if (tierConfig.features.some(f => f.includes(featureName))) {
            return { allowed: true, tier: tier };
        }
        
        // 檢查是否在試用期
        const trial = this.checkTrialAccess(featureName);
        if (trial.inTrial) {
            return { 
                allowed: true, 
                tier: 'trial', 
                trialDaysLeft: trial.daysLeft 
            };
        }
        
        return { 
            allowed: false, 
            requiredTier: this.getRequiredTier(featureName),
            suggestedDonation: this.getSuggestedDonation(featureName)
        };
    }

    /**
     * 檢查試用期存取
     */
    checkTrialAccess(featureName) {
        const requiredTier = this.getRequiredTier(featureName);
        if (requiredTier === 'free') return { inTrial: false };
        
        const trial = this.trialPeriods.get(requiredTier);
        if (!trial || trial.used) return { inTrial: false };
        
        const now = new Date();
        const expiresAt = new Date(trial.expires);
        
        if (now > expiresAt) {
            trial.used = true;
            this.saveTrialData();
            return { inTrial: false };
        }
        
        const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        return { inTrial: true, daysLeft: daysLeft };
    }

    /**
     * 取得功能所需等級
     */
    getRequiredTier(featureName) {
        for (const [tier, config] of Object.entries(this.featureTiers)) {
            if (config.features.some(f => f.includes(featureName))) {
                return tier;
            }
        }
        return 'professional'; // 預設需要專業版
    }

    /**
     * 取得建議贊助金額
     */
    getSuggestedDonation(featureName) {
        const requiredTier = this.getRequiredTier(featureName);
        return this.featureTiers[requiredTier]?.price || 888;
    }

    /**
     * 顯示紅包邀請
     */
    showDonationInvite(featureName, context = {}) {
        const access = this.checkFeatureAccess(featureName);
        
        if (access.allowed) return true;
        
        const requiredTier = access.requiredTier;
        const tierConfig = this.featureTiers[requiredTier];
        
        // 創建溫馨的紅包邀請對話框
        const inviteHTML = `
            <div id="donation-invite" style="
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
                    background: linear-gradient(135deg, #fff8e1, #ffffff);
                    padding: 40px; 
                    border-radius: 20px; 
                    max-width: 500px; 
                    width: 90%;
                    text-align: center;
                    border: 3px solid #d4af37;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">🧧</div>
                    <h2 style="color: #8b4513; margin-bottom: 15px;">
                        感謝您使用宮廟記帳軟體！
                    </h2>
                    <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
                        您想要使用的「<strong>${featureName}</strong>」功能需要小小的紅包贊助，
                        這將幫助我們持續改善軟體，為更多宮廟提供服務。
                    </p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8b4513; margin-bottom: 15px;">${tierConfig.name}</h3>
                        <div style="font-size: 24px; color: #d4af37; font-weight: bold; margin-bottom: 10px;">
                            NT$ ${tierConfig.price} / 年
                        </div>
                        <div style="font-size: 14px; color: #666;">
                            ${tierConfig.description}
                        </div>
                        
                        <div style="text-align: left; margin-top: 15px;">
                            <strong>包含功能：</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                ${tierConfig.features.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <div style="font-size: 18px; margin-bottom: 10px;">🎁 特別優惠</div>
                        <div style="color: #28a745; font-weight: bold;">
                            現在贊助可享 7 天免費試用！
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <button onclick="startTrial('${requiredTier}')" style="
                            background: #28a745; 
                            color: white; 
                            border: none; 
                            padding: 12px 25px; 
                            border-radius: 8px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            cursor: pointer;
                            margin-right: 10px;
                        ">🎁 開始免費試用</button>
                        
                        <button onclick="showDonationMethods('${requiredTier}')" style="
                            background: #d4af37; 
                            color: white; 
                            border: none; 
                            padding: 12px 25px; 
                            border-radius: 8px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            cursor: pointer;
                            margin-right: 10px;
                        ">🧧 贊助支持</button>
                        
                        <button onclick="closeDonationInvite()" style="
                            background: #6c757d; 
                            color: white; 
                            border: none; 
                            padding: 12px 25px; 
                            border-radius: 8px; 
                            font-size: 16px; 
                            cursor: pointer;
                        ">稍後再說</button>
                    </div>
                    
                    <div style="margin-top: 20px; font-size: 12px; color: #999;">
                        💝 您的每一份贊助都是對開發團隊的鼓勵<br>
                        🙏 感恩您對宮廟軟體發展的支持
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', inviteHTML);
        return false; // 功能暫時不可用
    }

    /**
     * 開始試用
     */
    startTrial(tier) {
        const trial = this.trialPeriods.get(tier);
        if (trial && !trial.used) {
            trial.used = true;
            trial.actualStarted = new Date().toISOString();
            this.saveTrialData();
            
            // 臨時提升功能等級
            this.currentTier = tier;
            
            this.closeDonationInvite();
            
            const daysLeft = Math.ceil((new Date(trial.expires) - new Date()) / (1000 * 60 * 60 * 24));
            alert(`🎁 試用已開始！\n\n您現在可以使用 ${this.featureTiers[tier].name} 的所有功能\n試用期限：${daysLeft} 天\n\n感謝您的支持！`);
            
            // 記錄試用開始
            this.logDonationActivity('trial_started', tier, `開始試用 ${this.featureTiers[tier].name}`);
            
            return true;
        }
        
        alert('❌ 試用期已使用或已過期');
        return false;
    }

    /**
     * 顯示贊助方式
     */
    showDonationMethods(tier) {
        const tierConfig = this.featureTiers[tier];
        
        const methodsHTML = `
            <div id="donation-methods" style="
                position: fixed; 
                top: 0; left: 0; 
                width: 100%; height: 100%; 
                background: rgba(0,0,0,0.9); 
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: white;
                    padding: 40px; 
                    border-radius: 20px; 
                    max-width: 600px; 
                    width: 90%;
                    text-align: center;
                ">
                    <h2 style="color: #8b4513; margin-bottom: 20px;">
                        🧧 贊助 ${tierConfig.name}
                    </h2>
                    <div style="font-size: 32px; color: #d4af37; font-weight: bold; margin-bottom: 20px;">
                        NT$ ${tierConfig.price}
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8b4513; margin-bottom: 15px;">💳 贊助方式</h3>
                        
                        <div style="margin-bottom: 20px;">
                            <h4>🏦 銀行轉帳</h4>
                            <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                                <div><strong>銀行：</strong>請填入您的銀行資訊</div>
                                <div><strong>戶名：</strong>請填入戶名</div>
                                <div><strong>帳號：</strong>請填入帳號</div>
                                <div style="color: #d4af37; font-weight: bold;">轉帳後請提供後五碼驗證</div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4>📱 電子支付</h4>
                            <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                                <div>支援 LINE Pay、街口支付、Apple Pay 等</div>
                                <div style="color: #666; font-size: 14px;">（開發中，近期推出）</div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4>🧧 現金紅包</h4>
                            <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                                <div>親自送達或郵寄至開發團隊</div>
                                <div style="color: #666; font-size: 14px;">地址：（請提供實際地址）</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <div style="font-weight: bold; color: #856404;">📝 贊助後請聯絡我們</div>
                        <div style="color: #856404; font-size: 14px;">
                            請提供轉帳證明或贊助憑證，我們將為您開通功能
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <input type="text" id="donation-code" placeholder="請輸入贊助驗證碼（如有）" style="
                            width: 70%; 
                            padding: 10px; 
                            border: 1px solid #ddd; 
                            border-radius: 5px;
                            margin-right: 10px;
                        ">
                        <button onclick="verifyDonation('${tier}')" style="
                            background: #28a745; 
                            color: white; 
                            border: none; 
                            padding: 10px 20px; 
                            border-radius: 5px; 
                            font-weight: bold; 
                            cursor: pointer;
                        ">驗證</button>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <button onclick="closeDonationMethods()" style="
                            background: #6c757d; 
                            color: white; 
                            border: none; 
                            padding: 10px 20px; 
                            border-radius: 5px; 
                            cursor: pointer;
                        ">關閉</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', methodsHTML);
    }

    /**
     * 驗證贊助
     */
    verifyDonation(tier) {
        const code = document.getElementById('donation-code').value.trim();
        
        if (!code) {
            alert('請輸入贊助驗證碼');
            return;
        }
        
        // 簡單的驗證碼系統（實際應用中應該更安全）
        const validCodes = {
            'TEMPLE888': 'premium',
            'TEMPLE1688': 'professional',
            'GUANGQING2025': 'professional', // 給廣清宮的特別碼
            'BLESSING888': 'premium',
            'FORTUNE1688': 'professional'
        };
        
        if (validCodes[code.toUpperCase()] === tier) {
            this.activateDonation(tier, code);
            this.closeDonationMethods();
            alert(`🎉 贊助驗證成功！\n\n感謝您的支持！\n${this.featureTiers[tier].name} 已啟用\n有效期限：一年`);
        } else {
            alert('❌ 驗證碼無效或不符合所選功能等級\n\n請檢查驗證碼是否正確，或聯絡客服取得協助。');
        }
    }

    /**
     * 啟用贊助功能
     */
    activateDonation(tier, verificationCode) {
        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.featureTiers[tier].duration);
        
        const donation = {
            id: `donation_${Date.now()}`,
            tier: tier,
            amount: this.featureTiers[tier].price,
            verificationCode: verificationCode,
            activatedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            status: 'active'
        };
        
        this.donationHistory.push(donation);
        this.currentTier = tier;
        this.saveDonationData();
        
        this.logDonationActivity('donation_activated', tier, `啟用 ${this.featureTiers[tier].name}`);
        
        // 顯示感謝訊息
        this.showGratitudeMessage(tier);
    }

    /**
     * 顯示感謝訊息
     */
    showGratitudeMessage(tier) {
        const tierConfig = this.featureTiers[tier];
        
        setTimeout(() => {
            const gratitudeHTML = `
                <div id="gratitude-message" style="
                    position: fixed; 
                    top: 20px; right: 20px; 
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 20px; 
                    border-radius: 10px; 
                    max-width: 300px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 10000;
                    animation: slideIn 0.5s ease-out;
                ">
                    <div style="font-size: 24px; text-align: center; margin-bottom: 10px;">🙏</div>
                    <div style="font-weight: bold; text-align: center; margin-bottom: 10px;">
                        感恩您的贊助！
                    </div>
                    <div style="font-size: 14px; text-align: center;">
                        ${tierConfig.name} 已啟用<br>
                        願神明保佑您的宮廟興旺！
                    </div>
                    <div style="text-align: center; margin-top: 15px;">
                        <button onclick="closeGratitudeMessage()" style="
                            background: rgba(255,255,255,0.2); 
                            color: white; 
                            border: 1px solid rgba(255,255,255,0.3); 
                            padding: 8px 15px; 
                            border-radius: 5px; 
                            cursor: pointer;
                        ">關閉</button>
                    </div>
                </div>
                
                <style>
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                </style>
            `;
            
            document.body.insertAdjacentHTML('beforeend', gratitudeHTML);
            
            // 5秒後自動關閉
            setTimeout(() => {
                const message = document.getElementById('gratitude-message');
                if (message) message.remove();
            }, 5000);
        }, 500);
    }

    /**
     * 取得當前等級
     */
    getCurrentTier() {
        return this.currentTier;
    }

    /**
     * 取得贊助歷史
     */
    getDonationHistory() {
        return [...this.donationHistory];
    }

    /**
     * 取得功能狀態報告
     */
    getFeatureReport() {
        const currentTierConfig = this.featureTiers[this.currentTier];
        const activeDonation = this.donationHistory.find(d => 
            d.tier === this.currentTier && 
            new Date(d.expiresAt) > new Date()
        );
        
        return {
            currentTier: this.currentTier,
            tierName: currentTierConfig.name,
            features: currentTierConfig.features,
            limits: currentTierConfig.limits,
            expiresAt: activeDonation?.expiresAt,
            totalDonations: this.donationHistory.length,
            totalAmount: this.donationHistory.reduce((sum, d) => sum + d.amount, 0)
        };
    }

    /**
     * 載入贊助資料
     */
    loadDonationData() {
        const donations = localStorage.getItem('temple-donations');
        if (donations) {
            this.donationHistory = JSON.parse(donations);
        }
        
        const trials = localStorage.getItem('temple-trials');
        if (trials) {
            this.trialPeriods = new Map(Object.entries(JSON.parse(trials)));
        }
    }

    /**
     * 儲存贊助資料
     */
    saveDonationData() {
        localStorage.setItem('temple-donations', JSON.stringify(this.donationHistory));
    }

    /**
     * 儲存試用資料
     */
    saveTrialData() {
        const obj = Object.fromEntries(this.trialPeriods);
        localStorage.setItem('temple-trials', JSON.stringify(obj));
    }

    /**
     * 記錄贊助活動
     */
    logDonationActivity(action, tier, description) {
        if (window.privacyManager) {
            window.privacyManager.logActivity('donation_system', action, description, { tier });
        }
    }

    /**
     * 關閉對話框
     */
    closeDonationInvite() {
        const invite = document.getElementById('donation-invite');
        if (invite) invite.remove();
    }

    closeDonationMethods() {
        const methods = document.getElementById('donation-methods');
        if (methods) methods.remove();
    }

    closeGratitudeMessage() {
        const message = document.getElementById('gratitude-message');
        if (message) message.remove();
    }
}

// 全局函數供HTML調用
window.startTrial = function(tier) {
    window.donationManager.startTrial(tier);
};

window.showDonationMethods = function(tier) {
    window.donationManager.showDonationMethods(tier);
};

window.verifyDonation = function(tier) {
    window.donationManager.verifyDonation(tier);
};

window.closeDonationInvite = function() {
    window.donationManager.closeDonationInvite();
};

window.closeDonationMethods = function() {
    window.donationManager.closeDonationMethods();
};

window.closeGratitudeMessage = function() {
    window.donationManager.closeGratitudeMessage();
};

// 創建全局贊助管理器
window.donationManager = new DonationManager(); 