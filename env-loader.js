/**
 * 環境變數載入器
 * 在生產環境中從 Netlify 環境變數載入設定
 */

// 檢查是否在 Netlify 環境中
const isNetlify = window.location.hostname.includes('netlify.app') || 
                  window.location.hostname.includes('netlify.com') ||
                  window.location.hostname !== 'localhost';

// 開發環境配置
const DEV_CONFIG = {
    SUPABASE_URL: 'https://nfncwofzfjdvyhdfjbzw.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbmN3b2Z6ZmpkdnloZGZqYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjM0MDcsImV4cCI6MjA3MzA5OTQwN30.ZyLtV91pG618utDhJhGJbZpbFPZ_IEx2mBPc7GVfkH4',
    APP_ENV: 'development'
};

// 載入環境變數的函數
function loadEnvironmentVariables() {
    try {
        // 如果是生產環境，從 Netlify 注入的環境變數中讀取
        if (isNetlify) {
            console.log('生產環境：從 Netlify 環境變數載入');
            
            // Netlify 在建置時會將環境變數注入，但我們需要手動處理
            // 檢查是否有預先注入的環境變數
            const netlifySupabaseUrl = '%%VITE_SUPABASE_URL%%'; // Netlify 建置時會替換
            const netlifySupabaseKey = '%%VITE_SUPABASE_ANON_KEY%%'; // Netlify 建置時會替換
            
            // 如果變數沒有被替換（仍包含%%），則使用默認值
            window.SUPABASE_URL = netlifySupabaseUrl.includes('%%') ? 
                DEV_CONFIG.SUPABASE_URL : netlifySupabaseUrl;
            window.SUPABASE_ANON_KEY = netlifySupabaseKey.includes('%%') ? 
                DEV_CONFIG.SUPABASE_ANON_KEY : netlifySupabaseKey;
            window.APP_ENV = 'production';
            
            // 備用方案：從meta標籤讀取（如果有設定）
            const metaSupabaseUrl = document.querySelector('meta[name="supabase-url"]');
            const metaSupabaseKey = document.querySelector('meta[name="supabase-anon-key"]');
            
            if (metaSupabaseUrl && metaSupabaseUrl.content) {
                window.SUPABASE_URL = metaSupabaseUrl.content;
            }
            if (metaSupabaseKey && metaSupabaseKey.content) {
                window.SUPABASE_ANON_KEY = metaSupabaseKey.content;
            }
        } else {
            // 開發環境
            console.log('開發環境：使用本地配置');
            Object.assign(window, DEV_CONFIG);
        }
        
        // 強制設定實際的環境變數（如果還是預設值的話）
        if (window.SUPABASE_URL.includes('your-project')) {
            window.SUPABASE_URL = DEV_CONFIG.SUPABASE_URL;
        }
        if (window.SUPABASE_ANON_KEY.includes('your-anon-key')) {
            window.SUPABASE_ANON_KEY = DEV_CONFIG.SUPABASE_ANON_KEY;
        }
        
        // 設定給 Vue/其他框架使用的全域變數
        window.NEXT_PUBLIC_SUPABASE_URL = window.SUPABASE_URL;
        window.NEXT_PUBLIC_SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
        
        // 驗證必要的環境變數
        if (!window.SUPABASE_URL || window.SUPABASE_URL.includes('your-project')) {
            console.warn('⚠️ Supabase URL 未正確設定，將使用離線模式');
        }
        
        if (!window.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY.includes('your-anon-key')) {
            console.warn('⚠️ Supabase 匿名金鑰未正確設定，將使用離線模式');
        }
        
        console.log('環境變數載入完成:', {
            environment: window.APP_ENV,
            supabaseConfigured: !!(window.SUPABASE_URL && !window.SUPABASE_URL.includes('your-project')),
            hostname: window.location.hostname
        });
        
    } catch (error) {
        console.error('環境變數載入失敗:', error);
        // 降級到開發環境配置
        Object.assign(window, DEV_CONFIG);
    }
}

// 立即載入環境變數
loadEnvironmentVariables();

// 提供給其他腳本使用的工具函數
window.getEnvConfig = function() {
    return {
        supabaseUrl: window.SUPABASE_URL,
        supabaseKey: window.SUPABASE_ANON_KEY,
        environment: window.APP_ENV,
        isProduction: window.APP_ENV === 'production',
        isDevelopment: window.APP_ENV === 'development'
    };
};

// 提供環境檢查函數
window.checkEnvironment = function() {
    const config = window.getEnvConfig();
    
    return {
        ready: !!(config.supabaseUrl && config.supabaseKey && 
                 !config.supabaseUrl.includes('your-project') && 
                 !config.supabaseKey.includes('your-anon-key')),
        config: config,
        warnings: [
            ...(config.supabaseUrl.includes('your-project') ? ['Supabase URL 未設定'] : []),
            ...(config.supabaseKey.includes('your-anon-key') ? ['Supabase 匿名金鑰未設定'] : [])
        ]
    };
};