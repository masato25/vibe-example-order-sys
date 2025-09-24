import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Customer, CustomerAddress, LoadingState } from '@/types'
import { authApi } from '@/services/api'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<Customer | undefined>()
  const addresses = ref<CustomerAddress[]>([])
  const token = ref<string | undefined>()
  const isLoading = ref(false)
  const error = ref<string | undefined>()

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)
  const fullName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.first_name || ''} ${currentUser.value.last_name || ''}`.trim()
  })
  const defaultAddress = computed(() => 
    addresses.value.find(addr => addr.is_default)
  )

  // Actions
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = undefined
    
    try {
      const response = await authApi.login({ email, password })
      token.value = response.data.access_token
      currentUser.value = response.data.user
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token.value)
      
      // Load user addresses
      await loadAddresses()
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
  }) => {
    isLoading.value = true
    error.value = undefined
    
    try {
      const response = await authApi.register(userData)
      token.value = response.data.access_token
      currentUser.value = response.data.user
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token.value)
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await authApi.logout()
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear state regardless of API call success
      currentUser.value = undefined
      addresses.value = []
      token.value = undefined
      error.value = undefined
      
      // Clear localStorage
      localStorage.removeItem('auth_token')
    }
  }

  const loadProfile = async () => {
    if (!token.value) return
    
    isLoading.value = true
    error.value = undefined
    
    try {
      const response = await authApi.getProfile()
      currentUser.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to load profile'
      
      // If unauthorized, logout
      if (err.response?.status === 401) {
        await logout()
      }
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (userData: Partial<Customer>) => {
    if (!currentUser.value) return
    
    isLoading.value = true
    error.value = undefined
    
    try {
      const response = await authApi.updateProfile(userData)
      currentUser.value = { ...currentUser.value, ...response.data }
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadAddresses = async () => {
    if (!currentUser.value) return
    
    try {
      const response = await authApi.getAddresses()
      addresses.value = response.data
    } catch (err: any) {
      console.error('Failed to load addresses:', err)
    }
  }

  const addAddress = async (addressData: Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at' | 'updated_at'>) => {
    if (!currentUser.value) return
    
    isLoading.value = true
    error.value = undefined
    
    try {
      const response = await authApi.addAddress(addressData)
      addresses.value.push(response.data)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to add address'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateAddress = async (addressId: number, addressData: Partial<CustomerAddress>) => {
    isLoading.value = true
    error.value = undefined
    
    try {
      const response = await authApi.updateAddress(addressId, addressData)
      const index = addresses.value.findIndex(addr => addr.id === addressId)
      if (index !== -1) {
        addresses.value[index] = { ...addresses.value[index], ...response.data }
      }
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update address'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteAddress = async (addressId: number) => {
    isLoading.value = true
    error.value = undefined
    
    try {
      await authApi.deleteAddress(addressId)
      addresses.value = addresses.value.filter(addr => addr.id !== addressId)
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete address'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const initializeFromStorage = () => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
      // Load profile data
      loadProfile()
    }
  }

  const clearError = () => {
    error.value = undefined
  }

  return {
    // State
    currentUser,
    addresses,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    fullName,
    defaultAddress,
    
    // Actions
    login,
    register,
    logout,
    loadProfile,
    updateProfile,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    initializeFromStorage,
    clearError
  }
})