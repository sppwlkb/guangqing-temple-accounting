<template>
  <el-button
    :class="[
      'action-button',
      `action-button--${variant}`,
      `action-button--${size}`,
      {
        'action-button--loading': loading,
        'action-button--disabled': disabled,
        'action-button--block': block
      }
    ]"
    :type="elementType"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :icon="icon"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  icon: {
    type: [String, Object],
    default: null
  }
})

const emit = defineEmits(['click'])

// 映射到 Element Plus 的 type
const elementType = computed(() => {
  const typeMap = {
    primary: 'primary',
    secondary: 'default',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info'
  }
  return typeMap[props.variant] || 'default'
})

const handleClick = (event) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.action-button {
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* 尺寸變體 */
.action-button--large {
  padding: var(--spacing-md) var(--spacing-xxl);
  font-size: var(--font-size-md);
  min-height: 44px;
}

.action-button--default {
  padding: var(--button-padding-vertical) var(--button-padding-horizontal);
  font-size: var(--font-size-base);
  min-height: 36px;
}

.action-button--small {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  min-height: 28px;
}

/* 顏色變體 */
.action-button--primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.action-button--primary:hover {
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

.action-button--secondary {
  background: var(--bg-primary);
  border-color: var(--border-base);
  color: var(--text-primary);
  box-shadow: var(--shadow-base);
}

.action-button--secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: var(--shadow-light);
}

.action-button--success {
  background: linear-gradient(135deg, var(--success-color) 0%, var(--success-dark) 100%);
  border-color: var(--success-color);
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.action-button--success:hover {
  background: linear-gradient(135deg, var(--success-light) 0%, var(--success-color) 100%);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
  transform: translateY(-1px);
}

.action-button--warning {
  background: linear-gradient(135deg, var(--warning-color) 0%, var(--warning-dark) 100%);
  border-color: var(--warning-color);
  color: white;
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
}

.action-button--warning:hover {
  background: linear-gradient(135deg, var(--warning-light) 0%, var(--warning-color) 100%);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.4);
  transform: translateY(-1px);
}

.action-button--danger {
  background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-dark) 100%);
  border-color: var(--danger-color);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.action-button--danger:hover {
  background: linear-gradient(135deg, var(--danger-light) 0%, var(--danger-color) 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
  transform: translateY(-1px);
}

.action-button--info {
  background: linear-gradient(135deg, var(--info-color) 0%, var(--info-dark) 100%);
  border-color: var(--info-color);
  color: white;
  box-shadow: 0 2px 8px rgba(144, 147, 153, 0.3);
}

.action-button--info:hover {
  background: linear-gradient(135deg, var(--info-light) 0%, var(--info-color) 100%);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.4);
  transform: translateY(-1px);
}

/* 狀態變體 */
.action-button--loading {
  pointer-events: none;
  opacity: 0.8;
}

.action-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.action-button--block {
  width: 100%;
  display: block;
}

/* 載入動畫 */
.action-button--loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 點擊波紋效果 */
.action-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.action-button:active::after {
  width: 200px;
  height: 200px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .action-button--large {
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-base);
    min-height: 40px;
  }
  
  .action-button--default {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-sm);
    min-height: 32px;
  }
  
  .action-button--small {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-xs);
    min-height: 24px;
  }
}

/* 深色模式支援 */
@media (prefers-color-scheme: dark) {
  .action-button--secondary {
    background: var(--bg-secondary);
    border-color: var(--border-light);
    color: var(--text-primary);
  }
  
  .action-button--secondary:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-color);
  }
}

/* 高對比度模式支援 */
@media (prefers-contrast: high) {
  .action-button {
    border-width: 2px;
    font-weight: var(--font-weight-semibold);
  }
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
  .action-button {
    transition: none;
  }
  
  .action-button:hover {
    transform: none;
  }
  
  .action-button--loading::before {
    animation: none;
  }
  
  .action-button::after {
    transition: none;
  }
}
</style>
