// Restaurant domain types
export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category_id: number
  image?: string
  images?: string[]
  ingredients?: string[]
  allergens?: string[]
  nutritional_info?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sodium?: number
  }
  preparation_time?: number
  is_available: boolean
  is_featured: boolean
  is_spicy: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  image?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  menu_items?: MenuItem[]
}

export interface Customer {
  id: number
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  date_of_birth?: string
  avatar?: string
  preferences?: {
    dietary?: string[]
    spice_level?: 'mild' | 'medium' | 'hot'
    favorite_categories?: number[]
  }
  loyalty_points: number
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}

export interface CustomerAddress {
  id: number
  customer_id: number
  label: string
  street_address: string
  apartment?: string
  city: string
  state: string
  postal_code: string
  country: string
  latitude?: number
  longitude?: number
  is_default: boolean
  delivery_instructions?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id?: number
  order_id?: number
  menu_item_id: number
  menu_item_name: string
  menu_item_price: number
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
  modifications?: {
    name: string
    price: number
  }[]
  created_at?: string
}

export interface Order {
  id?: number
  order_number?: string
  customer_id?: number
  customer_email?: string
  customer_phone?: string
  customer_name?: string
  order_type: 'delivery' | 'pickup' | 'dine_in'
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  delivery_address_id?: number
  delivery_address?: CustomerAddress
  delivery_instructions?: string
  subtotal: number
  tax_amount: number
  delivery_fee: number
  tip_amount: number
  discount_amount: number
  total_amount: number
  payment_method?: 'card' | 'cash' | 'digital_wallet'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_id?: string
  estimated_delivery_time?: string
  actual_delivery_time?: string
  requested_delivery_time?: string
  special_instructions?: string
  order_items: OrderItem[]
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  menu_item: MenuItem
  quantity: number
  modifications?: {
    name: string
    price: number
  }[]
  special_instructions?: string
}

export interface Promotion {
  id: number
  code?: string
  name: string
  description?: string
  type: 'percentage' | 'fixed_amount' | 'free_item'
  value: number
  minimum_order_amount?: number
  maximum_discount_amount?: number
  usage_limit?: number
  usage_count: number
  applicable_categories?: number[]
  applicable_items?: number[]
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: number
  order_id: number
  customer_id?: number
  menu_item_id?: number
  rating: number
  comment?: string
  is_verified: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface RestaurantSettings {
  id: number
  key: string
  value: any
  description?: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    filter_count: number
    total_count: number
  }
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface CartState extends LoadingState {
  items: CartItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
}

export interface MenuState extends LoadingState {
  categories: Category[]
  menuItems: MenuItem[]
  selectedCategory?: number
  searchQuery: string
  filters: {
    vegetarian: boolean
    vegan: boolean
    glutenFree: boolean
    spicy: boolean
  }
}

export interface OrderState extends LoadingState {
  currentOrder?: Order
  orderHistory: Order[]
}

export interface UserState extends LoadingState {
  currentUser?: Customer
  addresses: CustomerAddress[]
  isAuthenticated: boolean
  token?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export interface AddressForm {
  label: string
  street_address: string
  apartment?: string
  city: string
  state: string
  postal_code: string
  delivery_instructions?: string
  is_default: boolean
}

export interface CheckoutForm {
  customer_info: {
    email: string
    phone: string
    first_name: string
    last_name: string
  }
  order_type: 'delivery' | 'pickup'
  delivery_address?: AddressForm
  payment_method: 'card' | 'cash' | 'digital_wallet'
  special_instructions?: string
  requested_delivery_time?: string
  tip_amount: number
}

// Microservices types
export interface PricingResponse {
  item_id: number
  original_price: number
  dynamic_price: number
  discount_percentage?: number
  surge_multiplier?: number
  reason: string
}

export interface InventoryStatus {
  item_id: number
  current_stock: number
  is_available: boolean
  estimated_restock?: string
}

export interface NotificationRequest {
  type: 'sms' | 'email' | 'push'
  recipient: string
  template: string
  data: Record<string, any>
}

// Utility types
export type OrderStatus = Order['status']
export type OrderType = Order['order_type']
export type PaymentMethod = Order['payment_method']
export type PaymentStatus = Order['payment_status']