import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, MenuItem, CartState } from '@/types'
import { pricingApi } from '@/services/api'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | undefined>()
  const appliedPromoCode = ref<string | undefined>()
  const promoDiscount = ref(0)
  
  // Getters
  const itemCount = computed(() => 
    items.value.reduce((total, item) => total + item.quantity, 0)
  )
  
  const subtotal = computed(() => 
    items.value.reduce((total, item) => {
      const itemPrice = item.menu_item.price
      const modificationsCost = item.modifications?.reduce((sum, mod) => sum + mod.price, 0) || 0
      return total + ((itemPrice + modificationsCost) * item.quantity)
    }, 0)
  )
  
  const tax = computed(() => subtotal.value * 0.0875)
  const deliveryFee = computed(() => subtotal.value >= 25 ? 0 : 3.99)
  const total = computed(() => subtotal.value + tax.value + deliveryFee.value - promoDiscount.value)
  
  const isEmpty = computed(() => items.value.length === 0)
  
  // Actions
  const addItem = (menuItem: MenuItem, quantity: number = 1, modifications?: { name: string; price: number }[], specialInstructions?: string) => {
    // Check if item with same modifications already exists
    const existingItemIndex = items.value.findIndex(item => 
      item.menu_item.id === menuItem.id &&
      JSON.stringify(item.modifications) === JSON.stringify(modifications) &&
      item.special_instructions === specialInstructions
    )
    
    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      items.value[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      items.value.push({
        menu_item: menuItem,
        quantity,
        modifications,
        special_instructions: specialInstructions
      })
    }
    
    saveToStorage()
  }
  
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index)
    } else {
      items.value[index].quantity = quantity
      saveToStorage()
    }
  }
  
  const removeItem = (index: number) => {
    items.value.splice(index, 1)
    saveToStorage()
  }
  
  const clearCart = () => {
    items.value = []
    appliedPromoCode.value = undefined
    promoDiscount.value = 0
    error.value = undefined
    saveToStorage()
  }
  
  const applyPromoCode = async (code: string) => {
    if (!code.trim()) return
    
    isLoading.value = true
    error.value = undefined
    
    try {
      const response = await pricingApi.getDynamicPricing([])
      // This would be a promo code validation call
      appliedPromoCode.value = code
      promoDiscount.value = 5.00 // Example discount
      saveToStorage()
    } catch (err: any) {
      error.value = 'Invalid promo code'
    } finally {
      isLoading.value = false
    }
  }
  
  const removePromoCode = () => {
    appliedPromoCode.value = undefined
    promoDiscount.value = 0
    saveToStorage()
  }
  
  const validateCart = async () => {
    isLoading.value = true
    error.value = undefined
    
    try {
      // Check item availability and get current pricing
      const itemIds = items.value.map(item => item.menu_item.id)
      const pricing = await pricingApi.getDynamicPricing(itemIds)
      
      // Update prices if they've changed
      pricing.data?.forEach((priceInfo: any) => {
        const cartItem = items.value.find(item => item.menu_item.id === priceInfo.item_id)
        if (cartItem && cartItem.menu_item.price !== priceInfo.dynamic_price) {
          cartItem.menu_item.price = priceInfo.dynamic_price
        }
      })
      
      saveToStorage()
      return true
    } catch (err: any) {
      error.value = 'Unable to validate cart. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  const getCartSummary = () => ({
    items: items.value.map(item => ({
      menu_item_id: item.menu_item.id,
      menu_item_name: item.menu_item.name,
      menu_item_price: item.menu_item.price,
      quantity: item.quantity,
      unit_price: item.menu_item.price + (item.modifications?.reduce((sum, mod) => sum + mod.price, 0) || 0),
      total_price: (item.menu_item.price + (item.modifications?.reduce((sum, mod) => sum + mod.price, 0) || 0)) * item.quantity,
      modifications: item.modifications,
      special_instructions: item.special_instructions
    })),
    subtotal: subtotal.value,
    tax_amount: tax.value,
    delivery_fee: deliveryFee.value,
    discount_amount: promoDiscount.value,
    total_amount: total.value,
    promo_code: appliedPromoCode.value
  })
  
  const saveToStorage = () => {
    const cartData = {
      items: items.value,
      appliedPromoCode: appliedPromoCode.value,
      promoDiscount: promoDiscount.value
    }
    localStorage.setItem('cart', JSON.stringify(cartData))
  }
  
  const initializeFromStorage = () => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      try {
        const cartData = JSON.parse(stored)
        items.value = cartData.items || []
        appliedPromoCode.value = cartData.appliedPromoCode
        promoDiscount.value = cartData.promoDiscount || 0
      } catch (err) {
        console.error('Failed to load cart from storage:', err)
        clearCart()
      }
    }
  }
  
  const clearError = () => {
    error.value = undefined
  }
  
  return {
    // State
    items,
    isLoading,
    error,
    appliedPromoCode,
    promoDiscount,
    
    // Getters
    itemCount,
    subtotal,
    tax,
    deliveryFee,
    total,
    isEmpty,
    
    // Actions
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    applyPromoCode,
    removePromoCode,
    validateCart,
    getCartSummary,
    saveToStorage,
    initializeFromStorage,
    clearError
  }
})