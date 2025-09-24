import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MenuItem from '../components/MenuItem.vue'

// Mock the cart store
vi.mock('../stores/cart', () => ({
  useCartStore: () => ({
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    getItemQuantity: vi.fn(() => 0),
  })
}))

describe('MenuItem Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockItem = {
    id: '1',
    name: 'Test Burger',
    description: 'A delicious test burger',
    price: 12.99,
    image: 'test-image.jpg',
    category: 'main',
    available: true,
    ingredients: ['beef', 'lettuce', 'tomato'],
    allergens: ['gluten'],
    calories: 650,
    prep_time: 15
  }

  it('renders menu item correctly', () => {
    const wrapper = mount(MenuItem, {
      props: { item: mockItem }
    })

    expect(wrapper.find('h3').text()).toBe(mockItem.name)
    expect(wrapper.find('.description').text()).toBe(mockItem.description)
    expect(wrapper.find('.price').text()).toContain('$12.99')
    expect(wrapper.find('img').attributes('alt')).toBe(mockItem.name)
  })

  it('displays unavailable state correctly', () => {
    const unavailableItem = { ...mockItem, available: false }
    const wrapper = mount(MenuItem, {
      props: { item: unavailableItem }
    })

    expect(wrapper.classes()).toContain('unavailable')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.unavailable-text').text()).toBe('Currently Unavailable')
  })

  it('shows item details when expanded', async () => {
    const wrapper = mount(MenuItem, {
      props: { item: mockItem }
    })

    // Initially details should be hidden
    expect(wrapper.find('.item-details').exists()).toBe(false)

    // Click to expand
    await wrapper.find('.expand-btn').trigger('click')
    
    expect(wrapper.find('.item-details').exists()).toBe(true)
    expect(wrapper.find('.ingredients').text()).toContain('beef')
    expect(wrapper.find('.calories').text()).toContain('650')
    expect(wrapper.find('.prep-time').text()).toContain('15 min')
  })

  it('adds item to cart when add button is clicked', async () => {
    const mockCartStore = {
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      getItemQuantity: vi.fn(() => 0),
    }

    vi.mocked(mockCartStore.addItem)

    const wrapper = mount(MenuItem, {
      props: { item: mockItem },
      global: {
        mocks: {
          cartStore: mockCartStore
        }
      }
    })

    await wrapper.find('.add-btn').trigger('click')
    
    // Should call addItem with the correct item
    expect(mockCartStore.addItem).toHaveBeenCalledWith(mockItem)
  })

  it('handles quantity updates correctly', async () => {
    const mockCartStore = {
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      getItemQuantity: vi.fn(() => 2), // Item already in cart
    }

    const wrapper = mount(MenuItem, {
      props: { item: mockItem },
      global: {
        mocks: {
          cartStore: mockCartStore
        }
      }
    })

    // Should show quantity controls when item is in cart
    expect(wrapper.find('.quantity-controls').exists()).toBe(true)
    expect(wrapper.find('.quantity').text()).toBe('2')

    // Test increment
    await wrapper.find('.increment-btn').trigger('click')
    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith(mockItem.id, 3)

    // Test decrement
    await wrapper.find('.decrement-btn').trigger('click')
    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith(mockItem.id, 1)
  })
})