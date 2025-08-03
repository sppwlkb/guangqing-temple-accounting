<template>
  <div class="form-input" :class="inputClasses">
    <label v-if="label" class="input-label" :for="inputId">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="input-wrapper">
      <el-input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :clearable="clearable"
        :show-password="showPassword"
        :maxlength="maxlength"
        :show-word-limit="showWordLimit"
        :size="size"
        :prefix-icon="prefixIcon"
        :suffix-icon="suffixIcon"
        :rows="rows"
        :autosize="autosize"
        :resize="resize"
        v-bind="$attrs"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <template v-if="$slots.prepend" #prepend>
          <slot name="prepend" />
        </template>
        <template v-if="$slots.append" #append>
          <slot name="append" />
        </template>
        <template v-if="$slots.prefix" #prefix>
          <slot name="prefix" />
        </template>
        <template v-if="$slots.suffix" #suffix>
          <slot name="suffix" />
        </template>
      </el-input>
      
      <!-- 自訂後綴圖標 -->
      <div v-if="customSuffix" class="custom-suffix">
        <slot name="custom-suffix" />
      </div>
    </div>
    
    <!-- 幫助文字 -->
    <div v-if="helpText || errorMessage" class="input-help">
      <div v-if="errorMessage" class="error-message">
        <el-icon><WarningFilled /></el-icon>
        {{ errorMessage }}
      </div>
      <div v-else-if="helpText" class="help-text">
        {{ helpText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, useAttrs } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  showPassword: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: [String, Number],
    default: null
  },
  showWordLimit: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  prefixIcon: {
    type: [String, Object],
    default: null
  },
  suffixIcon: {
    type: [String, Object],
    default: null
  },
  customSuffix: {
    type: Boolean,
    default: false
  },
  helpText: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'filled', 'outlined'].includes(value)
  },
  // textarea 專用
  rows: {
    type: Number,
    default: 2
  },
  autosize: {
    type: [Boolean, Object],
    default: false
  },
  resize: {
    type: String,
    default: 'vertical'
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'change', 'blur', 'focus'])

// 生成唯一 ID
const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

// 雙向綁定
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 樣式類別
const inputClasses = computed(() => [
  `form-input--${props.variant}`,
  `form-input--${props.size}`,
  {
    'form-input--error': props.errorMessage,
    'form-input--disabled': props.disabled,
    'form-input--readonly': props.readonly,
    'form-input--required': props.required
  }
])

// 事件處理
const handleInput = (value) => {
  emit('input', value)
}

const handleChange = (value) => {
  emit('change', value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
.form-input {
  margin-bottom: var(--form-item-margin-bottom);
}

.input-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--form-label-color);
  line-height: var(--line-height-base);
}

.required-mark {
  color: var(--danger-color);
  margin-left: var(--spacing-xs);
}

.input-wrapper {
  position: relative;
}

.custom-suffix {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
}

.input-help {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-base);
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--danger-color);
}

.help-text {
  color: var(--text-secondary);
}

/* 變體樣式 */
.form-input--default :deep(.el-input__wrapper) {
  border: 1px solid var(--form-input-border-color);
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
}

.form-input--default :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-light);
}

.form-input--default :deep(.el-input.is-focus .el-input__wrapper) {
  border-color: var(--form-input-focus-border-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-input--filled :deep(.el-input__wrapper) {
  background-color: var(--bg-secondary);
  border: 1px solid transparent;
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
}

.form-input--filled :deep(.el-input__wrapper:hover) {
  background-color: var(--bg-tertiary);
}

.form-input--filled :deep(.el-input.is-focus .el-input__wrapper) {
  background-color: var(--bg-primary);
  border-color: var(--form-input-focus-border-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-input--outlined :deep(.el-input__wrapper) {
  border: 2px solid var(--form-input-border-color);
  border-radius: var(--border-radius-large);
  transition: var(--transition-base);
}

.form-input--outlined :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-light);
}

.form-input--outlined :deep(.el-input.is-focus .el-input__wrapper) {
  border-color: var(--form-input-focus-border-color);
}

/* 尺寸變體 */
.form-input--large :deep(.el-input__wrapper) {
  min-height: 44px;
  padding: 0 var(--spacing-lg);
}

.form-input--large .input-label {
  font-size: var(--font-size-md);
}

.form-input--small :deep(.el-input__wrapper) {
  min-height: 28px;
  padding: 0 var(--spacing-sm);
}

.form-input--small .input-label {
  font-size: var(--font-size-sm);
}

/* 狀態樣式 */
.form-input--error :deep(.el-input__wrapper) {
  border-color: var(--danger-color);
}

.form-input--error :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.form-input--disabled {
  opacity: 0.6;
}

.form-input--disabled .input-label {
  color: var(--text-disabled);
}

.form-input--readonly :deep(.el-input__wrapper) {
  background-color: var(--bg-disabled);
  cursor: not-allowed;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .form-input {
    margin-bottom: var(--spacing-md);
  }
  
  .input-label {
    font-size: var(--font-size-sm);
  }
  
  .form-input--large :deep(.el-input__wrapper) {
    min-height: 40px;
  }
  
  .form-input--default :deep(.el-input__wrapper) {
    min-height: 36px;
  }
  
  .form-input--small :deep(.el-input__wrapper) {
    min-height: 32px;
  }
}

/* 深色模式支援 */
@media (prefers-color-scheme: dark) {
  .form-input--filled :deep(.el-input__wrapper) {
    background-color: var(--bg-tertiary);
  }
  
  .form-input--filled :deep(.el-input__wrapper:hover) {
    background-color: var(--bg-secondary);
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .form-input--outlined :deep(.el-input__wrapper) {
    border-width: 3px;
  }
  
  .input-label {
    font-weight: var(--font-weight-semibold);
  }
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
  .form-input--default :deep(.el-input__wrapper),
  .form-input--filled :deep(.el-input__wrapper),
  .form-input--outlined :deep(.el-input__wrapper) {
    transition: none;
  }
}
</style>
