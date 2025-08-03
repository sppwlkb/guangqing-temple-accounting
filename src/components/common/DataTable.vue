<template>
  <div class="data-table">
    <!-- 表格工具列 -->
    <div v-if="showToolbar" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <span v-if="showTotal" class="total-count">
            共 {{ total }} 筆記錄
          </span>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <!-- 刷新按鈕 -->
          <el-button
            v-if="showRefresh"
            :icon="Refresh"
            :loading="loading"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </slot>
      </div>
    </div>

    <!-- 表格主體 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      :loading="loading"
      :height="height"
      :max-height="maxHeight"
      :stripe="stripe"
      :border="border"
      :size="size"
      :empty-text="emptyText"
      :row-key="rowKey"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblclick"
    >
      <!-- 選擇列 -->
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="55"
        :selectable="selectable"
      />

      <!-- 序號列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序號"
        width="60"
        :index="getIndex"
      />

      <!-- 動態列 -->
      <slot></slot>

      <!-- 操作列 -->
      <el-table-column
        v-if="$slots.actions"
        label="操作"
        :width="actionsWidth"
        :fixed="actionsFixed"
        class-name="actions-column"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :index="scope.$index"></slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分頁控制 -->
    <div v-if="showPagination" class="table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :background="true"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

/**
 * DataTable 組件 - 通用資料表格
 * 支援排序、篩選、分頁、選擇等功能
 */
const props = defineProps({
  // 表格資料
  data: {
    type: Array,
    default: () => []
  },
  // 是否載入中
  loading: {
    type: Boolean,
    default: false
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: undefined
  },
  // 表格最大高度
  maxHeight: {
    type: [String, Number],
    default: undefined
  },
  // 是否顯示斑馬紋
  stripe: {
    type: Boolean,
    default: true
  },
  // 是否顯示邊框
  border: {
    type: Boolean,
    default: true
  },
  // 表格尺寸
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  // 空資料文字
  emptyText: {
    type: String,
    default: '暫無資料'
  },
  // 行資料的 Key
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  // 預設排序
  defaultSort: {
    type: Object,
    default: () => ({})
  },
  // 是否顯示工具列
  showToolbar: {
    type: Boolean,
    default: true
  },
  // 是否顯示總數
  showTotal: {
    type: Boolean,
    default: true
  },
  // 是否顯示刷新按鈕
  showRefresh: {
    type: Boolean,
    default: true
  },
  // 是否顯示選擇列
  showSelection: {
    type: Boolean,
    default: false
  },
  // 是否顯示序號列
  showIndex: {
    type: Boolean,
    default: false
  },
  // 選擇函數
  selectable: {
    type: Function,
    default: () => true
  },
  // 操作列寬度
  actionsWidth: {
    type: [String, Number],
    default: 'auto'
  },
  // 操作列是否固定
  actionsFixed: {
    type: [String, Boolean],
    default: 'right'
  },
  // 是否顯示分頁
  showPagination: {
    type: Boolean,
    default: true
  },
  // 當前頁碼
  currentPage: {
    type: Number,
    default: 1
  },
  // 每頁大小
  pageSize: {
    type: Number,
    default: 20
  },
  // 總記錄數
  total: {
    type: Number,
    default: 0
  },
  // 每頁大小選項
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  // 分頁布局
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'sort-change',
  'selection-change',
  'row-click',
  'row-dblclick',
  'refresh',
  'size-change',
  'current-change'
])

// 表格引用
const tableRef = ref()

// 內部頁碼和大小
const currentPage = ref(props.currentPage)
const pageSize = ref(props.pageSize)

// 表格資料（分頁處理）
const tableData = computed(() => {
  if (!props.showPagination) {
    return props.data
  }
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
})

// 獲取序號
const getIndex = (index) => {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

// 處理排序變化
const handleSortChange = (sortInfo) => {
  emit('sort-change', sortInfo)
}

// 處理選擇變化
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

// 處理行點擊
const handleRowClick = (row, column, event) => {
  emit('row-click', row, column, event)
}

// 處理行雙擊
const handleRowDblclick = (row, column, event) => {
  emit('row-dblclick', row, column, event)
}

// 處理刷新
const handleRefresh = () => {
  emit('refresh')
}

// 處理每頁大小變化
const handleSizeChange = (size) => {
  pageSize.value = size
  emit('update:pageSize', size)
  emit('size-change', size)
}

// 處理當前頁變化
const handleCurrentChange = (page) => {
  currentPage.value = page
  emit('update:currentPage', page)
  emit('current-change', page)
}

// 監聽外部頁碼變化
watch(() => props.currentPage, (newValue) => {
  currentPage.value = newValue
})

watch(() => props.pageSize, (newValue) => {
  pageSize.value = newValue
})

// 暴露表格方法
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const toggleRowSelection = (row, selected) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

const toggleAllSelection = () => {
  tableRef.value?.toggleAllSelection()
}

const setCurrentRow = (row) => {
  tableRef.value?.setCurrentRow(row)
}

defineExpose({
  clearSelection,
  toggleRowSelection,
  toggleAllSelection,
  setCurrentRow
})
</script>

<style scoped>
.data-table {
  width: 100%;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.table-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 操作列樣式 */
:deep(.actions-column .cell) {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .table-pagination {
    justify-content: center;
  }
  
  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
