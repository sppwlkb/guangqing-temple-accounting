<template>
  <div class="income-categories">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">收入類別管理</h1>
        <p class="page-description">管理收入的分類項目</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增類別
        </el-button>
      </div>
    </div>

    <!-- 類別列表 -->
    <FormCard title="類別列表" description="拖拽可調整類別順序">
      <DataTable
        :data="incomeStore.categories"
        :loading="loading"
        :show-pagination="false"
        :show-selection="false"
        :show-index="true"
        empty-text="暫無收入類別"
      >
        <!-- 顏色列 -->
        <el-table-column label="顏色" width="80" align="center">
          <template #default="{ row }">
            <div 
              class="category-color"
              :style="{ backgroundColor: row.color }"
            ></div>
          </template>
        </el-table-column>

        <!-- 類別名稱 -->
        <el-table-column label="類別名稱" prop="name" min-width="150">
          <template #default="{ row }">
            <span class="category-name">{{ row.name }}</span>
          </template>
        </el-table-column>

        <!-- 描述 -->
        <el-table-column label="描述" prop="description" min-width="200">
          <template #default="{ row }">
            <span class="category-description">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 使用統計 -->
        <el-table-column label="使用次數" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryUsageCount(row.id) }}</el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <el-button
            type="primary"
            size="small"
            :icon="Edit"
            @click="handleEdit(row)"
          >
            編輯
          </el-button>
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            :disabled="getCategoryUsageCount(row.id) > 0"
            @click="handleDelete(row)"
          >
            刪除
          </el-button>
        </template>
      </DataTable>
    </FormCard>

    <!-- 新增/編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="dialogRules"
        label-width="80px"
      >
        <el-form-item label="類別名稱" prop="name">
          <el-input
            v-model="dialogForm.name"
            placeholder="請輸入類別名稱"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="類別顏色" prop="color">
          <div class="color-picker-wrapper">
            <el-color-picker
              v-model="dialogForm.color"
              :predefine="predefineColors"
              show-alpha
            />
            <span class="color-preview" :style="{ backgroundColor: dialogForm.color }">
              {{ dialogForm.color }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="類別描述" prop="description">
          <el-input
            v-model="dialogForm.description"
            type="textarea"
            placeholder="請輸入類別描述（選填）"
            :rows="3"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button
            type="primary"
            :loading="dialogSubmitting"
            @click="handleDialogSubmit"
          >
            {{ isEditing ? '更新' : '新增' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useIncomeStore } from '@/stores/income'
import FormCard from '@/components/common/FormCard.vue'
import DataTable from '@/components/common/DataTable.vue'
import { handleError } from '@/utils/errorHandler'

// Store
const incomeStore = useIncomeStore()

// 載入狀態
const loading = ref(false)

// 對話框狀態
const dialogVisible = ref(false)
const dialogSubmitting = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

// 對話框表單引用
const dialogFormRef = ref()

// 對話框表單資料
const dialogForm = reactive({
  name: '',
  color: '#409EFF',
  description: ''
})

// 對話框表單驗證規則
const dialogRules = {
  name: [
    { required: true, message: '請輸入類別名稱', trigger: 'blur' },
    { min: 1, max: 20, message: '類別名稱長度在 1 到 20 個字元', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        // 檢查名稱是否重複
        const exists = incomeStore.categories.some(cat => 
          cat.name === value && cat.id !== editingId.value
        )
        if (exists) {
          callback(new Error('類別名稱已存在'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  color: [
    { required: true, message: '請選擇類別顏色', trigger: 'change' }
  ],
  description: [
    { max: 100, message: '描述不能超過 100 個字元', trigger: 'blur' }
  ]
}

// 預定義顏色
const predefineColors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

// 對話框標題
const dialogTitle = computed(() => {
  return isEditing.value ? '編輯收入類別' : '新增收入類別'
})

// 獲取類別使用次數
const getCategoryUsageCount = (categoryId) => {
  return incomeStore.incomes.filter(income => income.categoryId === categoryId).length
}

// 處理新增
const handleAdd = () => {
  isEditing.value = false
  editingId.value = null
  resetDialogForm()
  dialogVisible.value = true
}

// 處理編輯
const handleEdit = (category) => {
  isEditing.value = true
  editingId.value = category.id
  dialogForm.name = category.name
  dialogForm.color = category.color
  dialogForm.description = category.description || ''
  dialogVisible.value = true
}

// 處理刪除
const handleDelete = async (category) => {
  const usageCount = getCategoryUsageCount(category.id)
  
  if (usageCount > 0) {
    ElMessage.warning('此類別仍有收入記錄，無法刪除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `確定要刪除類別「${category.name}」嗎？`,
      '確認刪除',
      {
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await incomeStore.deleteCategory(category.id)
    ElMessage.success('類別已刪除')
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error, 'Category Management', { operation: 'deleteCategory' })
    }
  }
}

// 重置對話框表單
const resetDialogForm = () => {
  dialogForm.name = ''
  dialogForm.color = '#409EFF'
  dialogForm.description = ''
  
  if (dialogFormRef.value) {
    dialogFormRef.value.clearValidate()
  }
}

// 處理對話框關閉
const handleDialogClose = () => {
  dialogVisible.value = false
  setTimeout(() => {
    resetDialogForm()
  }, 300)
}

// 處理對話框提交
const handleDialogSubmit = async () => {
  if (!dialogFormRef.value) return

  try {
    await dialogFormRef.value.validate()
    
    dialogSubmitting.value = true

    const categoryData = {
      name: dialogForm.name.trim(),
      color: dialogForm.color,
      description: dialogForm.description.trim()
    }

    if (isEditing.value) {
      await incomeStore.updateCategory(editingId.value, categoryData)
      ElMessage.success('類別已更新')
    } else {
      await incomeStore.addCategory(categoryData)
      ElMessage.success('類別已新增')
    }

    handleDialogClose()
  } catch (error) {
    if (error.message) {
      // 表單驗證錯誤
      return
    }
    handleError(error, 'Category Management', { 
      operation: isEditing.value ? 'updateCategory' : 'addCategory' 
    })
  } finally {
    dialogSubmitting.value = false
  }
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    await incomeStore.loadCategories()
    await incomeStore.loadIncomes()
  } catch (error) {
    handleError(error, 'Category Management', { operation: 'initialization' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.income-categories {
  padding: 24px;
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

.category-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.category-name {
  font-weight: 500;
  color: #303133;
}

.category-description {
  color: #606266;
  font-size: 14px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-family: monospace;
  min-width: 80px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .income-categories {
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
}
</style>
