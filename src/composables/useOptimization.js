import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { debounce, throttle } from '@/utils/performance'

/**
 * 效能優化組合式函數
 * 提供各種效能優化功能
 */

// 圖片懶載入
export function useLazyImage() {
  const imageRef = ref()
  const isLoaded = ref(false)
  const isError = ref(false)
  const isIntersecting = ref(false)

  let observer = null

  const load = () => {
    if (!imageRef.value || isLoaded.value) return

    const img = imageRef.value
    const src = img.dataset.src

    if (src) {
      img.onload = () => {
        isLoaded.value = true
        img.classList.add('loaded')
      }
      
      img.onerror = () => {
        isError.value = true
        img.classList.add('error')
      }
      
      img.src = src
      img.removeAttribute('data-src')
    }
  }

  onMounted(() => {
    if (!imageRef.value) return

    // 使用 Intersection Observer 實現懶載入
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              isIntersecting.value = true
              load()
              observer.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin: '50px'
        }
      )
      
      observer.observe(imageRef.value)
    } else {
      // 降級處理：直接載入
      load()
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    imageRef,
    isLoaded,
    isError,
    isIntersecting
  }
}

// 虛擬滾動優化
export function useVirtualScroll(options = {}) {
  const {
    itemHeight = 50,
    containerHeight = 400,
    buffer = 5,
    threshold = 100
  } = options

  const containerRef = ref()
  const scrollTop = ref(0)
  const items = ref([])
  const visibleItems = ref([])
  const startIndex = ref(0)
  const endIndex = ref(0)

  const updateVisibleItems = throttle(() => {
    if (!items.value.length) return

    const start = Math.floor(scrollTop.value / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    
    startIndex.value = Math.max(0, start - buffer)
    endIndex.value = Math.min(items.value.length - 1, start + visibleCount + buffer)
    
    visibleItems.value = items.value.slice(startIndex.value, endIndex.value + 1)
  }, 16)

  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop
    updateVisibleItems()
  }

  const setItems = (newItems) => {
    items.value = newItems
    updateVisibleItems()
  }

  return {
    containerRef,
    visibleItems,
    startIndex,
    endIndex,
    handleScroll,
    setItems,
    totalHeight: () => items.value.length * itemHeight,
    offsetY: () => startIndex.value * itemHeight
  }
}

// 記憶體優化
export function useMemoryOptimization() {
  const memoryUsage = ref({})
  const isMonitoring = ref(false)
  
  let monitoringInterval = null

  const startMonitoring = () => {
    if (!('memory' in performance)) {
      console.warn('瀏覽器不支援記憶體監控')
      return
    }

    isMonitoring.value = true
    
    monitoringInterval = setInterval(() => {
      memoryUsage.value = {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      }
    }, 1000)
  }

  const stopMonitoring = () => {
    isMonitoring.value = false
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }
  }

  const forceGarbageCollection = () => {
    if (window.gc) {
      window.gc()
      console.log('強制垃圾回收完成')
    } else {
      console.warn('垃圾回收功能不可用')
    }
  }

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    memoryUsage,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    forceGarbageCollection
  }
}

// 載入狀態優化
export function useLoadingState() {
  const loading = ref(false)
  const loadingStack = ref([])

  const startLoading = (key = 'default') => {
    if (!loadingStack.value.includes(key)) {
      loadingStack.value.push(key)
    }
    loading.value = true
  }

  const stopLoading = (key = 'default') => {
    const index = loadingStack.value.indexOf(key)
    if (index > -1) {
      loadingStack.value.splice(index, 1)
    }
    loading.value = loadingStack.value.length > 0
  }

  const withLoading = async (asyncFn, key = 'default') => {
    startLoading(key)
    try {
      return await asyncFn()
    } finally {
      stopLoading(key)
    }
  }

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading
  }
}

// 防抖搜尋優化
export function useDebouncedSearch(searchFn, delay = 300) {
  const searchTerm = ref('')
  const isSearching = ref(false)
  const results = ref([])

  const debouncedSearch = debounce(async (term) => {
    if (!term.trim()) {
      results.value = []
      return
    }

    isSearching.value = true
    try {
      results.value = await searchFn(term)
    } catch (error) {
      console.error('搜尋錯誤:', error)
      results.value = []
    } finally {
      isSearching.value = false
    }
  }, delay)

  const search = (term) => {
    searchTerm.value = term
    debouncedSearch(term)
  }

  const clearSearch = () => {
    searchTerm.value = ''
    results.value = []
    isSearching.value = false
  }

  return {
    searchTerm,
    isSearching,
    results,
    search,
    clearSearch
  }
}

// 批次操作優化
export function useBatchOperation() {
  const operations = ref([])
  const isProcessing = ref(false)
  const progress = ref(0)

  const addOperation = (operation) => {
    operations.value.push(operation)
  }

  const processBatch = async (batchSize = 10, delay = 100) => {
    if (operations.value.length === 0) return

    isProcessing.value = true
    progress.value = 0

    const total = operations.value.length
    let processed = 0

    while (operations.value.length > 0) {
      const batch = operations.value.splice(0, batchSize)
      
      await Promise.all(
        batch.map(async (operation) => {
          try {
            await operation()
          } catch (error) {
            console.error('批次操作錯誤:', error)
          }
        })
      )

      processed += batch.length
      progress.value = Math.round((processed / total) * 100)

      // 讓出控制權給瀏覽器
      if (operations.value.length > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    isProcessing.value = false
    progress.value = 100
  }

  const clearOperations = () => {
    operations.value = []
    progress.value = 0
  }

  return {
    operations,
    isProcessing,
    progress,
    addOperation,
    processBatch,
    clearOperations
  }
}

// 組件快取優化
export function useComponentCache() {
  const cache = new Map()
  const maxSize = 50

  const get = (key) => {
    if (cache.has(key)) {
      // 更新訪問時間
      const item = cache.get(key)
      cache.delete(key)
      cache.set(key, { ...item, lastAccess: Date.now() })
      return item.data
    }
    return null
  }

  const set = (key, data) => {
    // 如果快取已滿，移除最舊的項目
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }

    cache.set(key, {
      data,
      createdAt: Date.now(),
      lastAccess: Date.now()
    })
  }

  const has = (key) => cache.has(key)

  const clear = () => cache.clear()

  const size = () => cache.size

  return {
    get,
    set,
    has,
    clear,
    size
  }
}

// 響應式斷點優化
export function useResponsiveBreakpoints() {
  const breakpoints = {
    xs: 480,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1920
  }

  const width = ref(window.innerWidth)
  const currentBreakpoint = ref('')

  const updateBreakpoint = () => {
    const w = width.value
    if (w < breakpoints.xs) currentBreakpoint.value = 'xs'
    else if (w < breakpoints.sm) currentBreakpoint.value = 'sm'
    else if (w < breakpoints.md) currentBreakpoint.value = 'md'
    else if (w < breakpoints.lg) currentBreakpoint.value = 'lg'
    else currentBreakpoint.value = 'xl'
  }

  const handleResize = throttle(() => {
    width.value = window.innerWidth
    updateBreakpoint()
  }, 100)

  onMounted(() => {
    updateBreakpoint()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    width,
    currentBreakpoint,
    breakpoints,
    isMobile: () => ['xs', 'sm'].includes(currentBreakpoint.value),
    isTablet: () => currentBreakpoint.value === 'md',
    isDesktop: () => ['lg', 'xl'].includes(currentBreakpoint.value)
  }
}
