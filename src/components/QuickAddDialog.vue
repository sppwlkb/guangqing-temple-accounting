<template>
  <el-dialog
    v-model="visible"
    title="快速記帳"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="類型" prop="type">
        <el-radio-group v-model="form.type" @change="handleTypeChange">
          <el-radio-button label="income">收入</el-radio-button>
          <el-radio-button label="expense">支出</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="類別" prop="categoryId">
        <el-select
          v-model="form.categoryId"
          placeholder="請選擇類別"
          style="width: 100%"
        >
          <el-option
            v-for="category in currentCategories"
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
          v-model="form.amount"
          :min="0"
          :precision="0"
          :step="100"
          style="width: 100%"
          placeholder="請輸入金額"
        />
      </el-form-item>

      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="選擇日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="說明" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="請輸入說明（選填）"
        />
      </el-form-item>

      <el-form-item v-if="form.type === 'income'" label="捐款人" prop="donor">
        <el-input
          v-model="form.donor"
          placeholder="請輸入捐款人姓名（選填）"
        />
      </el-form-item>

      <el-form-item v-if="form.type === 'expense'" label="廠商" prop="vendor">
        <el-input
          v-model="form.vendor"
          placeholder="請輸入廠商名稱（選填）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ submitting ? '儲存中...' : '儲存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useIncomeStore } from '../stores/income'
import { useExpenseStore } from '../stores/expense'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()

const formRef = ref(null)
const submitting = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  type: 'income',
  categoryId: null,
  amount: null,
  date: dayjs().format('YYYY-MM-DD'),
  description: '',
  donor: '',
  vendor: ''
})

const rules = {
  type: [
    { required: true, message: '請選擇類型', trigger: 'change' }
  ],
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

const currentCategories = computed(() => {
  return form.value.type === 'income' 
    ? incomeStore.categories 
    : expenseStore.categories
})

const handleTypeChange = () => {
  // 切換類型時重置類別選擇
  form.value.categoryId = null
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const data = {
      categoryId: form.value.categoryId,
      amount: form.value.amount,
      date: form.value.date,
      description: form.value.description
    }
    
    if (form.value.type === 'income') {
      if (form.value.donor) {
        data.donor = form.value.donor
      }
      await incomeStore.addIncome(data)
    } else {
      if (form.value.vendor) {
        data.vendor = form.value.vendor
      }
      await expenseStore.addExpense(data)
    }
    
    // 重置表單
    resetForm()
    visible.value = false
    
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  resetForm()
  visible.value = false
}

const resetForm = () => {
  form.value = {
    type: 'income',
    categoryId: null,
    amount: null,
    date: dayjs().format('YYYY-MM-DD'),
    description: '',
    donor: '',
    vendor: ''
  }
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 監聽對話框開啟，重置表單
watch(visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>