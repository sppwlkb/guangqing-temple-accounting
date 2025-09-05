/**
 * 廣清宮記帳軟體 - Firebase 雲端配置
 * 提供真正的雲端存儲、用戶認證和實時同步功能
 */

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyAFBpWl0A6TKNgFVSaQag0adVAGIvx0WCI",
    authDomain: "guangqing-temple-accounting.firebaseapp.com",
    projectId: "guangqing-temple-accounting",
    storageBucket: "guangqing-temple-accounting.firebasestorage.app",
    messagingSenderId: "149239503393",
    appId: "1:149239503393:web:b9f0ab73e4412e1c77a160",
    measurementId: "G-EQTHNQH9T5"
};

class FirebaseCloudService {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.isInitialized = false;
        this.localStorageMode = false;
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        
        // 監聽網路狀態
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onConnectionStateChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onConnectionStateChange(false);
        });
        
        this.initFirebase();
    }

    /**
     * 初始化 Firebase
     */
    async initFirebase() {
        console.log('正在初始化 Firebase...');
        
        try {
            // 動態載入 Firebase SDK
            if (typeof firebase === 'undefined') {
                await this.loadFirebaseSDK();
            }

            // 初始化 Firebase
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
            } else {
                this.app = firebase.app();
            }

            // 初始化服務
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();

            // 配置 Firestore 設定
            if (!this.isInitialized) {
                try {
                    // 使用新版本兼容的設定，避免棄用警告
                    this.db.settings({
                        ignoreUndefinedProperties: true,
                        // 使用新的快取設定替代已棄用的 enableMultiTabIndexedDbPersistence
                        cache: {
                            kind: 'memory'  // 或者 'persistent' 如果需要持久化
                        }
                    });
                    
                    console.log('Firestore 已配置（新版本模式）');
                } catch (err) {
                    console.warn('Firestore 設定警告:', err.message);
                    // 降級到基本設定
                    try {
                        this.db.settings({
                            ignoreUndefinedProperties: true
                        });
                    } catch (fallbackErr) {
                        console.warn('基本 Firestore 設定也失敗:', fallbackErr.message);
                    }
                }
            }

            // 監聽認證狀態變化
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.onAuthStateChanged(user);
            });

            this.isInitialized = true;
            console.log('Firebase 初始化成功');
            
        } catch (error) {
            console.error('Firebase 初始化失敗:', error);
            this.fallbackToLocalStorage();
        }
        
        /* 原 Firebase 初始化代碼已停用
        try {
            // 動態載入 Firebase SDK
            if (typeof firebase === 'undefined') {
                await this.loadFirebaseSDK();
            }

            // 初始化 Firebase
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
            } else {
                this.app = firebase.app();
            }

            // 初始化服務
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();

            // 配置 Firestore 設定（使用新的配置方式避免棄用警告）
            if (!this.isInitialized) {
                try {
                    this.db.settings({
                        ignoreUndefinedProperties: true,
                        experimentalForceLongPolling: false
                    });
                    
                    console.log('Firestore 已配置（新版本兼容模式）');
                } catch (err) {
                    console.warn('Firestore 設定失敗:', err);
                }
            }

            // 監聽認證狀態變化
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.onAuthStateChanged(user);
            });

            this.isInitialized = true;
            console.log('Firebase 初始化成功');
            
        } catch (error) {
            console.error('Firebase 初始化失敗:', error);
            this.fallbackToLocalStorage();
        }
        */
    }

    /**
     * 動態載入 Firebase SDK
     */
    async loadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            // 使用更新的 Firebase SDK 版本 (10.x) 以避免棄用警告
            // Firebase App (核心)
            const appScript = document.createElement('script');
            appScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js';
            
            appScript.onload = () => {
                // Firebase Auth
                const authScript = document.createElement('script');
                authScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js';
                
                authScript.onload = () => {
                    // Firebase Firestore
                    const firestoreScript = document.createElement('script');
                    firestoreScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js';
                    
                    firestoreScript.onload = () => {
                        // Firebase Storage
                        const storageScript = document.createElement('script');
                        storageScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js';
                        
                        storageScript.onload = resolve;
                        storageScript.onerror = reject;
                        document.head.appendChild(storageScript);
                    };
                    firestoreScript.onerror = reject;
                    document.head.appendChild(firestoreScript);
                };
                authScript.onerror = reject;
                document.head.appendChild(authScript);
            };
            appScript.onerror = reject;
            document.head.appendChild(appScript);
        });
    }

    /**
     * 用戶註冊
     */
    async registerUser(email, password, displayName) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 更新用戶資料
            await user.updateProfile({
                displayName: displayName
            });

            // 創建用戶文檔
            await this.db.collection('users').doc(user.uid).set({
                email: email,
                displayName: displayName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                templeInfo: {
                    name: displayName,
                    type: 'temple'
                }
            });

            return {
                success: true,
                user: user,
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
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 更新最後登入時間
            await this.db.collection('users').doc(user.uid).update({
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                user: user,
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
     * 匿名登入（用於訪客使用）
     */
    async loginAnonymously() {
        console.log('嘗試匿名登入，當前狀態:', {
            localStorageMode: this.localStorageMode,
            isInitialized: this.isInitialized,
            hasAuth: !!this.auth
        });
        
        // 首先嘗試 Firebase 登入（除非已經在本地模式）
        if (!this.localStorageMode) {
            // 如果 Firebase 未初始化，等待初始化完成
            if (!this.isInitialized) {
                console.log('等待 Firebase 初始化...');
                let waitCount = 0;
                while (!this.isInitialized && waitCount < 50) { // 增加等待時間
                    await new Promise(resolve => setTimeout(resolve, 100));
                    waitCount++;
                }
            }

            // 嘗試 Firebase 匿名登入
            if (this.isInitialized && this.auth) {
                try {
                    console.log('嘗試 Firebase 匿名登入...');
                    const userCredential = await this.auth.signInAnonymously();
                    console.log('Firebase 匿名登入成功，UID:', userCredential.user.uid);
                    
                    return {
                        success: true,
                        user: userCredential.user,
                        message: 'Firebase 匿名登入成功'
                    };
                } catch (error) {
                    console.warn('Firebase 匿名登入失敗，原因:', error.message);
                    // 不立即降級，先嘗試其他方法
                }
            }
        }
        
        // Firebase 不可用，嘗試使用備用登入
        console.log('Firebase 登入不可用，嘗試本地模式');
        this.currentUser = {
            uid: 'guangqing-local-' + Date.now(),
            isAnonymous: true,
            displayName: '廣清宮本地用戶'
        };
        
        // 設置為本地存儲模式
        this.localStorageMode = true;
        
        return {
            success: true,
            user: this.currentUser,
            message: '本地模式登入成功（雲端服務暫時不可用）'
        };
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
        // 如果是本地存儲模式，直接返回成功
        if (this.localStorageMode || !this.isInitialized) {
            console.log('使用本地存儲模式，模擬上傳成功');
            return {
                success: true,
                message: '資料已存儲在本地（雲端服務不可用）',
                timestamp: new Date().toLocaleString('zh-TW')
            };
        }

        if (!this.currentUser) {
            throw new Error('用戶未登入');
        }

        try {
            const userDoc = this.db.collection('temples').doc(this.currentUser.uid);
            
            // 分別儲存不同類型的資料
            const batch = this.db.batch();
            
            // 儲存記錄
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

            // 儲存信眾資料
            if (data.believers && data.believers.length > 0) {
                const believersRef = userDoc.collection('believers');
                data.believers.forEach(believer => {
                    const docRef = believersRef.doc(believer.id?.toString() || believer.name);
                    batch.set(docRef, {
                        ...believer,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                });
            }

            // 儲存提醒
            if (data.reminders && data.reminders.length > 0) {
                const remindersRef = userDoc.collection('reminders');
                data.reminders.forEach(reminder => {
                    const docRef = remindersRef.doc(reminder.id.toString());
                    batch.set(docRef, {
                        ...reminder,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                });
            }

            // 儲存自定義類別
            if (data.customCategories) {
                batch.set(userDoc.collection('settings').doc('categories'), {
                    customIncomeCategories: data.customCategories.income || [],
                    customExpenseCategories: data.customCategories.expense || [],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }

            // 更新同步資訊
            batch.set(userDoc, {
                lastSyncAt: firebase.firestore.FieldValue.serverTimestamp(),
                recordsCount: data.records?.length || 0,
                believersCount: data.believers?.length || 0,
                remindersCount: data.reminders?.length || 0
            }, { merge: true });

            await batch.commit();

            return {
                success: true,
                message: '資料已成功上傳到雲端',
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
        // 優先嘗試 Firebase 下載
        if (!this.localStorageMode && this.isInitialized && this.currentUser) {
            console.log('嘗試從 Firebase 下載資料...');
            try {
                return await this.downloadFromFirebase();
            } catch (error) {
                console.warn('Firebase 下載失敗，嘗試備用方法:', error.message);
                // 如果 Firebase 失敗，降級到本地模式但不返回空資料
            }
        }
        
        // 如果 Firebase 不可用，嘗試使用現有的 CloudSyncService 作為備用
        if (window.cloudSync && typeof window.cloudSync.downloadData === 'function') {
            console.log('使用備用雲端同步服務下載資料...');
            try {
                return await window.cloudSync.downloadData();
            } catch (error) {
                console.warn('備用雲端服務下載失敗:', error.message);
            }
        }
        
        // 最後返回本地空資料（但提示用戶檢查設定）
        console.log('所有雲端服務不可用，返回空資料');
        return {
            success: false,
            data: {
                records: [],
                believers: [],
                reminders: [],
                customCategories: null,
                downloadedAt: new Date().toISOString()
            },
            message: '雲端服務不可用，請檢查網路連線或登入狀態',
            timestamp: new Date().toLocaleString('zh-TW')
        };
    }

    /**
     * 從 Firebase 下載資料
     */
    async downloadFromFirebase() {
        if (!this.currentUser) {
            throw new Error('用戶未登入');
        }

        try {
            const userDoc = this.db.collection('temples').doc(this.currentUser.uid);
            console.log(`正在從用戶文檔下載資料: temples/${this.currentUser.uid}`);
            
            // 並行獲取所有資料
            const [recordsSnapshot, believersSnapshot, remindersSnapshot, categoriesSnapshot] = await Promise.all([
                userDoc.collection('records').orderBy('date', 'desc').get(),
                userDoc.collection('believers').get(),
                userDoc.collection('reminders').get(),
                userDoc.collection('settings').doc('categories').get()
            ]);

            // 處理記錄資料，確保格式正確
            const records = recordsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: parseInt(doc.id) || doc.id,
                    date: data.date,
                    type: data.type,
                    category: data.category,
                    subcategory: data.subcategory,
                    amount: data.amount,
                    description: data.description,
                    believerName: data.believerName || '',
                    location: data.location || '',
                    updatedAt: data.updatedAt,
                    synced: true
                };
            });

            // 處理信眾資料
            const believers = believersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: data.id || doc.id,
                    name: data.name,
                    phone: data.phone || '',
                    address: data.address || '',
                    notes: data.notes || '',
                    totalDonation: data.totalDonation || 0,
                    visitCount: data.visitCount || 0,
                    lastVisit: data.lastVisit || '',
                    updatedAt: data.updatedAt,
                    synced: true
                };
            });

            // 處理提醒資料
            const reminders = remindersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: parseInt(doc.id) || doc.id,
                    title: data.title,
                    description: data.description || '',
                    date: data.date,
                    time: data.time,
                    completed: data.completed || false,
                    updatedAt: data.updatedAt,
                    synced: true
                };
            });

            const data = {
                records,
                believers,
                reminders,
                customCategories: categoriesSnapshot.exists ? categoriesSnapshot.data() : null,
                downloadedAt: new Date().toISOString()
            };

            console.log(`成功下載資料: ${records.length} 筆記錄, ${believers.length} 位信眾, ${reminders.length} 個提醒`);

            return {
                success: true,
                data: data,
                message: `資料已成功從雲端下載 (${records.length} 筆記錄, ${believers.length} 位信眾, ${reminders.length} 個提醒)`,
                timestamp: new Date().toLocaleString('zh-TW')
            };
        } catch (error) {
            console.error('Firebase 下載資料錯誤:', error);
            throw new Error(`下載失敗: ${error.message}`);
        }
    }

    /**
     * 實時監聽資料變化
     */
    setupRealtimeSync(callback) {
        if (!this.currentUser) return null;

        const userDoc = this.db.collection('temples').doc(this.currentUser.uid);
        
        // 監聽記錄變化
        const recordsUnsubscribe = userDoc.collection('records')
            .onSnapshot((snapshot) => {
                const changes = snapshot.docChanges();
                if (changes.length > 0) {
                    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    callback('records', records, changes);
                }
            });

        // 監聽信眾資料變化
        const believersUnsubscribe = userDoc.collection('believers')
            .onSnapshot((snapshot) => {
                const changes = snapshot.docChanges();
                if (changes.length > 0) {
                    const believers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    callback('believers', believers, changes);
                }
            });

        // 返回取消監聽的函數
        return () => {
            recordsUnsubscribe();
            believersUnsubscribe();
        };
    }

    /**
     * 認證狀態變化處理
     */
    onAuthStateChanged(user) {
        if (user) {
            console.log('用戶已登入:', user.displayName || user.email || '匿名用戶');
            // 觸發自動同步
            this.autoSync();
        } else {
            console.log('用戶已登出');
        }
        
        // 通知應用程式認證狀態變化
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
    }

    /**
     * 網路狀態變化處理
     */
    onConnectionStateChange(isOnline) {
        console.log('網路狀態:', isOnline ? '已連線' : '已離線');
        
        if (isOnline && this.currentUser) {
            // 網路恢復時自動同步
            this.autoSync();
        }
        
        // 通知應用程式網路狀態變化
        window.dispatchEvent(new CustomEvent('connectionStateChanged', { detail: { isOnline } }));
    }

    /**
     * 自動同步
     */
    async autoSync() {
        if (!this.isOnline || !this.currentUser) return;

        try {
            // 檢查本地是否有未同步的變更
            const lastLocalModified = localStorage.getItem('temple-last-modified');
            const lastCloudSync = localStorage.getItem('temple-last-cloud-sync');
            
            if (lastLocalModified && (!lastCloudSync || parseInt(lastLocalModified) > parseInt(lastCloudSync))) {
                // 有本地變更，上傳到雲端
                const localData = this.collectLocalData();
                await this.uploadData(localData);
                localStorage.setItem('temple-last-cloud-sync', Date.now().toString());
            }
        } catch (error) {
            console.warn('自動同步失敗:', error);
        }
    }

    /**
     * 收集本地資料
     */
    collectLocalData() {
        return {
            records: JSON.parse(localStorage.getItem('temple-records') || '[]'),
            believers: JSON.parse(localStorage.getItem('temple-believers') || '[]'),
            reminders: JSON.parse(localStorage.getItem('temple-reminders') || '[]'),
            customCategories: {
                income: JSON.parse(localStorage.getItem('custom-income-categories') || '[]'),
                expense: JSON.parse(localStorage.getItem('custom-expense-categories') || '[]')
            },
            lastModified: Date.now()
        };
    }

    /**
     * 降級到本地存儲模式
     */
    fallbackToLocalStorage() {
        console.warn('暫時降級到本地存儲模式');
        this.localStorageMode = true;
        // 注意：不重置 this.isInitialized，保留 Firebase 初始化狀態以便後續重試
        
        // 設置本地模擬用戶（如果還沒有用戶的話）
        if (!this.currentUser) {
            this.currentUser = {
                uid: 'guangqing-local-' + Date.now(),
                isAnonymous: true,
                displayName: '廣清宮本地用戶'
            };
        }
        
        // 檢查是否有備用雲端同步服務
        if (window.cloudSync) {
            console.log('檢測到備用雲端同步服務，可用作備選方案');
        }
        
        // 設置定時重試 Firebase 連接（每 5 分鐘檢查一次）
        setTimeout(() => {
            if (this.localStorageMode && navigator.onLine) {
                console.log('嘗試重新連接 Firebase...');
                this.localStorageMode = false;
                this.initFirebase();
            }
        }, 5 * 60 * 1000);
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
            'auth/network-request-failed': '網路連線失敗',
            'auth/requires-recent-login': '需要重新登入'
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
            currentUser: this.currentUser ? {
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                displayName: this.currentUser.displayName,
                isAnonymous: this.currentUser.isAnonymous
            } : null,
            localStorageMode: this.localStorageMode || false
        };
    }
}

// 創建全局實例
window.firebaseCloud = new FirebaseCloudService(); 