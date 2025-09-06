<template>
  <teleport to="body">
    <transition name="loading-fade">
      <div v-if="isVisible" class="global-loading">
        <div class="loading-backdrop" @click="handleBackdropClick" />
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          
          <div class="loading-text">
            {{ currentMessage }}
          </div>
          
          <div v-if="showProgress" class="loading-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
            <div class="progress-text">{{ progress }}%</div>
          </div>
          
          <div v-if="showCancel" class="loading-actions">
            <el-button size="small" @click="handleCancel">
              取消
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '載入中...'
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  cancelable: {
    type: Boolean,
    default: false
  },
  messages: {
    type: Array,
    default: () => []
  },
  messageInterval: {
    type: Number,
    default: 2000
  }
})

const emit = defineEmits(['cancel', 'backdrop-click'])

const isVisible = ref(false)
const currentMessage = ref('')
const messageIndex = ref(0)
let messageTimer = null

// 計算當前顯示的訊息
const updateMessage = () => {
  if (props.messages.length > 0) {
    currentMessage.value = props.messages[messageIndex.value]
    messageIndex.value = (messageIndex.value + 1) % props.messages.length
  } else {
    currentMessage.value = props.message
  }
}

// 開始訊息輪播
const startMessageRotation = () => {
  if (props.messages.length > 1) {
    messageTimer = setInterval(updateMessage, props.messageInterval)
  }
}

// 停止訊息輪播
const stopMessageRotation = () => {
  if (messageTimer) {
    clearInterval(messageTimer)
    messageTimer = null
  }
}

// 監聽可見性變化
watch(() => props.visible, (newValue) => {
  isVisible.value = newValue
  
  if (newValue) {
    updateMessage()
    startMessageRotation()
    // 防止背景滾動
    document.body.style.overflow = 'hidden'
  } else {
    stopMessageRotation()
    messageIndex.value = 0
    // 恢復背景滾動
    document.body.style.overflow = ''
  }
}, { immediate: true })

// 監聽訊息變化
watch(() => props.message, updateMessage)
watch(() => props.messages, () => {
  messageIndex.value = 0
  updateMessage()
  stopMessageRotation()
  if (isVisible.value) {
    startMessageRotation()
  }
})

// 處理取消
const handleCancel = () => {
  emit('cancel')
}

// 處理背景點擊
const handleBackdropClick = () => {
  if (props.cancelable) {
    emit('backdrop-click')
  }
}

// 清理
const cleanup = () => {
  stopMessageRotation()
  document.body.style.overflow = ''
}

// 組件卸載時清理
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.loading-content {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--border-radius-large);
  padding: var(--spacing-xxl);
  box-shadow: var(--shadow-dark);
  text-align: center;
  min-width: 200px;
  max-width: 400px;
  border: 1px solid var(--border-extra-light);
}

.loading-spinner {
  margin-bottom: var(--spacing-lg);
}

.spinner-ring {
  display: inline-block;
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 38px;
  height: 38px;
  margin: 5px;
  border: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: var(--primary-color) transparent transparent transparent;
}

.spinner-ring div:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring div:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner-ring div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes spinner-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-weight-medium);
  min-height: 20px;
}

.loading-progress {
  margin-bottom: var(--spacing-lg);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-round);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: var(--border-radius-round);
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: progress-shimmer 1.5s infinite;
}

@keyframes progress-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: var(--font-family-mono);
}

.loading-actions {
  margin-top: var(--spacing-lg);
}

/* 過渡動畫 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.loading-fade-enter-active .loading-content {
  animation: loading-scale-in 0.3s ease;
}

.loading-fade-leave-active .loading-content {
  animation: loading-scale-out 0.3s ease;
}

@keyframes loading-scale-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes loading-scale-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .loading-content {
    margin: var(--spacing-lg);
    padding: var(--spacing-xl);
    min-width: auto;
    max-width: none;
  }
  
  .spinner-ring {
    width: 40px;
    height: 40px;
  }
  
  .spinner-ring div {
    width: 32px;
    height: 32px;
    margin: 4px;
    border-width: 2px;
  }
  
  .loading-text {
    font-size: var(--font-size-sm);
  }
}

/* 深色模式支援 */
@media (prefers-color-scheme: dark) {
  .loading-backdrop {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .loading-content {
    background: var(--bg-secondary);
    border-color: var(--border-light);
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .loading-content {
    border-width: 2px;
    border-color: var(--text-primary);
  }
  
  .spinner-ring div {
    border-width: 4px;
  }
  
  .progress-bar {
    border: 1px solid var(--text-primary);
  }
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
  .spinner-ring div {
    animation: none;
    border-color: var(--primary-color);
  }
  
  .progress-fill::after {
    animation: none;
  }
  
  .loading-fade-enter-active,
  .loading-fade-leave-active {
    transition: none;
  }
  
  .loading-content {
    animation: none;
  }
}
</style>
