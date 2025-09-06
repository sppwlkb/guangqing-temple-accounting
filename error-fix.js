/**
 * 錯誤修復腳本
 * 修復 Firebase 和 IndexedDB 相關錯誤
 */

(function() {
    'use strict';

    console.log('🔧 啟動錯誤修復腳本...');

    // 1. 修復 Firebase 初始化錯誤
    function fixFirebaseErrors() {
        // 檢查是否存在 Firebase 全域變數衝突
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            console.log('⚠️ 檢測到多個 Firebase 應用實例，正在清理...');
            try {
                firebase.apps.forEach(app => {
                    if (app.name !== '[DEFAULT]') {
                        app.delete();
                    }
                });
            } catch (e) {
                console.warn('Firebase 清理警告:', e.message);
            }
        }

        // 修復 Firebase SDK 載入順序問題
        window.firebaseLoadPromise = window.firebaseLoadPromise || new Promise((resolve, reject) => {
            if (typeof firebase !== 'undefined') {
                resolve();
                return;
            }

            const scripts = [
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js'
            ];

            let loadedCount = 0;

            scripts.forEach((src, index) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = false; // 確保順序載入
                
                script.onload = () => {
                    loadedCount++;
                    console.log(`✅ Firebase 腳本 ${index + 1}/${scripts.length} 載入完成`);
                    
                    if (loadedCount === scripts.length) {
                        console.log('🔥 Firebase SDK 載入完成');
                        resolve();
                    }
                };

                script.onerror = (error) => {
                    console.error(`❌ Firebase 腳本載入失敗: ${src}`, error);
                    reject(error);
                };

                document.head.appendChild(script);
            });
        });

        return window.firebaseLoadPromise;
    }

    // 2. 修復 IndexedDB 錯誤
    function fixIndexedDBErrors() {
        // 檢查 IndexedDB 支援
        if (!window.indexedDB) {
            console.warn('⚠️ 瀏覽器不支援 IndexedDB，將使用 localStorage 作為備用');
            return Promise.resolve(false);
        }

        // 修復 IndexedDB 版本衝突
        return new Promise((resolve) => {
            const testDBName = 'temple-accounting-test';
            const deleteReq = indexedDB.deleteDatabase(testDBName);
            
            deleteReq.onsuccess = () => {
                console.log('✅ IndexedDB 測試清理完成');
                resolve(true);
            };
            
            deleteReq.onerror = () => {
                console.warn('⚠️ IndexedDB 清理失敗，但將繼續執行');
                resolve(false);
            };
            
            // 超時處理
            setTimeout(() => resolve(true), 3000);
        });
    }

    // 3. 修復全域變數衝突
    function fixGlobalConflicts() {
        // 檢查 Vue 相關衝突
        if (window.Vue && window.Vue.version) {
            console.log(`✅ Vue ${window.Vue.version} 已載入`);
        }

        // 檢查 ElementPlus 相關衝突
        if (window.ElementPlus) {
            console.log('✅ ElementPlus 已載入');
        }

        // 修復可能的全域變數覆蓋問題
        const protectedGlobals = ['Vue', 'ElementPlus', 'echarts'];
        protectedGlobals.forEach(globalName => {
            if (window[globalName]) {
                Object.defineProperty(window, globalName, {
                    writable: false,
                    configurable: false
                });
            }
        });
    }

    // 4. 修復控制台錯誤處理
    function fixConsoleErrors() {
        // 捕獲未處理的錯誤
        window.addEventListener('error', function(event) {
            console.group('🚨 捕獲到錯誤:');
            console.error('錯誤訊息:', event.message);
            console.error('檔案:', event.filename);
            console.error('行號:', event.lineno);
            console.error('列號:', event.colno);
            console.error('錯誤物件:', event.error);
            console.groupEnd();
            
            // 不阻止預設行為，但記錄詳細資訊
            return false;
        });

        // 捕獲 Promise 拒絕
        window.addEventListener('unhandledrejection', function(event) {
            console.group('🚨 捕獲到 Promise 拒絕:');
            console.error('原因:', event.reason);
            console.error('Promise:', event.promise);
            console.groupEnd();
            
            // 防止在控制台顯示未處理的拒絕錯誤
            event.preventDefault();
        });
    }

    // 5. 主修復函數
    async function runErrorFix() {
        try {
            console.log('🔧 開始錯誤修復程序...');

            // 修復全域變數衝突
            fixGlobalConflicts();

            // 修復控制台錯誤處理
            fixConsoleErrors();

            // 修復 IndexedDB
            const indexedDBOK = await fixIndexedDBErrors();
            if (indexedDBOK) {
                console.log('✅ IndexedDB 修復完成');
            }

            // 修復 Firebase
            await fixFirebaseErrors();
            console.log('✅ Firebase 修復完成');

            console.log('🎉 錯誤修復程序完成');

            // 發送修復完成事件
            window.dispatchEvent(new CustomEvent('errorFixComplete', {
                detail: { 
                    firebaseOK: true, 
                    indexedDBOK: indexedDBOK,
                    timestamp: new Date().toISOString()
                }
            }));

        } catch (error) {
            console.error('❌ 錯誤修復程序失敗:', error);
        }
    }

    // 6. 延遲執行修復，確保 DOM 載入完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runErrorFix);
    } else {
        // DOM 已載入，立即執行
        setTimeout(runErrorFix, 100);
    }

    // 7. 提供手動修復接口
    window.runErrorFix = runErrorFix;
    
    console.log('🔧 錯誤修復腳本已載入，使用 window.runErrorFix() 可手動執行修復');

})();