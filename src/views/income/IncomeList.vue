<template>
  <div class="income-list">
    <div class="page-header">
      <h1 class="page-title">收入記錄</h1>
      <p class="page-description">管理宮廟的所有收入記錄</p>
    </div>

    <!-- 工具列 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateRangeChange"
        />
        <el-select
          v-model="selectedCategory"
          placeholder="選擇類別"
          clearable
          style="width: 150px"
          @change="handleCategoryChange"
        >
          <el-option
            v-for="category in incomeStore.categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          >
            <span :style="{ color: category.color }">● </span>
            {{ category.name }}
          </el-option>
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜尋說明或捐款人"
          style="width: 200px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon>
          匯出
        </el-button>
        <el-button type="primary" @click="$router.push('/income/add')">
          <el-icon><Plus /></el-icon>
          新增收入
        </el-button>
      </div>
    </div>

    <!-- 統計摘要 -->
    <el-row :gutter="20" class="summary-row">
      <el-col :span="6">
        <div class="summary-card">
          <div class="summary-value">{{ filteredIncomes.length }}</div>
          <div class="summary-label">記錄筆數</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-card">
          <div class="summary-value">{{ formatCurrency(totalAmount) }}</div>
          <div class="summary-label">總金額</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-card">
          <div class="summary-value">{{ formatCurrency(averageAmount) }}</div>
          <div class="summary-label">平均金額</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-card">
          <div class="summary-value">{{ formatCurrency(maxAmount) }}</div>
          <div class="summary-label">最大金額</div>
        </div>
      </el-col>
    </el-row>

    <!-- 資料表格 -->
    <div class="data-table">
      <el-table
        :data="paginatedIncomes"
        v-loading="incomeStore.loading"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="date" label="日期" width="120" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="categoryId" label="類別" width="120">
          <template #default="{ row }">
            <el-tag 
              :color="getCategoryColor(row.categoryId)"
              size="small"
              style="color: white;"
            >
              {{ getCategoryName(row.categoryId) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="金額" width="120" align="right" sortable="custom">
          <template #default="{ row }">
            <span class="amount income">{{ formatCurrency(row.amount) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="donor" label="捐款人" width="120">
          <template #default="{ row }">
            {{ row.donor || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="說明" min-width="200">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="editIncome(row)"
            >
              編輯
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteIncome(row)"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredIncomes.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 編輯對話框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="編輯收入記錄"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="類別" prop="categoryId">
          <el-select
            v-model="editForm.categoryId"
            placeholder="請選擇類別"
            style="width: 100%"
          >
            <el-option
              v-for="category in incomeStore.categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            >
              <span :style="{ color: category.color }">● </span>
              {{ category.name }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="金額" prop="amount">
          <el-input-number
            v-model="editForm.amount"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="editForm.date"
            type="date"
            placeholder="選擇日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="捐款人" prop="donor">
          <el-input
            v-model="editForm.donor"
            placeholder="請輸入捐款人姓名"
          />
        </el-form-item>

        <el-form-item label="說明" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入說明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit" :loading="saving">
            儲存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useIncomeStore } from '../../stores/income'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Download, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const incomeStore = useIncomeStore()

// 篩選和搜尋
const dateRange = ref([])
const selectedCategory = ref(null)
const searchKeyword = ref('')

// 分頁
const currentPage = ref(1)
const pageSize = ref(20)

// 排序
const sortField = ref('date')
const sortOrder = ref('descending')

// 編輯
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const saving = ref(false)
const editForm = ref({
  id: null,
  categoryId: null,
  amount: null,
  date: '',
  donor: '',
  description: ''
})

const editRules = {
  categoryId: [
    { required: true, message: '請選擇類別', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '請輸入金額', trigger: 'blur' },
    { type: 'number', min: 1, message: '金額必須大於0', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '請選擇日期', trigger: 'change' }
  ]
}

// 計算屬性
const filteredIncomes = computed(() => {
  let result = [...incomeStore.incomes]

  // 日期範圍篩選
  if (dateRange.value && dateRange.value.length === 2) {
    result = result.filter(income => {
      const incomeDate = dayjs(income.date)
      return incomeDate.isAfter(dayjs(dateRange.value[0]).subtract(1, 'day')) &&
             incomeDate.isBefore(dayjs(dateRange.value[1]).add(1, 'day'))
    })
  }

  // 類別篩選
  if (selectedCategory.value) {
    result = result.filter(income => income.categoryId === selectedCategory.value)
  }

  // 關鍵字搜尋
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(income => 
      (income.description && income.description.toLowerCase().includes(keyword)) ||
      (income.donor && income.donor.toLowerCase().includes(keyword))
    )
  }

  // 排序
  result.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    if (sortField.value === 'date') {
      aValue = dayjs(aValue).valueOf()
      bValue = dayjs(bValue).valueOf()
    }
    
    if (sortOrder.value === 'ascending') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return result
})

const paginatedIncomes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredIncomes.value.slice(start, end)
})

const totalAmount = computed(() => {
  return filteredIncomes.value.reduce((sum, income) => sum + income.amount, 0)
})

const averageAmount = computed(() => {
  return filteredIncomes.value.length > 0 
    ? totalAmount.value / filteredIncomes.value.length 
    : 0
})

const maxAmount = computed(() => {
  return filteredIncomes.value.length > 0
    ? Math.max(...filteredIncomes.value.map(income => income.amount))
    : 0
})

// 方法
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getCategoryName = (categoryId) => {
  const category = incomeStore.getCategoryById(categoryId)
  return category ? category.name : '未知'
}

const getCategoryColor = (categoryId) => {
  const category = incomeStore.getCategoryById(categoryId)
  return category ? category.color : '#909399'
}

const handleDateRangeChange = () => {
  currentPage.value = 1
}

const handleCategoryChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSortChange = ({ prop, order }) => {
  sortField.value = prop
  sortOrder.value = order
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const editIncome = (income) => {
  editForm.value = {
    id: income.id,
    categoryId: income.categoryId,
    amount: income.amount,
    date: income.date,
    donor: income.donor || '',
    description: income.description || ''
  }
  editDialogVisible.value = true
}

const saveEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    saving.value = true
    
    await incomeStore.updateIncome(editForm.value.id, {
      categoryId: editForm.value.categoryId,
      amount: editForm.value.amount,
      date: editForm.value.date,
      donor: editForm.value.donor,
      description: editForm.value.description
    })
    
    editDialogVisible.value = false
  } catch (error) {
    console.error('更新失敗:', error)
  } finally {
    saving.value = false
  }
}

const deleteIncome = async (income) => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除這筆收入記錄嗎？\n金額：${formatCurrency(income.amount)}\n日期：${formatDate(income.date)}`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await incomeStore.deleteIncome(income.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('刪除失敗:', error)
    }
  }
}

const exportData = () => {
  try {
    const data = filteredIncomes.value.map(income => ({
      '日期': formatDate(income.date),
      '類別': getCategoryName(income.categoryId),
      '金額': income.amount,
      '捐款人': income.donor || '',
      '說明': income.description || '',
      '建立時間': dayjs(income.createdAt).format('YYYY-MM-DD HH:mm:ss')
    }))
    
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '收入記錄')
    
    const filename = `收入記錄_${dayjs().format('YYYY-MM-DD')}.xlsx`
    XLSX.writeFile(wb, filename)
    
    ElMessage.success('匯出成功')
  } catch (error) {
    console.error('匯出失敗:', error)
    ElMessage.error('匯出失敗')
  }
}

onMounted(async () => {
  await incomeStore.loadIncomes()
  await incomeStore.loadCategories()
})
</script>

<style scoped>
.income-list {
  padding: 0;
}

.summary-row {
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 14px;
  color: #606266;
}

.pagination-container {
  padding: 20px;
  text-align: center;
  background: white;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  text-align: right;
}
</style>