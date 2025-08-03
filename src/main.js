import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhTw from 'element-plus/es/locale/lang/zh-tw'
import router from './router'
import App from './App.vue'
import './styles/main.css'
import { setupGlobalErrorHandler } from './utils/errorHandler'

// 設置全域錯誤處理
setupGlobalErrorHandler()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhTw,
})

app.mount('#app')