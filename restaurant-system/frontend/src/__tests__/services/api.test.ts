import { describe, it, expect, vi, beforeEach } from 'vitest'
import { directusApi } from '../services/api'

// Mock fetch
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMenuItems', () => {
    it('should fetch menu items successfully', async () => {
      const mockItems = [
        { id: '1', name: 'Burger', price: 12.99 },
        { id: '2', name: 'Pizza', price: 18.50 }
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockItems })
      } as Response)

      const result = await directusApi.getMenuItems()
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/menu_items'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      
      expect(result).toEqual(mockItems)
    })

    it('should handle API errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      await expect(directusApi.getMenuItems()).rejects.toThrow('Failed to fetch menu items')
    })
  })

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [
        { id: '1', name: 'Appetizers', slug: 'appetizers' },
        { id: '2', name: 'Main Courses', slug: 'main-courses' }
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCategories })
      } as Response)

      const result = await directusApi.getCategories()
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/categories'),
        expect.objectContaining({
          method: 'GET'
        })
      )
      
      expect(result).toEqual(mockCategories)
    })
  })

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockOrder = {
        customer_id: 'cust-123',
        items: [
          { menu_item_id: '1', quantity: 2, price: 12.99 }
        ],
        total: 25.98
      }

      const mockResponse = {
        id: 'order-123',
        status: 'pending',
        ...mockOrder
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockResponse })
      } as Response)

      const result = await directusApi.createOrder(mockOrder)
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/orders'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(mockOrder)
        })
      )
      
      expect(result).toEqual(mockResponse)
    })

    it('should handle order creation errors', async () => {
      const mockOrder = {
        customer_id: 'cust-123',
        items: [],
        total: 0
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response)

      await expect(directusApi.createOrder(mockOrder)).rejects.toThrow('Failed to create order')
    })
  })

  describe('authenticateCustomer', () => {
    it('should authenticate customer successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockResponse = {
        access_token: 'jwt-token-123',
        refresh_token: 'refresh-token-456',
        expires: 3600
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockResponse })
      } as Response)

      const result = await directusApi.authenticateCustomer(credentials)
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(credentials)
        })
      )
      
      expect(result).toEqual(mockResponse)
    })
  })
})