<template>
  <div class="amount-input">
    <el-input-number
      v-model="inputValue"
      :min="min"
      :max="max"
      :precision="precision"
      :step="step"
      :size="size"
      :disabled="disabled"
      :placeholder="placeholder"
      :controls="controls"
      :controls-position="controlsPosition"
      class="amount-input-number"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <template v-if="currencySymbol" #prefix>
        <span class="currency-symbol">{{ currencySymbol }}</span>
      </template>
    </el-input-number>
    
    <!-- 輔助文字 -->
    <div v-if="helperText" class="helper-text">
      {{ helperText }}
    </div>
    
    <!-- 金額轉換顯示 -->
    <div v-if="showConversion && inputValue" class="amount-conversion">
      <span class="conversion-label">大寫金額：</span>
      <span class="conversion-value">{{ convertToChineseAmount(inputValue) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

/**
 * AmountInput 組件 - 金額輸入器
 * 支援金額格式化、大寫轉換、貨幣符號等功能
 */
const props = defineProps({
  // v-model 綁定值
  modelValue: {
    type: [Number, String],
    default: null
  },
  // 最小值
  min: {
    type: Number,
    default: 0
  },
  // 最大值
  max: {
    type: Number,
    default: Infinity
  },
  // 精度（小數位數）
  precision: {
    type: Number,
    default: 0
  },
  // 步長
  step: {
    type: Number,
    default: 1
  },
  // 尺寸
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 佔位符
  placeholder: {
    type: String,
    default: '請輸入金額'
  },
  // 是否顯示控制按鈕
  controls: {
    type: Boolean,
    default: true
  },
  // 控制按鈕位置
  controlsPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['right', ''].includes(value)
  },
  // 貨幣符號
  currencySymbol: {
    type: String,
    default: ''
  },
  // 輔助文字
  helperText: {
    type: String,
    default: ''
  },
  // 是否顯示大寫轉換
  showConversion: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

// 內部值
const inputValue = ref(props.modelValue)

// 監聽外部值變化
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
})

// 監聽內部值變化
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// 處理變化事件
const handleChange = (value) => {
  emit('change', value)
}

// 處理失焦事件
const handleBlur = (event) => {
  emit('blur', event)
}

// 處理聚焦事件
const handleFocus = (event) => {
  emit('focus', event)
}

// 數字轉中文大寫
const convertToChineseAmount = (amount) => {
  if (!amount || amount === 0) return '零元整'
  
  const digits = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '萬', '億', '兆']
  
  let amountStr = Math.floor(amount).toString()
  let result = ''
  let unitIndex = 0
  let bigUnitIndex = 0
  
  // 從右到左處理每一位數字
  for (let i = amountStr.length - 1; i >= 0; i--) {
    const digit = parseInt(amountStr[i])
    
    if (digit !== 0) {
      result = digits[digit] + units[unitIndex] + result
    } else if (result && !result.startsWith('零')) {
      result = '零' + result
    }
    
    unitIndex++
    
    // 每四位加一個大單位
    if (unitIndex === 4) {
      if (result && !result.startsWith('零')) {
        result = bigUnits[bigUnitIndex + 1] + result
      }
      unitIndex = 0
      bigUnitIndex++
    }
  }
  
  // 處理特殊情況
  result = result.replace(/零+/g, '零')
  result = result.replace(/零$/, '')
  
  return result + '元整'
}

// 格式化顯示金額
const formatAmount = (amount) => {
  if (!amount) return ''
  return new Intl.NumberFormat('zh-TW').format(amount)
}

// 暴露方法給父組件
defineExpose({
  formatAmount,
  convertToChineseAmount
})
</script>

<style scoped>
.amount-input {
  width: 100%;
}

.amount-input-number {
  width: 100%;
}

.currency-symbol {
  color: #909399;
  font-weight: 500;
  margin-right: 4px;
}

.helper-text {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.amount-conversion {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
}

.conversion-label {
  color: #606266;
  margin-right: 8px;
}

.conversion-value {
  color: #303133;
  font-weight: 500;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .amount-conversion {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>