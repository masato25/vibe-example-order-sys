import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import type { MenuItem } from '@/types'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockMenuItem: MenuItem = {
    id: 1,
    name: 'Test Burger',
    description: 'A delicious test burger',
    price: 12.99,
    category_id: 1,
    is_available: true,
    is_featured: false,
    is_spicy: false,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    sort_order: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  it('should initialize with empty cart', () => {
    const store = useCartStore()
    
    expect(store.items).toEqual([])
    expect(store.itemCount).toBe(0)
    expect(store.subtotal).toBe(0)
    expect(store.isEmpty).toBe(true)
  })

  it('should add item to cart', () => {
    const store = useCartStore()
    
    store.addItem(mockMenuItem, 2)
    
    expect(store.items).toHaveLength(1)
    expect(store.items[0].menu_item).toEqual(mockMenuItem)
    expect(store.items[0].quantity).toBe(2)
    expect(store.itemCount).toBe(2)
    expect(store.subtotal).toBe(25.98)
  })

  it('should update existing item quantity when adding same item', () => {
    const store = useCartStore()
    
    store.addItem(mockMenuItem, 1)
    store.addItem(mockMenuItem, 2)
    
    expect(store.items).toHaveLength(1)
    expect(store.items[0].quantity).toBe(3)
    expect(store.itemCount).toBe(3)
  })

  it('should calculate subtotal correctly', () => {
    const store = useCartStore()
    
    store.addItem(mockMenuItem, 2)
    
    expect(store.subtotal).toBe(25.98)
  })

  it('should calculate tax correctly', () => {
    const store = useCartStore()
    
    store.addItem(mockMenuItem, 1)
    
    expect(store.tax).toBeCloseTo(1.14, 2) // 12.99 * 0.0875
  })

  it('should calculate delivery fee correctly', () => {
    const store = useCartStore()
    
    // Under $25 - should have delivery fee
    store.addItem(mockMenuItem, 1)
    expect(store.deliveryFee).toBe(3.99)
    
    // Clear and add enough for free delivery
    store.clearCart()
    store.addItem(mockMenuItem, 2) // $25.98 > $25
    expect(store.deliveryFee).toBe(0)
  })

  it('should update item quantity', () => {
    const store = useCartStore()
    
    store.addItem(mockMenuItem, 1)
    store.updateItemQuantity(0, 3)
    
    expect(store.items[0].quantity).toBe(3)
    expect(store.itemCount).toBe(3)
  })

  it('should remove item when quantity set to 0', () => {
    const store = useCartStore()
    
    store.addItem(mockMenuItem, 1)
    store.updateItemQuantity(0, 0)
    
    expect(store.items).toHaveLength(0)
    expect(store.isEmpty).toBe(true)
  })

  it('should remove item by index', () => {
    const store = useCartStore()
    
    store.addItem(mockMenuItem, 1)
    store.removeItem(0)
    
    expect(store.items).toHaveLength(0)
    expect(store.isEmpty).toBe(true)
  })

  it('should clear entire cart', () => {
    const store = useCartStore()
    
    store.addItem(mockMenuItem, 2)
    store.appliedPromoCode = 'TEST'
    store.promoDiscount = 5.00
    
    store.clearCart()
    
    expect(store.items).toHaveLength(0)
    expect(store.appliedPromoCode).toBeUndefined()
    expect(store.promoDiscount).toBe(0)
    expect(store.isEmpty).toBe(true)
  })

  it('should handle items with modifications', () => {
    const store = useCartStore()
    const modifications = [
      { name: 'Extra Cheese', price: 1.50 },
      { name: 'Bacon', price: 2.00 }
    ]
    
    store.addItem(mockMenuItem, 1, modifications)
    
    expect(store.items[0].modifications).toEqual(modifications)
    expect(store.subtotal).toBe(16.49) // 12.99 + 1.50 + 2.00
  })

  it('should treat items with different modifications as separate items', () => {
    const store = useCartStore()
    const modifications1 = [{ name: 'Extra Cheese', price: 1.50 }]
    const modifications2 = [{ name: 'Bacon', price: 2.00 }]
    
    store.addItem(mockMenuItem, 1, modifications1)
    store.addItem(mockMenuItem, 1, modifications2)
    
    expect(store.items).toHaveLength(2)
    expect(store.itemCount).toBe(2)
  })

  it('should generate correct cart summary', () => {
    const store = useCartStore()
    const modifications = [{ name: 'Extra Cheese', price: 1.50 }]
    
    store.addItem(mockMenuItem, 2, modifications)
    const summary = store.getCartSummary()
    
    expect(summary.items).toHaveLength(1)
    expect(summary.items[0].menu_item_id).toBe(1)
    expect(summary.items[0].quantity).toBe(2)
    expect(summary.items[0].unit_price).toBe(14.49) // 12.99 + 1.50
    expect(summary.items[0].total_price).toBe(28.98) // 14.49 * 2
    expect(summary.subtotal).toBe(28.98)
  })
})