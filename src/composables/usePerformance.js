import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { debounce, throttle, memoize, performanceMonitor } from '@/utils/performance'

/**
 * 效能優化組合式函數
 * 提供常用的效能優化功能
 */

// 防抖組合函數
export function useDebounce(func, delay = 300) {
  const debouncedFunc = debounce(func, delay)
  
  return {
    debouncedFunc,
    cancel: () => {
      if (debouncedFunc.cancel) {
        debouncedFunc.cancel()
      }
    }
  }
}

// 節流組合函數
export function useThrottle(func, limit = 100) {
  const throttledFunc = throttle(func, limit)
  
  return {
    throttledFunc
  }
}

// 記憶化組合函數
export function useMemoize(func, keyGenerator) {
  const memoizedFunc = memoize(func, keyGenerator)
  
  return {
    memoizedFunc,
    clearCache: () => {
      if (memoizedFunc.cache) {
        memoizedFunc.cache.clear()
      }
    }
  }
}

// 載入狀態管理
export function useLoading(initialState = false) {
  const loading = ref(initialState)
  const loadingCount = ref(0)
  
  const startLoading = () => {
    loadingCount.value++
    loading.value = true
  }
  
  const stopLoading = () => {
    loadingCount.value = Math.max(0, loadingCount.value - 1)
    if (loadingCount.value === 0) {
      loading.value = false
    }
  }
  
  const withLoading = async (asyncFunc) => {
    startLoading()
    try {
      return await asyncFunc()
    } finally {
      stopLoading()
    }
  }
  
  return {
    loading,
    startLoading,
    stopLoading,
    withLoading
  }
}

// 虛擬滾動組合函數
export function useVirtualScroll(options = {}) {
  const {
    itemHeight = 50,
    containerHeight = 400,
    buffer = 5
  } = options
  
  const containerRef = ref()
  const scrollTop = ref(0)
  const items = ref([])
  
  const visibleStart = ref(0)
  const visibleEnd = ref(0)
  const visibleItems = ref([])
  
  const updateVisibleRange = () => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    
    visibleStart.value = Math.max(0, start - buffer)
    visibleEnd.value = Math.min(items.value.length, start + visibleCount + buffer)
    
    visibleItems.value = items.value.slice(visibleStart.value, visibleEnd.value)
  }
  
  const handleScroll = throttle((event) => {
    scrollTop.value = event.target.scrollTop
    updateVisibleRange()
  }, 16)
  
  const setItems = (newItems) => {
    items.value = newItems
    updateVisibleRange()
  }
  
  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll)
    }
  })
  
  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
  })
  
  return {
    containerRef,
    visibleItems,
    visibleStart,
    visibleEnd,
    setItems,
    totalHeight: () => items.value.length * itemHeight,
    offsetY: () => visibleStart.value * itemHeight
  }
}

// 圖片懶載入組合函數
export function useLazyImage() {
  const imageRef = ref()
  const loaded = ref(false)
  const error = ref(false)
  
  const load = (src) => {
    if (!imageRef.value) return
    
    const img = new Image()
    img.onload = () => {
      imageRef.value.src = src
      loaded.value = true
    }
    img.onerror = () => {
      error.value = true
    }
    img.src = src
  }
  
  return {
    imageRef,
    loaded,
    error,
    load
  }
}

// 效能監控組合函數
export function usePerformanceMonitor() {
  const metrics = ref({})
  const isMonitoring = ref(false)
  
  const startMonitoring = () => {
    isMonitoring.value = true
    updateMetrics()
  }
  
  const stopMonitoring = () => {
    isMonitoring.value = false
  }
  
  const updateMetrics = () => {
    if (!isMonitoring.value) return
    
    metrics.value = {
      fps: performanceMonitor.getAverageMetric('fps'),
      memory: performanceMonitor.getMetrics('memory').slice(-1)[0]?.value,
      longTasks: performanceMonitor.getMetrics('longTask').length
    }
    
    setTimeout(updateMetrics, 1000)
  }
  
  onMounted(() => {
    startMonitoring()
  })
  
  onUnmounted(() => {
    stopMonitoring()
  })
  
  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  }
}

// 批次處理組合函數
export function useBatchProcessor(batchSize = 10, delay = 0) {
  const queue = ref([])
  const processing = ref(false)
  
  const addToBatch = (item) => {
    queue.value.push(item)
    if (!processing.value) {
      processBatch()
    }
  }
  
  const processBatch = async () => {
    processing.value = true
    
    while (queue.value.length > 0) {
      const batch = queue.value.splice(0, batchSize)
      
      await Promise.all(batch.map(async (item) => {
        if (typeof item === 'function') {
          return await item()
        }
        return item
      }))
      
      if (delay > 0 && queue.value.length > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      // 讓出控制權給瀏覽器
      await nextTick()
    }
    
    processing.value = false
  }
  
  const clearQueue = () => {
    queue.value = []
  }
  
  return {
    queue,
    processing,
    addToBatch,
    clearQueue
  }
}

// 資源預載入組合函數
export function usePreload() {
  const preloadedResources = ref(new Set())
  
  const preload = (url, type = 'fetch') => {
    if (preloadedResources.value.has(url)) {
      return Promise.resolve()
    }
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url
      link.as = type
      
      link.onload = () => {
        preloadedResources.value.add(url)
        resolve()
      }
      
      link.onerror = reject
      
      document.head.appendChild(link)
    })
  }
  
  const preloadImages = (urls) => {
    return Promise.all(urls.map(url => preload(url, 'image')))
  }
  
  const preloadScripts = (urls) => {
    return Promise.all(urls.map(url => preload(url, 'script')))
  }
  
  return {
    preload,
    preloadImages,
    preloadScripts,
    preloadedResources
  }
}

// 響應式斷點組合函數
export function useBreakpoints() {
  const breakpoints = {
    xs: 480,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1920
  }
  
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  
  const updateSize = throttle(() => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }, 100)
  
  const isXs = ref(width.value < breakpoints.xs)
  const isSm = ref(width.value >= breakpoints.xs && width.value < breakpoints.sm)
  const isMd = ref(width.value >= breakpoints.sm && width.value < breakpoints.md)
  const isLg = ref(width.value >= breakpoints.md && width.value < breakpoints.lg)
  const isXl = ref(width.value >= breakpoints.lg)
  
  const updateBreakpoints = () => {
    isXs.value = width.value < breakpoints.xs
    isSm.value = width.value >= breakpoints.xs && width.value < breakpoints.sm
    isMd.value = width.value >= breakpoints.sm && width.value < breakpoints.md
    isLg.value = width.value >= breakpoints.md && width.value < breakpoints.lg
    isXl.value = width.value >= breakpoints.lg
  }
  
  onMounted(() => {
    window.addEventListener('resize', updateSize)
    updateBreakpoints()
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })
  
  return {
    width,
    height,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    breakpoints
  }
}

// 滾動優化組合函數
export function useScrollOptimization() {
  const scrollY = ref(0)
  const scrollDirection = ref('down')
  const isScrolling = ref(false)
  
  let lastScrollY = 0
  let scrollTimer = null
  
  const handleScroll = throttle(() => {
    const currentScrollY = window.scrollY
    
    scrollY.value = currentScrollY
    scrollDirection.value = currentScrollY > lastScrollY ? 'down' : 'up'
    isScrolling.value = true
    
    lastScrollY = currentScrollY
    
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }, 16)
  
  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    clearTimeout(scrollTimer)
  })
  
  return {
    scrollY,
    scrollDirection,
    isScrolling
  }
}
