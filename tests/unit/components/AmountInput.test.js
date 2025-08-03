import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AmountInput from '@/components/business/AmountInput.vue'

// Mock Element Plus
const mockElInput = {
  name: 'ElInput',
  template: '<input v-bind="$attrs" v-on="$listeners" />',
  props: ['modelValue', 'placeholder', 'disabled', 'size', 'clearable']
}

describe('AmountInput', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(AmountInput, {
      global: {
        components: {
          ElInput: mockElInput
        }
      }
    })
  })

  describe('基本功能', () => {
    it('應該正確渲染', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('應該顯示預設佔位符', () => {
      expect(wrapper.find('input').attributes('placeholder')).toBe('請輸入金額')
    })

    it('應該接受自訂佔位符', async () => {
      await wrapper.setProps({ placeholder: '自訂佔位符' })
      expect(wrapper.find('input').attributes('placeholder')).toBe('自訂佔位符')
    })
  })

  describe('數值處理', () => {
    it('應該正確格式化數字', async () => {
      await wrapper.setProps({ modelValue: 1234567 })
      
      // 模擬失焦事件來觸發格式化
      await wrapper.vm.handleBlur()
      
      expect(wrapper.vm.displayValue).toBe('1,234,567')
    })

    it('應該正確解析格式化的數字', () => {
      const result = wrapper.vm.parseNumber('1,234,567')
      expect(result).toBe(1234567)
    })

    it('應該處理小數位數', async () => {
      await wrapper.setProps({ 
        modelValue: 1234.56,
        precision: 2
      })
      
      await wrapper.vm.handleBlur()
      
      expect(wrapper.vm.displayValue).toBe('1,234.56')
    })

    it('應該處理空值', () => {
      const result = wrapper.vm.parseNumber('')
      expect(result).toBe(null)
    })

    it('應該處理無效輸入', () => {
      const result = wrapper.vm.parseNumber('abc')
      expect(result).toBe(null)
    })
  })

  describe('驗證功能', () => {
    it('應該驗證最小值', async () => {
      await wrapper.setProps({ min: 100 })
      
      const error = wrapper.vm.validateNumber(50)
      expect(error).toBe('金額不能小於 100')
    })

    it('應該驗證最大值', async () => {
      await wrapper.setProps({ max: 1000 })
      
      const error = wrapper.vm.validateNumber(2000)
      expect(error).toBe('金額不能大於 1000')
    })

    it('應該通過有效值驗證', async () => {
      await wrapper.setProps({ min: 100, max: 1000 })
      
      const error = wrapper.vm.validateNumber(500)
      expect(error).toBe('')
    })

    it('應該處理 null 值', () => {
      const error = wrapper.vm.validateNumber(null)
      expect(error).toBe('')
    })
  })

  describe('事件處理', () => {
    it('應該在輸入時觸發 update:modelValue 事件', async () => {
      const input = wrapper.find('input')
      await input.setValue('1000')
      await input.trigger('input')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([1000])
    })

    it('應該在輸入時觸發 change 事件', async () => {
      const input = wrapper.find('input')
      await input.setValue('1000')
      await input.trigger('input')
      
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')[0]).toEqual([1000])
    })

    it('應該在聚焦時觸發 focus 事件', async () => {
      await wrapper.setProps({ modelValue: 1000 })
      
      const input = wrapper.find('input')
      await input.trigger('focus')
      
      expect(wrapper.emitted('focus')).toBeTruthy()
      expect(wrapper.emitted('focus')[0]).toEqual([1000])
    })

    it('應該在失焦時觸發 blur 事件', async () => {
      await wrapper.setProps({ modelValue: 1000 })
      
      const input = wrapper.find('input')
      await input.trigger('blur')
      
      expect(wrapper.emitted('blur')).toBeTruthy()
      expect(wrapper.emitted('blur')[0]).toEqual([1000])
    })
  })

  describe('顯示選項', () => {
    it('應該顯示貨幣符號', async () => {
      await wrapper.setProps({ 
        showCurrency: true,
        currencySymbol: 'NT$'
      })
      
      expect(wrapper.text()).toContain('NT$')
    })

    it('應該隱藏貨幣符號', async () => {
      await wrapper.setProps({ showCurrency: false })
      
      expect(wrapper.text()).not.toContain('NT$')
    })

    it('應該顯示單位', async () => {
      await wrapper.setProps({ 
        showUnit: true,
        unit: '元'
      })
      
      expect(wrapper.text()).toContain('元')
    })

    it('應該顯示千分位分隔符', async () => {
      await wrapper.setProps({ 
        modelValue: 1234567,
        showThousandSeparator: true
      })
      
      await wrapper.vm.handleBlur()
      
      expect(wrapper.vm.displayValue).toBe('1,234,567')
    })

    it('應該隱藏千分位分隔符', async () => {
      await wrapper.setProps({ 
        modelValue: 1234567,
        showThousandSeparator: false
      })
      
      await wrapper.vm.handleBlur()
      
      expect(wrapper.vm.displayValue).toBe('1234567')
    })
  })

  describe('狀態管理', () => {
    it('應該正確處理禁用狀態', async () => {
      await wrapper.setProps({ disabled: true })
      
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    it('應該正確處理載入狀態', async () => {
      await wrapper.setProps({ loading: true })
      
      // 檢查是否有載入相關的屬性或類別
      expect(wrapper.vm.loading).toBe(true)
    })
  })

  describe('聚焦和失焦行為', () => {
    it('聚焦時應該顯示原始數字', async () => {
      await wrapper.setProps({ modelValue: 1234567 })
      
      // 先失焦格式化
      await wrapper.vm.handleBlur()
      expect(wrapper.vm.displayValue).toBe('1,234,567')
      
      // 再聚焦
      await wrapper.vm.handleFocus()
      expect(wrapper.vm.displayValue).toBe('1234567')
    })

    it('失焦時應該格式化顯示', async () => {
      await wrapper.setProps({ modelValue: 1234567 })
      
      await wrapper.vm.handleFocus()
      expect(wrapper.vm.displayValue).toBe('1234567')
      
      await wrapper.vm.handleBlur()
      expect(wrapper.vm.displayValue).toBe('1,234,567')
    })
  })

  describe('輔助功能', () => {
    it('應該顯示輔助文字', async () => {
      await wrapper.setProps({ helperText: '請輸入正確的金額' })
      
      expect(wrapper.text()).toContain('請輸入正確的金額')
    })

    it('應該顯示錯誤訊息', async () => {
      await wrapper.setProps({ min: 100 })
      
      // 觸發驗證
      wrapper.vm.handleInput('50')
      
      expect(wrapper.vm.errorMessage).toBe('金額不能小於 100')
    })
  })

  describe('暴露的方法', () => {
    it('應該暴露 validate 方法', () => {
      expect(typeof wrapper.vm.validate).toBe('function')
    })

    it('validate 方法應該返回驗證結果', async () => {
      await wrapper.setProps({ 
        modelValue: 500,
        min: 100,
        max: 1000
      })
      
      const isValid = wrapper.vm.validate()
      expect(isValid).toBe(true)
    })

    it('validate 方法應該在驗證失敗時返回 false', async () => {
      await wrapper.setProps({ 
        modelValue: 50,
        min: 100
      })
      
      const isValid = wrapper.vm.validate()
      expect(isValid).toBe(false)
    })
  })
})
