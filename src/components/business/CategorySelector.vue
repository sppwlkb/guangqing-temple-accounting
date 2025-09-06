<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :filterable="filterable"
    :disabled="disabled"
    :loading="loading"
    :size="size"
    class="category-selector"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="category in categories"
      :key="category.id"
      :label="category.name"
      :value="category.id"
      :disabled="!category.isActive"
    >
      <div class="category-option">
        <span 
          class="category-color" 
          :style="{ backgroundColor: category.color }"
        ></span>
        <span class="category-name">{{ category.name }}</span>
        <span v-if="category.description" class="category-description">
          {{ category.description }}
        </span>
      </div>
    </el-option>
    
    <!-- 空狀態 -->
    <template #empty>
      <div class="empty-state">
        <el-icon><Document /></el-icon>
        <p>{{ emptyText }}</p>
      </div>
    </template>
  </el-select>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'

/**
 * CategorySelector 組件 - 類別選擇器
 * 支援收入和支出類別選擇，帶有顏色顯示和搜尋功能
 */
const props = defineProps({
  // v-model 綁定值
  modelValue: {
    type: [String, Number],
    default: null
  },
  // 類別列表
  categories: {
    type: Array,
    default: () => []
  },
  // 佔位符文字
  placeholder: {
    type: String,
    default: '請選擇類別'
  },
  // 是否可清空
  clearable: {
    type: Boolean,
    default: true
  },
  // 是否可搜尋
  filterable: {
    type: Boolean,
    default: true
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否載入中
  loading: {
    type: Boolean,
    default: false
  },
  // 尺寸
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  // 空狀態文字
  emptyText: {
    type: String,
    default: '暫無類別資料'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'clear'])

// 內部選中值
const selectedValue = ref(props.modelValue)

// 監聽外部值變化
watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue
})

// 監聽內部值變化
watch(selectedValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// 處理選擇變化
const handleChange = (value) => {
  const selectedCategory = props.categories.find(cat => cat.id === value)
  emit('change', value, selectedCategory)
}

// 處理清空
const handleClear = () => {
  emit('clear')
}

// 獲取選中的類別資訊
const getSelectedCategory = () => {
  return props.categories.find(cat => cat.id === selectedValue.value)
}

// 暴露方法給父組件
defineExpose({
  getSelectedCategory
})
</script>

<style scoped>
.category-selector {
  width: 100%;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.category-name {
  font-weight: 500;
  color: #303133;
  flex-shrink: 0;
}

.category-description {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
}

.empty-state .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .category-description {
    display: none;
  }
}
</style>
