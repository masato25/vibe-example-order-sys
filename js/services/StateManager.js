/**
 * 事件發射器
 * 提供事件訂閱和發布功能
 */
class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    /**
     * 訂閱事件
     * @param {string} event - 事件名稱
     * @param {Function} listener - 監聽函數
     * @returns {Function} - 取消訂閱函數
     */
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).push(listener);
        
        // 返回取消訂閱函數
        return () => this.off(event, listener);
    }

    /**
     * 一次性訂閱事件
     * @param {string} event - 事件名稱
     * @param {Function} listener - 監聽函數
     * @returns {Function} - 取消訂閱函數
     */
    once(event, listener) {
        const onceListener = (...args) => {
            this.off(event, onceListener);
            listener(...args);
        };
        
        return this.on(event, onceListener);
    }

    /**
     * 取消訂閱事件
     * @param {string} event - 事件名稱
     * @param {Function} listener - 監聽函數
     */
    off(event, listener) {
        if (!this.events.has(event)) return;
        
        const listeners = this.events.get(event);
        const index = listeners.indexOf(listener);
        
        if (index > -1) {
            listeners.splice(index, 1);
        }
        
        if (listeners.length === 0) {
            this.events.delete(event);
        }
    }

    /**
     * 發布事件
     * @param {string} event - 事件名稱
     * @param {...any} args - 事件參數
     */
    emit(event, ...args) {
        if (!this.events.has(event)) return;
        
        const listeners = [...this.events.get(event)];
        listeners.forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error(`事件處理器執行失敗 (${event}):`, error);
            }
        });
    }

    /**
     * 清除所有事件監聽器
     */
    clear() {
        this.events.clear();
    }

    /**
     * 獲取事件監聽器數量
     * @param {string} event - 事件名稱
     * @returns {number} - 監聽器數量
     */
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }
}

/**
 * 狀態管理器
 * 提供集中式狀態管理和狀態變更通知
 */
class StateManager extends EventEmitter {
    constructor(initialState = {}) {
        super();
        this.state = { ...initialState };
        this.history = [];
        this.maxHistorySize = 50;
        this.middlewares = [];
    }

    /**
     * 獲取當前狀態
     * @param {string} path - 狀態路徑（可選）
     * @returns {*} - 狀態值
     */
    getState(path = null) {
        if (path === null) {
            return { ...this.state };
        }
        
        return this.getNestedValue(this.state, path);
    }

    /**
     * 設置狀態
     * @param {string|Object} pathOrUpdates - 狀態路徑或更新對象
     * @param {*} value - 新值（當第一個參數是路徑時使用）
     */
    setState(pathOrUpdates, value = undefined) {
        const oldState = { ...this.state };
        let newState;

        if (typeof pathOrUpdates === 'string') {
            // 路徑更新
            newState = { ...this.state };
            this.setNestedValue(newState, pathOrUpdates, value);
        } else {
            // 對象更新
            newState = { ...this.state, ...pathOrUpdates };
        }

        // 執行中間件
        const action = {
            type: 'SET_STATE',
            payload: pathOrUpdates,
            timestamp: Date.now()
        };

        newState = this.applyMiddlewares(oldState, newState, action);

        // 檢查狀態是否真正改變
        if (this.isStateChanged(oldState, newState)) {
            this.state = newState;
            this.addToHistory(oldState, action);
            this.emit('stateChange', newState, oldState, action);
        }
    }

    /**
     * 更新狀態（部分更新）
     * @param {string} path - 狀態路徑
     * @param {Function} updater - 更新函數
     */
    updateState(path, updater) {
        const currentValue = this.getNestedValue(this.state, path);
        const newValue = updater(currentValue);
        this.setState(path, newValue);
    }

    /**
     * 重置狀態
     * @param {Object} newState - 新狀態
     */
    resetState(newState = {}) {
        const oldState = { ...this.state };
        const action = {
            type: 'RESET_STATE',
            payload: newState,
            timestamp: Date.now()
        };

        this.state = { ...newState };
        this.addToHistory(oldState, action);
        this.emit('stateChange', this.state, oldState, action);
    }

    /**
     * 訂閱狀態變更
     * @param {Function} listener - 監聽函數
     * @returns {Function} - 取消訂閱函數
     */
    subscribe(listener) {
        return this.on('stateChange', listener);
    }

    /**
     * 訂閱特定路徑的狀態變更
     * @param {string} path - 狀態路徑
     * @param {Function} listener - 監聽函數
     * @returns {Function} - 取消訂閱函數
     */
    subscribeToPath(path, listener) {
        const wrappedListener = (newState, oldState, action) => {
            const newValue = this.getNestedValue(newState, path);
            const oldValue = this.getNestedValue(oldState, path);
            
            if (newValue !== oldValue) {
                listener(newValue, oldValue, action);
            }
        };

        return this.on('stateChange', wrappedListener);
    }

    /**
     * 添加中間件
     * @param {Function} middleware - 中間件函數
     */
    addMiddleware(middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * 移除中間件
     * @param {Function} middleware - 中間件函數
     */
    removeMiddleware(middleware) {
        const index = this.middlewares.indexOf(middleware);
        if (index > -1) {
            this.middlewares.splice(index, 1);
        }
    }

    /**
     * 應用中間件
     * @param {Object} oldState - 舊狀態
     * @param {Object} newState - 新狀態
     * @param {Object} action - 動作
     * @returns {Object} - 處理後的新狀態
     */
    applyMiddlewares(oldState, newState, action) {
        return this.middlewares.reduce(
            (state, middleware) => middleware(oldState, state, action) || state,
            newState
        );
    }

    /**
     * 獲取嵌套值
     * @param {Object} obj - 對象
     * @param {string} path - 路徑
     * @returns {*} - 值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * 設置嵌套值
     * @param {Object} obj - 對象
     * @param {string} path - 路徑
     * @param {*} value - 值
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    /**
     * 檢查狀態是否改變
     * @param {Object} oldState - 舊狀態
     * @param {Object} newState - 新狀態
     * @returns {boolean} - 是否改變
     */
    isStateChanged(oldState, newState) {
        return JSON.stringify(oldState) !== JSON.stringify(newState);
    }

    /**
     * 添加到歷史記錄
     * @param {Object} state - 狀態
     * @param {Object} action - 動作
     */
    addToHistory(state, action) {
        this.history.unshift({ state, action, timestamp: Date.now() });
        
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(0, this.maxHistorySize);
        }
    }

    /**
     * 獲取歷史記錄
     * @returns {Array} - 歷史記錄
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * 清除歷史記錄
     */
    clearHistory() {
        this.history = [];
    }
}

/**
 * 餐廳狀態管理器
 * 專門管理餐廳應用的狀態
 */
class RestaurantStateManager extends StateManager {
    constructor() {
        super({
            // 菜單狀態
            menu: {
                items: [],
                categories: [],
                currentCategory: 'all',
                loading: false,
                error: null
            },
            
            // 購物車狀態
            cart: {
                items: [],
                total: 0,
                count: 0,
                isOpen: false
            },
            
            // 訂單狀態
            order: {
                current: null,
                history: [],
                status: null
            },
            
            // 用戶狀態
            user: {
                preferences: {},
                recentSearches: []
            },
            
            // UI狀態
            ui: {
                loading: false,
                error: null,
                modals: {
                    checkout: false,
                    success: false
                }
            }
        });

        this.storageService = null;
        this.setupMiddlewares();
    }

    /**
     * 設置存儲服務
     * @param {Object} storageService - 存儲服務實例
     */
    setStorageService(storageService) {
        this.storageService = storageService;
    }

    /**
     * 設置中間件
     */
    setupMiddlewares() {
        // 日誌中間件
        this.addMiddleware((oldState, newState, action) => {
            // 在開發環境中記錄狀態變更
            console.group(`🔄 State Change: ${action.type}`);
            console.log('Action:', action);
            console.log('Old State:', oldState);
            console.log('New State:', newState);
            console.groupEnd();
        });

        // 購物車計算中間件
        this.addMiddleware((oldState, newState, action) => {
            if (newState.cart && newState.cart.items) {
                const items = newState.cart.items;
                const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const count = items.reduce((sum, item) => sum + item.quantity, 0);
                
                newState.cart.total = total;
                newState.cart.count = count;
            }
            
            return newState;
        });
    }

    // 菜單相關方法
    setMenuItems(items) {
        this.setState('menu.items', items);
    }

    setMenuLoading(loading) {
        this.setState('menu.loading', loading);
    }

    setMenuError(error) {
        this.setState('menu.error', error);
    }

    setCurrentCategory(category) {
        this.setState('menu.currentCategory', category);
    }

    // 購物車相關方法
    addToCart(item) {
        const cartItems = this.getState('cart.items');
        const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex >= 0) {
            this.updateState('cart.items', items => {
                const newItems = [...items];
                newItems[existingItemIndex].quantity += 1;
                return newItems;
            });
        } else {
            this.updateState('cart.items', items => [
                ...items,
                { ...item, quantity: 1 }
            ]);
        }
    }

    updateCartItemQuantity(itemId, change) {
        this.updateState('cart.items', items => {
            return items.map(item => {
                if (item.id === itemId) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);
        });
    }

    removeFromCart(itemId) {
        this.updateState('cart.items', items => 
            items.filter(item => item.id !== itemId)
        );
    }

    clearCart() {
        this.setState('cart.items', []);
    }

    setCartOpen(isOpen) {
        this.setState('cart.isOpen', isOpen);
    }

    // 訂單相關方法
    setCurrentOrder(order) {
        this.setState('order.current', order);
    }

    addOrderToHistory(order) {
        this.updateState('order.history', history => [order, ...history]);
    }

    setOrderStatus(status) {
        this.setState('order.status', status);
    }

    // UI相關方法
    setLoading(loading) {
        this.setState('ui.loading', loading);
    }

    setError(error) {
        this.setState('ui.error', error);
    }

    setModalOpen(modalName, isOpen) {
        this.setState(`ui.modals.${modalName}`, isOpen);
    }

    // 用戶相關方法
    setUserPreferences(preferences) {
        this.setState('user.preferences', preferences);
    }

    addRecentSearch(searchTerm) {
        this.updateState('user.recentSearches', searches => {
            const filtered = searches.filter(term => term !== searchTerm);
            return [searchTerm, ...filtered].slice(0, 10);
        });
    }

    clearRecentSearches() {
        this.setState('user.recentSearches', []);
    }

    // 便利方法
    getMenuItems() {
        return this.getState('menu.items');
    }

    getCartItems() {
        return this.getState('cart.items');
    }

    getCartTotal() {
        return this.getState('cart.total');
    }

    getCartCount() {
        return this.getState('cart.count');
    }

    isCartOpen() {
        return this.getState('cart.isOpen');
    }

    getCurrentCategory() {
        return this.getState('menu.currentCategory');
    }
}

// 創建全域狀態管理器實例
const createStateManager = () => {
    return new RestaurantStateManager();
};

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        EventEmitter, 
        StateManager, 
        RestaurantStateManager, 
        createStateManager 
    };
} else {
    window.EventEmitter = EventEmitter;
    window.StateManager = StateManager;
    window.RestaurantStateManager = RestaurantStateManager;
    window.createStateManager = createStateManager;
}