/**
 * 廣清宮記帳軟體 - 簡單HTTP服務器
 * 解決CORS問題，支援PWA功能
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

// MIME類型映射
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

// 獲取本機IP地址
function getLocalIP() {
    const interfaces = require('os').networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// 創建HTTP服務器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 預設首頁
    if (pathname === '/') {
        pathname = '/index-enhanced.html';
    }
    
    // 安全檢查：防止目錄遍歷攻擊
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, safePath);
    
    // 檢查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // 文件不存在，返回404
            res.writeHead(404, {
                'Content-Type': 'text/html; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(`
                <!DOCTYPE html>
                <html lang="zh-TW">
                <head>
                    <meta charset="UTF-8">
                    <title>404 - 找不到頁面</title>
                    <style>
                        body { 
                            font-family: 'Microsoft JhengHei', sans-serif; 
                            text-align: center; 
                            padding: 50px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            min-height: 100vh;
                            margin: 0;
                        }
                        .container {
                            background: rgba(255, 255, 255, 0.1);
                            padding: 30px;
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                            display: inline-block;
                            margin-top: 100px;
                        }
                        h1 { font-size: 3em; margin: 0; }
                        p { font-size: 1.2em; margin: 20px 0; }
                        a { color: #ffeb3b; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🏛️ 404</h1>
                        <p>找不到您要的頁面</p>
                        <p><a href="/">返回首頁</a></p>
                    </div>
                </body>
                </html>
            `);
            return;
        }
        
        // 讀取文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end('500 - 服務器內部錯誤');
                return;
            }
            
            // 獲取文件擴展名
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            // 設置響應頭
            const headers = {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Cache-Control': 'no-cache'
            };
            
            // PWA相關頭部
            if (ext === '.html') {
                headers['X-Content-Type-Options'] = 'nosniff';
                headers['X-Frame-Options'] = 'DENY';
                headers['X-XSS-Protection'] = '1; mode=block';
            }
            
            // Service Worker相關
            if (pathname.includes('service-worker.js')) {
                headers['Service-Worker-Allowed'] = '/';
                headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            }
            
            // Manifest文件
            if (ext === '.json' && pathname.includes('manifest')) {
                headers['Content-Type'] = 'application/manifest+json; charset=utf-8';
            }
            
            res.writeHead(200, headers);
            res.end(data);
        });
    });
});

// 處理OPTIONS請求（CORS預檢）
server.on('request', (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        });
        res.end();
    }
});

// 啟動服務器
server.listen(PORT, () => {
    const localIP = getLocalIP();
    
    console.log('🏛️ 廣清宮快速記帳軟體 - HTTP服務器已啟動');
    console.log('');
    console.log('📱 本地訪問: http://localhost:' + PORT);
    console.log('📱 網路訪問: http://' + localIP + ':' + PORT);
    console.log('');
    console.log('💡 提示:');
    console.log('  • 電腦請使用: http://localhost:' + PORT);
    console.log('  • 手機請使用: http://' + localIP + ':' + PORT);
    console.log('  • 按 Ctrl+C 停止服務器');
    console.log('');
    console.log('🚀 服務器運行中...');
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n🛑 正在關閉服務器...');
    server.close(() => {
        console.log('✅ 服務器已關閉');
        process.exit(0);
    });
});

// 錯誤處理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用，請嘗試其他端口`);
    } else {
        console.error('❌ 服務器錯誤:', err);
    }
    process.exit(1);
});
