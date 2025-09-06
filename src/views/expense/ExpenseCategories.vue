<template>
  <div class="expense-categories">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">支出類別管理</h1>
        <p class="page-description">管理支出的分類項目</p>
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
        :data="expenseStore.categories"
        :loading="loading"
        :show-pagination="false"
        :show-selection="false"
        :show-index="true"
        empty-text="暫無支出類別"
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
            <el-tag v-if="row.isDefault" size="small" type="info" class="default-tag">
              預設
            </el-tag>
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
            :disabled="row.isDefault || getCategoryUsageCount(row.id) > 0"
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
import { useExpenseStore } from '@/stores/expense'
import FormCard from '@/components/common/FormCard.vue'
import DataTable from '@/components/common/DataTable.vue'
import { handleError } from '@/utils/errorHandler'

// Store
const expenseStore = useExpenseStore()

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
  color: '#F56C6C',
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
        const exists = expenseStore.categories.some(cat => 
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

// 預定義顏色（支出類別使用偏紅色系）
const predefineColors = [
  '#F56C6C', '#E6A23C', '#909399', '#FF6B6B', '#FF8A80',
  '#FFAB91', '#FFCC80', '#FFF176', '#DCE775', '#AED581',
  '#81C784', '#4DB6AC', '#4FC3F7', '#64B5F6', '#7986CB'
]

// 對話框標題
const dialogTitle = computed(() => {
  return isEditing.value ? '編輯支出類別' : '新增支出類別'
})

// 獲取類別使用次數
const getCategoryUsageCount = (categoryId) => {
  return expenseStore.expenses.filter(expense => expense.categoryId === categoryId).length
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
  if (category.isDefault) {
    ElMessage.warning('預設類別無法刪除')
    return
  }

  const usageCount = getCategoryUsageCount(category.id)
  
  if (usageCount > 0) {
    ElMessage.warning('此類別仍有支出記錄，無法刪除')
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

    await expenseStore.deleteCategory(category.id)
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
  dialogForm.color = '#F56C6C'
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
      description: dialogForm.description.trim(),
      isDefault: false
    }

    if (isEditing.value) {
      await expenseStore.updateCategory(editingId.value, categoryData)
      ElMessage.success('類別已更新')
    } else {
      await expenseStore.addCategory(categoryData)
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
    await expenseStore.loadExpenses()
  } catch (error) {
    handleError(error, 'Category Management', { operation: 'initialization' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.expense-categories {
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
  margin-right: 8px;
}

.default-tag {
  margin-left: 8px;
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
  .expense-categories {
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
