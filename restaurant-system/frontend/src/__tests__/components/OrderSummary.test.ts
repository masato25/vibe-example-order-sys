import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebMemoryHistory } from 'vue-router'
import OrderSummary from '../components/OrderSummary.vue'

// Mock router
const router = createRouter({
  history: createWebMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/checkout', component: { template: '<div>Checkout</div>' } }
  ]
})

describe('OrderSummary Component', () => {
  const mockOrder = {
    id: 'order-123',
    status: 'pending',
    items: [
      {
        id: '1',
        name: 'Burger',
        price: 12.99,
        quantity: 2,
        subtotal: 25.98
      },
      {
        id: '2', 
        name: 'Fries',
        price: 4.99,
        quantity: 1,
        subtotal: 4.99
      }
    ],
    subtotal: 30.97,
    tax: 2.48,
    total: 33.45,
    created_at: '2025-09-25T10:30:00Z'
  }

  it('renders order summary correctly', () => {
    const wrapper = mount(OrderSummary, {
      props: { order: mockOrder },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.order-id').text()).toContain('order-123')
    expect(wrapper.find('.order-status').text()).toContain('pending')
    expect(wrapper.findAll('.order-item')).toHaveLength(2)
  })

  it('displays correct totals', () => {
    const wrapper = mount(OrderSummary, {
      props: { order: mockOrder },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.subtotal').text()).toContain('$30.97')
    expect(wrapper.find('.tax').text()).toContain('$2.48')
    expect(wrapper.find('.total').text()).toContain('$33.45')
  })

  it('shows order items with correct details', () => {
    const wrapper = mount(OrderSummary, {
      props: { order: mockOrder },
      global: {
        plugins: [router]
      }
    })

    const items = wrapper.findAll('.order-item')
    
    expect(items[0].find('.item-name').text()).toBe('Burger')
    expect(items[0].find('.item-quantity').text()).toContain('2')
    expect(items[0].find('.item-price').text()).toContain('$12.99')
    expect(items[0].find('.item-subtotal').text()).toContain('$25.98')
    
    expect(items[1].find('.item-name').text()).toBe('Fries')
    expect(items[1].find('.item-quantity').text()).toContain('1')
    expect(items[1].find('.item-price').text()).toContain('$4.99')
  })

  it('formats date correctly', () => {
    const wrapper = mount(OrderSummary, {
      props: { order: mockOrder },
      global: {
        plugins: [router]
      }
    })

    const dateElement = wrapper.find('.order-date')
    expect(dateElement.exists()).toBe(true)
    // Date formatting will depend on locale
    expect(dateElement.text()).toBeTruthy()
  })

  it('displays correct status styling', async () => {
    const pendingOrder = { ...mockOrder, status: 'pending' }
    const wrapper = mount(OrderSummary, {
      props: { order: pendingOrder },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.status-pending').exists()).toBe(true)

    // Test other statuses
    await wrapper.setProps({ order: { ...mockOrder, status: 'confirmed' } })
    expect(wrapper.find('.status-confirmed').exists()).toBe(true)

    await wrapper.setProps({ order: { ...mockOrder, status: 'completed' } })
    expect(wrapper.find('.status-completed').exists()).toBe(true)
  })
})