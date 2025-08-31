/**
 * 廣清宮記帳軟體 - 個人資料保護系統
 * 符合台灣個人資料保護法規範
 */

class PrivacyProtectionManager {
    constructor() {
        this.encryptionKey = null;
        this.auditLog = [];
        this.consentRecords = new Map();
        this.dataRetentionPeriod = 365 * 5; // 5年保存期限
        this.initializeProtection();
    }

    /**
     * 初始化個資保護系統
     */
    async initializeProtection() {
        try {
            // 生成或載入加密金鑰
            await this.generateEncryptionKey();
            
            // 初始化審計日誌
            this.initializeAuditLog();
            
            // 載入同意記錄
            await this.loadConsentRecords();
            
            console.log('✅ 個資保護系統初始化完成');
        } catch (error) {
            console.error('❌ 個資保護系統初始化失敗:', error);
        }
    }

    /**
     * 生成加密金鑰
     */
    async generateEncryptionKey() {
        try {
            // 檢查是否已有金鑰
            const existingKey = localStorage.getItem('privacy-encryption-key');
            if (existingKey) {
                this.encryptionKey = existingKey;
                return;
            }

            // 生成新的加密金鑰
            const key = await this.generateSecureKey();
            this.encryptionKey = key;
            
            // 安全儲存金鑰（實際部署時應使用更安全的方式）
            localStorage.setItem('privacy-encryption-key', key);
            
            this.logActivity('system', 'encryption_key_generated', '生成新的加密金鑰');
        } catch (error) {
            console.error('生成加密金鑰失敗:', error);
            throw error;
        }
    }

    /**
     * 生成安全的加密金鑰
     */
    async generateSecureKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 加密個人資料
     */
    encryptPersonalData(data) {
        try {
            if (!data || typeof data !== 'object') {
                return data;
            }

            const sensitiveFields = [
                'name', 'phone', 'address', 'email', 'idNumber',
                'believerName', 'contactInfo', 'personalInfo'
            ];

            const encrypted = { ...data };
            
            for (const field of sensitiveFields) {
                if (encrypted[field]) {
                    encrypted[field] = this.encrypt(encrypted[field].toString());
                    encrypted[`${field}_encrypted`] = true;
                }
            }

            // 記錄加密操作
            this.logActivity('system', 'data_encrypted', `加密個人資料: ${Object.keys(data).join(', ')}`);
            
            return encrypted;
        } catch (error) {
            console.error('加密個人資料失敗:', error);
            return data;
        }
    }

    /**
     * 解密個人資料
     */
    decryptPersonalData(data) {
        try {
            if (!data || typeof data !== 'object') {
                return data;
            }

            const decrypted = { ...data };
            
            for (const key in decrypted) {
                if (key.endsWith('_encrypted') && decrypted[key] === true) {
                    const fieldName = key.replace('_encrypted', '');
                    if (decrypted[fieldName]) {
                        decrypted[fieldName] = this.decrypt(decrypted[fieldName]);
                        delete decrypted[key];
                    }
                }
            }

            return decrypted;
        } catch (error) {
            console.error('解密個人資料失敗:', error);
            return data;
        }
    }

    /**
     * 簡單加密函數（實際應用中建議使用更強的加密算法）
     */
    encrypt(text) {
        if (!this.encryptionKey || !text) return text;
        
        let encrypted = '';
        for (let i = 0; i < text.length; i++) {
            const keyIndex = i % this.encryptionKey.length;
            const keyChar = this.encryptionKey.charCodeAt(keyIndex);
            const textChar = text.charCodeAt(i);
            encrypted += String.fromCharCode((textChar + keyChar) % 65536);
        }
        return btoa(encrypted);
    }

    /**
     * 簡單解密函數
     */
    decrypt(encryptedText) {
        if (!this.encryptionKey || !encryptedText) return encryptedText;
        
        try {
            const encrypted = atob(encryptedText);
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                const keyIndex = i % this.encryptionKey.length;
                const keyChar = this.encryptionKey.charCodeAt(keyIndex);
                const encryptedChar = encrypted.charCodeAt(i);
                decrypted += String.fromCharCode((encryptedChar - keyChar + 65536) % 65536);
            }
            return decrypted;
        } catch (error) {
            console.error('解密失敗:', error);
            return encryptedText;
        }
    }

    /**
     * 記錄同意書
     */
    recordConsent(dataSubject, purpose, consentType = 'explicit') {
        const consentId = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const consent = {
            id: consentId,
            dataSubject: dataSubject,
            purpose: purpose,
            consentType: consentType,
            timestamp: new Date().toISOString(),
            ipAddress: 'local', // 本地應用
            userAgent: navigator.userAgent,
            status: 'active',
            withdrawable: true
        };

        this.consentRecords.set(consentId, consent);
        this.saveConsentRecords();
        
        this.logActivity(dataSubject, 'consent_recorded', `記錄同意書: ${purpose}`);
        
        return consentId;
    }

    /**
     * 撤回同意
     */
    withdrawConsent(consentId, reason = '') {
        if (this.consentRecords.has(consentId)) {
            const consent = this.consentRecords.get(consentId);
            consent.status = 'withdrawn';
            consent.withdrawnAt = new Date().toISOString();
            consent.withdrawReason = reason;
            
            this.saveConsentRecords();
            this.logActivity(consent.dataSubject, 'consent_withdrawn', `撤回同意: ${consent.purpose}`);
            
            return true;
        }
        return false;
    }

    /**
     * 檢查同意狀態
     */
    checkConsentStatus(dataSubject, purpose) {
        for (const [id, consent] of this.consentRecords) {
            if (consent.dataSubject === dataSubject && 
                consent.purpose === purpose && 
                consent.status === 'active') {
                return { valid: true, consentId: id, consent: consent };
            }
        }
        return { valid: false };
    }

    /**
     * 資料匿名化處理
     */
    anonymizeData(data) {
        const anonymized = { ...data };
        
        // 移除直接識別資料
        delete anonymized.name;
        delete anonymized.phone;
        delete anonymized.address;
        delete anonymized.email;
        delete anonymized.idNumber;
        
        // 部分遮蔽處理
        if (anonymized.believerName) {
            anonymized.believerName = this.maskName(anonymized.believerName);
        }
        
        // 添加匿名化標記
        anonymized.anonymized = true;
        anonymized.anonymizedAt = new Date().toISOString();
        
        this.logActivity('system', 'data_anonymized', '資料匿名化處理');
        
        return anonymized;
    }

    /**
     * 姓名遮蔽處理
     */
    maskName(name) {
        if (!name || name.length < 2) return '***';
        
        if (name.length === 2) {
            return name.charAt(0) + '*';
        } else {
            return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
        }
    }

    /**
     * 資料保存期限檢查
     */
    checkDataRetention(data) {
        if (!data.createdAt) return { shouldRetain: true };
        
        const createdDate = new Date(data.createdAt);
        const currentDate = new Date();
        const daysDiff = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
        
        const shouldRetain = daysDiff < this.dataRetentionPeriod;
        
        if (!shouldRetain) {
            this.logActivity('system', 'data_retention_expired', `資料保存期限已到期: ${data.id || 'unknown'}`);
        }
        
        return {
            shouldRetain: shouldRetain,
            daysSinceCreation: daysDiff,
            daysUntilExpiry: this.dataRetentionPeriod - daysDiff
        };
    }

    /**
     * 自動清理過期資料
     */
    cleanupExpiredData() {
        const records = JSON.parse(localStorage.getItem('temple-records') || '[]');
        const believers = JSON.parse(localStorage.getItem('temple-believers') || '[]');
        
        const validRecords = records.filter(record => {
            const retention = this.checkDataRetention(record);
            return retention.shouldRetain;
        });
        
        const validBelievers = believers.filter(believer => {
            const retention = this.checkDataRetention(believer);
            return retention.shouldRetain;
        });
        
        const deletedRecords = records.length - validRecords.length;
        const deletedBelievers = believers.length - validBelievers.length;
        
        if (deletedRecords > 0 || deletedBelievers > 0) {
            localStorage.setItem('temple-records', JSON.stringify(validRecords));
            localStorage.setItem('temple-believers', JSON.stringify(validBelievers));
            
            this.logActivity('system', 'data_cleanup', `清理過期資料: ${deletedRecords} 筆記錄, ${deletedBelievers} 筆信眾資料`);
        }
        
        return { deletedRecords, deletedBelievers };
    }

    /**
     * 初始化審計日誌
     */
    initializeAuditLog() {
        const existingLog = localStorage.getItem('privacy-audit-log');
        if (existingLog) {
            this.auditLog = JSON.parse(existingLog);
        }
    }

    /**
     * 記錄活動日誌
     */
    logActivity(user, action, description, additionalData = {}) {
        const logEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            user: user,
            action: action,
            description: description,
            ipAddress: 'local',
            userAgent: navigator.userAgent,
            additionalData: additionalData
        };

        this.auditLog.push(logEntry);
        
        // 保持日誌數量在合理範圍內（最多10000條）
        if (this.auditLog.length > 10000) {
            this.auditLog = this.auditLog.slice(-8000);
        }
        
        this.saveAuditLog();
    }

    /**
     * 儲存審計日誌
     */
    saveAuditLog() {
        localStorage.setItem('privacy-audit-log', JSON.stringify(this.auditLog));
    }

    /**
     * 載入同意記錄
     */
    async loadConsentRecords() {
        const records = localStorage.getItem('privacy-consent-records');
        if (records) {
            const parsed = JSON.parse(records);
            this.consentRecords = new Map(Object.entries(parsed));
        }
    }

    /**
     * 儲存同意記錄
     */
    saveConsentRecords() {
        const obj = Object.fromEntries(this.consentRecords);
        localStorage.setItem('privacy-consent-records', JSON.stringify(obj));
    }

    /**
     * 獲取個資保護狀態報告
     */
    getPrivacyReport() {
        const totalRecords = JSON.parse(localStorage.getItem('temple-records') || '[]').length;
        const totalBelievers = JSON.parse(localStorage.getItem('temple-believers') || '[]').length;
        const totalConsents = this.consentRecords.size;
        const activeConsents = Array.from(this.consentRecords.values()).filter(c => c.status === 'active').length;
        
        return {
            totalPersonalDataRecords: totalRecords + totalBelievers,
            totalRecords: totalRecords,
            totalBelievers: totalBelievers,
            totalConsents: totalConsents,
            activeConsents: activeConsents,
            auditLogEntries: this.auditLog.length,
            encryptionEnabled: !!this.encryptionKey,
            lastCleanup: localStorage.getItem('last-privacy-cleanup'),
            dataRetentionPeriod: `${Math.floor(this.dataRetentionPeriod / 365)} 年`,
            complianceStatus: this.checkComplianceStatus()
        };
    }

    /**
     * 檢查合規狀態
     */
    checkComplianceStatus() {
        const issues = [];
        
        if (!this.encryptionKey) {
            issues.push('未啟用資料加密');
        }
        
        if (this.auditLog.length === 0) {
            issues.push('缺少審計日誌記錄');
        }
        
        if (this.consentRecords.size === 0) {
            issues.push('缺少同意書記錄');
        }
        
        return {
            compliant: issues.length === 0,
            issues: issues,
            score: Math.max(0, 100 - (issues.length * 25))
        };
    }

    /**
     * 導出個資處理清單
     */
    exportDataInventory() {
        const records = JSON.parse(localStorage.getItem('temple-records') || '[]');
        const believers = JSON.parse(localStorage.getItem('temple-believers') || '[]');
        
        const inventory = {
            exportedAt: new Date().toISOString(),
            dataCategories: {
                financialRecords: {
                    count: records.length,
                    personalDataFields: ['信眾姓名', '聯絡資訊', '捐款金額', '參與活動'],
                    purpose: '宮廟財務管理與信眾服務',
                    legalBasis: '履行宗教組織法定義務',
                    retentionPeriod: '5年'
                },
                believerProfiles: {
                    count: believers.length,
                    personalDataFields: ['姓名', '電話', '地址', '參與記錄'],
                    purpose: '信眾服務與聯繫',
                    legalBasis: '基於當事人同意',
                    retentionPeriod: '5年'
                }
            },
            securityMeasures: [
                '資料加密儲存',
                '存取權限控制',
                '審計日誌記錄',
                '定期資料清理',
                '同意書管理'
            ],
            complianceFramework: '台灣個人資料保護法'
        };
        
        this.logActivity('system', 'data_inventory_exported', '導出個資處理清單');
        
        return inventory;
    }
}

// 創建全局個資保護管理器實例
window.privacyManager = new PrivacyProtectionManager(); 