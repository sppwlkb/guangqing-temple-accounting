/**
 * 數據持久化服務
 * 抽象化本地儲存的實現 (localStorage, IndexedDB, etc.)
 */

const STORAGE_PREFIX = 'temple-';

/**
 * 安全地從 localStorage 獲取數據
 * @param {string} key 鍵名 (不含前綴)
 * @returns {any | null} 解析後的數據或 null
 */
function getData(key) {
  try {
    const rawData = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error(`[StorageService] 獲取數據失敗 (key: ${key}):`, error);
    return null;
  }
}

/**
 * 安全地將數據儲存到 localStorage
 * @param {string} key 鍵名 (不含前綴)
 * @param {any} data 要儲存的數據
 * @returns {boolean} 是否成功
 */
function saveData(key, data) {
  try {
    const stringifiedData = JSON.stringify(data);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, stringifiedData);
    // 設置一個最後修改時間戳，用於雲端同步判斷
    localStorage.setItem(`${STORAGE_PREFIX}last-modified`, Date.now().toString());
    return true;
  } catch (error) {
    console.error(`[StorageService] 儲存數據失敗 (key: ${key}):`, error);
    return false;
  }
}

/**
 * 從 localStorage 移除數據
 * @param {string} key 鍵名 (不含前綴)
 */
function removeData(key) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`[StorageService] 移除數據失敗 (key: ${key}):`, error);
  }
}

export const storageService = {
  getData,
  saveData,
  removeData,
};
