// 廣清宮記帳軟體測試數據生成器
// 使用方法：在瀏覽器控制台中執行此腳本

function generateTestData() {
    console.log('開始生成測試數據...');
    
    // 清空現有數據
    localStorage.removeItem('temple-records');
    localStorage.removeItem('temple-believers');
    localStorage.removeItem('temple-reminders');
    localStorage.removeItem('temple-inventory');
    localStorage.removeItem('temple-stock-movements');
    localStorage.removeItem('temple-events');
    
    // 生成財務記錄數據
    const records = [];
    const believers = [];
    const reminders = [];
    
    // 收入類別
    const incomeCategories = [
        '香油錢', '點燈費', '安太歲', '祈福金', '法會功德金', 
        '建廟基金', '慈善捐款', '節慶捐款', '特殊法會', '其他捐款'
    ];
    
    // 支出類別
    const expenseCategories = [
        '水電費', '清潔用品', '祭品採購', '維修費用', '人事費用',
        '法會用品', '慈善支出', '設備採購', '行政費用', '其他支出'
    ];
    
    // 信眾姓名列表
    const believerNames = [
        '王大明', '李小華', '陳美玲', '張志強', '林淑芬',
        '黃建國', '吳雅婷', '劉俊傑', '蔡佳蓉', '鄭文龍',
        '謝淑惠', '許志豪', '楊麗娟', '洪明德', '周雅雯',
        '朱建華', '何美珠', '呂志明', '蘇雅琪', '馬文傑',
        '高淑玲', '孫建國', '韓雅婷', '曾志強', '彭美華',
        '董文龍', '薛淑芬', '葉志豪', '范雅玲', '石建明'
    ];
    
    // 生成2023年和2024年的財務記錄
    let recordId = 1;
    
    for (let year = 2023; year <= 2024; year++) {
        for (let month = 1; month <= 12; month++) {
            // 如果是2024年，只生成到當前月份
            if (year === 2024 && month > new Date().getMonth() + 1) break;
            
            // 每月生成15-25筆記錄
            const recordCount = Math.floor(Math.random() * 11) + 15;
            
            for (let i = 0; i < recordCount; i++) {
                const isIncome = Math.random() > 0.3; // 70%機率是收入
                const day = Math.floor(Math.random() * 28) + 1;
                const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                
                if (isIncome) {
                    // 收入記錄
                    const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
                    const donor = believerNames[Math.floor(Math.random() * believerNames.length)];
                    let amount;
                    
                    // 根據類別設定金額範圍
                    switch (category) {
                        case '香油錢':
                            amount = Math.floor(Math.random() * 500) + 100;
                            break;
                        case '點燈費':
                            amount = Math.floor(Math.random() * 300) + 200;
                            break;
                        case '安太歲':
                            amount = Math.floor(Math.random() * 400) + 600;
                            break;
                        case '建廟基金':
                            amount = Math.floor(Math.random() * 5000) + 1000;
                            break;
                        case '法會功德金':
                            amount = Math.floor(Math.random() * 2000) + 500;
                            break;
                        default:
                            amount = Math.floor(Math.random() * 1000) + 300;
                    }
                    
                    records.push({
                        id: recordId++,
                        type: 'income',
                        category: category,
                        amount: amount,
                        date: date,
                        description: `${category} - ${donor}`,
                        donor: donor,
                        createdAt: new Date(date).toISOString()
                    });
                } else {
                    // 支出記錄
                    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                    let amount;
                    
                    // 根據類別設定金額範圍
                    switch (category) {
                        case '水電費':
                            amount = Math.floor(Math.random() * 3000) + 2000;
                            break;
                        case '祭品採購':
                            amount = Math.floor(Math.random() * 2000) + 1000;
                            break;
                        case '維修費用':
                            amount = Math.floor(Math.random() * 5000) + 1000;
                            break;
                        case '人事費用':
                            amount = Math.floor(Math.random() * 8000) + 5000;
                            break;
                        case '設備採購':
                            amount = Math.floor(Math.random() * 10000) + 2000;
                            break;
                        default:
                            amount = Math.floor(Math.random() * 1500) + 500;
                    }
                    
                    records.push({
                        id: recordId++,
                        type: 'expense',
                        category: category,
                        amount: amount,
                        date: date,
                        description: `${category} - ${month}月份`,
                        donor: '',
                        createdAt: new Date(date).toISOString()
                    });
                }
            }
        }
    }
    
    // 生成信眾資料
    believerNames.forEach((name, index) => {
        const birthYear = 1950 + Math.floor(Math.random() * 50);
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const birthDay = Math.floor(Math.random() * 28) + 1;
        const birthday = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
        
        // 計算該信眾的總捐款
        const believerRecords = records.filter(r => r.donor === name && r.type === 'income');
        const totalDonation = believerRecords.reduce((sum, r) => sum + r.amount, 0);
        
        believers.push({
            name: name,
            birthday: birthday,
            phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            email: `${name.replace(/[^\w]/g, '')}@email.com`,
            address: `台北市${['中正區', '大同區', '中山區', '松山區', '大安區'][Math.floor(Math.random() * 5)]}某某路${Math.floor(Math.random() * 200) + 1}號`,
            totalDonation: totalDonation,
            donationCount: believerRecords.length,
            createdAt: new Date().toISOString()
        });
    });
    
    // 生成提醒事項
    const reminderTitles = [
        '準備春節法會用品', '檢查消防設備', '更新信眾資料',
        '準備中元普渡', '安排年度大掃除', '檢查電器設備',
        '準備媽祖聖誕法會', '更新財務報表', '安排志工培訓',
        '檢查建築安全', '準備重陽節活動', '更新網站資訊'
    ];
    
    reminderTitles.forEach((title, index) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 90) + 1);
        
        reminders.push({
            id: index + 1,
            title: title,
            description: `${title}的詳細說明和注意事項`,
            dueDate: dueDate.toISOString().split('T')[0],
            repeat: ['none', 'daily', 'weekly', 'monthly', 'yearly'][Math.floor(Math.random() * 5)],
            advanceDays: Math.floor(Math.random() * 7) + 1,
            completed: Math.random() > 0.7,
            createdAt: new Date().toISOString()
        });
    });
    
    // 保存到 localStorage
    localStorage.setItem('temple-records', JSON.stringify(records));
    localStorage.setItem('temple-believers', JSON.stringify(believers));
    localStorage.setItem('temple-reminders', JSON.stringify(reminders));
    
    console.log(`✅ 測試數據生成完成！`);
    console.log(`📊 財務記錄: ${records.length} 筆`);
    console.log(`👥 信眾資料: ${believers.length} 筆`);
    console.log(`⏰ 提醒事項: ${reminders.length} 筆`);
    console.log(`💰 總收入: ${records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0).toLocaleString()} 元`);
    console.log(`💸 總支出: ${records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0).toLocaleString()} 元`);
    
    // 重新載入頁面以顯示新數據
    alert('測試數據已生成完成！頁面將重新載入以顯示新數據。');
    window.location.reload();
}

// 執行數據生成
generateTestData();
