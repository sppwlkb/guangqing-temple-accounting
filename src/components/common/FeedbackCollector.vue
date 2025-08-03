<template>
  <div class="feedback-collector">
    <!-- 浮動反饋按鈕 -->
    <el-button
      v-if="!dialogVisible"
      class="feedback-button"
      type="primary"
      :icon="ChatDotRound"
      circle
      @click="openFeedback"
    />

    <!-- 反饋對話框 -->
    <el-dialog
      v-model="dialogVisible"
      title="用戶反饋"
      width="500px"
      :before-close="handleClose"
    >
      <el-form
        ref="feedbackFormRef"
        :model="feedbackForm"
        :rules="feedbackRules"
        label-width="100px"
      >
        <el-form-item label="反饋類型" prop="type">
          <el-select v-model="feedbackForm.type" style="width: 100%">
            <el-option label="功能建議" value="suggestion" />
            <el-option label="問題回報" value="bug" />
            <el-option label="用戶體驗" value="ux" />
            <el-option label="效能問題" value="performance" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="嚴重程度" prop="severity">
          <el-radio-group v-model="feedbackForm.severity">
            <el-radio value="low">輕微</el-radio>
            <el-radio value="medium">中等</el-radio>
            <el-radio value="high">嚴重</el-radio>
            <el-radio value="critical">緊急</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="頁面位置" prop="page">
          <el-input
            v-model="feedbackForm.page"
            placeholder="自動偵測當前頁面"
            readonly
          />
        </el-form-item>

        <el-form-item label="問題描述" prop="description">
          <el-input
            v-model="feedbackForm.description"
            type="textarea"
            placeholder="請詳細描述您遇到的問題或建議"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="重現步驟" prop="steps">
          <el-input
            v-model="feedbackForm.steps"
            type="textarea"
            placeholder="如果是問題回報，請描述重現步驟（選填）"
            :rows="3"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="聯繫方式" prop="contact">
          <el-input
            v-model="feedbackForm.contact"
            placeholder="電子郵件或電話（選填）"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="系統資訊">
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">瀏覽器：</span>
              <span class="info-value">{{ systemInfo.browser }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">作業系統：</span>
              <span class="info-value">{{ systemInfo.os }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">螢幕解析度：</span>
              <span class="info-value">{{ systemInfo.screen }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">時間戳記：</span>
              <span class="info-value">{{ systemInfo.timestamp }}</span>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            提交反饋
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 快速評分 -->
    <el-dialog
      v-model="ratingVisible"
      title="快速評分"
      width="400px"
      :before-close="handleRatingClose"
    >
      <div class="rating-content">
        <p>請為您當前的使用體驗評分：</p>
        <el-rate
          v-model="rating"
          :max="5"
          show-text
          :texts="ratingTexts"
          size="large"
        />
        <el-input
          v-model="ratingComment"
          type="textarea"
          placeholder="簡短評論（選填）"
          :rows="2"
          maxlength="100"
          show-word-limit
          style="margin-top: 16px"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleRatingClose">跳過</el-button>
          <el-button
            type="primary"
            @click="handleRatingSubmit"
          >
            提交評分
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// 路由
const route = useRoute()

// 狀態
const dialogVisible = ref(false)
const ratingVisible = ref(false)
const submitting = ref(false)
const rating = ref(0)
const ratingComment = ref('')

// 表單引用
const feedbackFormRef = ref()

// 反饋表單
const feedbackForm = reactive({
  type: 'suggestion',
  severity: 'medium',
  page: '',
  description: '',
  steps: '',
  contact: ''
})

// 表單驗證規則
const feedbackRules = {
  type: [
    { required: true, message: '請選擇反饋類型', trigger: 'change' }
  ],
  severity: [
    { required: true, message: '請選擇嚴重程度', trigger: 'change' }
  ],
  description: [
    { required: true, message: '請描述問題或建議', trigger: 'blur' },
    { min: 10, message: '描述至少需要 10 個字元', trigger: 'blur' }
  ]
}

// 評分文字
const ratingTexts = ['很差', '較差', '一般', '良好', '優秀']

// 系統資訊
const systemInfo = computed(() => ({
  browser: getBrowserInfo(),
  os: navigator.platform,
  screen: `${screen.width}x${screen.height}`,
  timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
}))

// 獲取瀏覽器資訊
function getBrowserInfo() {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Unknown'
}

// 打開反饋對話框
const openFeedback = () => {
  feedbackForm.page = route.path
  dialogVisible.value = true
}

// 關閉反饋對話框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表單
const resetForm = () => {
  feedbackForm.type = 'suggestion'
  feedbackForm.severity = 'medium'
  feedbackForm.page = ''
  feedbackForm.description = ''
  feedbackForm.steps = ''
  feedbackForm.contact = ''
  
  if (feedbackFormRef.value) {
    feedbackFormRef.value.clearValidate()
  }
}

// 提交反饋
const handleSubmit = async () => {
  if (!feedbackFormRef.value) return

  try {
    await feedbackFormRef.value.validate()
    
    submitting.value = true

    // 收集完整的反饋資料
    const feedbackData = {
      ...feedbackForm,
      systemInfo: systemInfo.value,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    }

    // 儲存到本地（實際應用中會發送到服務器）
    saveFeedback(feedbackData)
    
    ElMessage.success('感謝您的反饋！我們會盡快處理。')
    handleClose()
    
    // 如果是高嚴重程度，顯示額外訊息
    if (feedbackForm.severity === 'critical' || feedbackForm.severity === 'high') {
      ElMessage.warning('您回報的是高優先級問題，我們會優先處理。')
    }
    
  } catch (error) {
    if (error.message) {
      return // 表單驗證錯誤
    }
    ElMessage.error('提交反饋失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

// 儲存反饋到本地
const saveFeedback = (feedbackData) => {
  try {
    const existingFeedbacks = JSON.parse(localStorage.getItem('user-feedbacks') || '[]')
    existingFeedbacks.unshift({
      id: Date.now(),
      ...feedbackData
    })
    
    // 保留最近 100 條反饋
    if (existingFeedbacks.length > 100) {
      existingFeedbacks.splice(100)
    }
    
    localStorage.setItem('user-feedbacks', JSON.stringify(existingFeedbacks))
  } catch (error) {
    console.error('儲存反饋失敗:', error)
  }
}

// 獲取會話 ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session-id')
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    sessionStorage.setItem('session-id', sessionId)
  }
  return sessionId
}

// 顯示快速評分
const showQuickRating = () => {
  ratingVisible.value = true
}

// 關閉評分對話框
const handleRatingClose = () => {
  ratingVisible.value = false
  rating.value = 0
  ratingComment.value = ''
}

// 提交評分
const handleRatingSubmit = () => {
  const ratingData = {
    rating: rating.value,
    comment: ratingComment.value,
    page: route.path,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId()
  }
  
  // 儲存評分
  const existingRatings = JSON.parse(localStorage.getItem('user-ratings') || '[]')
  existingRatings.unshift({
    id: Date.now(),
    ...ratingData
  })
  
  localStorage.setItem('user-ratings', JSON.stringify(existingRatings))
  
  ElMessage.success('感謝您的評分！')
  handleRatingClose()
}

// 定期顯示評分請求（每 30 分鐘）
let ratingTimer = null

const startRatingTimer = () => {
  // 檢查是否已經評分過
  const lastRating = localStorage.getItem('last-rating-time')
  const now = Date.now()
  
  if (!lastRating || now - parseInt(lastRating) > 30 * 60 * 1000) {
    ratingTimer = setTimeout(() => {
      showQuickRating()
      localStorage.setItem('last-rating-time', now.toString())
    }, 10 * 60 * 1000) // 10 分鐘後顯示
  }
}

// 初始化
onMounted(() => {
  // 在開發環境中啟動評分定時器
  if (import.meta.env.DEV) {
    startRatingTimer()
  }
})

// 清理定時器
const cleanup = () => {
  if (ratingTimer) {
    clearTimeout(ratingTimer)
  }
}

// 組件卸載時清理
import { onUnmounted } from 'vue'
onUnmounted(cleanup)

// 暴露方法供外部調用
defineExpose({
  openFeedback,
  showQuickRating
})
</script>

<style scoped>
.feedback-collector {
  position: relative;
}

.feedback-button {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 1000;
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.feedback-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.system-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #606266;
  font-weight: 500;
}

.info-value {
  color: #303133;
  font-family: monospace;
}

.rating-content {
  text-align: center;
  padding: 20px 0;
}

.rating-content p {
  margin-bottom: 20px;
  font-size: 16px;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .feedback-button {
    bottom: 60px;
    right: 16px;
    width: 48px;
    height: 48px;
  }
}
</style>
