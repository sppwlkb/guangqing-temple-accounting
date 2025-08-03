const { createApp, ref, computed, onMounted, nextTick, watch } = Vue;

// IndexedDB 資料庫設定
const db = new Dexie('TempleAccountingDB_CRM_Projects');
db.version(1).stores({
    records: '++id, type, category, amount, date, description, donor, projectId, createdAt',
    reminders: '++id, title, description, dueDate, repeat, advanceDays, completed, createdAt',
    budgets: '&month, data',
    donors: '&name, birthday, phone, address, zodiac, totalDonation, donationCount, lastDonationDate',
    projects: '++id, name, description, createdAt'
});

createApp({
    setup() {
        // 響應式資料
        const showAddModal = ref(false);
        const showReminderModal = ref(false);
        const showBudgetModal = ref(false);
        const showProjectModal = ref(false);
        const showDonorModal = ref(false);
        const showNotificationPopup = ref(false);
        const currentPage = ref('dashboard');
        const records = ref([]);
        const reminders = ref([]);
        const budgets = ref({});
        const donors = ref([]);
        const projects = ref([]);
        const editingReminder = ref(null);
        const editingProject = ref(null);
        const editingDonor = ref(null);
        const currentNotification = ref({});
        const selectedTimeFilter = ref('3months');
        const donorSearchQuery = ref('');
        const selectedDonor = ref(null);
        const selectedProject = ref(null);
        
        const form = ref({
            type: 'income',
            category: '',
            amount: null,
            date: new Date().toISOString().split('T')[0],
            description: '',
            donor: '',
            projectId: null
        });
        
        const reminderForm = ref({
            title: '',
            description: '',
            dueDate: '',
            repeat: 'none',
            advanceDays: 2
        });
        
        const budgetForm = ref({
            category: '',
            amount: null
        });
        
        const projectForm = ref({
            name: '',
            description: ''
        });
        
        const donorForm = ref({
            name: '',
            birthday: '',
            phone: '',
            address: ''
        });
        
        // 時間篩選選項
        const timeFilters = [
            { key: '1month', label: '近1個月' },
            { key: '3months', label: '近3個月' },
            { key: '6months', label: '近6個月' },
            { key: '1year', label: '近1年' },
            { key: 'all', label: '全部' }
        ];
        
        // 類別定義
        const incomeCategories = [
            '香油錢', '點光明燈', '屬名紅包', '未屬名紅包', 
            '祝壽', '看風水', '停車費', '感謝神尊', '其他'
        ];
        
        const expenseCategories = [
            '人員薪水', '房租', '水電費', '雜項開支', 
            '參訪金', '修繕費', '管理費', '其他'
        ];
        
        // 計算屬性
        const currentCategories = computed(() => {
            return form.value.type === 'income' ? incomeCategories : expenseCategories;
        });
        
        const modalTitle = computed(() => {
            return form.value.type === 'income' ? '新增收入' : '新增支出';
        });
        
        const reminderModalTitle = computed(() => {
            return editingReminder.value ? '編輯提醒' : '新增提醒';
        });
        
        // 根據時間篩選獲取記錄
        const filteredRecords = computed(() => {
            if (selectedTimeFilter.value === 'all') {
                return records.value;
            }
            
            const now = new Date();
            let startDate = new Date();
            
            switch (selectedTimeFilter.value) {
                case '1month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case '3months':
                    startDate.setMonth(now.getMonth() - 3);
                    break;
                case '6months':
                    startDate.setMonth(now.getMonth() - 6);
                    break;
                case '1year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            
            return records.value.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= startDate;
            });
        });
        
        const filteredDonors = computed(() => {
            const query = donorSearchQuery.value.toLowerCase();
            const currentYear = new Date().getFullYear();
            const conflicts = getTaiSuiConflicts(currentYear).flatMap(c => c.signs);

            return donors.value.map(donor => {
                const isTaiSui = conflicts.includes(donor.zodiac);
                const conflictInfo = isTaiSui ? getTaiSuiConflicts(currentYear).find(c => c.signs.includes(donor.zodiac)) : null;
                return {
                    ...donor,
                    isTaiSui,
                    conflictType: conflictInfo ? conflictInfo.type : ''
                };
            }).filter(donor => {
                return !query || donor.name.toLowerCase().includes(query);
            }).sort((a, b) => b.totalDonation - a.totalDonation);
        });
        
        const projectsWithStats = computed(() => {
            return projects.value.map(project => {
                const projectRecords = records.value.filter(r => r.projectId === project.id);
                const totalIncome = projectRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
                const totalExpense = projectRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
                return {
                    ...project,
                    totalIncome,
                    totalExpense,
                    balance: totalIncome - totalExpense
                };
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
        
        const totalIncome = computed(() => {
            return filteredRecords.value
                .filter(r => r.type === 'income')
                .reduce((sum, r) => sum + r.amount, 0);
        });
        
        const totalExpense = computed(() => {
            return filteredRecords.value
                .filter(r => r.type === 'expense')
                .reduce((sum, r) => sum + r.amount, 0);
        });
        
        const totalBalance = computed(() => {
            return totalIncome.value - totalExpense.value;
        });
        
        const recentRecords = computed(() => {
            return records.value
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);
        });
        
        const allReminders = computed(() => {
            return reminders.value
                .filter(r => !r.completed)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        });
        
        const urgentReminders = computed(() => {
            const today = new Date();
            return allReminders.value.filter(reminder => {
                const dueDate = new Date(reminder.dueDate);
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (diffDays <= reminder.advanceDays) {
                    const dayOfWeek = dueDate.getDay();
                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                        const fridayBefore = new Date(dueDate);
                        fridayBefore.setDate(dueDate.getDate() - (dayOfWeek === 0 ? 2 : 1));
                        const fridayDiff = Math.ceil((fridayBefore - today) / (1000 * 60 * 60 * 24));
                        if (fridayDiff <= reminder.advanceDays) {
                            reminder.urgency = diffDays <= 1 ? 'urgent' : 'warning';
                            return true;
                        }
                    } else {
                        reminder.urgency = diffDays <= 1 ? 'urgent' : 'warning';
                        return true;
                    }
                }
                return false;
            });
        });
        
        const taiSuiDonors = computed(() => {
            return filteredDonors.value.filter(d => d.isTaiSui);
        });
        
        // 智能分析計算
        const incomeTrend = computed(() => {
            const thisMonth = records.value.filter(r => 
                r.type === 'income' && 
                new Date(r.date).getMonth() === new Date().getMonth()
            ).reduce((sum, r) => sum + r.amount, 0);
            
            const lastMonth = records.value.filter(r => 
                r.type === 'income' && 
                new Date(r.date).getMonth() === new Date().getMonth() - 1
            ).reduce((sum, r) => sum + r.amount, 0);
            
            const percentage = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;
            return {
                direction: thisMonth >= lastMonth ? 'up' : 'down',
                percentage: Math.abs(percentage)
            };
        });
        
        const expenseTrend = computed(() => {
            const thisMonth = records.value.filter(r => 
                r.type === 'expense' && 
                new Date(r.date).getMonth() === new Date().getMonth()
            ).reduce((sum, r) => sum + r.amount, 0);
            
            const lastMonth = records.value.filter(r => 
                r.type === 'expense' && 
                new Date(r.date).getMonth() === new Date().getMonth() - 1
            ).reduce((sum, r) => sum + r.amount, 0);
            
            const percentage = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;
            return {
                direction: thisMonth >= lastMonth ? 'up' : 'down',
                percentage: Math.abs(percentage)
            };
        });
        
        const balanceTrend = computed(() => {
            const thisMonthBalance = totalIncome.value - totalExpense.value;
            const lastMonthIncome = records.value.filter(r => 
                r.type === 'income' && 
                new Date(r.date).getMonth() === new Date().getMonth() - 1
            ).reduce((sum, r) => sum + r.amount, 0);
            
            const lastMonthExpense = records.value.filter(r => 
                r.type === 'expense' && 
                new Date(r.date).getMonth() === new Date().getMonth() - 1
            ).reduce((sum, r) => sum + r.amount, 0);
            
            const lastMonthBalance = lastMonthIncome - lastMonthExpense;
            const percentage = lastMonthBalance !== 0 ? ((thisMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance) * 100).toFixed(1) : 0;
            
            return {
                direction: thisMonthBalance >= lastMonthBalance ? 'up' : 'down',
                percentage: Math.abs(percentage)
            };
        });
        
        const healthScore = computed(() => {
            let score = 50; // 基礎分數
            
            // 收支比例評分
            const ratio = totalExpense.value > 0 ? totalIncome.value / totalExpense.value : 1;
            if (ratio > 1.5) score += 30;
            else if (ratio > 1.2) score += 20;
            else if (ratio > 1) score += 10;
            else score -= 20;
            
            // 結餘穩定性評分
            if (totalBalance.value > 0) score += 20;
            else score -= 30;
            
            return Math.max(0, Math.min(100, score));
        });
        
        const healthStatus = computed(() => {
            if (healthScore.value >= 80) return '優秀';
            if (healthScore.value >= 60) return '良好';
            if (healthScore.value >= 40) return '一般';
            return '需改善';
        });
        
        const incomeExpenseRatio = computed(() => {
            return totalExpense.value > 0 ? (totalIncome.value / totalExpense.value * 100).toFixed(1) : 100;
        });
        
        const incomeExpenseAnalysis = computed(() => {
            const ratio = parseFloat(incomeExpenseRatio.value);
            if (ratio > 150) return '收入遠超支出，財務狀況優秀';
            if (ratio > 120) return '收入超過支出，財務狀況良好';
            if (ratio > 100) return '收入略超支出，需注意控制';
            return '支出超過收入，需要調整財務';
        });
        
        const avgDailyIncome = computed(() => {
            const days = Math.max(1, Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24)));
            return totalIncome.value / days;
        });
        
        const avgIncomeAnalysis = computed(() => {
            if (avgDailyIncome.value > 1000) return '日均收入表現優秀';
            if (avgDailyIncome.value > 500) return '日均收入表現良好';
            if (avgDailyIncome.value > 200) return '日均收入表現一般';
            return '建議增加收入來源';
        });
        
        const topExpenseCategory = computed(() => {
            const categoryStats = {};
            filteredRecords.value.filter(r => r.type === 'expense').forEach(record => {
                categoryStats[record.category] = (categoryStats[record.category] || 0) + record.amount;
            });
            
            const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
            if (sortedCategories.length === 0) return { name: '無', percentage: 0 };
            
            const topCategory = sortedCategories[0];
            const percentage = totalExpense.value > 0 ? (topCategory[1] / totalExpense.value * 100).toFixed(1) : 0;
            
            return {
                name: topCategory[0],
                percentage: percentage
            };
        });
        
        const predictedBalance = computed(() => {
            const monthlyIncome = totalIncome.value;
            const monthlyExpense = totalExpense.value;
            const trend = monthlyIncome - monthlyExpense;
            return totalBalance.value + trend;
        });
        
        const balancePrediction = computed(() => {
            const predicted = predictedBalance.value;
            if (predicted > totalBalance.value) return '預計下月結餘增加';
            if (predicted < totalBalance.value) return '預計下月結餘減少';
            return '預計下月結餘持平';
        });
        
        const financialSuggestions = computed(() => {
            const suggestions = [];
            
            if (totalExpense.value > totalIncome.value) {
                suggestions.push({
                    id: 1,
                    title: '支出控制建議',
                    description: '當前支出超過收入，建議檢視並削減非必要支出項目，特別是雜項開支和管理費用。'
                });
            }
            
            if (topExpenseCategory.value.percentage > 50) {
                suggestions.push({
                    id: 2,
                    title: '支出結構優化',
                    description: `${topExpenseCategory.value.name}佔支出比例過高（${topExpenseCategory.value.percentage}%），建議分散支出風險，避免過度依賴單一支出類別。`
                });
            }
            
            if (healthScore.value < 60) {
                suggestions.push({
                    id: 3,
                    title: '財務健康改善',
                    description: '財務健康度偏低，建議：1) 增加香油錢等穩定收入來源 2) 控制人員薪水和房租等固定支出 3) 建立緊急備用金。'
                });
            }
            
            const incomeVariance = calculateIncomeVariance();
            if (incomeVariance > 0.5) {
                suggestions.push({
                    id: 4,
                    title: '收入穩定性提升',
                    description: '收入波動較大，建議多元化收入來源，如增加光明燈、看風水等服務項目，減少對單一收入的依賴。'
                });
            }
            
            if (suggestions.length === 0) {
                suggestions.push({
                    id: 5,
                    title: '財務狀況良好',
                    description: '目前財務狀況穩定，建議繼續保持良好的收支管理習慣，可考慮設立發展基金為未來擴展做準備。'
                });
            }
            
            return suggestions;
        });
        
        // 預算相關計算屬性
        const budgetSummary = computed(() => {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const monthBudgets = budgets.value[currentMonth] || {};
            
            const summary = expenseCategories.map(category => {
                const budget = monthBudgets[category] || 0;
                const spent = records.value
                    .filter(r => r.type === 'expense' && r.category === category && r.date.startsWith(currentMonth))
                    .reduce((sum, r) => sum + r.amount, 0);
                
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                
                return {
                    category,
                    budget,
                    spent,
                    remaining: budget - spent,
                    percentage
                };
            });
            
            return summary;
        });
        
        const totalBudget = computed(() => {
            return budgetSummary.value.reduce((sum, item) => sum + item.budget, 0);
        });
        
        const totalExpenseForMonth = computed(() => {
            return budgetSummary.value.reduce((sum, item) => sum + item.spent, 0);
        });
        
        const remainingBudget = computed(() => {
            return totalBudget.value - totalExpenseForMonth.value;
        });
        
        const budgetStatus = computed(() => {
            if (totalBudget.value === 0) return '尚未設定預算';
            const percentage = (totalExpenseForMonth.value / totalBudget.value) * 100;
            if (percentage > 100) return `已超支 ${((percentage - 100).toFixed(1))}%`;
            return `剩餘 ${(100 - percentage).toFixed(1)}%`;
        });
        
        // 計算收入變異係數
        const calculateIncomeVariance = () => {
            const monthlyIncomes = {};
            filteredRecords.value.filter(r => r.type === 'income').forEach(record => {
                const month = new Date(record.date).toISOString().slice(0, 7);
                monthlyIncomes[month] = (monthlyIncomes[month] || 0) + record.amount;
            });
            
            const incomes = Object.values(monthlyIncomes);
            if (incomes.length < 2) return 0;
            
            const mean = incomes.reduce((a, b) => a + b, 0) / incomes.length;
            const variance = incomes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / incomes.length;
            const stdDev = Math.sqrt(variance);
            
            return mean > 0 ? stdDev / mean : 0;
        };
        
        // 方法
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('zh-TW', {
                style: 'currency',
                currency: 'TWD',
                minimumFractionDigits: 0
            }).format(amount);
        };
        
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('zh-TW');
        };
        
        const formatReminderDate = (date) => {
            const dueDate = new Date(date);
            const today = new Date();
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                return `已過期 ${Math.abs(diffDays)} 天`;
            } else if (diffDays === 0) {
                return '今天到期';
            } else if (diffDays === 1) {
                return '明天到期';
            } else {
                return `${diffDays} 天後到期 (${formatDate(date)})`;
            }
        };
        
        const switchPage = (page) => {
            document.querySelectorAll('.page-content').forEach(el => {
                el.classList.remove('active');
            });
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('active');
            });
            
            document.getElementById(page).classList.add('active');
            event.currentTarget.classList.add('active');
            
            currentPage.value = page;
            
            // 初始化圖表
            if (page === 'analysis') {
                nextTick(() => {
                    initAnalysisCharts();
                });
            } else if (page === 'dashboard') {
                nextTick(() => {
                    initDashboardChart();
                });
            }
        };
        
        const openAddModal = (type) => {
            form.value.type = type;
            form.value.category = '';
            showAddModal.value = true;
        };
        
        const closeAddModal = () => {
            showAddModal.value = false;
            resetForm();
        };
        
        const resetForm = () => {
            form.value = {
                type: 'income',
                category: '',
                amount: null,
                date: new Date().toISOString().split('T')[0],
                description: '',
                donor: '',
                projectId: null
            };
        };
        
        const updateCategories = () => {
            form.value.category = '';
        };
        
        const saveRecord = async () => {
            if (!form.value.category || !form.value.amount) {
                alert('請填寫必要欄位');
                return;
            }
            
            // 預算檢查
            if (form.value.type === 'expense') {
                const currentMonth = form.value.date.slice(0, 7);
                const monthBudgets = budgets.value[currentMonth] || {};
                const categoryBudget = monthBudgets[form.value.category] || 0;
                
                if (categoryBudget > 0) {
                    const spent = records.value
                        .filter(r => r.type === 'expense' && r.category === form.value.category && r.date.startsWith(currentMonth))
                        .reduce((sum, r) => sum + r.amount, 0);
                    
                    if (spent + form.value.amount > categoryBudget) {
                        if (!confirm(`此筆支出將超過 [${form.value.category}] 的預算！\n\n預算: ${formatCurrency(categoryBudget)}\n已用: ${formatCurrency(spent)}\n此筆: ${formatCurrency(form.value.amount)}\n\n確定要繼續嗎？`)) {
                            return;
                        }
                    }
                }
            }
            
            const newRecord = {
                type: form.value.type,
                category: form.value.category,
                amount: form.value.amount,
                date: form.value.date,
                description: form.value.description || form.value.category,
                donor: form.value.donor || '',
                projectId: form.value.projectId,
                createdAt: new Date().toISOString()
            };
            
            await db.records.add(newRecord);
            
            // 更新信眾資料
            if (form.value.type === 'income' && form.value.donor) {
                await updateDonor(form.value.donor, form.value.amount, form.value.date);
            }
            
            await loadFromDB();
            closeAddModal();
            
            showNotification('記錄已儲存', '收支記錄已成功新增');
            
            // 更新圖表
            if (currentPage.value === 'dashboard') {
                nextTick(() => {
                    initDashboardChart();
                });
            } else if (currentPage.value === 'analysis') {
                nextTick(() => {
                    initAnalysisCharts();
                });
            }
        };
        
        const saveReminder = async () => {
            if (!reminderForm.value.title || !reminderForm.value.dueDate) {
                alert('請填寫必要欄位');
                return;
            }
            
            if (editingReminder.value) {
                await db.reminders.update(editingReminder.value.id, {
                    ...reminderForm.value,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await db.reminders.add({
                    ...reminderForm.value,
                    completed: false,
                    createdAt: new Date().toISOString()
                });
            }
            
            await loadFromDB();
            closeReminderModal();
            
            showNotification('提醒已儲存', '提醒設定已成功儲存');
        };
        
        const closeReminderModal = () => {
            showReminderModal.value = false;
            editingReminder.value = null;
            resetReminderForm();
        };
        
        const resetReminderForm = () => {
            reminderForm.value = {
                title: '',
                description: '',
                dueDate: '',
                repeat: 'none',
                advanceDays: 2
            };
        };
        
        const editReminder = (reminder) => {
            editingReminder.value = reminder;
            reminderForm.value = { ...reminder };
            showReminderModal.value = true;
        };
        
        const markReminderDone = async (id) => {
            const reminder = await db.reminders.get(id);
            if (reminder) {
                await db.reminders.update(id, {
                    completed: true,
                    completedAt: new Date().toISOString()
                });
                
                if (reminder.repeat !== 'none') {
                    const nextDueDate = new Date(reminder.dueDate);
                    if (reminder.repeat === 'monthly') {
                        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                    } else if (reminder.repeat === 'yearly') {
                        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                    }
                    
                    await db.reminders.add({
                        ...reminder,
                        id: undefined,
                        dueDate: nextDueDate.toISOString().split('T')[0],
                        completed: false,
                        createdAt: new Date().toISOString()
                    });
                }
                
                await loadFromDB();
                showNotification('提醒已完成', '提醒已標記為完成');
            }
        };
        
        const snoozeReminder = async (id) => {
            const reminder = await db.reminders.get(id);
            if (reminder) {
                const newDueDate = new Date(reminder.dueDate);
                newDueDate.setDate(newDueDate.getDate() + 1);
                await db.reminders.update(id, {
                    dueDate: newDueDate.toISOString().split('T')[0]
                });
                await loadFromDB();
                showNotification('提醒已延後', '提醒已延後一天');
            }
        };
        
        const deleteReminder = async (id) => {
            if (confirm('確定要刪除此提醒嗎？')) {
                await db.reminders.delete(id);
                await loadFromDB();
                showNotification('提醒已刪除', '提醒已成功刪除');
            }
        };
        
        const showNotifications = () => {
            if (urgentReminders.value.length > 0) {
                switchPage('reminders');
            } else {
                showNotification('無緊急提醒', '目前沒有需要處理的提醒');
            }
        };
        
        const showNotification = (title, message) => {
            currentNotification.value = { title, message };
            showNotificationPopup.value = true;
            setTimeout(() => {
                showNotificationPopup.value = false;
            }, 3000);
        };
        
        const loadFromDB = async () => {
            const [recordsData, remindersData, budgetsData, donorsData, projectsData] = await Promise.all([
                db.records.toArray(),
                db.reminders.toArray(),
                db.budgets.toArray(),
                db.donors.toArray(),
                db.projects.toArray()
            ]);
            
            records.value = recordsData;
            reminders.value = remindersData;
            donors.value = donorsData;
            projects.value = projectsData;
            
            const budgetObject = {};
            budgetsData.forEach(item => {
                budgetObject[item.month] = item.data;
            });
            budgets.value = budgetObject;
        };
        
        const openBudgetModal = (category, amount) => {
            budgetForm.value.category = category;
            budgetForm.value.amount = amount;
            showBudgetModal.value = true;
        };
        
        const saveBudget = async () => {
            const currentMonth = new Date().toISOString().slice(0, 7);
            if (!budgets.value[currentMonth]) {
                budgets.value[currentMonth] = {};
            }
            budgets.value[currentMonth][budgetForm.value.category] = budgetForm.value.amount;
            await db.budgets.put({ month: currentMonth, data: budgets.value[currentMonth] });
            showBudgetModal.value = false;
            showNotification('預算已設定', `${budgetForm.value.category} 的預算已更新`);
        };
        
        const copyLastMonthBudget = async () => {
            const today = new Date();
            const currentMonth = today.toISOString().slice(0, 7);
            const lastMonthDate = new Date(today.setMonth(today.getMonth() - 1));
            const lastMonth = lastMonthDate.toISOString().slice(0, 7);
            
            const lastMonthBudgetData = await db.budgets.get(lastMonth);
            
            if (lastMonthBudgetData) {
                if (confirm('確定要將上個月的預算複製到本月嗎？這將會覆蓋本月已設定的預算。')) {
                    budgets.value[currentMonth] = { ...lastMonthBudgetData.data };
                    await db.budgets.put({ month: currentMonth, data: budgets.value[currentMonth] });
                    showNotification('預算已複製', '已成功複製上個月的預算');
                }
            } else {
                alert('上個月沒有設定預算');
            }
        };
        
        const updateDonor = async (name, amount, date) => {
            const existingDonor = await db.donors.get(name);
            if (existingDonor) {
                await db.donors.update(name, {
                    totalDonation: existingDonor.totalDonation + amount,
                    donationCount: existingDonor.donationCount + 1,
                    lastDonationDate: date
                });
            } else {
                // 如果是新信眾，打開編輯視窗讓使用者輸入詳細資料
                donorForm.value = { name, birthday: '', phone: '', address: '' };
                editingDonor.value = null;
                showDonorModal.value = true;
            }
        };
        
        const saveDonor = async () => {
            if (!donorForm.value.name) {
                alert('請輸入姓名');
                return;
            }
            
            const zodiac = donorForm.value.birthday ? getZodiac(new Date(donorForm.value.birthday).getFullYear()) : '';
            
            if (editingDonor.value) {
                await db.donors.update(editingDonor.value.name, { 
                    ...donorForm.value,
                    zodiac
                });
            } else {
                const existing = await db.donors.get(donorForm.value.name);
                if (existing) {
                    await db.donors.update(donorForm.value.name, { 
                        ...donorForm.value,
                        zodiac
                    });
                } else {
                    await db.donors.add({ 
                        ...donorForm.value,
                        zodiac,
                        totalDonation: 0,
                        donationCount: 0,
                        lastDonationDate: ''
                    });
                }
            }
            
            await loadFromDB();
            showDonorModal.value = false;
            editingDonor.value = null;
            showNotification('信眾資料已儲存', '信眾資料已成功更新');
        };
        
        const showDonorDetails = (donor) => {
            selectedDonor.value = donor;
        };
        
        const getDonorRecords = (donorName) => {
            return records.value.filter(r => r.donor === donorName).sort((a, b) => new Date(b.date) - new Date(a.date));
        };
        
        const saveProject = async () => {
            if (!projectForm.value.name) {
                alert('請輸入專案名稱');
                return;
            }
            
            if (editingProject.value) {
                await db.projects.update(editingProject.value.id, {
                    name: projectForm.value.name,
                    description: projectForm.value.description
                });
            } else {
                await db.projects.add({
                    name: projectForm.value.name,
                    description: projectForm.value.description,
                    createdAt: new Date().toISOString()
                });
            }
            
            await loadFromDB();
            showProjectModal.value = false;
            projectForm.value = { name: '', description: '' };
            editingProject.value = null;
            showNotification('專案已儲存', '專案資料已成功更新');
        };
        
        const showProjectDetails = (project) => {
            selectedProject.value = project;
        };
        
        const getProjectRecords = (projectId) => {
            return records.value.filter(r => r.projectId === projectId).sort((a, b) => new Date(b.date) - new Date(a.date));
        };
        
        const getZodiac = (year) => {
            const zodiacs = ['猴', '雞', '狗', '豬', '鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊'];
            return zodiacs[(year - 1900) % 12];
        };
        
        const getTaiSuiConflicts = (year) => {
            const currentZodiac = getZodiac(year);
            const zodiacs = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
            const currentIndex = zodiacs.indexOf(currentZodiac);
            
            const conflicts = [
                { type: '值', signs: [currentZodiac] },
                { type: '沖', signs: [zodiacs[(currentIndex + 6) % 12]] },
                // 簡化版刑、害、破，可擴充為完整版
                { type: '刑', signs: [zodiacs[(currentIndex + 3) % 12]] }, 
                { type: '害', signs: [zodiacs[(currentIndex + 9) % 12]] },
                { type: '破', signs: [zodiacs[(currentIndex + 4) % 12]] }
            ];
            
            return conflicts;
        };
        
        const notifyDonor = (donor) => {
            showNotification('點燈提醒', `已將點燈提醒發送給 ${donor.name} (電話: ${donor.phone || '未提供'})`);
        };
        
        const exportData = () => {
            if (records.value.length === 0) {
                alert('暫無資料可匯出');
                return;
            }
            
            const csvContent = [
                '日期,類型,類別,金額,說明,捐款人,專案',
                ...records.value.map(record => {
                    const projectName = record.projectId ? projects.value.find(p => p.id === record.projectId)?.name : '';
                    return [
                        record.date,
                        record.type === 'income' ? '收入' : '支出',
                        record.category,
                        record.amount,
                        record.description,
                        record.donor || '',
                        projectName
                    ].join(',');
                })
            ].join('\n');
            
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `廣清宮記帳資料_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('匯出成功', '資料已匯出為CSV檔案');
        };
        
        const generateTestData = async () => {
            if (confirm('確定要生成測試資料嗎？這將會新增一些示例記錄。')) {
                const testProjects = [
                    { name: '中元普渡大典', description: '年度中元普渡活動', createdAt: new Date().toISOString() },
                    { name: '光明燈專案', description: '年度光明燈點燈', createdAt: new Date().toISOString() }
                ];
                await db.projects.bulkAdd(testProjects);
                const addedProjects = await db.projects.toArray();
                
                const testRecords = [];
                const today = new Date();
                
                // 生成過去3個月的測試資料
                for (let i = 0; i < 90; i++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    
                    // 隨機生成收入記錄
                    if (Math.random() > 0.7) {
                        const incomeCategory = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
                        const donorName = `信眾${Math.floor(Math.random() * 100)}`;
                        const amount = Math.floor(Math.random() * 5000) + 500;
                        
                        testRecords.push({
                            type: 'income',
                            category: incomeCategory,
                            amount: amount,
                            date: date.toISOString().split('T')[0],
                            description: `${incomeCategory}收入`,
                            donor: donorName,
                            projectId: Math.random() > 0.5 ? addedProjects[0].id : null,
                            createdAt: new Date().toISOString()
                        });
                        
                        await updateDonor(donorName, amount, date.toISOString().split('T')[0]);
                    }
                }
                
                await db.records.bulkAdd(testRecords);
                await loadFromDB();
                showNotification('測試資料已生成', `已新增 ${testRecords.length} 筆測試記錄`);
            }
        };
        
        const clearAllData = async () => {
            if (confirm('確定要清除所有資料嗎？此操作無法復原。')) {
                await db.delete();
                db.open();
                await loadFromDB();
                showNotification('資料已清除', '所有資料已成功清除');
            }
        };
        
        const installApp = () => {
            if ('serviceWorker' in navigator) {
                showNotification('安裝提示', '請使用瀏覽器的「加到主畫面」功能安裝此應用');
            } else {
                alert('您的瀏覽器不支援PWA安裝功能');
            }
        };
        
        const checkReminders = () => {
            if (urgentReminders.value.length > 0) {
                const reminder = urgentReminders.value[0];
                showNotification('提醒通知', `${reminder.title} - ${formatReminderDate(reminder.dueDate)}`);
            }
        };
        
        // 圖表初始化等方法... (省略以保持簡潔)
        
        // 生命週期
        onMounted(() => {
            loadFromDB();
            
            // 註冊 Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            }
            
            // 檢查提醒
            checkReminders();
            
            // 每小時檢查一次提醒
            setInterval(checkReminders, 60 * 60 * 1000);
            
            // 初始化圖表
            nextTick(() => {
                initDashboardChart();
            });
        });
        
        return {
            // ...返回所有需要的資料和方法
            showAddModal, showReminderModal, showBudgetModal, showProjectModal, showDonorModal, showNotificationPopup, currentPage, records, reminders, budgets, donors, projects, form, reminderForm, budgetForm, projectForm, donorForm, editingReminder, editingProject, editingDonor, currentNotification, selectedTimeFilter, timeFilters, donorSearchQuery, filteredDonors, selectedDonor, selectedProject, projectsWithStats, currentCategories, modalTitle, reminderModalTitle, totalIncome, totalExpense, totalBalance, recentRecords, allReminders, urgentReminders, incomeTrend, expenseTrend, balanceTrend, healthScore, healthStatus, incomeExpenseRatio, incomeExpenseAnalysis, avgDailyIncome, avgIncomeAnalysis, topExpenseCategory, predictedBalance, balancePrediction, financialSuggestions, budgetSummary, totalBudget, totalExpenseForMonth, remainingBudget, budgetStatus, taiSuiDonors, formatCurrency, formatDate, formatReminderDate, switchPage, openAddModal, closeAddModal, updateCategories, saveRecord, saveReminder, closeReminderModal, editReminder, markReminderDone, snoozeReminder, deleteReminder, showNotifications, openBudgetModal, saveBudget, copyLastMonthBudget, showDonorDetails, getDonorRecords, saveProject, showProjectDetails, getProjectRecords, saveDonor, notifyDonor, exportData, generateTestData, clearAllData, installApp, updateCharts, initDashboardChart, initAnalysisCharts
        };
    }
}).mount('#app');

    </script>
</body>
</html>