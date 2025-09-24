import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebMemoryHistory } from 'vue-router'
import CheckoutForm from '../components/CheckoutForm.vue'

const router = createRouter({
  history: createWebMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/success', component: { template: '<div>Success</div>' } }
  ]
})

// Mock stores
vi.mock('../stores/cart', () => ({
  useCartStore: () => ({
    items: [
      { id: '1', name: 'Burger', price: 12.99, quantity: 2 }
    ],
    total: 25.98,
    clearCart: vi.fn()
  })
}))

vi.mock('../stores/user', () => ({
  useUserStore: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890'
    },
    isAuthenticated: true
  })
}))

describe('CheckoutForm Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders checkout form with user data pre-filled', () => {
    const wrapper = mount(CheckoutForm, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('input[name="email"]').element.value).toBe('test@example.com')
    expect(wrapper.find('input[name="firstName"]').element.value).toBe('John')
    expect(wrapper.find('input[name="lastName"]').element.value).toBe('Doe')
    expect(wrapper.find('input[name="phone"]').element.value).toBe('+1234567890')
  })

  it('validates required fields', async () => {
    const wrapper = mount(CheckoutForm, {
      global: {
        plugins: [router]
      }
    })

    // Clear required field
    await wrapper.find('input[name="email"]').setValue('')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error-email').exists()).toBe(true)
    expect(wrapper.find('.error-email').text()).toContain('Email is required')
  })

  it('validates email format', async () => {
    const wrapper = mount(CheckoutForm, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('input[name="email"]').setValue('invalid-email')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error-email').text()).toContain('Please enter a valid email')
  })

  it('validates phone number format', async () => {
    const wrapper = mount(CheckoutForm, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('input[name="phone"]').setValue('invalid-phone')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error-phone').text()).toContain('Please enter a valid phone number')
  })

  it('shows loading state during submission', async () => {
    const wrapper = mount(CheckoutForm, {
      global: {
        plugins: [router]
      }
    })

    // Fill form with valid data
    await wrapper.find('input[name="address"]').setValue('123 Test Street')
    await wrapper.find('input[name="city"]').setValue('Test City')
    await wrapper.find('input[name="zipCode"]').setValue('12345')

    // Mock API call to be slow
    vi.spyOn(global, 'fetch').mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ data: { id: 'order-123' } })
      } as Response), 1000))
    )

    // Submit form
    wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('handles successful order submission', async () => {
    const wrapper = mount(CheckoutForm, {
      global: {
        plugins: [router]
      }
    })

    // Mock successful API response
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 'order-123', status: 'confirmed' } })
    } as Response)

    // Fill and submit form
    await wrapper.find('input[name="address"]').setValue('123 Test Street')
    await wrapper.find('input[name="city"]').setValue('Test City')
    await wrapper.find('input[name="zipCode"]').setValue('12345')
    await wrapper.find('form').trigger('submit')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.success-message').exists()).toBe(true)
    expect(wrapper.find('.success-message').text()).toContain('Order placed successfully!')
  })

  it('handles order submission errors', async () => {
    const wrapper = mount(CheckoutForm, {
      global: {
        plugins: [router]
      }
    })

    // Mock API error response
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request'
    } as Response)

    // Fill and submit form
    await wrapper.find('input[name="address"]').setValue('123 Test Street')
    await wrapper.find('input[name="city"]').setValue('Test City')
    await wrapper.find('input[name="zipCode"]').setValue('12345')
    await wrapper.find('form').trigger('submit')

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Failed to place order')
  })

  it('calculates and displays order totals correctly', () => {
    const wrapper = mount(CheckoutForm, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.subtotal').text()).toContain('$25.98')
    // Tax calculation (8% assumed)
    expect(wrapper.find('.tax').text()).toContain('$2.08')
    expect(wrapper.find('.total').text()).toContain('$28.06')
  })
})