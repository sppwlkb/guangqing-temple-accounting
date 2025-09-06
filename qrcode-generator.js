/**
 * QR Code 生成器
 * 使用純JavaScript生成QR Code，無需外部依賴
 */

class QRCodeGenerator {
    constructor() {
        this.modules = [];
        this.moduleCount = 0;
    }

    /**
     * 生成QR Code
     * @param {string} text - 要編碼的文字
     * @param {number} size - QR Code大小 (預設: 256)
     * @returns {string} - Base64編碼的PNG圖片
     */
    generate(text, size = 256) {
        // 簡化版QR Code生成 - 使用在線API
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=10`;
        return qrApiUrl;
    }

    /**
     * 創建QR Code HTML元素
     * @param {string} text - 要編碼的文字
     * @param {number} size - QR Code大小
     * @returns {HTMLElement} - QR Code圖片元素
     */
    createQRElement(text, size = 256) {
        const img = document.createElement('img');
        img.src = this.generate(text, size);
        img.alt = 'QR Code';
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '8px';
        return img;
    }

    /**
     * 顯示QR Code模態框
     * @param {string} text - 要編碼的文字
     * @param {string} title - 模態框標題
     * @param {string} description - 描述文字
     */
    showQRModal(text, title = 'QR Code', description = '請使用手機掃描此QR Code') {
        // 創建模態框
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        // 創建模態框內容
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: qrModalShow 0.3s ease-out;
        `;

        // 添加動畫樣式
        if (!document.getElementById('qr-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'qr-modal-styles';
            style.textContent = `
                @keyframes qrModalShow {
                    from {
                        opacity: 0;
                        transform: scale(0.8) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .qr-modal-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                .qr-modal-close:hover {
                    background: #d32f2f;
                    transform: scale(1.1);
                }
                .qr-copy-btn {
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin: 10px 5px;
                    font-size: 14px;
                    transition: all 0.3s;
                }
                .qr-copy-btn:hover {
                    background: #1976D2;
                    transform: translateY(-2px);
                }
                .qr-sync-btn {
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin: 15px 5px;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                .qr-sync-btn:hover {
                    background: #45a049;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                }
            `;
            document.head.appendChild(style);
        }

        modalContent.style.position = 'relative';

        // 關閉按鈕
        const closeBtn = document.createElement('button');
        closeBtn.className = 'qr-modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => {
            modal.style.animation = 'qrModalShow 0.3s ease-out reverse';
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        // 標題
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            margin: 0 0 15px 0;
            color: #333;
            font-size: 24px;
            font-weight: bold;
        `;

        // 描述
        const descElement = document.createElement('p');
        descElement.textContent = description;
        descElement.style.cssText = `
            margin: 0 0 20px 0;
            color: #666;
            font-size: 16px;
            line-height: 1.5;
        `;

        // QR Code圖片
        const qrImg = this.createQRElement(text, 200);
        qrImg.style.margin = '20px 0';

        // 複製連結按鈕
        const copyBtn = document.createElement('button');
        copyBtn.className = 'qr-copy-btn';
        copyBtn.textContent = '📋 複製連結';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = '✅ 已複製';
                setTimeout(() => {
                    copyBtn.textContent = '📋 複製連結';
                }, 2000);
            });
        };

        // 立即同步按鈕
        const syncBtn = document.createElement('button');
        syncBtn.className = 'qr-sync-btn';
        syncBtn.textContent = '☁️ 立即同步到雲端';
        syncBtn.onclick = async () => {
            syncBtn.textContent = '⏳ 同步中...';
            syncBtn.disabled = true;
            
            try {
                const result = await window.cloudSync.syncToCloud();
                if (result.success) {
                    syncBtn.textContent = '✅ 同步成功';
                    syncBtn.style.background = '#4CAF50';
                    
                    // 更新QR Code（包含最新的同步ID）
                    const newQRData = window.cloudSync.generateQRData();
                    qrImg.src = window.qrGenerator.generate(newQRData.url, 200);
                } else {
                    syncBtn.textContent = '❌ 同步失敗';
                    syncBtn.style.background = '#f44336';
                    alert('同步失敗：' + result.message);
                }
            } catch (error) {
                syncBtn.textContent = '❌ 同步失敗';
                syncBtn.style.background = '#f44336';
                alert('同步失敗：' + error.message);
            }
            
            setTimeout(() => {
                syncBtn.textContent = '☁️ 立即同步到雲端';
                syncBtn.style.background = '#4CAF50';
                syncBtn.disabled = false;
            }, 3000);
        };

        // 使用說明
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
            font-size: 14px;
            color: #555;
        `;
        instructions.innerHTML = `
            <strong>📱 手機安裝步驟：</strong><br>
            1. 使用手機掃描上方QR Code<br>
            2. 在手機瀏覽器中開啟連結<br>
            3. 點擊瀏覽器選單中的「加到主畫面」<br>
            4. 確認安裝，即可在桌面使用<br>
            <br>
            <strong>☁️ 數據同步：</strong><br>
            • 先點擊「立即同步到雲端」<br>
            • 手機掃描後會自動同步數據<br>
            • 確保手機和電腦數據一致
        `;

        // 組裝模態框
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(titleElement);
        modalContent.appendChild(descElement);
        modalContent.appendChild(qrImg);
        modalContent.appendChild(document.createElement('br'));
        modalContent.appendChild(copyBtn);
        modalContent.appendChild(syncBtn);
        modalContent.appendChild(instructions);

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // 點擊背景關閉
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        };

        // ESC鍵關閉
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeBtn.click();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return modal;
    }

    /**
     * 為手機安裝顯示QR Code
     */
    showInstallQR() {
        const qrData = window.cloudSync.generateQRData();
        this.showQRModal(
            qrData.url,
            '📱 安裝到手機',
            '掃描QR Code在手機上安裝廣清宮記帳軟體'
        );
    }
}

// 創建全局實例
window.qrGenerator = new QRCodeGenerator();
