import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const userStore = useUserStore()
    
    expect(userStore.user).toBeNull()
    expect(userStore.isAuthenticated).toBe(false)
    expect(userStore.loading).toBe(false)
    expect(userStore.error).toBeNull()
  })

  it('should set loading state correctly', () => {
    const userStore = useUserStore()
    
    userStore.setLoading(true)
    expect(userStore.loading).toBe(true)
    
    userStore.setLoading(false)
    expect(userStore.loading).toBe(false)
  })

  it('should set error correctly', () => {
    const userStore = useUserStore()
    const errorMessage = 'Test error message'
    
    userStore.setError(errorMessage)
    expect(userStore.error).toBe(errorMessage)
    
    userStore.clearError()
    expect(userStore.error).toBeNull()
  })

  it('should set user and update authentication state', () => {
    const userStore = useUserStore()
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
      address: '123 Test St'
    }
    
    userStore.setUser(mockUser)
    expect(userStore.user).toEqual(mockUser)
    expect(userStore.isAuthenticated).toBe(true)
  })

  it('should logout user correctly', () => {
    const userStore = useUserStore()
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
      address: '123 Test St'
    }
    
    // Set user first
    userStore.setUser(mockUser)
    expect(userStore.isAuthenticated).toBe(true)
    
    // Then logout
    userStore.logout()
    expect(userStore.user).toBeNull()
    expect(userStore.isAuthenticated).toBe(false)
  })
})