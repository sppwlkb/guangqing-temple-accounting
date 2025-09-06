<template>
  <div class="form-card">
    <div v-if="title || description || $slots.header" class="form-card-header">
      <div v-if="title || description" class="header-content">
        <h3 v-if="title" class="form-card-title">{{ title }}</h3>
        <p v-if="description" class="form-card-description">{{ description }}</p>
      </div>
      <div v-if="$slots.header" class="header-actions">
        <slot name="header"></slot>
      </div>
    </div>
    
    <div class="form-card-body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="form-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
/**
 * FormCard 組件 - 表單卡片容器
 * 提供統一的表單佈局和樣式
 */
defineProps({
  // 卡片標題
  title: {
    type: String,
    default: ''
  },
  // 卡片描述
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.header-content {
  flex: 1;
}

.form-card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.form-card-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.header-actions {
  margin-left: 16px;
  flex-shrink: 0;
}

.form-card-body {
  padding: 24px;
}

.form-card-footer {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .form-card-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    margin-left: 0;
    display: flex;
    justify-content: flex-end;
  }
  
  .form-card-body {
    padding: 20px 16px;
  }
  
  .form-card-footer {
    padding: 16px;
    flex-direction: column-reverse;
  }
  
  .form-card-footer .el-button {
    width: 100%;
  }
}
</style>