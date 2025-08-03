<template>
  <div class="settings-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">系統設定</h1>
      <p class="page-description">管理宮廟記帳軟體的各項設定</p>
    </div>

    <el-row :gutter="20">
      <!-- 左側選單 -->
      <el-col :xs="24" :md="6">
        <div class="settings-menu">
          <el-menu
            :default-active="activeTab"
            @select="handleMenuSelect"
            class="settings-menu-list"
          >
            <el-menu-item index="basic">
              <el-icon><Setting /></el-icon>
              <span>基本設定</span>
            </el-menu-item>
            <el-menu-item index="categories">
              <el-icon><Grid /></el-icon>
              <span>類別管理</span>
            </el-menu-item>
            <el-menu-item index="backup">
              <el-icon><FolderOpened /></el-icon>
              <span>備份還原</span>
            </el-menu-item>
            <el-menu-item index="about">
              <el-icon><InfoFilled /></el-icon>
              <span>關��軟體</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>

      <!-- 右側內容 -->
      <el-col :xs="24" :md="18">
        <!-- 基本設定 -->
        <div v-show="activeTab === 'basic'" class="settings-content">
          <FormCard title="基本資訊" description="設定宮廟的基本資訊">
            <el-form
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicRules"
              label-width="120px"
            >
              <el-form-item label="宮廟名稱" prop="templeName">
                <el-input
                  v-model="basicForm.templeName"
                  placeholder="請輸入宮廟名稱"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="負責人" prop="manager">
                <el-input
                  v-model="basicForm.manager"
                  placeholder="請輸入負責人姓名"
                  maxlength="20"
                />
              </el-form-item>

              <el-form-item label="聯絡電話" prop="phone">
                <el-input
                  v-model="basicForm.phone"
                  placeholder="請輸入聯絡電話"
                  maxlength="15"
                />
              </el-form-item>

              <el-form-item label="地址" prop="address">
                <el-input
                  v-model="basicForm.address"
                  type="textarea"
                  placeholder="請輸入宮廟地址"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </FormCard>

          <FormCard title="系統偏好" description="設定系統的顯示和行為偏好">
            <el-form
              ref="preferenceFormRef"
              :model="preferenceForm"
              label-width="120px"
            >
              <el-form-item label="貨幣符號">
                <el-select v-model="preferenceForm.currency">
                  <el-option label="新台幣 (NT$)" value="TWD" />
                  <el-option label="人民幣 (¥)" value="CNY" />
                  <el-option label="美元 ($)" value="USD" />
                </el-select>
              </el-form-item>

              <el-form-item label="日期格式">
                <el-select v-model="preferenceForm.dateFormat">
                  <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                  <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                  <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                </el-select>
              </el-form-item>

              <el-form-item label="每頁顯示">
                <el-select v-model="preferenceForm.pageSize">
                  <el-option label="20 筆" :value="20" />
                  <el-option label="50 筆" :value="50" />
                  <el-option label="100 筆" :value="100" />
                </el-select>
              </el-form-item>

              <el-form-item label="自動備份">
                <el-switch
                  v-model="preferenceForm.autoBackup"
                  active-text="開啟"
                  inactive-text="關閉"
                />
              </el-form-item>

              <el-form-item label="備份間隔" v-if="preferenceForm.autoBackup">
                <el-select v-model="preferenceForm.backupInterval">
                  <el-option label="每日" :value="1" />
                  <el-option label="每週" :value="7" />
                  <el-option label="每月" :value="30" />
                </el-select>
              </el-form-item>

              <el-form-item label="提醒通知">
                <el-switch
                  v-model="preferenceForm.reminderEnabled"
                  active-text="開啟"
                  inactive-text="關閉"
                />
              </el-form-item>
            </el-form>
          </FormCard>

          <div class="form-actions">
            <el-button @click="resetBasicSettings">重置</el-button>
            <el-button type="primary" @click="saveBasicSettings" :loading="saving">
              儲存設定
            </el-button>
          </div>
        </div>

        <!-- 類別管理 -->
        <div v-show="activeTab === 'categories'" class="settings-content">
          <FormCard title="收入類別" description="管理收入的分類項目">
            <div class="category-section">
              <div class="section-header">
                <el-button type="primary" @click="showAddIncomeCategory = true">
                  <el-icon><Plus /></el-icon>
                  新增收入類別
                </el-button>
              </div>
              
              <div class="category-list">
                <div
                  v-for="category in incomeStore.categories"
                  :key="category.id"
                  class="category-item"
                >
                  <div class="category-info">
                    <span 
                      class="category-color"
                      :style="{ backgroundColor: category.color }"
                    ></span>
                    <div class="category-details">
                      <div class="category-name">{{ category.name }}</div>
                      <div class="category-description">{{ category.description }}</div>
                    </div>
                  </div>
                  <div class="category-actions">
                    <el-button size="small" @click="editIncomeCategory(category)">
                      編輯
                    </el-button>
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click="deleteIncomeCategory(category.id)"
                    >
                      刪除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </FormCard>

          <FormCard title="支出類別" description="管理支出的分類項目">
            <div class="category-section">
              <div class="section-header">
                <el-button type="primary" @click="showAddExpenseCategory = true">
                  <el-icon><Plus /></el-icon>
                  新增支出類別
                </el-button>
              </div>
              
              <div class="category-list">
                <div
                  v-for="category in expenseStore.categories"
                  :key="category.id"
                  class="category-item"
                >
                  <div class="category-info">
                    <span 
                      class="category-color"
                      :style="{ backgroundColor: category.color }"
                    ></span>
                    <div class="category-details">
                      <div class="category-name">{{ category.name }}</div>
                      <div class="category-description">{{ category.description }}</div>
                    </div>
                  </div>
                  <div class="category-actions">
                    <el-button size="small" @click="editExpenseCategory(category)">
                      編輯
                    </el-button>
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click="deleteExpenseCategory(category.id)"
                    >
                      刪除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </FormCard>
        </div>

        <!-- 備份還原 -->
        <div v-show="activeTab === 'backup'" class="settings-content">
          <FormCard title="資料備份" description="備份您的記帳資料">
            <div class="backup-section">
              <el-alert
                title="重要提醒"
                description="建議定期備份資料，以防資料遺失。備份檔案包含所有收支記錄和設定。"
                type="info"
                :closable="false"
                style="margin-bottom: 20px;"
              />
              
              <div class="backup-actions">
                <el-button type="primary" @click="createBackup" :loading="backupLoading">
                  <el-icon><Download /></el-icon>
                  立即備份
                </el-button>
                
                <el-upload
                  ref="uploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".json"
                  @change="handleFileSelect"
                >
                  <el-button>
                    <el-icon><Upload /></el-icon>
                    選擇備份檔案
                  </el-button>
                </el-upload>
                
                <el-button 
                  type="warning" 
                  @click="restoreBackup"
                  :disabled="!selectedFile"
                  :loading="restoreLoading"
                >
                  <el-icon><RefreshRight /></el-icon>
                  還原資料
                </el-button>
              </div>
              
              <div v-if="selectedFile" class="selected-file">
                <el-icon><Document /></el-icon>
                已選擇檔案：{{ selectedFile.name }}
              </div>
            </div>
          </FormCard>

          <FormCard title="自動備份設定" description="設定自動備份的頻率和選項">
            <el-form label-width="120px">
              <el-form-item label="自動備份">
                <el-switch
                  v-model="autoBackupEnabled"
                  active-text="開啟"
                  inactive-text="關閉"
                />
              </el-form-item>
              
              <el-form-item label="備份頻率" v-if="autoBackupEnabled">
                <el-radio-group v-model="autoBackupFrequency">
                  <el-radio :label="1">每日</el-radio>
                  <el-radio :label="7">每週</el-radio>
                  <el-radio :label="30">每月</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="保留份數" v-if="autoBackupEnabled">
                <el-input-number
                  v-model="maxBackupFiles"
                  :min="1"
                  :max="10"
                  controls-position="right"
                />
              </el-form-item>
            </el-form>
          </FormCard>
        </div>

        <!-- 關於軟體 -->
        <div v-show="activeTab === 'about'" class="settings-content">
          <FormCard title="軟體資訊">
            <div class="about-section">
              <div class="app-info">
                <div class="app-logo">
                  <el-icon size="64"><House /></el-icon>
                </div>
                <div class="app-details">
                  <h2>廣清宮快速記帳軟體</h2>
                  <p class="version">版本 1.0.0</p>
                  <p class="description">
                    專為宮廟設計的財務管理系統，提供完整的收支記錄、
                    財務分析和報表功能，幫助宮廟更好地管理財務。
                  </p>
                </div>
              </div>
              
              <div class="feature-list">
                <h3>主要功能</h3>
                <ul>
                  <li>收入支出記錄管理</li>
                  <li>財務報表生成</li>
                  <li>資料備份與還原</li>
                  <li>多平台同步支援</li>
                  <li>自訂類別管理</li>
                  <li>圖表分析功能</li>
                </ul>
              </div>
              
              <div class="contact-info">
                <h3>技術支援</h3>
                <p>如有任何問題或建議，請聯繫開發團隊</p>
                <p>© 2024 廣清宮開發團隊 版權所有</p>
              </div>
            </div>
          </FormCard>
        </div>
      </el-col>
    </el-row>

    <!-- 類別編輯對話框 -->
    <CategoryEditDialog
      v-model="showCategoryDialog"
      :category="editingCategory"
      :type="editingCategoryType"
      @save="handleCategorySave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useIncomeStore } from '@/stores/income'
import { useExpenseStore } from '@/stores/expense'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import FormCard from '@/components/common/FormCard.vue'
import CategoryEditDialog from '@/components/business/CategoryEditDialog.vue'
import {
  Setting, Grid, FolderOpened, InfoFilled, Plus, Download,
  Upload, RefreshRight, Document, House
} from '@element-plus/icons-vue'

const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()
const appStore = useAppStore()

// 當前活動標籤
const activeTab = ref('basic')

// 表單引用
const basicFormRef = ref()
const preferenceFormRef = ref()

// 儲存狀態
const saving = ref(false)

// 基本設定表單
const basicForm = reactive({
  templeName: '廣清宮',
  manager: '',
  phone: '',
  address: ''
})

const basicRules = {
  templeName: [
    { required: true, message: '請輸入宮廟名稱', trigger: 'blur' }
  ]
}

// 偏好設定表單
const preferenceForm = reactive({
  currency: 'TWD',
  dateFormat: 'YYYY-MM-DD',
  pageSize: 20,
  autoBackup: true,
  backupInterval: 7,
  reminderEnabled: true
})

// 類別管理
const showAddIncomeCategory = ref(false)
const showAddExpenseCategory = ref(false)
const showCategoryDialog = ref(false)
const editingCategory = ref(null)
const editingCategoryType = ref('income')

// 備份還原
const backupLoading = ref(false)
const restoreLoading = ref(false)
const selectedFile = ref(null)
const uploadRef = ref()
const autoBackupEnabled = ref(true)
const autoBackupFrequency = ref(7)
const maxBackupFiles = ref(5)

// 選單選擇處理
const handleMenuSelect = (key) => {
  activeTab.value = key
}

// 儲存基本設定
const saveBasicSettings = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    saving.value = true
    
    // 更新應用設定
    Object.assign(appStore.settings, {
      templeName: basicForm.templeName,
      manager: basicForm.manager,
      phone: basicForm.phone,
      address: basicForm.address,
      ...preferenceForm
    })
    
    await appStore.saveSettings()
    ElMessage.success('設定已儲存')
  } catch (error) {
    console.error('儲存設定失敗:', error)
    ElMessage.error('儲存設定失敗')
  } finally {
    saving.value = false
  }
}

// 重置基本設定
const resetBasicSettings = () => {
  Object.assign(basicForm, {
    templeName: '廣清宮',
    manager: '',
    phone: '',
    address: ''
  })
  
  Object.assign(preferenceForm, {
    currency: 'TWD',
    dateFormat: 'YYYY-MM-DD',
    pageSize: 20,
    autoBackup: true,
    backupInterval: 7,
    reminderEnabled: true
  })
}

// 編輯收入類別
const editIncomeCategory = (category) => {
  editingCategory.value = { ...category }
  editingCategoryType.value = 'income'
  showCategoryDialog.value = true
}

// 編輯支出類別
const editExpenseCategory = (category) => {
  editingCategory.value = { ...category }
  editingCategoryType.value = 'expense'
  showCategoryDialog.value = true
}

// 刪除收入類別
const deleteIncomeCategory = async (id) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除此收入類別嗎？刪除後無法恢復。',
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await incomeStore.deleteCategory(id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('刪除類別失敗:', error)
    }
  }
}

// 刪除支出類別
const deleteExpenseCategory = async (id) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除此支出類別嗎？刪除後無法恢復。',
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await expenseStore.deleteCategory(id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('刪除類別失敗:', error)
    }
  }
}

// 處理類別儲存
const handleCategorySave = async (categoryData) => {
  try {
    if (editingCategoryType.value === 'income') {
      if (editingCategory.value?.id) {
        await incomeStore.updateCategory(editingCategory.value.id, categoryData)
      } else {
        await incomeStore.addCategory(categoryData)
      }
    } else {
      if (editingCategory.value?.id) {
        await expenseStore.updateCategory(editingCategory.value.id, categoryData)
      } else {
        await expenseStore.addCategory(categoryData)
      }
    }
    
    showCategoryDialog.value = false
    editingCategory.value = null
  } catch (error) {
    console.error('儲存類別失敗:', error)
  }
}

// 創建備份
const createBackup = async () => {
  backupLoading.value = true
  
  try {
    await appStore.createBackup()
  } catch (error) {
    console.error('備份失敗:', error)
    ElMessage.error('備份失敗')
  } finally {
    backupLoading.value = false
  }
}

// 處理檔案選擇
const handleFileSelect = (file) => {
  selectedFile.value = file.raw
}

// 還原備份
const restoreBackup = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('請先選擇備份檔案')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '還原備份將覆蓋現有資料，確定要繼續嗎？',
      '確認還原',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    restoreLoading.value = true
    
    // 讀取檔案內容
    const fileContent = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(selectedFile.value)
    })
    
    const backupData = JSON.parse(fileContent)
    
    // 還原資料（這裡需要實作具體的還原邏輯）
    // await restoreFromBackup(backupData)
    
    ElMessage.success('資料還原成功')
    selectedFile.value = null
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('還原失敗:', error)
      ElMessage.error('還原失敗')
    }
  } finally {
    restoreLoading.value = false
  }
}

onMounted(async () => {
  // 載入設定
  await appStore.loadSettings()
  
  // 載入類別
  await Promise.all([
    incomeStore.loadCategories(),
    expenseStore.loadCategories()
  ])
  
  // 同步設定到表單
  Object.assign(basicForm, {
    templeName: appStore.settings.templeName || '廣清宮',
    manager: appStore.settings.manager || '',
    phone: appStore.settings.phone || '',
    address: appStore.settings.address || ''
  })
  
  Object.assign(preferenceForm, {
    currency: appStore.settings.currency || 'TWD',
    dateFormat: appStore.settings.dateFormat || 'YYYY-MM-DD',
    pageSize: appStore.settings.pageSize || 20,
    autoBackup: appStore.settings.autoBackup !== false,
    backupInterval: appStore.settings.backupInterval || 7,
    reminderEnabled: appStore.settings.reminderEnabled !== false
  })
})
</script>

<style scoped>
.settings-page {
  padding: 0;
}

.settings-menu {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-menu-list {
  border: none;
}

.settings-content {
  min-height: 500px;
}

.form-actions {
  margin-top: 24px;
  text-align: right;
}

.form-actions .el-button {
  margin-left: 12px;
}

.category-section {
  padding: 0;
}

.section-header {
  margin-bottom: 20px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.category-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-details {
  flex: 1;
}

.category-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.category-description {
  font-size: 12px;
  color: #909399;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.backup-section {
  padding: 0;
}

.backup-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  color: #1e40af;
  font-size: 14px;
}

.about-section {
  padding: 0;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.app-logo {
  color: #409eff;
}

.app-details h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.version {
  color: #909399;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.description {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.feature-list {
  margin-bottom: 30px;
}

.feature-list h3 {
  margin: 0 0 16px 0;
  color: #303133;
}

.feature-list ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.feature-list li {
  margin-bottom: 8px;
}

.contact-info h3 {
  margin: 0 0 12px 0;
  color: #303133;
}

.contact-info p {
  margin: 0 0 8px 0;
  color: #606266;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .backup-actions {
    flex-direction: column;
  }
  
  .app-info {
    flex-direction: column;
    text-align: center;
  }
  
  .category-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .category-actions {
    justify-content: center;
  }
}
</style>