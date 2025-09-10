#!/usr/bin/env node

/**
 * 簡單的建置腳本 - 不依賴 Vite
 * 直接複製文件到 dist 目錄
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 開始簡單建置流程...');

// 獲取環境變數
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('環境變數:', {
    SUPABASE_URL: SUPABASE_URL.substring(0, 30) + '...',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY.substring(0, 10) + '...',
    NODE_ENV: process.env.NODE_ENV || 'production'
});

// 創建 dist 目錄
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// 要複製的文件列表
const filesToCopy = [
    'index-enhanced.html',
    'cloud-sync.js',
    'supabase-sync.js',
    'env-loader.js',
    'qrcode-generator.js',
    'offline-storage.js',
    'manifest.json',
    'service-worker.js',
    'favicon.ico'
];

// 複製文件
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join('dist', file));
        console.log(`✅ 複製 ${file}`);
    } else {
        console.log(`⚠️ 文件不存在: ${file}`);
    }
});

// 處理 env-loader.js - 注入環境變數
const envLoaderPath = path.join('dist', 'env-loader.js');
if (fs.existsSync(envLoaderPath)) {
    let content = fs.readFileSync(envLoaderPath, 'utf8');
    
    // 替換環境變數占位符
    content = content.replace(/%%VITE_SUPABASE_URL%%/g, SUPABASE_URL);
    content = content.replace(/%%VITE_SUPABASE_ANON_KEY%%/g, SUPABASE_ANON_KEY);
    
    fs.writeFileSync(envLoaderPath, content);
    console.log('✅ env-loader.js 環境變數已注入');
}

// 更新 index-enhanced.html 的 meta 標籤
const htmlPath = path.join('dist', 'index-enhanced.html');
if (fs.existsSync(htmlPath)) {
    let content = fs.readFileSync(htmlPath, 'utf8');
    
    // 在 head 標籤中添加環境變數 meta 標籤
    const metaTags = `
    <!-- Supabase配置 (由Netlify建置時注入) -->
    <meta name="supabase-url" content="${SUPABASE_URL}">
    <meta name="supabase-anon-key" content="${SUPABASE_ANON_KEY}">
    <meta name="app-environment" content="production">
    `;
    
    // 在 </head> 之前插入 meta 標籤
    content = content.replace('</head>', metaTags + '</head>');
    
    fs.writeFileSync(htmlPath, content);
    console.log('✅ HTML meta標籤已更新');
}

// 創建環境狀態文件
const envStatus = {
    supabaseConfigured: !!(SUPABASE_URL && !SUPABASE_URL.includes('your-project')),
    buildTime: new Date().toISOString(),
    environment: 'production',
    netlify: true
};

fs.writeFileSync(path.join('dist', 'env-status.json'), JSON.stringify(envStatus, null, 2));

// 創建 .nojekyll 文件
fs.writeFileSync(path.join('dist', '.nojekyll'), '');

console.log('🎉 簡單建置流程完成！');
console.log('📁 建置文件位於 dist/ 目錄');

// 列出建置後的文件
console.log('\n📋 建置文件清單:');
const distFiles = fs.readdirSync('dist');
distFiles.forEach(file => {
    console.log(`   ${file}`);
});