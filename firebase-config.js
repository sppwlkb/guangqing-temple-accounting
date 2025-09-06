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
        this.isSyncing = false; // 新增同步狀態標記
        
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

        // 驗證資料格式
        if (!data || typeof data !== 'object') {
            throw new Error('無效的資料格式');
        }

        let uploadedCounts = {
            records: 0,
            believers: 0,
            reminders: 0,
            categories: 0
        };

        try {
            const userDoc = this.db.collection('temples').doc(this.currentUser.uid);
            const maxBatchSize = 500; // Firestore 批次操作限制
            const batches = [];
            let currentBatch = this.db.batch();
            let operationCount = 0;
            
            console.log('開始上傳資料到雲端...', {
                records: data.records?.length || 0,
                believers: data.believers?.length || 0,
                reminders: data.reminders?.length || 0
            });

            // 批次處理記錄
            if (data.records && Array.isArray(data.records)) {
                const recordsRef = userDoc.collection('records');
                for (const record of data.records) {
                    if (!record.id) {
                        console.warn('跳過無效記錄（缺少 ID）:', record);
                        continue;
                    }

                    const docRef = recordsRef.doc(record.id.toString());
                    const sanitizedRecord = this.sanitizeData({
                        ...record,
                        amount: parseFloat(record.amount) || 0,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        syncedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    currentBatch.set(docRef, sanitizedRecord, { merge: true });
                    operationCount++;
                    uploadedCounts.records++;

                    if (operationCount >= maxBatchSize) {
                        batches.push(currentBatch);
                        currentBatch = this.db.batch();
                        operationCount = 0;
                    }
                }
            }

            // 批次處理信眾資料
            if (data.believers && Array.isArray(data.believers)) {
                const believersRef = userDoc.collection('believers');
                for (const believer of data.believers) {
                    const believerId = believer.id?.toString() || believer.name;
                    if (!believerId) {
                        console.warn('跳過無效信眾資料（缺少 ID 或姓名）:', believer);
                        continue;
                    }

                    const docRef = believersRef.doc(believerId);
                    const sanitizedBeliever = this.sanitizeData({
                        ...believer,
                        totalDonation: parseFloat(believer.totalDonation) || 0,
                        visitCount: parseInt(believer.visitCount) || 0,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        syncedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    currentBatch.set(docRef, sanitizedBeliever, { merge: true });
                    operationCount++;
                    uploadedCounts.believers++;

                    if (operationCount >= maxBatchSize) {
                        batches.push(currentBatch);
                        currentBatch = this.db.batch();
                        operationCount = 0;
                    }
                }
            }

            // 批次處理提醒
            if (data.reminders && Array.isArray(data.reminders)) {
                const remindersRef = userDoc.collection('reminders');
                for (const reminder of data.reminders) {
                    if (!reminder.id) {
                        console.warn('跳過無效提醒（缺少 ID）:', reminder);
                        continue;
                    }

                    const docRef = remindersRef.doc(reminder.id.toString());
                    const sanitizedReminder = this.sanitizeData({
                        ...reminder,
                        completed: Boolean(reminder.completed),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        syncedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    currentBatch.set(docRef, sanitizedReminder, { merge: true });
                    operationCount++;
                    uploadedCounts.reminders++;

                    if (operationCount >= maxBatchSize) {
                        batches.push(currentBatch);
                        currentBatch = this.db.batch();
                        operationCount = 0;
                    }
                }
            }

            // 處理自定義類別
            if (data.customCategories && typeof data.customCategories === 'object') {
                const categoriesDoc = userDoc.collection('settings').doc('categories');
                const sanitizedCategories = this.sanitizeData({
                    customIncomeCategories: Array.isArray(data.customCategories.income) ? data.customCategories.income : [],
                    customExpenseCategories: Array.isArray(data.customCategories.expense) ? data.customCategories.expense : [],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    syncedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                currentBatch.set(categoriesDoc, sanitizedCategories, { merge: true });
                operationCount++;
                uploadedCounts.categories = 1;
            }

            // 更新用戶同步資訊
            const syncInfo = {
                lastSyncAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUploadAt: firebase.firestore.FieldValue.serverTimestamp(),
                recordsCount: uploadedCounts.records,
                believersCount: uploadedCounts.believers,
                remindersCount: uploadedCounts.reminders,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    timestamp: new Date().toISOString()
                }
            };

            currentBatch.set(userDoc, this.sanitizeData(syncInfo), { merge: true });
            operationCount++;

            // 如果還有操作，添加最後一個批次
            if (operationCount > 0) {
                batches.push(currentBatch);
            }

            // 執行所有批次操作
            console.log(`準備執行 ${batches.length} 個批次操作，總共 ${operationCount + (batches.length - 1) * maxBatchSize} 個操作`);
            
            for (let i = 0; i < batches.length; i++) {
                try {
                    await batches[i].commit();
                    console.log(`批次 ${i + 1}/${batches.length} 上傳成功`);
                } catch (batchError) {
                    console.error(`批次 ${i + 1}/${batches.length} 上傳失敗:`, batchError);
                    throw new Error(`批次上傳失敗: ${batchError.message}`);
                }
            }

            const message = `資料已成功上傳到雲端 (記錄: ${uploadedCounts.records}, 信眾: ${uploadedCounts.believers}, 提醒: ${uploadedCounts.reminders})`;
            console.log(message);

            return {
                success: true,
                message,
                uploadedCounts,
                batchCount: batches.length,
                timestamp: new Date().toLocaleString('zh-TW')
            };

        } catch (error) {
            console.error('上傳資料錯誤:', error);
            
            // 提供更詳細的錯誤訊息
            let errorMessage = '上傳失敗';
            if (error.code === 'permission-denied') {
                errorMessage = '權限不足，請檢查登入狀態';
            } else if (error.code === 'unavailable') {
                errorMessage = '雲端服務暫時不可用，請稍後重試';
            } else if (error.code === 'quota-exceeded') {
                errorMessage = '儲存空間不足';
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * 從雲端下載資料並更新到本地存儲
     */
    async downloadData(options = {}) {
        const { 
            forceRefresh = false, 
            mergeStrategy = 'timestamp',  // 'timestamp', 'replace', 'merge'
            applyToLocalStorage = true 
        } = options;

        // 檢查同步狀態
        if (this.isSyncing && !forceRefresh) {
            console.log('正在同步中，跳過下載要求');
            return {
                success: false,
                message: '正在同步中，請稍候',
                timestamp: new Date().toLocaleString('zh-TW')
            };
        }

        this.isSyncing = true;
        
        try {
            let downloadResult = null;
            
            // 優先嘗試 Firebase 下載
            if (!this.localStorageMode && this.isInitialized && this.currentUser) {
                console.log('嘗試從 Firebase 下載資料...');
                try {
                    downloadResult = await this.downloadFromFirebase();
                    if (downloadResult.success) {
                        console.log('Firebase 下載成功');
                    }
                } catch (error) {
                    console.warn('Firebase 下載失敗:', error.message);
                    downloadResult = null;
                }
            }
            
            // 如果 Firebase 失敗，嘗試備用服務
            if (!downloadResult && window.cloudSync && typeof window.cloudSync.downloadData === 'function') {
                console.log('使用備用雲端同步服務下載資料...');
                try {
                    downloadResult = await window.cloudSync.downloadData();
                    if (downloadResult.success) {
                        console.log('備用服務下載成功');
                    }
                } catch (error) {
                    console.warn('備用雲端服務下載失敗:', error.message);
                    downloadResult = null;
                }
            }
            
            // 如果所有服務都失敗
            if (!downloadResult || !downloadResult.success) {
                console.log('所有雲端服務不可用');
                return {
                    success: false,
                    data: null,
                    message: '雲端服務不可用，請檢查網路連線或登入狀態',
                    timestamp: new Date().toLocaleString('zh-TW')
                };
            }

            // 有成功下載的資料，開始處理
            console.log('開始處理下載的資料...', {
                records: downloadResult.data?.records?.length || 0,
                believers: downloadResult.data?.believers?.length || 0,
                reminders: downloadResult.data?.reminders?.length || 0
            });

            // 根據策略合併或更新資料
            if (applyToLocalStorage) {
                const mergeResult = await this.applyDownloadedData(downloadResult.data, mergeStrategy);
                downloadResult.mergeResult = mergeResult;
            }

            return {
                ...downloadResult,
                success: true,
                message: `資料已成功下載${applyToLocalStorage ? '並更新到本地' : ''}`,
                appliedToLocal: applyToLocalStorage
            };
            
        } catch (error) {
            console.error('下載資料錯誤:', error);
            return {
                success: false,
                error: error.message,
                message: `下載失敗: ${error.message}`,
                timestamp: new Date().toLocaleString('zh-TW')
            };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * 從 Firebase 下載資料
     */
    async downloadFromFirebase() {
        if (!this.currentUser) {
            throw new Error('用戶未登入');
        }

        if (!this.isOnline) {
            throw new Error('網路連線不可用');
        }

        try {
            const userDoc = this.db.collection('temples').doc(this.currentUser.uid);
            console.log(`正在從用戶文檔下載資料: temples/${this.currentUser.uid}`);
            
            // 設定查詢選項，優化效能
            const queryOptions = {
                source: 'server' // 強制從伺服器獲取最新資料
            };
            
            // 並行獲取所有資料，加入錯誤處理
            const [recordsSnapshot, believersSnapshot, remindersSnapshot, categoriesSnapshot, userInfoSnapshot] = await Promise.allSettled([
                userDoc.collection('records')
                    .orderBy('updatedAt', 'desc')
                    .limit(10000) // 限制最大筆數防止過載
                    .get(queryOptions),
                userDoc.collection('believers')
                    .orderBy('updatedAt', 'desc')
                    .limit(5000)
                    .get(queryOptions),
                userDoc.collection('reminders')
                    .orderBy('updatedAt', 'desc')
                    .limit(1000)
                    .get(queryOptions),
                userDoc.collection('settings').doc('categories').get(queryOptions),
                userDoc.get(queryOptions) // 獲取用戶同步資訊
            ]);

            // 處理記錄資料
            let records = [];
            if (recordsSnapshot.status === 'fulfilled' && recordsSnapshot.value) {
                records = recordsSnapshot.value.docs.map(doc => {
                    const data = doc.data();
                    // 資料清理和驗證
                    return this.sanitizeDownloadedRecord({
                        id: doc.id,
                        date: data.date,
                        type: data.type,
                        category: data.category,
                        subcategory: data.subcategory,
                        amount: parseFloat(data.amount) || 0,
                        description: data.description || '',
                        believerName: data.believerName || '',
                        location: data.location || '',
                        updatedAt: data.updatedAt,
                        syncedAt: data.syncedAt,
                        synced: true
                    });
                }).filter(record => record !== null); // 過濾無效記錄
            } else {
                console.warn('無法獲取記錄資料:', recordsSnapshot.reason?.message);
            }

            // 處理信眾資料
            let believers = [];
            if (believersSnapshot.status === 'fulfilled' && believersSnapshot.value) {
                believers = believersSnapshot.value.docs.map(doc => {
                    const data = doc.data();
                    return this.sanitizeDownloadedBeliever({
                        id: data.id || doc.id,
                        name: data.name,
                        phone: data.phone || '',
                        address: data.address || '',
                        notes: data.notes || '',
                        totalDonation: parseFloat(data.totalDonation) || 0,
                        visitCount: parseInt(data.visitCount) || 0,
                        lastVisit: data.lastVisit || '',
                        updatedAt: data.updatedAt,
                        syncedAt: data.syncedAt,
                        synced: true
                    });
                }).filter(believer => believer !== null);
            } else {
                console.warn('無法獲取信眾資料:', believersSnapshot.reason?.message);
            }

            // 處理提醒資料
            let reminders = [];
            if (remindersSnapshot.status === 'fulfilled' && remindersSnapshot.value) {
                reminders = remindersSnapshot.value.docs.map(doc => {
                    const data = doc.data();
                    return this.sanitizeDownloadedReminder({
                        id: doc.id,
                        title: data.title,
                        description: data.description || '',
                        date: data.date,
                        time: data.time,
                        completed: Boolean(data.completed),
                        updatedAt: data.updatedAt,
                        syncedAt: data.syncedAt,
                        synced: true
                    });
                }).filter(reminder => reminder !== null);
            } else {
                console.warn('無法獲取提醒資料:', remindersSnapshot.reason?.message);
            }

            // 處理自定義類別
            let customCategories = null;
            if (categoriesSnapshot.status === 'fulfilled' && categoriesSnapshot.value?.exists) {
                const categoriesData = categoriesSnapshot.value.data();
                customCategories = {
                    customIncomeCategories: Array.isArray(categoriesData.customIncomeCategories) ? 
                        categoriesData.customIncomeCategories : [],
                    customExpenseCategories: Array.isArray(categoriesData.customExpenseCategories) ? 
                        categoriesData.customExpenseCategories : [],
                    updatedAt: categoriesData.updatedAt,
                    syncedAt: categoriesData.syncedAt
                };
            }

            // 獲取用戶同步資訊
            let syncInfo = null;
            if (userInfoSnapshot.status === 'fulfilled' && userInfoSnapshot.value?.exists) {
                const userData = userInfoSnapshot.value.data();
                syncInfo = {
                    lastSyncAt: userData.lastSyncAt,
                    lastUploadAt: userData.lastUploadAt,
                    recordsCount: userData.recordsCount || 0,
                    believersCount: userData.believersCount || 0,
                    remindersCount: userData.remindersCount || 0
                };
            }

            const downloadedData = {
                records,
                believers,
                reminders,
                customCategories,
                syncInfo,
                downloadedAt: new Date().toISOString(),
                source: 'firebase'
            };

            console.log(`成功下載資料: ${records.length} 筆記錄, ${believers.length} 位信眾, ${reminders.length} 個提醒`);

            return {
                success: true,
                data: downloadedData,
                downloadStats: {
                    records: records.length,
                    believers: believers.length,
                    reminders: reminders.length,
                    hasCategories: !!customCategories
                },
                message: `資料已成功從雲端下載 (記錄: ${records.length}, 信眾: ${believers.length}, 提醒: ${reminders.length})`,
                timestamp: new Date().toLocaleString('zh-TW')
            };
        } catch (error) {
            console.error('Firebase 下載資料錯誤:', error);
            
            // 提供更詳細的錯誤訊息
            let errorMessage = '下載失敗';
            if (error.code === 'permission-denied') {
                errorMessage = '權限不足，請檢查登入狀態';
            } else if (error.code === 'unavailable') {
                errorMessage = '雲端服務暫時不可用，請稍後重試';
            } else if (error.code === 'deadline-exceeded') {
                errorMessage = '下載超時，資料量可能過大';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
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
            // 檢查是否正在同步
            if (this.isSyncing) {
                console.log('正在同步中，跳過自動同步');
                return;
            }

            this.isSyncing = true;
            
            // 檢查本地是否有未同步的變更
            let needsSync = false;
            let lastLocalModified, lastCloudSync;
            
            if (window.offlineStorage && window.offlineStorage.isInitialized) {
                // 使用 IndexedDB 檢查待同步項目
                const pendingItems = await window.offlineStorage.getPendingSyncItems().catch(() => []);
                needsSync = pendingItems.length > 0;
                console.log(`IndexedDB 待同步項目: ${pendingItems.length}`);
            } else {
                // 降級使用 localStorage 時間戳檢查
                lastLocalModified = localStorage.getItem('temple-last-modified');
                lastCloudSync = localStorage.getItem('temple-last-cloud-sync');
                needsSync = lastLocalModified && (!lastCloudSync || parseInt(lastLocalModified) > parseInt(lastCloudSync));
            }
            
            if (needsSync) {
                console.log('檢測到本地變更，開始自動同步...');
                // 有本地變更，上傳到雲端
                const localData = await this.collectLocalData();
                const result = await this.uploadData(localData);
                
                if (result.success) {
                    localStorage.setItem('temple-last-cloud-sync', Date.now().toString());
                    
                    // 如果使用 IndexedDB，標記同步項目為已完成
                    if (window.offlineStorage && window.offlineStorage.isInitialized) {
                        const pendingItems = await window.offlineStorage.getPendingSyncItems().catch(() => []);
                        for (const item of pendingItems) {
                            await window.offlineStorage.markSyncItemCompleted(item.id).catch(() => {});
                        }
                    }
                    
                    console.log('自動同步完成:', result.message);
                } else {
                    console.warn('自動同步失敗:', result.message);
                }
            } else {
                console.log('沒有待同步的變更');
            }
        } catch (error) {
            console.warn('自動同步失敗:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * 清理和驗證資料格式
     */
    sanitizeData(data) {
        if (!data || typeof data !== 'object') return data;
        
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            // 跳過 undefined 值
            if (value === undefined) continue;
            
            // 處理 null 值
            if (value === null) {
                sanitized[key] = null;
                continue;
            }
            
            // 處理函數（如 FieldValue）
            if (typeof value === 'function' || 
                (value && typeof value.isEqual === 'function')) {
                sanitized[key] = value;
                continue;
            }
            
            // 處理陣列
            if (Array.isArray(value)) {
                sanitized[key] = value.map(item => 
                    typeof item === 'object' ? this.sanitizeData(item) : item
                );
                continue;
            }
            
            // 遞歸處理物件
            if (typeof value === 'object') {
                sanitized[key] = this.sanitizeData(value);
                continue;
            }
            
            sanitized[key] = value;
        }
        
        return sanitized;
    }

    /**
     * 收集本地資料（整合 localStorage 和 IndexedDB）
     */
    async collectLocalData() {
        let data = {
            records: [],
            believers: [],
            reminders: [],
            customCategories: {
                income: [],
                expense: []
            },
            lastModified: Date.now()
        };

        try {
            // 優先從 IndexedDB 獲取資料
            if (window.offlineStorage && window.offlineStorage.isInitialized) {
                console.log('從 IndexedDB 收集資料...');
                
                const [records, believers, reminders, incomeCategories, expenseCategories] = await Promise.all([
                    window.offlineStorage.getAll('records').catch(() => []),
                    window.offlineStorage.getAll('believers').catch(() => []),
                    window.offlineStorage.getAll('reminders').catch(() => []),
                    window.offlineStorage.getByIndex('categories', 'type', 'income').catch(() => []),
                    window.offlineStorage.getByIndex('categories', 'type', 'expense').catch(() => [])
                ]);
                
                data = {
                    records: records || [],
                    believers: believers || [],
                    reminders: reminders || [],
                    customCategories: {
                        income: incomeCategories || [],
                        expense: expenseCategories || []
                    },
                    lastModified: Date.now()
                };
                
                console.log('IndexedDB 資料收集完成:', {
                    records: data.records.length,
                    believers: data.believers.length,
                    reminders: data.reminders.length,
                    incomeCategories: data.customCategories.income.length,
                    expenseCategories: data.customCategories.expense.length
                });
            } else {
                // 降級到 localStorage
                console.log('IndexedDB 不可用，從 localStorage 收集資料...');
                
                data = {
                    records: JSON.parse(localStorage.getItem('temple-records') || '[]'),
                    believers: JSON.parse(localStorage.getItem('temple-believers') || '[]'),
                    reminders: JSON.parse(localStorage.getItem('temple-reminders') || '[]'),
                    customCategories: {
                        income: JSON.parse(localStorage.getItem('custom-income-categories') || '[]'),
                        expense: JSON.parse(localStorage.getItem('custom-expense-categories') || '[]')
                    },
                    lastModified: parseInt(localStorage.getItem('temple-last-modified') || Date.now().toString())
                };
            }
        } catch (error) {
            console.error('收集本地資料失敗:', error);
            // 返回空資料而不是拋出錯誤
        }

        return data;
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
    /**
     * 清理和驗證下載的記錄資料
     */
    sanitizeDownloadedRecord(record) {
        if (!record || !record.id) return null;
        
        // 基本驗證
        if (!record.type || !['income', 'expense'].includes(record.type)) {
            console.warn('無效的記錄類型:', record);
            return null;
        }
        
        if (!record.date) {
            console.warn('缺少日期的記錄:', record);
            return null;
        }
        
        return {
            id: parseInt(record.id) || record.id,
            date: record.date,
            type: record.type,
            category: record.category || '其他',
            subcategory: record.subcategory || '',
            amount: Math.abs(parseFloat(record.amount)) || 0,
            description: (record.description || '').toString().slice(0, 500), // 限制長度
            believerName: (record.believerName || '').toString().slice(0, 100),
            location: (record.location || '').toString().slice(0, 200),
            updatedAt: record.updatedAt,
            syncedAt: record.syncedAt,
            synced: true
        };
    }

    /**
     * 清理和驗證下載的信眾資料
     */
    sanitizeDownloadedBeliever(believer) {
        if (!believer || (!believer.id && !believer.name)) return null;
        
        if (!believer.name || believer.name.trim().length === 0) {
            console.warn('缺少姓名的信眾資料:', believer);
            return null;
        }
        
        return {
            id: believer.id || believer.name,
            name: believer.name.toString().trim().slice(0, 100),
            phone: (believer.phone || '').toString().slice(0, 20),
            address: (believer.address || '').toString().slice(0, 300),
            notes: (believer.notes || '').toString().slice(0, 1000),
            totalDonation: Math.max(0, parseFloat(believer.totalDonation)) || 0,
            visitCount: Math.max(0, parseInt(believer.visitCount)) || 0,
            lastVisit: believer.lastVisit || '',
            updatedAt: believer.updatedAt,
            syncedAt: believer.syncedAt,
            synced: true
        };
    }

    /**
     * 清理和驗證下載的提醒資料
     */
    sanitizeDownloadedReminder(reminder) {
        if (!reminder || !reminder.id) return null;
        
        if (!reminder.title || reminder.title.trim().length === 0) {
            console.warn('缺少標題的提醒:', reminder);
            return null;
        }
        
        if (!reminder.date) {
            console.warn('缺少日期的提醒:', reminder);
            return null;
        }
        
        return {
            id: parseInt(reminder.id) || reminder.id,
            title: reminder.title.toString().trim().slice(0, 200),
            description: (reminder.description || '').toString().slice(0, 1000),
            date: reminder.date,
            time: reminder.time || '',
            completed: Boolean(reminder.completed),
            updatedAt: reminder.updatedAt,
            syncedAt: reminder.syncedAt,
            synced: true
        };
    }

    /**
     * 將下載的資料應用到本地存儲
     */
    async applyDownloadedData(downloadedData, mergeStrategy = 'timestamp') {
        if (!downloadedData) {
            throw new Error('無效的下載資料');
        }

        console.log(`開始將下載資料應用到本地 (策略: ${mergeStrategy})`);
        
        let mergeStats = {
            records: { added: 0, updated: 0, skipped: 0 },
            believers: { added: 0, updated: 0, skipped: 0 },
            reminders: { added: 0, updated: 0, skipped: 0 },
            categories: { updated: false }
        };

        try {
            // 優先使用 IndexedDB
            if (window.offlineStorage && window.offlineStorage.isInitialized) {
                mergeStats = await this.applyToIndexedDB(downloadedData, mergeStrategy);
            } else {
                // 降級到 localStorage
                console.log('IndexedDB 不可用，使用 localStorage');
                mergeStats = await this.applyToLocalStorage(downloadedData, mergeStrategy);
            }
            
            // 通知應用程式資料已更新
            window.dispatchEvent(new CustomEvent('dataUpdated', {
                detail: { 
                    source: 'cloudDownload', 
                    mergeStats,
                    downloadSource: downloadedData.source || 'unknown'
                }
            }));
            
            console.log('資料合併完成:', mergeStats);
            return mergeStats;
            
        } catch (error) {
            console.error('應用下載資料失敗:', error);
            throw new Error(`資料合併失敗: ${error.message}`);
        }
    }

    /**
     * 將資料應用到 IndexedDB
     */
    async applyToIndexedDB(downloadedData, mergeStrategy) {
        const mergeStats = {
            records: { added: 0, updated: 0, skipped: 0 },
            believers: { added: 0, updated: 0, skipped: 0 },
            reminders: { added: 0, updated: 0, skipped: 0 },
            categories: { updated: false }
        };

        const operations = [];
        
        // 處理記錄
        if (downloadedData.records && Array.isArray(downloadedData.records)) {
            for (const record of downloadedData.records) {
                const existingRecord = await window.offlineStorage.get('records', record.id).catch(() => null);
                
                if (!existingRecord) {
                    operations.push({ type: 'add', storeName: 'records', data: record });
                    mergeStats.records.added++;
                } else if (this.shouldUpdate(existingRecord, record, mergeStrategy)) {
                    operations.push({ type: 'update', storeName: 'records', data: record });
                    mergeStats.records.updated++;
                } else {
                    mergeStats.records.skipped++;
                }
            }
        }
        
        // 處理信眾
        if (downloadedData.believers && Array.isArray(downloadedData.believers)) {
            for (const believer of downloadedData.believers) {
                const existingBeliever = await window.offlineStorage.get('believers', believer.id).catch(() => null);
                
                if (!existingBeliever) {
                    operations.push({ type: 'add', storeName: 'believers', data: believer });
                    mergeStats.believers.added++;
                } else if (this.shouldUpdate(existingBeliever, believer, mergeStrategy)) {
                    operations.push({ type: 'update', storeName: 'believers', data: believer });
                    mergeStats.believers.updated++;
                } else {
                    mergeStats.believers.skipped++;
                }
            }
        }
        
        // 處理提醒
        if (downloadedData.reminders && Array.isArray(downloadedData.reminders)) {
            for (const reminder of downloadedData.reminders) {
                const existingReminder = await window.offlineStorage.get('reminders', reminder.id).catch(() => null);
                
                if (!existingReminder) {
                    operations.push({ type: 'add', storeName: 'reminders', data: reminder });
                    mergeStats.reminders.added++;
                } else if (this.shouldUpdate(existingReminder, reminder, mergeStrategy)) {
                    operations.push({ type: 'update', storeName: 'reminders', data: reminder });
                    mergeStats.reminders.updated++;
                } else {
                    mergeStats.reminders.skipped++;
                }
            }
        }
        
        // 處理自定義類別
        if (downloadedData.customCategories) {
            const { customIncomeCategories = [], customExpenseCategories = [] } = downloadedData.customCategories;
            
            // 更新收入類別
            for (const category of customIncomeCategories) {
                operations.push({ 
                    type: 'update', 
                    storeName: 'categories', 
                    data: { ...category, type: 'income' } 
                });
            }
            
            // 更新支出類別
            for (const category of customExpenseCategories) {
                operations.push({ 
                    type: 'update', 
                    storeName: 'categories', 
                    data: { ...category, type: 'expense' } 
                });
            }
            
            if (customIncomeCategories.length > 0 || customExpenseCategories.length > 0) {
                mergeStats.categories.updated = true;
            }
        }
        
        // 批次執行所有操作
        if (operations.length > 0) {
            await window.offlineStorage.batch(operations);
            console.log(`IndexedDB 批次操作完成: ${operations.length} 個操作`);
        }
        
        return mergeStats;
    }

    /**
     * 將資料應用到 localStorage
     */
    async applyToLocalStorage(downloadedData, mergeStrategy) {
        const mergeStats = {
            records: { added: 0, updated: 0, skipped: 0 },
            believers: { added: 0, updated: 0, skipped: 0 },
            reminders: { added: 0, updated: 0, skipped: 0 },
            categories: { updated: false }
        };

        // 處理記錄
        if (downloadedData.records) {
            const existingRecords = JSON.parse(localStorage.getItem('temple-records') || '[]');
            const recordMap = new Map(existingRecords.map(r => [r.id, r]));
            
            for (const record of downloadedData.records) {
                const existing = recordMap.get(record.id);
                if (!existing) {
                    recordMap.set(record.id, record);
                    mergeStats.records.added++;
                } else if (this.shouldUpdate(existing, record, mergeStrategy)) {
                    recordMap.set(record.id, record);
                    mergeStats.records.updated++;
                } else {
                    mergeStats.records.skipped++;
                }
            }
            
            localStorage.setItem('temple-records', JSON.stringify(Array.from(recordMap.values())));
        }
        
        // 處理信眾（類似記錄）
        if (downloadedData.believers) {
            const existingBelievers = JSON.parse(localStorage.getItem('temple-believers') || '[]');
            const believerMap = new Map(existingBelievers.map(b => [b.id, b]));
            
            for (const believer of downloadedData.believers) {
                const existing = believerMap.get(believer.id);
                if (!existing) {
                    believerMap.set(believer.id, believer);
                    mergeStats.believers.added++;
                } else if (this.shouldUpdate(existing, believer, mergeStrategy)) {
                    believerMap.set(believer.id, believer);
                    mergeStats.believers.updated++;
                } else {
                    mergeStats.believers.skipped++;
                }
            }
            
            localStorage.setItem('temple-believers', JSON.stringify(Array.from(believerMap.values())));
        }
        
        // 處理提醒（類似記錄）
        if (downloadedData.reminders) {
            const existingReminders = JSON.parse(localStorage.getItem('temple-reminders') || '[]');
            const reminderMap = new Map(existingReminders.map(r => [r.id, r]));
            
            for (const reminder of downloadedData.reminders) {
                const existing = reminderMap.get(reminder.id);
                if (!existing) {
                    reminderMap.set(reminder.id, reminder);
                    mergeStats.reminders.added++;
                } else if (this.shouldUpdate(existing, reminder, mergeStrategy)) {
                    reminderMap.set(reminder.id, reminder);
                    mergeStats.reminders.updated++;
                } else {
                    mergeStats.reminders.skipped++;
                }
            }
            
            localStorage.setItem('temple-reminders', JSON.stringify(Array.from(reminderMap.values())));
        }
        
        // 處理自定義類別
        if (downloadedData.customCategories) {
            const { customIncomeCategories = [], customExpenseCategories = [] } = downloadedData.customCategories;
            
            if (customIncomeCategories.length > 0) {
                localStorage.setItem('custom-income-categories', JSON.stringify(customIncomeCategories));
                mergeStats.categories.updated = true;
            }
            
            if (customExpenseCategories.length > 0) {
                localStorage.setItem('custom-expense-categories', JSON.stringify(customExpenseCategories));
                mergeStats.categories.updated = true;
            }
        }
        
        // 更新最後修改時間
        localStorage.setItem('temple-last-modified', Date.now().toString());
        
        return mergeStats;
    }

    /**
     * 判斷是否需要更新資料
     */
    shouldUpdate(existing, downloaded, strategy) {
        switch (strategy) {
            case 'replace':
                return true; // 全部替換
                
            case 'timestamp':
                // 根據時間戳判斷
                const existingTime = existing.updatedAt ? new Date(existing.updatedAt.seconds * 1000 || existing.updatedAt) : new Date(0);
                const downloadedTime = downloaded.updatedAt ? new Date(downloaded.updatedAt.seconds * 1000 || downloaded.updatedAt) : new Date();
                return downloadedTime > existingTime;
                
            case 'merge':
                // 簡單的合併逻輯（可以擴展）
                return JSON.stringify(existing) !== JSON.stringify(downloaded);
                
            default:
                return false;
        }
    }

    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            currentUser: this.currentUser ? {
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                displayName: this.currentUser.displayName,
                isAnonymous: this.currentUser.isAnonymous
            } : null,
            localStorageMode: this.localStorageMode || false,
            lastSync: localStorage.getItem('temple-last-cloud-sync') || null
        };
    }
}

// 創建全局實例
window.firebaseCloud = new FirebaseCloudService(); 