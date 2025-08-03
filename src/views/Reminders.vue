<template>
  <div class="reminders">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">提醒通知</h1>
        <p class="page-description">管理財務相關的提醒和通知</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增提醒
        </el-button>
      </div>
    </div>

    <!-- 待辦提醒 -->
    <FormCard title="待辦提醒" description="需要處理的重要事項">
      <div class="pending-reminders">
        <div 
          v-for="reminder in pendingReminders" 
          :key="reminder.id"
          class="reminder-item pending"
        >
          <div class="reminder-icon">
            <el-icon :class="getReminderIconClass(reminder.type)">
              <component :is="getReminderIcon(reminder.type)" />
            </el-icon>
          </div>
          <div class="reminder-content">
            <div class="reminder-title">{{ reminder.title }}</div>
            <div class="reminder-desc">{{ reminder.description }}</div>
            <div class="reminder-time">{{ formatTime(reminder.dueTime) }}</div>
          </div>
          <div class="reminder-actions">
            <el-button size="small" @click="markAsCompleted(reminder)">
              完成
            </el-button>
            <el-button size="small" @click="snoozeReminder(reminder)">
              稍後提醒
            </el-button>
          </div>
        </div>

        <div v-if="pendingReminders.length === 0" class="empty-state">
          <el-icon><SuccessFilled /></el-icon>
          <p>太好了！目前沒有待辦事項</p>
        </div>
      </div>
    </FormCard>

    <!-- 提醒設定 -->
    <FormCard title="提醒設定" description="配置自動提醒規則">
      <div class="reminder-settings">
        <div class="setting-group">
          <h4>財務提醒</h4>
          <div class="setting-items">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">月度結算提醒</div>
                <div class="setting-desc">每月最後一天提醒進行月度結算</div>
              </div>
              <el-switch v-model="settings.monthlyClosing" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">備份提醒</div>
                <div class="setting-desc">定期提醒備份重要資料</div>
              </div>
              <el-switch v-model="settings.backupReminder" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">異常支出警告</div>
                <div class="setting-desc">支出超過平均值時發出警告</div>
              </div>
              <el-switch v-model="settings.expenseAlert" />
            </div>
          </div>
        </div>

        <div class="setting-group">
          <h4>通知方式</h4>
          <div class="setting-items">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">桌面通知</div>
                <div class="setting-desc">在桌面顯示通知訊息</div>
              </div>
              <el-switch v-model="settings.desktopNotification" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">聲音提醒</div>
                <div class="setting-desc">播放提醒音效</div>
              </div>
              <el-switch v-model="settings.soundAlert" />
            </div>
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <el-button type="primary" @click="saveSettings">
          儲存設定
        </el-button>
        <el-button @click="testNotification">
          測試通知
        </el-button>
      </div>
    </FormCard>

    <!-- 提醒歷史 -->
    <FormCard title="提醒歷史" description="查看過往的提醒記錄">
      <div class="history-filters">
        <el-select v-model="historyFilter" @change="filterHistory">
          <el-option label="全部" value="all" />
          <el-option label="已完成" value="completed" />
          <el-option label="已忽略" value="dismissed" />
          <el-option label="已延期" value="snoozed" />
        </el-select>
      </div>

      <div class="reminder-history">
        <div 
          v-for="reminder in filteredHistory" 
          :key="reminder.id"
          class="reminder-item history"
        >
          <div class="reminder-icon">
            <el-icon :class="getStatusIconClass(reminder.status)">
              <component :is="getStatusIcon(reminder.status)" />
            </el-icon>
          </div>
          <div class="reminder-content">
            <div class="reminder-title">{{ reminder.title }}</div>
            <div class="reminder-desc">{{ reminder.description }}</div>
            <div class="reminder-time">
              {{ formatDateTime(reminder.completedTime || reminder.dismissedTime) }}
            </div>
          </div>
          <div class="reminder-status">
            <el-tag :type="getStatusTagType(reminder.status)">
              {{ getStatusText(reminder.status) }}
            </el-tag>
          </div>
        </div>

        <div v-if="filteredHistory.length === 0" class="empty-state">
          <el-icon><Document /></el-icon>
          <p>沒有符合條件的提醒記錄</p>
        </div>
      </div>
    </FormCard>

    <!-- 新增提醒對話框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增提醒"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addRules"
        label-width="100px"
      >
        <el-form-item label="提醒標題" prop="title">
          <el-input
            v-model="addForm.title"
            placeholder="請輸入提醒標題"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="提醒類型" prop="type">
          <el-select v-model="addForm.type" style="width: 100%">
            <el-option label="財務提醒" value="financial" />
            <el-option label="備份提醒" value="backup" />
            <el-option label="會議提醒" value="meeting" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="提醒時間" prop="dueTime">
          <el-date-picker
            v-model="addForm.dueTime"
            type="datetime"
            placeholder="選擇提醒時間"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="提醒內容" prop="description">
          <el-input
            v-model="addForm.description"
            type="textarea"
            placeholder="請輸入提醒內容"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="重複設定">
          <el-select v-model="addForm.repeat" style="width: 100%">
            <el-option label="不重複" value="none" />
            <el-option label="每天" value="daily" />
            <el-option label="每週" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            新增
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { 
  Plus, Bell, Warning, SuccessFilled, Document, 
  Check, Close, Clock 
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import FormCard from '@/components/common/FormCard.vue'
import { handleError } from '@/utils/errorHandler'

// 狀態
const addDialogVisible = ref(false)
const submitting = ref(false)
const historyFilter = ref('all')

// 表單引用
const addFormRef = ref()

// 提醒設定
const settings = reactive({
  monthlyClosing: true,
  backupReminder: true,
  expenseAlert: true,
  desktopNotification: true,
  soundAlert: false
})

// 新增表單
const addForm = reactive({
  title: '',
  type: 'financial',
  dueTime: '',
  description: '',
  repeat: 'none'
})

// 表單驗證規則
const addRules = {
  title: [
    { required: true, message: '請輸入提醒標題', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '請選擇提醒類型', trigger: 'change' }
  ],
  dueTime: [
    { required: true, message: '請選擇提醒時間', trigger: 'change' }
  ],
  description: [
    { required: true, message: '請輸入提醒內容', trigger: 'blur' }
  ]
}

// 待辦提醒（模擬數據）
const pendingReminders = ref([
  {
    id: 1,
    title: '月度結算',
    description: '請進行本月的收支結算和報表生成',
    type: 'financial',
    dueTime: '2024-01-31 18:00',
    priority: 'high'
  },
  {
    id: 2,
    title: '資料備份',
    description: '定期備份重要的財務資料',
    type: 'backup',
    dueTime: '2024-01-28 10:00',
    priority: 'medium'
  }
])

// 提醒歷史（模擬數據）
const reminderHistory = ref([
  {
    id: 3,
    title: '上月結算',
    description: '完成上月收支結算',
    type: 'financial',
    status: 'completed',
    completedTime: '2024-01-01 09:30'
  },
  {
    id: 4,
    title: '系統更新',
    description: '更新系統到最新版本',
    type: 'other',
    status: 'dismissed',
    dismissedTime: '2024-01-15 14:20'
  }
])

// 篩選後的歷史記錄
const filteredHistory = computed(() => {
  if (historyFilter.value === 'all') {
    return reminderHistory.value
  }
  return reminderHistory.value.filter(item => item.status === historyFilter.value)
})

// 格式化時間
const formatTime = (time) => {
  const now = dayjs()
  const target = dayjs(time)
  
  if (target.isBefore(now)) {
    return `逾期 ${now.diff(target, 'hour')} 小時`
  } else if (target.diff(now, 'hour') < 24) {
    return `${target.diff(now, 'hour')} 小時後`
  } else {
    return target.format('MM-DD HH:mm')
  }
}

const formatDateTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 獲取提醒圖標
const getReminderIcon = (type) => {
  const icons = {
    financial: 'Bell',
    backup: 'Document',
    meeting: 'Clock',
    other: 'Bell'
  }
  return icons[type] || 'Bell'
}

const getReminderIconClass = (type) => {
  const classes = {
    financial: 'financial-icon',
    backup: 'backup-icon',
    meeting: 'meeting-icon',
    other: 'other-icon'
  }
  return classes[type] || 'other-icon'
}

// 獲取狀態圖標
const getStatusIcon = (status) => {
  const icons = {
    completed: 'Check',
    dismissed: 'Close',
    snoozed: 'Clock'
  }
  return icons[status] || 'Bell'
}

const getStatusIconClass = (status) => {
  const classes = {
    completed: 'completed-icon',
    dismissed: 'dismissed-icon',
    snoozed: 'snoozed-icon'
  }
  return classes[status] || 'other-icon'
}

const getStatusTagType = (status) => {
  const types = {
    completed: 'success',
    dismissed: 'info',
    snoozed: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    completed: '已完成',
    dismissed: '已忽略',
    snoozed: '已延期'
  }
  return texts[status] || '未知'
}

// 處理新增
const handleAdd = () => {
  addDialogVisible.value = true
}

// 標記為完成
const markAsCompleted = (reminder) => {
  const index = pendingReminders.value.findIndex(r => r.id === reminder.id)
  if (index !== -1) {
    pendingReminders.value.splice(index, 1)
    reminderHistory.value.unshift({
      ...reminder,
      status: 'completed',
      completedTime: dayjs().format('YYYY-MM-DD HH:mm')
    })
    ElMessage.success('提醒已標記為完成')
  }
}

// 稍後提醒
const snoozeReminder = (reminder) => {
  ElMessage.info('提醒已延期1小時')
  // 實際實作中會更新提醒時間
}

// 儲存設定
const saveSettings = () => {
  localStorage.setItem('reminder-settings', JSON.stringify(settings))
  ElMessage.success('設定已儲存')
}

// 測試通知
const testNotification = () => {
  if (settings.desktopNotification) {
    ElNotification({
      title: '測試通知',
      message: '這是一個測試通知訊息',
      type: 'info'
    })
  } else {
    ElMessage.info('請先啟用桌面通知')
  }
}

// 篩選歷史
const filterHistory = () => {
  // 篩選邏輯已在 computed 中處理
}

// 處理對話框關閉
const handleDialogClose = () => {
  addDialogVisible.value = false
  resetForm()
}

// 重置表單
const resetForm = () => {
  addForm.title = ''
  addForm.type = 'financial'
  addForm.dueTime = ''
  addForm.description = ''
  addForm.repeat = 'none'
  
  if (addFormRef.value) {
    addFormRef.value.clearValidate()
  }
}

// 處理提交
const handleSubmit = async () => {
  if (!addFormRef.value) return

  try {
    await addFormRef.value.validate()
    
    submitting.value = true

    const newReminder = {
      id: Date.now(),
      title: addForm.title,
      description: addForm.description,
      type: addForm.type,
      dueTime: addForm.dueTime,
      repeat: addForm.repeat,
      priority: 'medium'
    }

    pendingReminders.value.push(newReminder)
    
    ElMessage.success('提醒已新增')
    handleDialogClose()
  } catch (error) {
    if (error.message) {
      return // 表單驗證錯誤
    }
    handleError(error, 'Reminders', { operation: 'addReminder' })
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  // 載入設定
  const savedSettings = localStorage.getItem('reminder-settings')
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings))
  }
})
</script>

<style scoped>
.reminders {
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

.pending-reminders,
.reminder-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.reminder-item.pending {
  background: #fff7e6;
  border-color: #e6a23c;
}

.reminder-item.history {
  background: #f8f9fa;
}

.reminder-icon {
  font-size: 24px;
}

.financial-icon {
  color: #409eff;
}

.backup-icon {
  color: #67c23a;
}

.meeting-icon {
  color: #e6a23c;
}

.other-icon {
  color: #909399;
}

.completed-icon {
  color: #67c23a;
}

.dismissed-icon {
  color: #909399;
}

.snoozed-icon {
  color: #e6a23c;
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.reminder-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.reminder-time {
  font-size: 12px;
  color: #909399;
}

.reminder-actions {
  display: flex;
  gap: 8px;
}

.reminder-status {
  display: flex;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.reminder-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-group h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.setting-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 14px;
  color: #606266;
}

.settings-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.history-filters {
  margin-bottom: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .reminders {
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
  
  .reminder-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .reminder-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
