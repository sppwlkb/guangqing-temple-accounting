/**
 * Firebase 雲端服務
 * 提供雲端存儲、用戶認證和實時同步功能
 */

// Firebase 配置
// 注意：這些是示例配置，實際使用時請替換為您的 Firebase 專案配置
export const firebaseConfig = {
    apiKey: "ap0dZIvLckVvv4Q7bH9D_wivoQ0tNEbMg1cUUbwqpkc",
    authDomain: "guangqing-temple-accounting.firebaseapp.com",
    databaseURL: "https://guangqing-temple-accounting-default-rtdb.firebaseio.com",
    projectId: "guangqing-temple-accounting",
    storageBucket: "guangqing-temple-accounting.appspot.com",
    messagingSenderId: "149239503393",
    appId: "1:123456789:web:abcdefghijklmnop"
};

class FirebaseCloudService {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.isInitialized = false;
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        
        window.addEventListener('online', () => this.onConnectionStateChange(true));
        window.addEventListener('offline', () => this.onConnectionStateChange(false));
    }

    async init() {
        if (this.isInitialized) return this;
        try {
            // 動態載入 Firebase SDKs
            if (typeof firebase === 'undefined') {
                await this.loadFirebaseSDK();
            }

            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
            } else {
                this.app = firebase.app();
            }

            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();

            await this.db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('離線持久化失敗：多個標籤頁打開');
                } else if (err.code == 'unimplemented') {
                    console.warn('離線持久化不支援此瀏覽器');
                }
            });

            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.onAuthStateChanged(user);
            });

            this.isInitialized = true;
            console.log('Firebase 初始化成功');
            return this;
        } catch (error) {
            console.error('Firebase 初始化失敗:', error);
            throw error;
        }
    }

    async loadFirebaseSDK() {
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js'
        ];

        for (const src of scripts) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }

    /**
     * 用戶註冊
     */
    async registerUser(email, password, displayName) {
        try {
            await this.init();
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await user.updateProfile({ displayName });

            await this.db.collection('users').doc(user.uid).set({
                email,
                displayName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                user,
                message: '註冊成功'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    /**
     * 用戶登入
     */
    async loginUser(email, password) {
        try {
            await this.init();
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await this.db.collection('users').doc(user.uid).update({
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                user,
                message: '登入成功'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    /**
     * 匹名登入
     */
    async loginAnonymously() {
        try {
            await this.init();
            const userCredential = await this.auth.signInAnonymously();
            return {
                success: true,
                user: userCredential.user,
                message: '写名登入成功'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    /**
     * 用戶登出
     */
    async logout() {
        try {
            await this.auth.signOut();
            return {
                success: true,
                message: '登出成功'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    /**
     * 上傳資料到雲端
     */
    async uploadData(data) {
        // 使用主要 firebase-config.js 中的實例
        if (window.firebaseCloud && window.firebaseCloud.uploadData) {
            return await window.firebaseCloud.uploadData(data);
        }

        // 備用實作
        if (!this.currentUser) {
            throw new Error('用戶未登入');
        }

        try {
            await this.init();
            const userDoc = this.db.collection('temples').doc(this.currentUser.uid);
            const batch = this.db.batch();
            
            // 簡化的上傳逻輯
            if (data.records && data.records.length > 0) {
                const recordsRef = userDoc.collection('records');
                data.records.forEach(record => {
                    const docRef = recordsRef.doc(record.id.toString());
                    batch.set(docRef, {
                        ...record,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                });
            }

            await batch.commit();
            return {
                success: true,
                message: '資料已成功上傳',
                timestamp: new Date().toLocaleString('zh-TW')
            };
        } catch (error) {
            console.error('上傳資料錯誤:', error);
            throw error;
        }
    }

    /**
     * 從雲端下載資料
     */
    async downloadData() {
        // 使用主要 firebase-config.js 中的實例
        if (window.firebaseCloud && window.firebaseCloud.downloadData) {
            return await window.firebaseCloud.downloadData();
        }

        // 備用實作
        if (!this.currentUser) {
            throw new Error('用戶未登入');
        }

        try {
            await this.init();
            const userDoc = this.db.collection('temples').doc(this.currentUser.uid);
            const recordsSnapshot = await userDoc.collection('records').get();
            
            const records = recordsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                success: true,
                data: {
                    records,
                    believers: [],
                    reminders: [],
                    customCategories: null
                },
                message: `已下載 ${records.length} 筆記錄`,
                timestamp: new Date().toLocaleString('zh-TW')
            };
        } catch (error) {
            console.error('下載資料錯誤:', error);
            throw error;
        }
    }

    /**
     * 認證狀態變化處理
     */
    onAuthStateChanged(user) {
        this.currentUser = user;
        if (user) {
            console.log('用戶已登入:', user.displayName || user.email || '噹名用戶');
        } else {
            console.log('用戶已登出');
        }
    }

    /**
     * 網路狀態變化處理
     */
    onConnectionStateChange(isOnline) {
        this.isOnline = isOnline;
        console.log('網路狀態:', isOnline ? '已連線' : '離線');
    }

    /**
     * 獲取錯誤訊息
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': '此電子郵件已被使用',
            'auth/invalid-email': '電子郵件格式無效',
            'auth/weak-password': '密碼強度不足',
            'auth/user-not-found': '找不到此用戶',
            'auth/wrong-password': '密碼錯誤',
            'auth/too-many-requests': '登入嘗試次數過多，請稍後再試',
            'auth/network-request-failed': '網路連線失敗'
        };
        
        return errorMessages[errorCode] || '發生未知錯誤';
    }

    /**
     * 獲取當前狀態
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isOnline: this.isOnline,
            currentUser: this.currentUser
        };
    }
}

// 導出單例模式的實例
// 附加監聽器以保持與主 firebase-config.js 同步
if (typeof window !== 'undefined') {
    window.addEventListener('authStateChanged', (event) => {
        if (firebaseService.onAuthStateChanged) {
            firebaseService.onAuthStateChanged(event.detail.user);
        }
    });

    window.addEventListener('connectionStateChanged', (event) => {
        if (firebaseService.onConnectionStateChange) {
            firebaseService.onConnectionStateChange(event.detail.isOnline);
        }
    });
}

export const firebaseService = new FirebaseCloudService();
