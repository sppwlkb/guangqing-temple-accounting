<template>
  <div class="file-upload">
    <el-upload
      ref="uploadRef"
      :action="action"
      :multiple="multiple"
      :accept="accept"
      :file-list="fileList"
      :auto-upload="autoUpload"
      :drag="drag"
      :disabled="disabled"
      :limit="limit"
      :show-file-list="showFileList"
      :list-type="listType"
      :before-upload="handleBeforeUpload"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :on-error="handleError"
      :on-success="handleSuccess"
      :on-progress="handleProgress"
      class="upload-component"
    >
      <!-- 拖拽上傳區域 -->
      <template v-if="drag">
        <div class="upload-dragger">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            <p>將檔案拖拽到此處，或<em>點擊上傳</em></p>
            <p class="upload-tip">{{ uploadTip }}</p>
          </div>
        </div>
      </template>
      
      <!-- 按鈕上傳 -->
      <template v-else-if="listType === 'text'">
        <el-button :icon="Upload" :disabled="disabled">
          {{ buttonText }}
        </el-button>
      </template>
      
      <!-- 圖片上傳 -->
      <template v-else-if="listType === 'picture-card'">
        <el-icon><Plus /></el-icon>
      </template>
    </el-upload>

    <!-- 上傳提示 -->
    <div v-if="showTip && uploadTip" class="upload-tip-text">
      {{ uploadTip }}
    </div>

    <!-- 檔案預覽對話框 -->
    <el-dialog
      v-model="previewVisible"
      title="檔案預覽"
      width="60%"
      :before-close="handlePreviewClose"
    >
      <div class="preview-content">
        <!-- 圖片預覽 -->
        <img
          v-if="previewFile && isImage(previewFile)"
          :src="previewFile.url"
          :alt="previewFile.name"
          class="preview-image"
        />
        
        <!-- PDF 預覽 -->
        <iframe
          v-else-if="previewFile && isPdf(previewFile)"
          :src="previewFile.url"
          class="preview-pdf"
        ></iframe>
        
        <!-- 其他檔案 -->
        <div v-else class="preview-other">
          <el-icon class="file-icon"><Document /></el-icon>
          <p>{{ previewFile?.name }}</p>
          <p class="file-size">{{ formatFileSize(previewFile?.size) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, UploadFilled, Plus, Document } from '@element-plus/icons-vue'

/**
 * FileUpload 組件 - 檔案上傳組件
 * 支援拖拽上傳、圖片預覽、檔案格式限制
 */
const props = defineProps({
  // v-model 綁定值
  modelValue: {
    type: Array,
    default: () => []
  },
  // 上傳地址
  action: {
    type: String,
    default: '#'
  },
  // 是否支援多選
  multiple: {
    type: Boolean,
    default: false
  },
  // 接受的檔案類型
  accept: {
    type: String,
    default: 'image/*,.pdf,.doc,.docx,.xls,.xlsx'
  },
  // 是否自動上傳
  autoUpload: {
    type: Boolean,
    default: false
  },
  // 是否支援拖拽
  drag: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 檔案數量限制
  limit: {
    type: Number,
    default: 5
  },
  // 檔案大小限制 (MB)
  maxSize: {
    type: Number,
    default: 10
  },
  // 是否顯示檔案列表
  showFileList: {
    type: Boolean,
    default: true
  },
  // 列表類型
  listType: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'picture', 'picture-card'].includes(value)
  },
  // 按鈕文字
  buttonText: {
    type: String,
    default: '選擇檔案'
  },
  // 上傳提示
  uploadTip: {
    type: String,
    default: '支援 jpg、png、pdf 等格式，檔案大小不超過 10MB'
  },
  // 是否顯示提示
  showTip: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'remove',
  'exceed',
  'error',
  'success',
  'progress'
])

// 上傳組件引用
const uploadRef = ref()
// 檔案列表
const fileList = ref([])
// 預覽相關
const previewVisible = ref(false)
const previewFile = ref(null)

// 監聽外部值變化
watch(() => props.modelValue, (newValue) => {
  fileList.value = newValue || []
}, { immediate: true })

// 檔案上傳前檢查
const handleBeforeUpload = (file) => {
  // 檢查檔案大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`檔案大小不能超過 ${props.maxSize}MB`)
    return false
  }

  // 檢查檔案類型
  const acceptTypes = props.accept.split(',').map(type => type.trim())
  const fileType = file.type
  const fileName = file.name.toLowerCase()
  
  const isValidType = acceptTypes.some(type => {
    if (type.startsWith('.')) {
      return fileName.endsWith(type)
    }
    return fileType.match(type.replace('*', '.*'))
  })
  
  if (!isValidType) {
    ElMessage.error('檔案格式不支援')
    return false
  }

  return true
}

// 檔案狀態改變
const handleChange = (file, files) => {
  fileList.value = files
  emit('update:modelValue', files)
  emit('change', file, files)
}

// 移除檔案
const handleRemove = (file, files) => {
  fileList.value = files
  emit('update:modelValue', files)
  emit('remove', file, files)
}

// 檔案超出限制
const handleExceed = (files, fileList) => {
  ElMessage.warning(`最多只能上傳 ${props.limit} 個檔案`)
  emit('exceed', files, fileList)
}

// 上傳失敗
const handleError = (error, file, fileList) => {
  ElMessage.error('檔案上傳失敗')
  emit('error', error, file, fileList)
}

// 上傳成功
const handleSuccess = (response, file, fileList) => {
  ElMessage.success('檔案上傳成功')
  emit('success', response, file, fileList)
}

// 上傳進度
const handleProgress = (event, file, fileList) => {
  emit('progress', event, file, fileList)
}

// 預覽檔案
const handlePreview = (file) => {
  previewFile.value = file
  previewVisible.value = true
}

// 關閉預覽
const handlePreviewClose = () => {
  previewVisible.value = false
  previewFile.value = null
}

// 判斷是否為圖片
const isImage = (file) => {
  return file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
}

// 判斷是否為 PDF
const isPdf = (file) => {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

// 格式化檔案大小
const formatFileSize = (size) => {
  if (!size) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  
  return `${fileSize.toFixed(1)} ${units[index]}`
}

// 清空檔案列表
const clearFiles = () => {
  uploadRef.value?.clearFiles()
  fileList.value = []
  emit('update:modelValue', [])
}

// 手動上傳
const submit = () => {
  uploadRef.value?.submit()
}

// 暴露方法
defineExpose({
  clearFiles,
  submit,
  handlePreview
})
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-component {
  width: 100%;
}

.upload-dragger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #fafafa;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-dragger:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-text p {
  margin: 0 0 8px 0;
  color: #606266;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.upload-tip-text {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.preview-pdf {
  width: 100%;
  height: 500px;
  border: none;
}

.preview-other {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #606266;
}

.file-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .upload-dragger {
    padding: 20px;
  }
  
  .upload-icon {
    font-size: 36px;
  }
  
  .preview-content {
    min-height: 200px;
  }
  
  .preview-pdf {
    height: 300px;
  }
}
</style>
