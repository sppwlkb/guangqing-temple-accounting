<template>
  <div class="profile">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">個人設定</h1>
        <p class="page-description">管理您的個人資訊和偏好設定</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :loading="saving" @click="handleSave">
          儲存設定
        </el-button>
      </div>
    </div>

    <!-- 基本資訊 -->
    <FormCard title="基本資訊" description="設定您的個人基本資訊">
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="120px"
        label-position="left"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="profileForm.name"
                placeholder="請輸入您的姓名"
                maxlength="20"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="職位" prop="position">
              <el-input
                v-model="profileForm.position"
                placeholder="請輸入您的職位"
                maxlength="30"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="電子郵件" prop="email">
              <el-input
                v-model="profileForm.email"
                type="email"
                placeholder="請輸入您的電子郵件"
                maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="聯絡電話" prop="phone">
              <el-input
                v-model="profileForm.phone"
                placeholder="請輸入您的聯絡電話"
                maxlength="20"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </FormCard>

    <!-- 偏好設定 -->
    <FormCard title="偏好設定" description="自訂您的使用偏好">
      <el-form
        ref="preferencesFormRef"
        :model="preferencesForm"
        :rules="preferencesRules"
        label-width="120px"
        label-position="left"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="日期格式" prop="dateFormat">
              <el-select
                v-model="preferencesForm.dateFormat"
                placeholder="請選擇日期格式"
                style="width: 100%"
              >
                <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="貨幣顯示格式" prop="currencyFormat">
              <el-select
                v-model="preferencesForm.currencyFormat"
                placeholder="請選擇貨幣格式"
                style="width: 100%"
              >
                <el-option label="NT$ 1,234" value="NT$ {amount}" />
                <el-option label="$ 1,234" value="$ {amount}" />
                <el-option label="1,234 元" value="{amount} 元" />
                <el-option label="1,234" value="{amount}" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="每頁顯示筆數" prop="pageSize">
              <el-select
                v-model="preferencesForm.pageSize"
                placeholder="請選擇每頁顯示筆數"
                style="width: 100%"
              >
                <el-option label="10 筆" :value="10" />
                <el-option label="20 筆" :value="20" />
                <el-option label="50 筆" :value="50" />
                <el-option label="100 筆" :value="100" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="主題色彩" prop="themeColor">
              <el-color-picker
                v-model="preferencesForm.themeColor"
                :predefine="predefineColors"
                show-alpha
              />
              <span class="color-preview">{{ preferencesForm.themeColor }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="其他偏好">
              <div class="preference-switches">
                <el-switch
                  v-model="preferencesForm.showWelcomeMessage"
                  active-text="顯示歡迎訊息"
                  inactive-text="隱藏歡迎訊息"
                />
                <el-switch
                  v-model="preferencesForm.autoSave"
                  active-text="自動儲存"
                  inactive-text="手動儲存"
                />
                <el-switch
                  v-model="preferencesForm.soundEnabled"
                  active-text="啟用音效"
                  inactive-text="關閉音效"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </FormCard>

    <!-- 安全設定 -->
    <FormCard title="安全設定" description="管理您的帳戶安全">
      <el-form
        ref="securityFormRef"
        :model="securityForm"
        :rules="securityRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="當前密碼" prop="currentPassword">
          <el-input
            v-model="securityForm.currentPassword"
            type="password"
            placeholder="請輸入當前密碼"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="新密碼" prop="newPassword">
          <el-input
            v-model="securityForm.newPassword"
            type="password"
            placeholder="請輸入新密碼"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="確認新密碼" prop="confirmPassword">
          <el-input
            v-model="securityForm.confirmPassword"
            type="password"
            placeholder="請再次輸入新密碼"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleChangePassword">
            修改密碼
          </el-button>
        </el-form-item>
      </el-form>
    </FormCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import FormCard from '@/components/common/FormCard.vue'
import { handleError } from '@/utils/errorHandler'

// 表單引用
const profileFormRef = ref()
const preferencesFormRef = ref()
const securityFormRef = ref()

// 儲存狀態
const saving = ref(false)

// 基本資訊表單
const profileForm = reactive({
  name: '',
  position: '',
  email: '',
  phone: ''
})

// 偏好設定表單
const preferencesForm = reactive({
  dateFormat: 'YYYY-MM-DD',
  currencyFormat: 'NT$ {amount}',
  pageSize: 20,
  themeColor: '#409EFF',
  showWelcomeMessage: true,
  autoSave: true,
  soundEnabled: false
})

// 安全設定表單
const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 預定義顏色
const predefineColors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
]

// 基本資訊驗證規則
const profileRules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名長度在 2 到 20 個字元', trigger: 'blur' }
  ],
  position: [
    { max: 30, message: '職位不能超過 30 個字元', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '請輸入正確的電子郵件格式', trigger: 'blur' },
    { max: 50, message: '電子郵件不能超過 50 個字元', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^[\d\-\+\(\)\s]*$/, message: '請輸入正確的電話號碼格式', trigger: 'blur' },
    { max: 20, message: '電話號碼不能超過 20 個字元', trigger: 'blur' }
  ]
}

// 偏好設定驗證規則
const preferencesRules = {
  dateFormat: [
    { required: true, message: '請選擇日期格式', trigger: 'change' }
  ],
  currencyFormat: [
    { required: true, message: '請選擇貨幣格式', trigger: 'change' }
  ],
  pageSize: [
    { required: true, message: '請選擇每頁顯示筆數', trigger: 'change' }
  ],
  themeColor: [
    { required: true, message: '請選擇主題色彩', trigger: 'change' }
  ]
}

// 安全設定驗證規則
const securityRules = {
  currentPassword: [
    { required: true, message: '請輸入當前密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能少於 6 個字元', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認新密碼', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== securityForm.newPassword) {
          callback(new Error('兩次輸入的密碼不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 載入設定
const loadSettings = async () => {
  try {
    // 從 localStorage 載入設定
    const savedProfile = localStorage.getItem('temple-profile')
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      Object.assign(profileForm, profile)
    }

    const savedPreferences = localStorage.getItem('temple-preferences')
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences)
      Object.assign(preferencesForm, preferences)
    }
  } catch (error) {
    handleError(error, 'Profile Management', { operation: 'loadSettings' })
  }
}

// 儲存設定
const handleSave = async () => {
  try {
    // 驗證表單
    await profileFormRef.value?.validate()
    await preferencesFormRef.value?.validate()

    saving.value = true

    // 儲存到 localStorage
    localStorage.setItem('temple-profile', JSON.stringify(profileForm))
    localStorage.setItem('temple-preferences', JSON.stringify(preferencesForm))

    ElMessage.success('設定已儲存')
  } catch (error) {
    if (error.message) {
      ElMessage.error('請檢查表單內容')
    } else {
      handleError(error, 'Profile Management', { operation: 'saveSettings' })
    }
  } finally {
    saving.value = false
  }
}

// 修改密碼
const handleChangePassword = async () => {
  try {
    await securityFormRef.value?.validate()

    // 這裡應該調用實際的密碼修改 API
    // 目前只是模擬
    ElMessage.success('密碼修改成功')
    
    // 清空密碼表單
    securityForm.currentPassword = ''
    securityForm.newPassword = ''
    securityForm.confirmPassword = ''
  } catch (error) {
    if (error.message) {
      ElMessage.error('請檢查密碼輸入')
    } else {
      handleError(error, 'Profile Management', { operation: 'changePassword' })
    }
  }
}

// 初始化
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.profile {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.color-preview {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
  font-family: monospace;
}

.preference-switches {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .profile {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .preference-switches {
    gap: 12px;
  }
}
</style>
