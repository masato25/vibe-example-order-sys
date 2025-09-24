/**
 * 主應用程式文件
 * 負責初始化所有模組並協調它們的工作
 */

class RestaurantApp {
    constructor() {
        this.initialized = false;
        this.services = {};
        this.components = {};
        this.state = null;
        
        // 檢查必需的依賴
        this.checkDependencies();
    }
    
    /**
     * 檢查必需的依賴是否已載入
     */
    checkDependencies() {
        const required = [
            'ConfigManager', 'config',
            'menuData', 'categoryData', 'restaurantConfig',
            'ValidationUtils', 'FormatUtils', 'DomUtils', 'Utils',
            'RestaurantStorageService', 'RestaurantStateManager', 'RestaurantApiService',
            'MenuItemComponent', 'MenuContainerComponent', 'CartItemComponent', 'CartComponent', 'CheckoutComponent'
        ];
        
        const missing = [];
        
        for (const dep of required) {
            if (typeof window[dep] === 'undefined') {
                missing.push(dep);
            }
        }
        
        if (missing.length > 0) {
            console.warn('⚠️ 以下依賴未載入:', missing);
            return false;
        }
        
        console.log('✅ 所有依賴檢查通過');
        return true;
    }

    /**
     * 初始化應用程式
     */
    async init() {
        console.log('🔧 開始初始化應用程式...');
        
        try {
            // 顯示載入狀態
            console.log('📱 顯示載入狀態');
            this.showLoadingState();
            
            // 1. 初始化配置
            console.log('⚙️ 初始化配置');
            await this.initializeConfig();
            console.log('✅ 配置初始化完成');
            
            // 2. 初始化服務
            console.log('🛠️ 初始化服務');
            await this.initializeServices();
            console.log('✅ 服務初始化完成');
            
            // 3. 初始化組件
            console.log('🧩 初始化組件');
            await this.initializeComponents();
            console.log('✅ 組件初始化完成');
            
            // 4. 設置事件監聽
            console.log('👂 設置事件監聽');
            this.setupEventListeners();
            console.log('✅ 事件監聽設置完成');
            
            // 5. 載入初始數據
            console.log('📊 載入初始數據');
            await this.loadInitialData();
            console.log('✅ 初始數據載入完成');
            
            // 6. 渲染初始UI
            console.log('🎨 渲染初始UI');
            this.renderInitialUI();
            console.log('✅ 初始UI渲染完成');
            
            // 7. 註冊 Service Worker
            console.log('🔧 註冊 Service Worker');
            this.registerServiceWorker();
            
            // 隱藏載入狀態
            console.log('🎉 隱藏載入狀態');
            this.hideLoadingState();
            
            this.initialized = true;
            this.logInitialization();
            
            console.log('🚀 應用程式初始化完成！');
            
        } catch (error) {
            console.error('❌ 應用程式初始化失敗:', error);
            console.error('錯誤堆疊:', error.stack);
            this.showErrorState(error);
            throw error; // 重新拋出錯誤以便上層處理
        }
    }

    /**
     * 初始化配置
     */
    async initializeConfig() {
        console.log('🔍 檢查配置管理器...');
        
        if (typeof config !== 'undefined') {
            console.log('✅ 配置管理器存在，開始初始化');
            await config.initialize();
            this.config = config;
            console.log('✅ 配置管理器初始化成功');
        } else {
            console.error('❌ 配置管理器未載入');
            throw new Error('配置管理器未載入');
        }
    }

    /**
     * 初始化服務
     */
    async initializeServices() {
        // 存儲服務
        this.services.storage = new RestaurantStorageService(
            this.config.get('storage.prefix', 'restaurant_')
        );
        
        // 狀態管理
        this.services.stateManager = new RestaurantStateManager({
            enableHistory: this.config.get('debug.enabled', false),
            enableMiddleware: true
        });
        this.state = this.services.stateManager;
        
        // API 服務
        this.services.api = new RestaurantApiService({
            baseURL: this.config.get('api.baseURL'),
            timeout: this.config.get('api.timeout'),
            mockMode: this.config.get('api.mockMode', false)
        });
        
        // 設置服務間的依賴關係
        this.services.api.setStorageService(this.services.storage);
        this.services.stateManager.setStorageService(this.services.storage);
    }

    /**
     * 初始化組件
     */
    async initializeComponents() {
        // 菜單組件
        this.components.menu = new MenuContainerComponent({
            containerId: 'menuGrid',
            apiService: this.services.api,
            stateManager: this.services.stateManager
        });
        
        // 購物車組件
        this.components.cart = new CartComponent({
            sidebarId: 'cartSidebar',
            overlayId: 'cartOverlay',
            itemsContainerId: 'cartItems',
            stateManager: this.services.stateManager,
            storageService: this.services.storage
        });
        
        // 結帳組件
        this.components.checkout = new CheckoutComponent({
            modalId: 'checkout-modal',
            stateManager: this.services.stateManager,
            apiService: this.services.api
        });
        
        // 初始化所有組件
        for (const component of Object.values(this.components)) {
            if (component.init) {
                await component.init();
            }
        }
    }

    /**
     * 設置事件監聽
     */
    setupEventListeners() {
        // 全域狀態變更監聽
        this.state.on('cart:updated', (cart) => {
            this.updateCartUI(cart);
        });
        
        this.state.on('menu:loaded', (menu) => {
            this.updateMenuUI(menu);
        });
        
        this.state.on('order:placed', (order) => {
            this.handleOrderPlaced(order);
        });
        
        // 購物車相關事件
        this.state.on('cart:item-added', (item) => {
            this.showNotification(`已添加 ${item.name} 到購物車`, 'success');
            this.updateCartBadge();
        });
        
        this.state.on('cart:item-removed', (item) => {
            this.showNotification(`已從購物車移除 ${item.name}`, 'info');
            this.updateCartBadge();
        });
        
        // 錯誤處理
        this.state.on('error', (error) => {
            this.handleError(error);
        });
        
        // 網路狀態監聽
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });
        
        // 頁面可見性變更
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            }
        });
        
        // 購物車切換
        const cartToggle = document.getElementById('cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => {
                this.toggleCart();
            });
        }
        
        // 類別篩選
        const categoryButtons = document.querySelectorAll('.category-tab');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });
        
        // 加入購物車事件
        document.addEventListener('menuAddToCart', (e) => {
            this.addToCart(e.detail.item);
        });
    }

    /**
     * 載入初始數據
     */
    async loadInitialData() {
        try {
            // 載入菜單數據
            const menuItems = await this.services.api.getMenuItems();
            this.state.setState('menu.items', menuItems);
            // 將數據傳遞給MenuComponent
            if (this.components.menu) {
                this.components.menu.setItems(menuItems);
            }
            
            // 載入分類數據
            const categories = await this.services.api.getCategories();
            this.state.setState('menu.categories', categories);
            
            // 載入購物車數據
            const savedCart = this.services.storage.getItem('cart');
            if (savedCart) {
                this.state.setState('cart', savedCart);
            }
            
            // 載入用戶偏好設置
            const preferences = this.services.storage.getItem('preferences');
            if (preferences) {
                this.state.setState('user.preferences', preferences);
            }
            
        } catch (error) {
            console.error('載入初始數據失敗:', error);
            // 使用預設數據
            this.loadDefaultData();
        }
    }

    /**
     * 載入預設數據
     */
    loadDefaultData() {
        if (typeof menuData !== 'undefined') {
            this.state.setState('menu.items', menuData);
            // 將數據傳遞給MenuComponent
            if (this.components.menu) {
                this.components.menu.setItems(menuData);
            }
        }
        
        if (typeof categoryData !== 'undefined') {
            this.state.setState('menu.categories', categoryData);
        }
        
        // 初始化空購物車
        this.state.setState('cart', {
            items: [],
            total: 0,
            itemCount: 0
        });
    }

    /**
     * 渲染初始UI
     */
    renderInitialUI() {
        // 渲染菜單
        if (this.components.menu) {
            this.components.menu.render();
        }
        
        // 渲染購物車
        if (this.components.cart) {
            this.components.cart.render();
        }
        
        // 更新購物車徽章
        this.updateCartBadge();
        
        // 設置主題
        this.applyTheme(this.config.get('ui.theme', 'light'));
    }

    /**
     * 更新購物車UI
     */
    updateCartUI(cart) {
        if (this.components.cart) {
            this.components.cart.setItems(cart.items || []);
        }
        this.updateCartBadge();
        
        // 保存到本地存儲
        this.services.storage.setItem('cart', cart);
    }

    /**
     * 更新菜單UI
     */
    updateMenuUI(menu) {
        if (this.components.menu) {
            this.components.menu.updateMenu(menu);
        }
    }

    /**
     * 更新購物車徽章
     */
    updateCartBadge() {
        const cart = this.state.getState('cart');
        const badge = document.getElementById('cart-badge');
        
        if (badge && cart) {
            const itemCount = cart.itemCount || 0;
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'block' : 'none';
        }
    }

    /**
     * 切換購物車顯示
     */
    toggleCart() {
        if (this.components.cart) {
            this.components.cart.toggle();
        }
    }

    /**
     * 按分類篩選
     */
    filterByCategory(category) {
        this.state.setState('menu.activeCategory', category);
        
        // 更新類別按鈕狀態
        document.querySelectorAll('.category-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // 篩選菜單項目
        if (this.components.menu) {
            this.components.menu.setCategory(category);
        }
    }

    /**
     * 添加商品到購物車
     */
    addToCart(item) {
        const cart = this.state.getState('cart') || { items: [], total: 0, itemCount: 0 };
        
        // 檢查商品是否已存在
        const existingItemIndex = cart.items.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex >= 0) {
            // 增加數量
            cart.items[existingItemIndex].quantity += 1;
        } else {
            // 添加新商品
            cart.items.push({
                ...item,
                quantity: 1
            });
        }
        
        // 更新購物車總計
        cart.total = cart.items.reduce((total, cartItem) => 
            total + (cartItem.price * cartItem.quantity), 0
        );
        cart.itemCount = cart.items.reduce((count, cartItem) => 
            count + cartItem.quantity, 0
        );
        
        // 更新狀態
        this.state.setState('cart', cart);
        
        // 保存到本地存儲
        this.services.storage.setItem('cart', cart);
        
        // 觸發事件
        this.state.emit('cart:item-added', item);
        this.state.emit('cart:updated', cart);
    }

    /**
     * 處理訂單提交
     */
    handleOrderPlaced(order) {
        this.showNotification('訂單提交成功！', 'success');
        
        // 清空購物車
        this.state.setState('cart', {
            items: [],
            total: 0,
            itemCount: 0
        });
        
        // 保存訂單歷史
        const orderHistory = this.services.storage.getItem('orderHistory') || [];
        orderHistory.unshift(order);
        this.services.storage.setItem('orderHistory', orderHistory.slice(0, 10)); // 只保留最近10筆
    }

    /**
     * 處理錯誤
     */
    handleError(error) {
        console.error('應用程式錯誤:', error);
        this.showNotification(error.message || '發生未知錯誤', 'error');
    }

    /**
     * 處理網路狀態變更
     */
    handleOnlineStatus(isOnline) {
        const statusEl = document.getElementById('network-status');
        
        if (isOnline) {
            this.showNotification('網路連線已恢復', 'success');
            if (statusEl) statusEl.style.display = 'none';
        } else {
            this.showNotification('網路連線中斷，已切換至離線模式', 'warning');
            if (statusEl) {
                statusEl.style.display = 'block';
                statusEl.textContent = '離線模式';
            }
        }
    }

    /**
     * 處理頁面變為可見
     */
    handlePageVisible() {
        // 重新檢查網路狀態
        if (navigator.onLine) {
            // 同步本地數據
            this.syncLocalData();
        }
    }

    /**
     * 同步本地數據
     */
    async syncLocalData() {
        // 實作數據同步邏輯
        if (this.config.get('debug.enabled')) {
            console.log('正在同步本地數據...');
        }
    }

    /**
     * 顯示通知
     */
    showNotification(message, type = 'info') {
        if (!this.config.get('ui.notifications', true)) {
            return;
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // 自動關閉
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // 手動關閉
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * 應用主題
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.services.storage.setItem('theme', theme);
    }

    /**
     * 註冊 Service Worker
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator && this.config.get('features.offlineMode')) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker 註冊成功:', registration);
                })
                .catch(error => {
                    console.log('Service Worker 註冊失敗:', error);
                });
        }
    }

    /**
     * 顯示載入狀態
     */
    showLoadingState() {
        const loadingEl = document.getElementById('loading-screen');
        if (loadingEl) {
            loadingEl.style.display = 'flex';
        }
    }

    /**
     * 隱藏載入狀態
     */
    hideLoadingState() {
        const loadingEl = document.getElementById('loading-screen');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    /**
     * 顯示錯誤狀態
     */
    showErrorState(error) {
        const errorEl = document.getElementById('error-screen');
        if (errorEl) {
            errorEl.style.display = 'flex';
            errorEl.querySelector('.error-message').textContent = error.message;
        }
    }

    /**
     * 記錄初始化資訊
     */
    logInitialization() {
        if (this.config.get('debug.enabled')) {
            console.group('🍽️ Restaurant App Initialized');
            console.log('Version:', '1.0.0');
            console.log('Environment:', this.config.getEnvironment());
            console.log('Services:', Object.keys(this.services));
            console.log('Components:', Object.keys(this.components));
            console.log('Feature Flags:', this.config.isFeatureEnabled);
            console.groupEnd();
        }
    }

    /**
     * 獲取應用程式狀態
     */
    getAppState() {
        return {
            initialized: this.initialized,
            services: Object.keys(this.services),
            components: Object.keys(this.components),
            state: this.state ? this.state.getState() : null
        };
    }
}

// 創建全域應用程式實例
const app = new RestaurantApp();

// DOM 載入完成後初始化應用程式
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOM 載入完成，開始初始化應用程式');
    
    try {
        await app.init();
        console.log('✅ 應用程式初始化成功');
    } catch (error) {
        console.error('❌ 應用程式初始化失敗:', error);
        
        // 顯示錯誤畫面
        const loadingScreen = document.getElementById('loading-screen');
        const errorScreen = document.getElementById('error-screen');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (errorScreen) {
            errorScreen.style.display = 'flex';
            const errorMessage = errorScreen.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = error.message || '應用程式初始化失敗';
            }
        }
    }
});

// 將應用程式實例掛載到全域
window.restaurantApp = app;

// 全域函數供HTML onclick使用
function toggleCart() {
    if (window.restaurantApp) {
        window.restaurantApp.toggleCart();
    }
}