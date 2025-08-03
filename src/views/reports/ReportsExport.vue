<template>
  <div class="reports-export">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">匯出報表</h1>
        <p class="page-description">匯出各種格式的財務報表</p>
      </div>
    </div>

    <!-- 匯出設定 -->
    <FormCard title="匯出設定">
      <el-form :model="exportSettings" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="報表類型">
              <el-select v-model="exportSettings.reportType" style="width: 100%">
                <el-option label="收支總表" value="summary" />
                <el-option label="收入明細" value="income" />
                <el-option label="支出明細" value="expense" />
                <el-option label="財務分析" value="analysis" />
                <el-option label="趨勢報表" value="trends" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="匯出格式">
              <el-select v-model="exportSettings.format" style="width: 100%">
                <el-option label="Excel (.xlsx)" value="excel" />
                <el-option label="PDF (.pdf)" value="pdf" />
                <el-option label="CSV (.csv)" value="csv" />
                <el-option label="JSON (.json)" value="json" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="時間範圍">
              <el-date-picker
                v-model="exportSettings.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="包含內容">
              <el-checkbox-group v-model="exportSettings.includeContent">
                <el-checkbox label="summary">統計摘要</el-checkbox>
                <el-checkbox label="details">詳細記錄</el-checkbox>
                <el-checkbox label="charts">圖表</el-checkbox>
                <el-checkbox label="analysis">分析結果</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="檔案名稱">
          <el-input 
            v-model="exportSettings.filename" 
            placeholder="請輸入檔案名稱（不含副檔名）"
            style="width: 300px"
          />
        </el-form-item>
      </el-form>

      <div class="export-actions">
        <el-button 
          type="primary" 
          :loading="exporting"
          @click="handleExport"
        >
          <el-icon><Download /></el-icon>
          {{ exporting ? '匯出中...' : '開始匯出' }}
        </el-button>
        <el-button @click="handlePreview">
          <el-icon><View /></el-icon>
          預覽報表
        </el-button>
      </div>
    </FormCard>

    <!-- 快速匯出 -->
    <FormCard title="快速匯出">
      <div class="quick-export">
        <div class="quick-export-item" @click="quickExport('monthly-summary')">
          <div class="quick-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="quick-content">
            <div class="quick-title">本月收支總表</div>
            <div class="quick-desc">Excel 格式，包含統計和明細</div>
          </div>
        </div>

        <div class="quick-export-item" @click="quickExport('yearly-analysis')">
          <div class="quick-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="quick-content">
            <div class="quick-title">年度財務分析</div>
            <div class="quick-desc">PDF 格式，包含圖表和分析</div>
          </div>
        </div>

        <div class="quick-export-item" @click="quickExport('backup-data')">
          <div class="quick-icon">
            <el-icon><FolderOpened /></el-icon>
          </div>
          <div class="quick-content">
            <div class="quick-title">完整資料備份</div>
            <div class="quick-desc">JSON 格式，所有資料</div>
          </div>
        </div>

        <div class="quick-export-item" @click="quickExport('tax-report')">
          <div class="quick-icon">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="quick-content">
            <div class="quick-title">稅務申報表</div>
            <div class="quick-desc">Excel 格式，符合稅務要求</div>
          </div>
        </div>
      </div>
    </FormCard>

    <!-- 匯出歷史 -->
    <FormCard title="匯出歷史">
      <el-table :data="exportHistory" stripe>
        <el-table-column label="匯出時間" prop="exportTime" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.exportTime) }}
          </template>
        </el-table-column>
        <el-table-column label="報表類型" prop="reportType" width="120" />
        <el-table-column label="格式" prop="format" width="80" />
        <el-table-column label="檔案名稱" prop="filename" min-width="200" />
        <el-table-column label="檔案大小" prop="fileSize" width="100" />
        <el-table-column label="狀態" prop="status" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small"
              :disabled="row.status !== 'completed'"
              @click="downloadFile(row)"
            >
              下載
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </FormCard>

    <!-- 預覽對話框 -->
    <el-dialog
      v-model="previewVisible"
      title="報表預覽"
      width="80%"
      :before-close="handlePreviewClose"
    >
      <div class="preview-content">
        <div class="preview-header">
          <h3>{{ getReportTitle() }}</h3>
          <p>{{ getReportDescription() }}</p>
        </div>
        
        <div class="preview-body">
          <el-alert
            title="預覽功能"
            type="info"
            description="這是報表的預覽版本，實際匯出的報表可能包含更多詳細資訊"
            show-icon
            :closable="false"
          />
          
          <div class="preview-placeholder">
            <el-icon class="preview-icon"><Document /></el-icon>
            <p>報表預覽功能開發中...</p>
            <p>將顯示報表的實際內容和格式</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="handlePreviewClose">關閉</el-button>
        <el-button type="primary" @click="handleExportFromPreview">
          確認匯出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Download, View, Document, TrendCharts, FolderOpened, Tickets 
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import FormCard from '@/components/common/FormCard.vue'
import { handleError } from '@/utils/errorHandler'

// 匯出設定
const exportSettings = ref({
  reportType: 'summary',
  format: 'excel',
  dateRange: [
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD')
  ],
  includeContent: ['summary', 'details'],
  filename: `temple-report-${dayjs().format('YYYY-MM-DD')}`
})

// 狀態
const exporting = ref(false)
const previewVisible = ref(false)

// 匯出歷史（模擬數據）
const exportHistory = ref([
  {
    id: 1,
    exportTime: '2024-01-15 14:30:00',
    reportType: '收支總表',
    format: 'Excel',
    filename: 'temple-summary-2024-01.xlsx',
    fileSize: '2.3 MB',
    status: 'completed'
  },
  {
    id: 2,
    exportTime: '2024-01-10 09:15:00',
    reportType: '財務分析',
    format: 'PDF',
    filename: 'temple-analysis-2024-01.pdf',
    fileSize: '1.8 MB',
    status: 'completed'
  },
  {
    id: 3,
    exportTime: '2024-01-08 16:45:00',
    reportType: '收入明細',
    format: 'CSV',
    filename: 'temple-income-2024-01.csv',
    fileSize: '856 KB',
    status: 'failed'
  }
])

// 處理匯出
const handleExport = async () => {
  try {
    exporting.value = true
    
    // 模擬匯出過程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 添加到匯出歷史
    const newExport = {
      id: Date.now(),
      exportTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      reportType: getReportTypeText(exportSettings.value.reportType),
      format: getFormatText(exportSettings.value.format),
      filename: `${exportSettings.value.filename}.${getFileExtension(exportSettings.value.format)}`,
      fileSize: '1.2 MB',
      status: 'completed'
    }
    
    exportHistory.value.unshift(newExport)
    
    ElMessage.success('報表匯出成功')
    
    // 模擬下載
    downloadSimulatedFile(newExport)
    
  } catch (error) {
    handleError(error, 'Reports Export', { operation: 'export' })
  } finally {
    exporting.value = false
  }
}

// 處理預覽
const handlePreview = () => {
  previewVisible.value = true
}

// 快速匯出
const quickExport = async (type) => {
  try {
    ElMessage.info(`正在準備${getQuickExportTitle(type)}...`)
    
    // 模擬快速匯出
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success(`${getQuickExportTitle(type)}匯出成功`)
  } catch (error) {
    handleError(error, 'Reports Export', { operation: 'quickExport' })
  }
}

// 下載檔案
const downloadFile = (file) => {
  ElMessage.success(`正在下載 ${file.filename}`)
  // 實際實作中會觸發檔案下載
}

// 模擬檔案下載
const downloadSimulatedFile = (file) => {
  const blob = new Blob(['模擬報表內容'], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.filename
  a.click()
  URL.revokeObjectURL(url)
}

// 輔助函數
const formatDateTime = (dateTime) => {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}

const getStatusType = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'failed': return 'danger'
    case 'processing': return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'failed': return '失敗'
    case 'processing': return '處理中'
    default: return '未知'
  }
}

const getReportTypeText = (type) => {
  const types = {
    summary: '收支總表',
    income: '收入明細',
    expense: '支出明細',
    analysis: '財務分析',
    trends: '趨勢報表'
  }
  return types[type] || type
}

const getFormatText = (format) => {
  const formats = {
    excel: 'Excel',
    pdf: 'PDF',
    csv: 'CSV',
    json: 'JSON'
  }
  return formats[format] || format
}

const getFileExtension = (format) => {
  const extensions = {
    excel: 'xlsx',
    pdf: 'pdf',
    csv: 'csv',
    json: 'json'
  }
  return extensions[format] || 'txt'
}

const getQuickExportTitle = (type) => {
  const titles = {
    'monthly-summary': '本月收支總表',
    'yearly-analysis': '年度財務分析',
    'backup-data': '完整資料備份',
    'tax-report': '稅務申報表'
  }
  return titles[type] || '報表'
}

const getReportTitle = () => {
  return getReportTypeText(exportSettings.value.reportType)
}

const getReportDescription = () => {
  const [startDate, endDate] = exportSettings.value.dateRange
  return `時間範圍：${startDate} 至 ${endDate}`
}

const handlePreviewClose = () => {
  previewVisible.value = false
}

const handleExportFromPreview = () => {
  previewVisible.value = false
  handleExport()
}

// 初始化
onMounted(() => {
  // 初始化設定
})
</script>

<style scoped>
.reports-export {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
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

.export-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.quick-export {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.quick-export-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-export-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.quick-icon {
  font-size: 24px;
  color: #409eff;
}

.quick-content {
  flex: 1;
}

.quick-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.quick-desc {
  font-size: 14px;
  color: #606266;
}

.preview-content {
  padding: 16px 0;
}

.preview-header {
  margin-bottom: 20px;
  text-align: center;
}

.preview-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.preview-header p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.preview-body {
  margin-top: 20px;
}

.preview-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #909399;
  margin-top: 20px;
}

.preview-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .reports-export {
    padding: 16px;
  }
  
  .quick-export {
    grid-template-columns: 1fr;
  }
  
  .export-actions {
    flex-direction: column;
  }
}
</style>
