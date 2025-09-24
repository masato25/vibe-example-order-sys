/**
 * API 服務
 * 處理所有與後端API的通信
 */
class ApiService {
    constructor(config = {}) {
        this.baseURL = config.baseURL || '/api';
        this.timeout = config.timeout || 10000;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...config.headers
        };
    }

    /**
     * 通用HTTP請求方法
     * @param {string} url - 請求URL
     * @param {Object} options - 請求選項
     * @returns {Promise} - 請求Promise
     */
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const config = {
                headers: { ...this.defaultHeaders, ...options.headers },
                signal: controller.signal,
                ...options
            };

            const response = await fetch(`${this.baseURL}${url}`, config);
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new ApiError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    await response.text()
                );
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new ApiError('請求超時', 408);
            }
            
            throw error;
        }
    }

    /**
     * GET 請求
     * @param {string} url - 請求URL
     * @param {Object} params - 查詢參數
     * @returns {Promise} - 請求Promise
     */
    async get(url, params = {}) {
        const searchParams = new URLSearchParams(params);
        const queryString = searchParams.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        return this.request(fullUrl, { method: 'GET' });
    }

    /**
     * POST 請求
     * @param {string} url - 請求URL
     * @param {Object} data - 請求數據
     * @returns {Promise} - 請求Promise
     */
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 請求
     * @param {string} url - 請求URL
     * @param {Object} data - 請求數據
     * @returns {Promise} - 請求Promise
     */
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 請求
     * @param {string} url - 請求URL
     * @returns {Promise} - 請求Promise
     */
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }

    /**
     * 上傳文件
     * @param {string} url - 上傳URL
     * @param {FormData} formData - 表單數據
     * @returns {Promise} - 請求Promise
     */
    async upload(url, formData) {
        const headers = { ...this.defaultHeaders };
        delete headers['Content-Type']; // 讓瀏覽器自動設置

        return this.request(url, {
            method: 'POST',
            body: formData,
            headers
        });
    }

    /**
     * 設置認證token
     * @param {string} token - 認證token
     */
    setAuthToken(token) {
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }

    /**
     * 設置基礎URL
     * @param {string} baseURL - 基礎URL
     */
    setBaseURL(baseURL) {
        this.baseURL = baseURL;
    }
}

/**
 * 餐廳API服務
 * 專門處理餐廳相關的API調用
 */
class RestaurantApiService extends ApiService {
    constructor(config = {}) {
        super(config);
        this.storageService = null;
    }

    /**
     * 設置存儲服務
     * @param {Object} storageService - 存儲服務實例
     */
    setStorageService(storageService) {
        this.storageService = storageService;
    }

    /**
     * 獲取菜單項目
     * @param {Object} filters - 篩選條件
     * @returns {Promise<Array>} - 菜單項目數組
     */
    async getMenuItems(filters = {}) {
        try {
            const response = await this.get('/menu/items', filters);
            return response.data || response;
        } catch (error) {
            console.warn('API獲取菜單失敗，使用本地數據:', error);
            // 回退到本地數據
            return this.getMockMenuItems(filters);
        }
    }

    /**
     * 獲取單個菜單項目
     * @param {number} itemId - 項目ID
     * @returns {Promise<Object>} - 菜單項目
     */
    async getMenuItem(itemId) {
        try {
            const response = await this.get(`/menu/items/${itemId}`);
            return response.data || response;
        } catch (error) {
            console.warn('API獲取菜單項目失敗:', error);
            throw error;
        }
    }

    /**
     * 獲取分類列表
     * @returns {Promise<Array>} - 分類數組
     */
    async getCategories() {
        try {
            const response = await this.get('/menu/categories');
            return response.data || response;
        } catch (error) {
            console.warn('API獲取分類失敗，使用本地數據:', error);
            return this.getMockCategories();
        }
    }

    /**
     * 提交訂單
     * @param {Object} orderData - 訂單數據
     * @returns {Promise<Object>} - 訂單結果
     */
    async submitOrder(orderData) {
        try {
            const response = await this.post('/orders', orderData);
            return response.data || response;
        } catch (error) {
            console.error('提交訂單失敗:', error);
            // 在沒有後端時，可以模擬成功
            return this.simulateOrderSubmission(orderData);
        }
    }

    /**
     * 獲取訂單狀態
     * @param {string} orderId - 訂單ID
     * @returns {Promise<Object>} - 訂單狀態
     */
    async getOrderStatus(orderId) {
        try {
            const response = await this.get(`/orders/${orderId}/status`);
            return response.data || response;
        } catch (error) {
            console.error('獲取訂單狀態失敗:', error);
            throw error;
        }
    }

    /**
     * 模擬菜單數據（後端不可用時使用）
     * @param {Object} filters - 篩選條件
     * @returns {Array} - 模擬菜單數據
     */
    getMockMenuItems(filters = {}) {
        const mockData = [
            {
                id: 1,
                name: '蒜蓉白肉',
                description: '新鮮蒜蓉搭配嫩滑白肉，清香開胃',
                price: 180,
                category: 'appetizer',
                image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
                badge: '招牌',
                available: true
            },
            // ... 其他菜單項目
        ];

        // 應用篩選條件
        let filteredData = mockData;
        
        if (filters.category && filters.category !== 'all') {
            filteredData = filteredData.filter(item => item.category === filters.category);
        }
        
        if (filters.available !== undefined) {
            filteredData = filteredData.filter(item => item.available === filters.available);
        }

        return filteredData;
    }

    /**
     * 模擬分類數據
     * @returns {Array} - 模擬分類數據
     */
    getMockCategories() {
        return [
            { id: 'all', name: '全部', icon: 'fas fa-utensils' },
            { id: 'appetizer', name: '開胃菜', icon: 'fas fa-leaf' },
            { id: 'main', name: '主餐', icon: 'fas fa-drumstick-bite' },
            { id: 'dessert', name: '甜點', icon: 'fas fa-ice-cream' },
            { id: 'drink', name: '飲品', icon: 'fas fa-coffee' }
        ];
    }

    /**
     * 模擬訂單提交
     * @param {Object} orderData - 訂單數據
     * @returns {Promise<Object>} - 模擬訂單結果
     */
    async simulateOrderSubmission(orderData) {
        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 模擬成功響應
        return {
            success: true,
            orderId: `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`,
            status: 'pending',
            estimatedTime: 30,
            message: '訂單已成功提交'
        };
    }
}

/**
 * API錯誤類
 */
class ApiError extends Error {
    constructor(message, status = 0, response = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
    }
}

// 創建全域API服務實例
const createApiService = (config = {}) => {
    return new RestaurantApiService(config);
};

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ApiService, 
        RestaurantApiService, 
        ApiError, 
        createApiService 
    };
} else {
    window.ApiService = ApiService;
    window.RestaurantApiService = RestaurantApiService;
    window.ApiError = ApiError;
    window.createApiService = createApiService;
}