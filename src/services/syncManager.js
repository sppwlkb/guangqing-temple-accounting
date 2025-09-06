/**
 * 同步管理器
 * 負責協調 UI、狀態管理 (Pinia) 和 Firebase 服務之間的數據同步。
 */
import { ElMessage, ElMessageBox } from 'element-plus'
import { firebaseService } from './firebaseService'
import { useIncomeStore } from '@/stores/income'
import { useExpenseStore } from '@/stores/expense'

class SyncManager {
  constructor() {
    this.isSyncing = false;
  }

  /**
   * 從 Pinia stores 收集所有需要同步的數據。
   * @returns {object} 包含所有應用程式數據的對象
   */
  _collectDataFromStores() {
    const incomeStore = useIncomeStore();
    const expenseStore = useExpenseStore();

    // 確保在調用前 stores 已加載
    // 注意：這是一個簡化的假設，在實際應用中，需要確保 stores 已被 Pinia 初始化
    if (!incomeStore.incomes || !expenseStore.expenses) {
        console.warn("Stores not ready for sync");
        // 在實際應用中可能需要加載它們
        // incomeStore.loadIncomes(); 
        // expenseStore.loadExpenses();
    }

    return {
      incomes: incomeStore.incomes,
      incomeCategories: incomeStore.categories,
      expenses: expenseStore.expenses,
      expenseCategories: expenseStore.categories,
      // 未來可以擴展其他 stores
    };
  }

  /**
   * 將從雲端獲取的數據應用到 Pinia stores。
   * @param {object} cloudData 從 Firebase 下載的數據
   */
  _applyDataToStores(cloudData) {
    const incomeStore = useIncomeStore();
    const expenseStore = useExpenseStore();

    if (cloudData.incomes) {
      incomeStore.setIncomes(cloudData.incomes); // 假設 setIncomes action 存在
    }
    if (cloudData.incomeCategories) {
      incomeStore.setCategories(cloudData.incomeCategories); // 假設 setCategories action 存在
    }
    if (cloudData.expenses) {
      expenseStore.setExpenses(cloudData.expenses);
    }
    if (cloudData.expenseCategories) {
      expenseStore.setCategories(cloudData.expenseCategories);
    }
  }

  /**
   * 上傳本地數據到雲端。
   */
  async syncToCloud() {
    if (this.isSyncing) {
      ElMessage.info('同步正在進行中，請稍候...');
      return;
    }

    if (!firebaseService.currentUser) {
        ElMessage.error('請先登入才能同步數據。');
        return;
    }

    this.isSyncing = true;
    ElMessage.info({ message: '開始上傳數據到雲端... ', duration: 1500 });

    try {
      const localData = this._collectDataFromStores();
      const result = await firebaseService.uploadData(localData);
      if (result.success) {
        ElMessage.success('數據已成功同步到雲端！');
      } else {
        throw new Error(result.message || '上傳失敗');
      }
    } catch (error) {
      console.error('同步到雲端失敗:', error);
      ElMessage.error(`同步失敗: ${error.message}`);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 從雲端下載數據並更新本地應用狀態。
   */
  async syncFromCloud() {
    if (this.isSyncing) {
      ElMessage.info('同步正在進行中，請稍候...');
      return;
    }

    if (!firebaseService.currentUser) {
        ElMessage.error('請先登入才能同步數據。');
        return;
    }

    try {
        await ElMessageBox.confirm(
            '這將會用雲端數據覆蓋您當前的本地數據，確定要繼續嗎？',
            '警告',
            {
              confirmButtonText: '確定同步',
              cancelButtonText: '取消',
              type: 'warning',
            }
        );
    } catch (error) {
        ElMessage.info('已取消同步操作。');
        return; // 用戶點擊取消
    }

    this.isSyncing = true;
    ElMessage.info({ message: '開始從雲端下載數據... ', duration: 1500 });

    try {
      const result = await firebaseService.downloadData();
      if (result.success && result.data) {
        this._applyDataToStores(result.data);
        ElMessage.success('數據已成功從雲端恢復！');
      } else {
        throw new Error(result.message || '下載的數據無效');
      }
    } catch (error) {
      console.error('從雲端同步失敗:', error);
      ElMessage.error(`同步失敗: ${error.message}`);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncManager = new SyncManager();