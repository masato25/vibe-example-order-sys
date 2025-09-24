import axios from 'axios'
import type { 
  MenuItem, 
  Category, 
  Order, 
  Customer, 
  CustomerAddress,
  CheckoutForm,
  LoginForm,
  RegisterForm,
  ApiResponse,
  PaginatedResponse
} from '@/types'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Microservices API
const microservicesApi = axios.create({
  baseURL: import.meta.env.VITE_MICROSERVICES_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Menu API
export const menuApi = {
  getCategories: () => 
    api.get<PaginatedResponse<Category>>('/items/categories?sort=sort_order&filter[is_active][_eq]=true'),
    
  getMenuItems: (categoryId?: number) => {
    let url = '/items/menu_items?filter[is_available][_eq]=true&sort=sort_order'
    if (categoryId) {
      url += `&filter[category_id][_eq]=${categoryId}`
    }
    return api.get<PaginatedResponse<MenuItem>>(url)
  },
  
  getMenuItem: (id: number) => 
    api.get<ApiResponse<MenuItem>>(`/items/menu_items/${id}`),
    
  getFeaturedItems: () => 
    api.get<PaginatedResponse<MenuItem>>('/items/menu_items?filter[is_featured][_eq]=true&filter[is_available][_eq]=true&limit=6'),
    
  searchMenuItems: (query: string) => 
    api.get<PaginatedResponse<MenuItem>>(`/items/menu_items?search=${encodeURIComponent(query)}&filter[is_available][_eq]=true`)
}

// Auth API
export const authApi = {
  login: (credentials: LoginForm) => 
    api.post<ApiResponse<{ access_token: string; user: Customer }>>('/auth/login', credentials),
    
  register: (userData: RegisterForm) => 
    api.post<ApiResponse<{ access_token: string; user: Customer }>>('/users', userData),
    
  logout: () => 
    api.post('/auth/logout'),
    
  getProfile: () => 
    api.get<ApiResponse<Customer>>('/users/me'),
    
  updateProfile: (userData: Partial<Customer>) => 
    api.patch<ApiResponse<Customer>>('/users/me', userData),
    
  getAddresses: () => 
    api.get<PaginatedResponse<CustomerAddress>>('/items/customer_addresses?filter[customer_id][_eq]=$CURRENT_USER'),
    
  addAddress: (addressData: Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at' | 'updated_at'>) => 
    api.post<ApiResponse<CustomerAddress>>('/items/customer_addresses', addressData),
    
  updateAddress: (id: number, addressData: Partial<CustomerAddress>) => 
    api.patch<ApiResponse<CustomerAddress>>(`/items/customer_addresses/${id}`, addressData),
    
  deleteAddress: (id: number) => 
    api.delete(`/items/customer_addresses/${id}`)
}

// Orders API
export const ordersApi = {
  createOrder: (orderData: CheckoutForm & { order_items: any[] }) => 
    api.post<ApiResponse<Order>>('/items/orders', orderData),
    
  getOrders: (customerId?: number) => {
    let url = '/items/orders?sort=-created_at'
    if (customerId) {
      url += `&filter[customer_id][_eq]=${customerId}`
    }
    return api.get<PaginatedResponse<Order>>(url)
  },
  
  getOrder: (id: number) => 
    api.get<ApiResponse<Order>>(`/items/orders/${id}?fields=*,order_items.*,order_items.menu_item_id.*`),
    
  getOrderByNumber: (orderNumber: string) => 
    api.get<PaginatedResponse<Order>>(`/items/orders?filter[order_number][_eq]=${orderNumber}&fields=*,order_items.*,order_items.menu_item_id.*`),
    
  updateOrderStatus: (id: number, status: string) => 
    api.patch<ApiResponse<Order>>(`/items/orders/${id}`, { status }),
    
  cancelOrder: (id: number) => 
    api.patch<ApiResponse<Order>>(`/items/orders/${id}`, { status: 'cancelled' })
}

// Restaurant settings API
export const settingsApi = {
  getSettings: () => 
    api.get<PaginatedResponse<{ key: string; value: any }>>('/items/restaurant_settings'),
    
  getSetting: (key: string) => 
    api.get<PaginatedResponse<{ key: string; value: any }>>(`/items/restaurant_settings?filter[key][_eq]=${key}`)
}

// Microservices API
export const pricingApi = {
  getDynamicPricing: (itemIds: number[]) => 
    microservicesApi.post('/pricing/dynamic', { item_ids: itemIds }),
    
  calculateOrderTotal: (orderData: any) => 
    microservicesApi.post('/pricing/calculate', orderData)
}

export const inventoryApi = {
  checkAvailability: (itemIds: number[]) => 
    microservicesApi.post('/inventory/check', { item_ids: itemIds }),
    
  getInventoryStatus: (itemId: number) => 
    microservicesApi.get(`/inventory/status/${itemId}`)
}

export const notificationApi = {
  sendOrderConfirmation: (orderData: any) => 
    microservicesApi.post('/notifications/order-confirmation', orderData),
    
  sendOrderUpdate: (orderData: any) => 
    microservicesApi.post('/notifications/order-update', orderData)
}

// Export the main API instance
export default api