/**
 * 宮廟快速記帳軟體 - 宮廟配置系統
 * 支援多宮廟使用，各自獨立的資料庫和設定
 */

class TempleConfigManager {
    constructor() {
        this.defaultConfig = {
            templeName: '您的宮廟名稱',
            templeAddress: '宮廟地址',
            templePhone: '聯絡電話',
            templeEmail: '聯絡信箱',
            establishedYear: new Date().getFullYear(),
            mainDeity: '主祀神明',
            
            // 資料庫設定
            storageType: 'local', // 'local', 'firebase', 'custom'
            
            // Firebase 設定（如果選擇使用）
            firebase: {
                apiKey: '',
                authDomain: '',
                databaseURL: '',
                projectId: '',
                storageBucket: '',
                messagingSenderId: '',
                appId: ''
            },
            
            // 個資保護設定
            privacy: {
                dpoName: '個資保護負責人',
                dpoPhone: '負責人電話',
                dpoEmail: '負責人信箱',
                dataRetentionYears: 5
            },
            
            // 系統設定
            system: {
                currency: 'TWD',
                dateFormat: 'YYYY-MM-DD',
                theme: 'temple-gold',
                enableCloudSync: false,
                enableEncryption: true,
                autoBackup: true
            },
            
            // 員工配置（可自訂）
            staff: [
                {
                    id: 'ADMIN001',
                    name: '系統管理員',
                    department: '管理部',
                    role: 'admin',
                    level: 'high'
                }
            ]
        };
        
        this.currentConfig = this.loadConfig();
        this.initializeConfig();
    }

    /**
     * 初始化配置系統
     */
    initializeConfig() {
        // 如果是第一次使用，顯示設定精靈
        if (!this.currentConfig.configured) {
            this.showSetupWizard();
        } else {
            this.applyConfig();
        }
    }

    /**
     * 載入配置
     */
    loadConfig() {
        const saved = localStorage.getItem('temple-config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                return { ...this.defaultConfig, ...config };
            } catch (error) {
                console.error('載入配置失敗:', error);
                return { ...this.defaultConfig };
            }
        }
        return { ...this.defaultConfig };
    }

    /**
     * 儲存配置
     */
    saveConfig() {
        try {
            localStorage.setItem('temple-config', JSON.stringify(this.currentConfig));
            console.log('✅ 宮廟配置已儲存');
            return true;
        } catch (error) {
            console.error('❌ 儲存配置失敗:', error);
            return false;
        }
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.currentConfig = { ...this.currentConfig, ...newConfig };
        this.saveConfig();
        this.applyConfig();
    }

    /**
     * 應用配置到系統
     */
    applyConfig() {
        // 更新頁面標題
        document.title = `${this.currentConfig.templeName} - 宮廟記帳軟體`;
        
        // 更新頁面中的宮廟名稱
        const templeNameElements = document.querySelectorAll('.temple-name');
        templeNameElements.forEach(element => {
            element.textContent = this.currentConfig.templeName;
        });

        // 應用主題
        this.applyTheme(this.currentConfig.system.theme);

        // 初始化存儲系統
        this.initializeStorage();

        // 更新個資保護資訊
        this.updatePrivacyInfo();
    }

    /**
     * 應用主題
     */
    applyTheme(themeName) {
        document.body.className = `theme-${themeName}`;
        
        // 可以根據不同主題設定不同的CSS變數
        const themes = {
            'temple-gold': {
                '--primary-color': '#d4af37',
                '--secondary-color': '#8b4513',
                '--accent-color': '#ffd700'
            },
            'temple-red': {
                '--primary-color': '#dc3545',
                '--secondary-color': '#8b0000',
                '--accent-color': '#ff6b6b'
            },
            'temple-blue': {
                '--primary-color': '#007bff',
                '--secondary-color': '#004085',
                '--accent-color': '#66b3ff'
            }
        };

        const theme = themes[themeName] || themes['temple-gold'];
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
    }

    /**
     * 初始化存儲系統
     */
    initializeStorage() {
        const storagePrefix = `temple-${this.generateTempleId()}-`;
        
        // 設定存儲前綴，確保各宮廟資料分離
        if (window.cloudSync) {
            window.cloudSync.setStoragePrefix(storagePrefix);
        }
        
        // 如果啟用Firebase，初始化Firebase配置
        if (this.currentConfig.storageType === 'firebase' && this.currentConfig.firebase.apiKey) {
            this.initializeFirebase();
        }
    }

    /**
     * 生成宮廟唯一ID
     */
    generateTempleId() {
        if (!this.currentConfig.templeId) {
            // 基於宮廟名稱和建立時間生成唯一ID
            const name = this.currentConfig.templeName.replace(/\s+/g, '');
            const timestamp = Date.now();
            const id = btoa(name + timestamp).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
            this.currentConfig.templeId = id;
            this.saveConfig();
        }
        return this.currentConfig.templeId;
    }

    /**
     * 初始化Firebase
     */
    initializeFirebase() {
        if (window.firebaseCloud && this.currentConfig.firebase.apiKey) {
            // 使用宮廟自己的Firebase配置
            window.firebaseCloud.updateConfig(this.currentConfig.firebase);
            console.log('✅ Firebase配置已更新為宮廟專屬設定');
        }
    }

    /**
     * 更新個資保護資訊
     */
    updatePrivacyInfo() {
        if (window.privacyManager) {
            // 更新個資保護聯絡人資訊
            const privacyConfig = {
                dpoName: this.currentConfig.privacy.dpoName,
                dpoPhone: this.currentConfig.privacy.dpoPhone,
                dpoEmail: this.currentConfig.privacy.dpoEmail,
                templeName: this.currentConfig.templeName,
                templeAddress: this.currentConfig.templeAddress
            };
            
            window.privacyManager.updateContactInfo(privacyConfig);
        }
    }

    /**
     * 顯示設定精靈
     */
    showSetupWizard() {
        // 創建設定精靈對話框
        const wizardHTML = `
            <div id="setup-wizard" style="
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
                    max-width: 600px; 
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <h2 style="color: #8b4513; text-align: center; margin-bottom: 20px;">
                        🏛️ 宮廟記帳軟體初始設定
                    </h2>
                    <p style="text-align: center; color: #666; margin-bottom: 30px;">
                        歡迎使用宮廟記帳軟體！請設定您的宮廟資訊
                    </p>
                    
                    <form id="temple-setup-form">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">宮廟名稱 *</label>
                            <input type="text" id="templeName" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">宮廟地址</label>
                            <input type="text" id="templeAddress" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">聯絡電話</label>
                            <input type="text" id="templePhone" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">主祀神明</label>
                            <input type="text" id="mainDeity" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">個資保護負責人 *</label>
                            <input type="text" id="dpoName" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">負責人聯絡電話</label>
                            <input type="text" id="dpoPhone" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">資料儲存方式</label>
                            <select id="storageType" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="local">本地儲存（推薦，免費）</option>
                                <option value="firebase">Firebase雲端儲存（需自行申請）</option>
                            </select>
                        </div>
                        
                        <div id="firebase-config" style="display: none; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                            <h4>Firebase 設定</h4>
                            <p style="font-size: 14px; color: #666;">如選擇Firebase，請填入您的Firebase專案配置</p>
                            <input type="text" id="firebaseApiKey" placeholder="API Key" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <input type="text" id="firebaseProjectId" placeholder="Project ID" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <button type="submit" style="
                                background: #d4af37; 
                                color: white; 
                                border: none; 
                                padding: 12px 30px; 
                                border-radius: 5px; 
                                font-size: 16px; 
                                font-weight: bold; 
                                cursor: pointer;
                            ">完成設定</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', wizardHTML);

        // 綁定事件
        document.getElementById('storageType').addEventListener('change', function() {
            const firebaseConfig = document.getElementById('firebase-config');
            firebaseConfig.style.display = this.value === 'firebase' ? 'block' : 'none';
        });

        document.getElementById('temple-setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.completeSetup();
        });
    }

    /**
     * 完成設定
     */
    completeSetup() {
        const formData = {
            templeName: document.getElementById('templeName').value,
            templeAddress: document.getElementById('templeAddress').value,
            templePhone: document.getElementById('templePhone').value,
            mainDeity: document.getElementById('mainDeity').value,
            privacy: {
                dpoName: document.getElementById('dpoName').value,
                dpoPhone: document.getElementById('dpoPhone').value,
                dpoEmail: this.currentConfig.privacy.dpoEmail,
                dataRetentionYears: 5
            },
            storageType: document.getElementById('storageType').value,
            configured: true
        };

        // 如果選擇Firebase，加入Firebase配置
        if (formData.storageType === 'firebase') {
            formData.firebase = {
                ...this.currentConfig.firebase,
                apiKey: document.getElementById('firebaseApiKey').value,
                projectId: document.getElementById('firebaseProjectId').value
            };
        }

        this.updateConfig(formData);
        
        // 移除設定精靈
        const wizard = document.getElementById('setup-wizard');
        if (wizard) {
            wizard.remove();
        }

        // 顯示完成訊息
        alert(`🎉 ${formData.templeName} 設定完成！\n\n系統已為您的宮廟建立獨立的資料空間。\n所有資料將安全地儲存在您選擇的位置。`);
        
        // 重新載入頁面以應用新設定
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    /**
     * 重置配置（回到設定精靈）
     */
    resetConfig() {
        if (confirm('確定要重置所有設定嗎？這將清除目前的宮廟配置（不會刪除記帳資料）。')) {
            this.currentConfig = { ...this.defaultConfig, configured: false };
            this.saveConfig();
            window.location.reload();
        }
    }

    /**
     * 匯出配置
     */
    exportConfig() {
        const configToExport = { ...this.currentConfig };
        // 移除敏感資訊
        delete configToExport.firebase;
        
        const blob = new Blob([JSON.stringify(configToExport, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentConfig.templeName}_配置備份.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 匯入配置
     */
    importConfig(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                if (confirm(`確定要匯入 ${config.templeName} 的配置嗎？`)) {
                    this.updateConfig(config);
                    alert('✅ 配置匯入成功！');
                }
            } catch (error) {
                alert('❌ 配置檔案格式錯誤');
            }
        };
        reader.readAsText(file);
    }

    /**
     * 獲取當前配置
     */
    getConfig() {
        return { ...this.currentConfig };
    }
}

// 創建全局配置管理器
window.templeConfig = new TempleConfigManager(); 