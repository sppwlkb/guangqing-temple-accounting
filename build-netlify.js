#!/usr/bin/env node

/**
 * Netlify建置腳本
 * 處理環境變數注入和文件優化
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 開始Netlify建置流程...');

// 獲取環境變數
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nfncwofzfjdvyhdfjbzw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbmN3b2Z6ZmpkdnloZGZqYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjM0MDcsImV4cCI6MjA3MzA5OTQwN30.ZyLtV91pG618utDhJhGJbZpbFPZ_IEx2mBPc7GVfkH4';

console.log('環境變數:', {
    SUPABASE_URL: SUPABASE_URL.substring(0, 30) + '...',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY.substring(0, 10) + '...',
    NODE_ENV: process.env.NODE_ENV
});

// 處理env-loader.js文件
function processEnvLoader() {
    const envLoaderPath = path.join(__dirname, 'env-loader.js');
    
    if (fs.existsSync(envLoaderPath)) {
        let content = fs.readFileSync(envLoaderPath, 'utf8');
        
        // 替換環境變數占位符
        content = content.replace(/%%VITE_SUPABASE_URL%%/g, SUPABASE_URL);
        content = content.replace(/%%VITE_SUPABASE_ANON_KEY%%/g, SUPABASE_ANON_KEY);
        
        fs.writeFileSync(envLoaderPath, content);
        console.log('✅ env-loader.js 環境變數已注入');
    } else {
        console.warn('⚠️ env-loader.js 檔案不存在');
    }
}

// 更新HTML文件的meta標籤
function updateHtmlMeta() {
    const htmlPath = path.join(__dirname, 'index-enhanced.html');
    
    if (fs.existsSync(htmlPath)) {
        let content = fs.readFileSync(htmlPath, 'utf8');
        
        // 在head標籤中添加環境變數meta標籤
        const metaTags = `
    <!-- Supabase配置 (由Netlify建置時注入) -->
    <meta name="supabase-url" content="${SUPABASE_URL}">
    <meta name="supabase-anon-key" content="${SUPABASE_ANON_KEY}">
    <meta name="app-environment" content="production">
    `;
        
        // 在</head>之前插入meta標籤
        content = content.replace('</head>', metaTags + '</head>');
        
        fs.writeFileSync(htmlPath, content);
        console.log('✅ HTML meta標籤已更新');
    } else {
        console.warn('⚠️ index-enhanced.html 檔案不存在');
    }
}

// 創建環境狀態檢查文件
function createEnvStatus() {
    const envStatus = {
        supabaseConfigured: !!(SUPABASE_URL && !SUPABASE_URL.includes('your-project')),
        buildTime: new Date().toISOString(),
        environment: 'production',
        netlify: true
    };
    
    fs.writeFileSync('env-status.json', JSON.stringify(envStatus, null, 2));
    console.log('✅ 環境狀態文件已創建');
}

// 執行建置任務
try {
    processEnvLoader();
    updateHtmlMeta();
    createEnvStatus();
    console.log('🎉 Netlify建置流程完成！');
} catch (error) {
    console.error('❌ 建置過程中發生錯誤:', error);
    process.exit(1);
}