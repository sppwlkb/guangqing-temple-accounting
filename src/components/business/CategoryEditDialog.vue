<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
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
      <el-form-item label="類別名稱" prop="name">
        <el-input
          v-model="form.name"
          placeholder="請輸入類別名稱"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="類別顏色" prop="color">
        <div class="color-picker-container">
          <el-color-picker
            v-model="form.color"
            :predefine="predefineColors"
            show-alpha
          />
          <span class="color-preview" :style="{ backgroundColor: form.color }">
            {{ form.name || '預覽' }}
          </span>
        </div>
      </el-form-item>

      <el-form-item label="類別說明" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="請輸入類別說明（選填）"
          :rows="3"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="是否啟用" prop="isActive">
        <el-switch
          v-model="form.isActive"
          active-text="啟用"
          inactive-text="停用"
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

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object,
    default: null
  },
  type: {
    type: String,
    default: 'income',
    validator: (value) => ['income', 'expense'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref(null)
const submitting = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  const typeText = props.type === 'income' ? '收入' : '支出'
  const actionText = props.category?.id ? '編輯' : '新增'
  return `${actionText}${typeText}類別`
})

const form = ref({
  name: '',
  color: '#409EFF',
  description: '',
  isActive: true
})

const rules = {
  name: [
    { required: true, message: '請輸入類別名稱', trigger: 'blur' },
    { min: 1, max: 20, message: '類別名稱長度在 1 到 20 個字元', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '請選擇類別顏色', trigger: 'change' }
  ]
}

// 預定義顏色
const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#8E44AD',
  '#3498DB',
  '#2ECC71',
  '#F39C12',
  '#E74C3C',
  '#95A5A6',
  '#34495E',
  '#16A085',
  '#27AE60',
  '#2980B9'
]

// 監聽類別變化，更新表單
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    form.value = {
      name: newCategory.name || '',
      color: newCategory.color || '#409EFF',
      description: newCategory.description || '',
      isActive: newCategory.isActive !== false
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 監聽對話框開啟，重置表單
watch(visible, (newValue) => {
  if (newValue && !props.category) {
    resetForm()
  }
})

const resetForm = () => {
  form.value = {
    name: '',
    color: '#409EFF',
    description: '',
    isActive: true
  }
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const categoryData = {
      name: form.value.name.trim(),
      color: form.value.color,
      description: form.value.description.trim(),
      isActive: form.value.isActive
    }
    
    emit('save', categoryData)
    
  } catch (error) {
    console.error('表單驗證失敗:', error)
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  resetForm()
  visible.value = false
}
</script>

<style scoped>
.color-picker-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview {
  padding: 4px 12px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.dialog-footer {
  text-align: right;
}
</style>