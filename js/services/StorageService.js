/**
 * 本地存儲服務
 * 提供統一的本地數據存儲接口
 */
class StorageService {
    constructor(config = {}) {
        this.prefix = config.prefix || 'restaurant_';
        this.version = config.version || '1.0';
        this.compressionEnabled = config.compression || false;
        
        // 檢查存儲可用性
        this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
        this.isSessionStorageAvailable = this.checkSessionStorageAvailability();
        
        // Fallback存儲
        this.memoryStorage = new Map();
    }

    /**
     * 檢查localStorage可用性
     * @returns {boolean} - 是否可用
     */
    checkLocalStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 檢查sessionStorage可用性
     * @returns {boolean} - 是否可用
     */
    checkSessionStorageAvailability() {
        try {
            const test = '__session_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 生成存儲鍵值
     * @param {string} key - 原始鍵值
     * @returns {string} - 帶前綴的鍵值
     */
    generateKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * 序列化數據
     * @param {*} data - 要序列化的數據
     * @returns {string} - 序列化後的字符串
     */
    serialize(data) {
        try {
            const serialized = JSON.stringify({
                data,
                timestamp: Date.now(),
                version: this.version
            });
            
            // 如果啟用壓縮，可以在這裡添加壓縮邏輯
            return serialized;
        } catch (error) {
            console.error('數據序列化失敗:', error);
            throw new Error('數據序列化失敗');
        }
    }

    /**
     * 反序列化數據
     * @param {string} serializedData - 序列化的數據
     * @returns {*} - 反序列化後的數據
     */
    deserialize(serializedData) {
        try {
            const parsed = JSON.parse(serializedData);
            
            // 版本檢查
            if (parsed.version !== this.version) {
                console.warn('數據版本不匹配，可能需要遷移');
            }
            
            return parsed.data;
        } catch (error) {
            console.error('數據反序列化失敗:', error);
            return null;
        }
    }

    /**
     * 存儲到localStorage
     * @param {string} key - 鍵值
     * @param {*} data - 數據
     * @param {Object} options - 選項
     */
    setLocal(key, data, options = {}) {
        const fullKey = this.generateKey(key);
        
        try {
            if (this.isLocalStorageAvailable) {
                const serializedData = this.serialize(data);
                localStorage.setItem(fullKey, serializedData);
            } else {
                // Fallback到內存存儲
                this.memoryStorage.set(fullKey, data);
            }
        } catch (error) {
            console.error('localStorage存儲失敗:', error);
            // 如果localStorage滿了，嘗試清理舊數據
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData();
                // 重試
                try {
                    const serializedData = this.serialize(data);
                    localStorage.setItem(fullKey, serializedData);
                } catch (retryError) {
                    console.error('重試存儲仍然失敗:', retryError);
                }
            }
        }
    }

    /**
     * 設置項目（setLocal的別名）
     * @param {string} key - 鍵值
     * @param {*} data - 要存儲的數據
     * @param {Object} options - 選項
     */
    setItem(key, data, options = {}) {
        return this.setLocal(key, data, options);
    }

    /**
     * 從localStorage讀取
     * @param {string} key - 鍵值
     * @param {*} defaultValue - 默認值
     * @returns {*} - 讀取的數據
     */
    getLocal(key, defaultValue = null) {
        const fullKey = this.generateKey(key);
        
        try {
            if (this.isLocalStorageAvailable) {
                const serializedData = localStorage.getItem(fullKey);
                if (serializedData === null) return defaultValue;
                
                const data = this.deserialize(serializedData);
                return data !== null ? data : defaultValue;
            } else {
                // Fallback到內存存儲
                return this.memoryStorage.get(fullKey) || defaultValue;
            }
        } catch (error) {
            console.error('localStorage讀取失敗:', error);
            return defaultValue;
        }
    }

    /**
     * 獲取項目（getLocal的別名）
     * @param {string} key - 鍵值
     * @param {*} defaultValue - 默認值
     * @returns {*} - 讀取的數據
     */
    getItem(key, defaultValue = null) {
        return this.getLocal(key, defaultValue);
    }

    /**
     * 從localStorage刪除
     * @param {string} key - 鍵值
     */
    removeLocal(key) {
        const fullKey = this.generateKey(key);
        
        try {
            if (this.isLocalStorageAvailable) {
                localStorage.removeItem(fullKey);
            } else {
                this.memoryStorage.delete(fullKey);
            }
        } catch (error) {
            console.error('localStorage刪除失敗:', error);
        }
    }

    /**
     * 移除項目（removeLocal的別名）
     * @param {string} key - 鍵值
     */
    removeItem(key) {
        return this.removeLocal(key);
    }

    /**
     * 存儲到sessionStorage
     * @param {string} key - 鍵值
     * @param {*} data - 數據
     */
    setSession(key, data) {
        const fullKey = this.generateKey(key);
        
        try {
            if (this.isSessionStorageAvailable) {
                const serializedData = this.serialize(data);
                sessionStorage.setItem(fullKey, serializedData);
            } else {
                this.memoryStorage.set(`session_${fullKey}`, data);
            }
        } catch (error) {
            console.error('sessionStorage存儲失敗:', error);
        }
    }

    /**
     * 從sessionStorage讀取
     * @param {string} key - 鍵值
     * @param {*} defaultValue - 默認值
     * @returns {*} - 讀取的數據
     */
    getSession(key, defaultValue = null) {
        const fullKey = this.generateKey(key);
        
        try {
            if (this.isSessionStorageAvailable) {
                const serializedData = sessionStorage.getItem(fullKey);
                if (serializedData === null) return defaultValue;
                
                const data = this.deserialize(serializedData);
                return data !== null ? data : defaultValue;
            } else {
                return this.memoryStorage.get(`session_${fullKey}`) || defaultValue;
            }
        } catch (error) {
            console.error('sessionStorage讀取失敗:', error);
            return defaultValue;
        }
    }

    /**
     * 清理過期數據
     */
    cleanupOldData() {
        if (!this.isLocalStorageAvailable) return;
        
        const now = Date.now();
        const keys = [];
        
        // 收集所有相關鍵值
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key);
            }
        }
        
        // 檢查並刪除過期數據
        keys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    // 如果數據超過7天，則刪除
                    if (now - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
                        localStorage.removeItem(key);
                    }
                }
            } catch (error) {
                // 如果解析失敗，直接刪除
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * 清理所有數據
     */
    clear() {
        if (this.isLocalStorageAvailable) {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key);
                }
            }
            keys.forEach(key => localStorage.removeItem(key));
        }
        
        if (this.isSessionStorageAvailable) {
            const keys = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key);
                }
            }
            keys.forEach(key => sessionStorage.removeItem(key));
        }
        
        // 清理內存存儲
        this.memoryStorage.clear();
    }

    /**
     * 獲取存儲使用情況
     * @returns {Object} - 存儲使用情況
     */
    getStorageInfo() {
        const info = {
            localStorage: {
                available: this.isLocalStorageAvailable,
                used: 0,
                keys: 0
            },
            sessionStorage: {
                available: this.isSessionStorageAvailable,
                used: 0,
                keys: 0
            },
            memoryStorage: {
                keys: this.memoryStorage.size
            }
        };

        if (this.isLocalStorageAvailable) {
            let localUsed = 0;
            let localKeys = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    localKeys++;
                    localUsed += key.length + (localStorage.getItem(key) || '').length;
                }
            }
            
            info.localStorage.used = localUsed;
            info.localStorage.keys = localKeys;
        }

        if (this.isSessionStorageAvailable) {
            let sessionUsed = 0;
            let sessionKeys = 0;
            
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    sessionKeys++;
                    sessionUsed += key.length + (sessionStorage.getItem(key) || '').length;
                }
            }
            
            info.sessionStorage.used = sessionUsed;
            info.sessionStorage.keys = sessionKeys;
        }

        return info;
    }
}

/**
 * 餐廳存儲服務
 * 專門處理餐廳應用的數據存儲
 */
class RestaurantStorageService extends StorageService {
    constructor(config = {}) {
        super({ ...config, prefix: 'restaurant_' });
    }

    /**
     * 保存購物車
     * @param {Array} cartItems - 購物車項目
     */
    saveCart(cartItems) {
        this.setLocal('cart', cartItems);
    }

    /**
     * 獲取購物車
     * @returns {Array} - 購物車項目
     */
    getCart() {
        return this.getLocal('cart', []);
    }

    /**
     * 清空購物車
     */
    clearCart() {
        this.removeLocal('cart');
    }

    /**
     * 保存用戶偏好
     * @param {Object} preferences - 用戶偏好
     */
    saveUserPreferences(preferences) {
        this.setLocal('userPreferences', preferences);
    }

    /**
     * 獲取用戶偏好
     * @returns {Object} - 用戶偏好
     */
    getUserPreferences() {
        return this.getLocal('userPreferences', {
            language: 'zh-TW',
            theme: 'light',
            notifications: true
        });
    }

    /**
     * 保存訂單歷史
     * @param {Object} order - 訂單數據
     */
    saveOrderHistory(order) {
        const history = this.getOrderHistory();
        history.unshift(order);
        
        // 只保留最近20筆訂單
        const limitedHistory = history.slice(0, 20);
        this.setLocal('orderHistory', limitedHistory);
    }

    /**
     * 獲取訂單歷史
     * @returns {Array} - 訂單歷史
     */
    getOrderHistory() {
        return this.getLocal('orderHistory', []);
    }

    /**
     * 保存最近搜尋
     * @param {string} searchTerm - 搜尋詞
     */
    saveRecentSearch(searchTerm) {
        if (!searchTerm.trim()) return;
        
        const recentSearches = this.getRecentSearches();
        
        // 移除重複項
        const filtered = recentSearches.filter(term => term !== searchTerm);
        filtered.unshift(searchTerm);
        
        // 只保留最近10次搜尋
        const limited = filtered.slice(0, 10);
        this.setLocal('recentSearches', limited);
    }

    /**
     * 獲取最近搜尋
     * @returns {Array} - 最近搜尋列表
     */
    getRecentSearches() {
        return this.getLocal('recentSearches', []);
    }

    /**
     * 清除最近搜尋
     */
    clearRecentSearches() {
        this.removeLocal('recentSearches');
    }

    /**
     * 保存應用狀態
     * @param {Object} state - 應用狀態
     */
    saveAppState(state) {
        this.setSession('appState', state);
    }

    /**
     * 獲取應用狀態
     * @returns {Object} - 應用狀態
     */
    getAppState() {
        return this.getSession('appState', {});
    }
}

// 創建全域存儲服務實例
const createStorageService = (config = {}) => {
    return new RestaurantStorageService(config);
};

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        StorageService, 
        RestaurantStorageService, 
        createStorageService 
    };
} else {
    window.StorageService = StorageService;
    window.RestaurantStorageService = RestaurantStorageService;
    window.createStorageService = createStorageService;
}