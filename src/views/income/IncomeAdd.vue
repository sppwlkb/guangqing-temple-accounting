<template>
  <div class="income-add">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">新增收入</h1>
        <p class="page-description">記錄宮廟的收入項目</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          :loading="submitting"
          @click="handleSubmit"
        >
          儲存
        </el-button>
      </div>
    </div>

    <!-- 表單內容 -->
    <FormCard title="收入資訊" description="請填寫收入的詳細資訊">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="left"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="24">
          <!-- 收入類別 -->
          <el-col :span="12">
            <el-form-item label="收入類別" prop="categoryId">
              <CategorySelector
                v-model="formData.categoryId"
                :categories="incomeStore.categories"
                placeholder="請選擇收入類別"
                @change="handleCategoryChange"
              />
            </el-form-item>
          </el-col>

          <!-- 收入金額 -->
          <el-col :span="12">
            <el-form-item label="收入金額" prop="amount">
              <AmountInput
                v-model="formData.amount"
                placeholder="請輸入收入金額"
                :min="1"
                :max="1000000"
                currency-symbol="NT$"
                helper-text="請輸入正確的金額數字"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <!-- 收入日期 -->
          <el-col :span="12">
            <el-form-item label="收入日期" prop="date">
              <el-date-picker
                v-model="formData.date"
                type="date"
                placeholder="請選擇收入日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>
          </el-col>

          <!-- 捐款人 -->
          <el-col :span="12">
            <el-form-item label="捐款人" prop="donor">
              <el-input
                v-model="formData.donor"
                placeholder="請輸入捐款人姓名"
                maxlength="50"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 收入說明 -->
        <el-form-item label="收入說明" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="請輸入收入說明（選填）"
            :rows="4"
            maxlength="500"
            show-word-limit
            resize="none"
          />
        </el-form-item>
      </el-form>
    </FormCard>

    <!-- 快速金額選擇 -->
    <FormCard title="快速金額" description="點擊下方按鈕快速選擇常用金額">
      <div class="quick-amounts">
        <el-button
          v-for="amount in quickAmounts"
          :key="amount"
          :type="formData.amount === amount ? 'primary' : 'default'"
          @click="selectQuickAmount(amount)"
        >
          NT$ {{ formatAmount(amount) }}
        </el-button>
      </div>
    </FormCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { useIncomeStore } from '@/stores/income'
import FormCard from '@/components/common/FormCard.vue'
import CategorySelector from '@/components/business/CategorySelector.vue'
import AmountInput from '@/components/business/AmountInput.vue'
import { handleError } from '@/utils/errorHandler'

// 路由和 Store
const router = useRouter()
const incomeStore = useIncomeStore()

// 表單引用
const formRef = ref()

// 提交狀態
const submitting = ref(false)

// 表單資料
const formData = reactive({
  categoryId: null,
  amount: null,
  date: dayjs().format('YYYY-MM-DD'),
  donor: '',
  description: ''
})

// 表單驗證規則
const formRules = {
  categoryId: [
    { required: true, message: '請選擇收入類別', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '請輸入收入金額', trigger: 'blur' },
    { type: 'number', min: 1, message: '金額必須大於 0', trigger: 'blur' },
    { type: 'number', max: 1000000, message: '金額不能超過 1,000,000', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '請選擇收入日期', trigger: 'change' }
  ],
  donor: [
    { max: 50, message: '捐款人姓名不能超過 50 個字元', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '說明不能超過 500 個字元', trigger: 'blur' }
  ]
}

// 快速金額選項
const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000, 20000]

// 禁用未來日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 格式化金額顯示
const formatAmount = (amount) => {
  return amount.toLocaleString()
}

// 選擇快速金額
const selectQuickAmount = (amount) => {
  formData.amount = amount
}

// 處理類別變化
const handleCategoryChange = (categoryId, category) => {
  console.log('Selected category:', category)
}

// 處理取消
const handleCancel = async () => {
  // 檢查是否有未儲存的變更
  const hasChanges = formData.categoryId || formData.amount || formData.donor || formData.description
  
  if (hasChanges) {
    try {
      await ElMessageBox.confirm(
        '您有未儲存的變更，確定要離開嗎？',
        '確認離開',
        {
          confirmButtonText: '確定離開',
          cancelButtonText: '繼續編輯',
          type: 'warning'
        }
      )
    } catch {
      return // 用戶取消離開
    }
  }
  
  router.back()
}

// 處理表單提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表單驗證
    await formRef.value.validate()
    
    submitting.value = true
    
    // 準備提交資料
    const submitData = {
      categoryId: formData.categoryId,
      amount: formData.amount,
      date: formData.date,
      donor: formData.donor.trim(),
      description: formData.description.trim()
    }
    
    // 提交到 Store
    await incomeStore.addIncome(submitData)
    
    ElMessage.success('收入記錄已成功新增')
    
    // 返回列表頁面
    router.push('/income/list')
    
  } catch (error) {
    if (error.message) {
      // 表單驗證錯誤
      ElMessage.error('請檢查表單內容')
    } else {
      // 其他錯誤
      handleError(error, 'Income Management', { operation: 'addIncome' })
    }
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(async () => {
  try {
    // 載入收入類別
    if (incomeStore.categories.length === 0) {
      await incomeStore.loadCategories()
    }
  } catch (error) {
    handleError(error, 'Income Management', { operation: 'loadCategories' })
  }
})
</script>

<style scoped>
.income-add {
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

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.quick-amounts .el-button {
  min-width: 120px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .income-add {
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
  
  .quick-amounts {
    justify-content: center;
  }
  
  .quick-amounts .el-button {
    min-width: 100px;
    flex: 1;
  }
}
</style>
