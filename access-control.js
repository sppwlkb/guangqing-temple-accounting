/**
 * 廣清宮記帳軟體 - 存取權限控制系統
 * 符合個人資料保護法的存取控制要求
 */

class AccessControlManager {
    constructor() {
        this.currentUser = null;
        this.userRoles = new Map();
        this.permissions = new Map();
        this.accessLog = [];
        this.initializeAccessControl();
    }

    /**
     * 初始化存取控制系統
     */
    initializeAccessControl() {
        this.setupDefaultRoles();
        this.loadUserData();
        this.setupPermissions();
        console.log('✅ 存取權限控制系統初始化完成');
    }

    /**
     * 設置預設角色
     */
    setupDefaultRoles() {
        // 根據公司人員名單設置角色
        const staffRoles = {
            // 管理層
            'A0001': { name: '魏自立', department: '總經理', role: 'admin', level: 'high' },
            
            // 管理部 - 負責個資管理
            'A0005': { name: '李佳芬', department: '管理部', role: 'data_manager', level: 'high' },
            'A0006': { name: '陳苡甄', department: '管理部', role: 'data_manager', level: 'medium' },
            'A0016': { name: '陳季青', department: '管理部', role: 'data_manager', level: 'medium' },
            'A0026': { name: '黃思婷', department: '管理部', role: 'data_manager', level: 'medium' },
            'A0058': { name: '何昱臻', department: '管理部', role: 'data_manager', level: 'medium' },
            'A0063': { name: '朱唯瑄', department: '管理部', role: 'data_manager', level: 'medium' },
            
            // 業務部 - 信眾資料維護
            'A0003': { name: '張勝紘', department: '業務部', role: 'believer_manager', level: 'medium' },
            'A0007': { name: '李尚俞', department: '業務部', role: 'believer_manager', level: 'medium' },
            'A0009': { name: '施博堅', department: '業務部主管', role: 'department_head', level: 'high' },
            
            // 客服部 - 信眾服務
            'A0015': { name: '湯敬驊', department: '客服部主管', role: 'department_head', level: 'high' },
            'A0035': { name: '林祐駿', department: '客服部', role: 'customer_service', level: 'low' },
            'A0057': { name: '張宇賢', department: '客服部', role: 'customer_service', level: 'low' },
            
            // 其他部門 - 限制存取
            'A0008': { name: '吳奕霖', department: '製造部', role: 'restricted', level: 'none' },
            'A0010': { name: '陳志威', department: '研發部', role: 'restricted', level: 'none' },
            'A0020': { name: '鄭義騰', department: '製造部', role: 'restricted', level: 'none' },
            'A0022': { name: '黃豐裕', department: '製造部主管', role: 'department_head', level: 'low' },
            'A0023': { name: '李政彥', department: '製造部', role: 'restricted', level: 'none' },
            'A0027': { name: '葛寰宸', department: '製造部', role: 'restricted', level: 'none' },
            'A0030': { name: '許智豪', department: '研發部', role: 'restricted', level: 'none' },
            'A0040': { name: '李仁佃', department: '製造部', role: 'restricted', level: 'none' },
            'A0042': { name: '莊福來', department: '研發部主管', role: 'department_head', level: 'low' },
            'A0050': { name: '張峻豪', department: '製造部', role: 'restricted', level: 'none' },
            'A0052': { name: '廖靖寧', department: '行銷部主管', role: 'department_head', level: 'medium' },
            'A0059': { name: '簡佳欣', department: '製造部', role: 'restricted', level: 'none' },
            
            // 膠藝所
            'A0028': { name: '陳宥瑄', department: '膠藝所', role: 'restricted', level: 'none' },
            'A0049': { name: '林裕峰', department: '膠藝所', role: 'restricted', level: 'none' },
            'A0054': { name: '潘韻如', department: '膠藝所', role: 'restricted', level: 'none' },
            'A0060': { name: '胡妤甄', department: '膠藝所', role: 'restricted', level: 'none' },
            'A0067': { name: '賴怡瑛', department: '膠藝所', role: 'restricted', level: 'none' }
        };

        // 儲存到 Map
        for (const [id, data] of Object.entries(staffRoles)) {
            this.userRoles.set(id, data);
        }
    }

    /**
     * 設置權限規則
     */
    setupPermissions() {
        const permissions = {
            // 系統管理員 - 完整權限
            'admin': {
                personalData: ['read', 'write', 'delete', 'export'],
                financialRecords: ['read', 'write', 'delete', 'export'],
                believerData: ['read', 'write', 'delete', 'export'],
                systemSettings: ['read', 'write'],
                auditLogs: ['read', 'export'],
                dataManagement: ['anonymize', 'encrypt', 'backup', 'restore']
            },
            
            // 資料管理員 - 個資管理權限
            'data_manager': {
                personalData: ['read', 'write', 'anonymize'],
                financialRecords: ['read', 'write', 'export'],
                believerData: ['read', 'write'],
                systemSettings: ['read'],
                auditLogs: ['read'],
                dataManagement: ['anonymize', 'encrypt', 'backup']
            },
            
            // 信眾管理員 - 信眾資料維護
            'believer_manager': {
                personalData: ['read', 'write'],
                financialRecords: ['read', 'write'],
                believerData: ['read', 'write'],
                systemSettings: [],
                auditLogs: [],
                dataManagement: []
            },
            
            // 部門主管 - 部門相關資料
            'department_head': {
                personalData: ['read'],
                financialRecords: ['read'],
                believerData: ['read'],
                systemSettings: [],
                auditLogs: [],
                dataManagement: []
            },
            
            // 客服人員 - 基本信眾服務
            'customer_service': {
                personalData: ['read'],
                financialRecords: [],
                believerData: ['read'],
                systemSettings: [],
                auditLogs: [],
                dataManagement: []
            },
            
            // 限制存取 - 無個資權限
            'restricted': {
                personalData: [],
                financialRecords: [],
                believerData: [],
                systemSettings: [],
                auditLogs: [],
                dataManagement: []
            }
        };

        for (const [role, perms] of Object.entries(permissions)) {
            this.permissions.set(role, perms);
        }
    }

    /**
     * 使用者登入
     */
    login(userId, password = null) {
        if (!this.userRoles.has(userId)) {
            this.logAccess(userId, 'login_failed', '使用者不存在');
            return { success: false, message: '使用者不存在' };
        }

        const user = this.userRoles.get(userId);
        this.currentUser = {
            id: userId,
            ...user,
            loginTime: new Date().toISOString()
        };

        this.logAccess(userId, 'login_success', `${user.name} 成功登入`);
        
        // 記錄到個資保護日誌
        if (window.privacyManager) {
            window.privacyManager.logActivity(userId, 'user_login', `使用者登入: ${user.name}`);
        }

        return { 
            success: true, 
            user: this.currentUser,
            permissions: this.getUserPermissions(userId)
        };
    }

    /**
     * 使用者登出
     */
    logout() {
        if (this.currentUser) {
            this.logAccess(this.currentUser.id, 'logout', `${this.currentUser.name} 登出`);
            
            if (window.privacyManager) {
                window.privacyManager.logActivity(this.currentUser.id, 'user_logout', `使用者登出: ${this.currentUser.name}`);
            }
            
            this.currentUser = null;
        }
    }

    /**
     * 檢查權限
     */
    checkPermission(action, dataType) {
        if (!this.currentUser) {
            this.logAccess('anonymous', 'permission_denied', `未登入嘗試存取: ${action} ${dataType}`);
            return false;
        }

        const userRole = this.currentUser.role;
        const rolePermissions = this.permissions.get(userRole);
        
        if (!rolePermissions || !rolePermissions[dataType]) {
            this.logAccess(this.currentUser.id, 'permission_denied', `無權限存取: ${action} ${dataType}`);
            return false;
        }

        const hasPermission = rolePermissions[dataType].includes(action);
        
        if (!hasPermission) {
            this.logAccess(this.currentUser.id, 'permission_denied', `權限不足: ${action} ${dataType}`);
        } else {
            this.logAccess(this.currentUser.id, 'permission_granted', `權限許可: ${action} ${dataType}`);
        }

        return hasPermission;
    }

    /**
     * 安全的資料存取包裝器
     */
    secureDataAccess(action, dataType, operation) {
        if (!this.checkPermission(action, dataType)) {
            throw new Error(`存取被拒絕: 您沒有權限執行 ${action} 操作於 ${dataType}`);
        }

        try {
            const result = operation();
            this.logAccess(this.currentUser.id, 'data_access_success', `成功執行: ${action} ${dataType}`);
            return result;
        } catch (error) {
            this.logAccess(this.currentUser.id, 'data_access_error', `執行失敗: ${action} ${dataType} - ${error.message}`);
            throw error;
        }
    }

    /**
     * 獲取使用者權限清單
     */
    getUserPermissions(userId) {
        const user = this.userRoles.get(userId);
        if (!user) return {};

        return this.permissions.get(user.role) || {};
    }

    /**
     * 資料遮蔽處理（基於權限等級）
     */
    maskDataByPermission(data, dataType) {
        if (!this.currentUser) return null;

        const level = this.currentUser.level;
        const role = this.currentUser.role;

        // 管理員和高級別使用者看到完整資料
        if (role === 'admin' || level === 'high') {
            return data;
        }

        // 中級別使用者看到部分遮蔽的資料
        if (level === 'medium') {
            const masked = { ...data };
            if (masked.phone) masked.phone = this.maskPhone(masked.phone);
            if (masked.address) masked.address = this.maskAddress(masked.address);
            return masked;
        }

        // 低級別使用者看到高度遮蔽的資料
        if (level === 'low') {
            const masked = { ...data };
            if (masked.name) masked.name = window.privacyManager.maskName(masked.name);
            if (masked.phone) masked.phone = '***-***-***';
            if (masked.address) masked.address = '***';
            if (masked.email) masked.email = '***@***.***';
            return masked;
        }

        // 無權限使用者返回空資料
        return null;
    }

    /**
     * 電話號碼遮蔽
     */
    maskPhone(phone) {
        if (!phone || phone.length < 6) return '***';
        return phone.substring(0, 3) + '***' + phone.substring(phone.length - 3);
    }

    /**
     * 地址遮蔽
     */
    maskAddress(address) {
        if (!address || address.length < 6) return '***';
        return address.substring(0, 6) + '***';
    }

    /**
     * 記錄存取日誌
     */
    logAccess(userId, action, description) {
        const logEntry = {
            id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            userId: userId,
            userName: this.userRoles.get(userId)?.name || 'Unknown',
            action: action,
            description: description,
            ipAddress: 'local',
            userAgent: navigator.userAgent
        };

        this.accessLog.push(logEntry);
        
        // 保持日誌數量在合理範圍內
        if (this.accessLog.length > 5000) {
            this.accessLog = this.accessLog.slice(-3000);
        }

        this.saveAccessLog();
    }

    /**
     * 載入使用者資料
     */
    loadUserData() {
        const accessLog = localStorage.getItem('access-control-log');
        if (accessLog) {
            this.accessLog = JSON.parse(accessLog);
        }
    }

    /**
     * 儲存存取日誌
     */
    saveAccessLog() {
        localStorage.setItem('access-control-log', JSON.stringify(this.accessLog));
    }

    /**
     * 獲取存取控制報告
     */
    getAccessControlReport() {
        const totalUsers = this.userRoles.size;
        const activeUsers = this.accessLog.filter(log => 
            log.action === 'login_success' && 
            new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        const roleDistribution = {};
        for (const user of this.userRoles.values()) {
            roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
        }

        const recentAccess = this.accessLog
            .filter(log => new Date(log.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .slice(-50);

        return {
            totalUsers: totalUsers,
            activeUsersToday: activeUsers,
            roleDistribution: roleDistribution,
            totalAccessLogs: this.accessLog.length,
            recentAccess: recentAccess,
            currentUser: this.currentUser,
            securityLevel: this.assessSecurityLevel()
        };
    }

    /**
     * 評估安全等級
     */
    assessSecurityLevel() {
        const issues = [];
        
        if (!this.currentUser) {
            issues.push('無使用者登入');
        }
        
        const recentFailedLogins = this.accessLog.filter(log => 
            log.action === 'login_failed' &&
            new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
        ).length;
        
        if (recentFailedLogins > 5) {
            issues.push('近期登入失敗次數過多');
        }

        const unauthorizedAccess = this.accessLog.filter(log => 
            log.action === 'permission_denied' &&
            new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        if (unauthorizedAccess > 10) {
            issues.push('近期未授權存取嘗試過多');
        }

        return {
            level: issues.length === 0 ? 'high' : issues.length < 3 ? 'medium' : 'low',
            issues: issues,
            score: Math.max(0, 100 - (issues.length * 20))
        };
    }

    /**
     * 導出存取權限清單
     */
    exportAccessMatrix() {
        const matrix = [];
        
        for (const [userId, user] of this.userRoles) {
            const permissions = this.getUserPermissions(userId);
            matrix.push({
                userId: userId,
                name: user.name,
                department: user.department,
                role: user.role,
                level: user.level,
                permissions: permissions
            });
        }

        if (window.privacyManager) {
            window.privacyManager.logActivity(
                this.currentUser?.id || 'system', 
                'access_matrix_exported', 
                '導出存取權限清單'
            );
        }

        return {
            exportedAt: new Date().toISOString(),
            exportedBy: this.currentUser?.name || 'System',
            totalUsers: matrix.length,
            accessMatrix: matrix
        };
    }
}

// 創建全局存取控制管理器實例
window.accessControl = new AccessControlManager(); 