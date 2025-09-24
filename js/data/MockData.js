/**
 * 菜單數據
 * 提供模擬的菜單項目數據
 */
const menuData = [
    {
        id: 1,
        name: '蒜蓉白肉',
        description: '新鮮蒜蓉搭配嫩滑白肉，清香開胃',
        price: 180,
        category: 'appetizer',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        badge: '招牌',
        available: true,
        nutrition: {
            calories: 210,
            protein: 18,
            carbs: 8,
            fat: 12
        },
        ingredients: ['豬肉', '蒜蓉', '醬油', '香油'],
        allergens: ['大豆'],
        spicyLevel: 0,
        preparationTime: 15
    },
    {
        id: 2,
        name: '涼拌海帶絲',
        description: '爽脆海帶絲，酸甜開胃，夏日首選',
        price: 120,
        category: 'appetizer',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        badge: '清爽',
        available: true,
        nutrition: {
            calories: 45,
            protein: 2,
            carbs: 10,
            fat: 0.5
        },
        ingredients: ['海帶絲', '醋', '糖', '香油'],
        allergens: [],
        spicyLevel: 0,
        preparationTime: 10
    },
    {
        id: 3,
        name: '宮保雞丁',
        description: '經典川菜，雞肉嫩滑，花生香脆',
        price: 280,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
        badge: '經典',
        available: true,
        nutrition: {
            calories: 320,
            protein: 25,
            carbs: 15,
            fat: 18
        },
        ingredients: ['雞肉', '花生', '乾辣椒', '花椒'],
        allergens: ['花生'],
        spicyLevel: 2,
        preparationTime: 20
    },
    {
        id: 4,
        name: '麻婆豆腐',
        description: '四川麻婆豆腐，麻辣鮮香，下飯神器',
        price: 220,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop',
        badge: '辣味',
        available: true,
        nutrition: {
            calories: 180,
            protein: 12,
            carbs: 8,
            fat: 12
        },
        ingredients: ['豆腐', '豬絞肉', '豆瓣醬', '花椒'],
        allergens: ['大豆'],
        spicyLevel: 3,
        preparationTime: 15
    },
    {
        id: 5,
        name: '糖醋排骨',
        description: '酸甜可口，肉質鮮嫩，老少皆宜',
        price: 320,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
        badge: '人氣',
        available: true,
        nutrition: {
            calories: 420,
            protein: 22,
            carbs: 25,
            fat: 28
        },
        ingredients: ['豬排骨', '醋', '糖', '醬油'],
        allergens: ['大豆'],
        spicyLevel: 0,
        preparationTime: 35
    },
    {
        id: 6,
        name: '清蒸鱸魚',
        description: '新鮮鱸魚清蒸，保持原味，營養豐富',
        price: 380,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
        badge: '健康',
        available: true,
        nutrition: {
            calories: 150,
            protein: 28,
            carbs: 2,
            fat: 4
        },
        ingredients: ['鱸魚', '薑絲', '蔥絲', '醬油'],
        allergens: ['魚類', '大豆'],
        spicyLevel: 0,
        preparationTime: 25
    },
    {
        id: 7,
        name: '紅豆湯圓',
        description: '軟糯湯圓配香甜紅豆，傳統甜品',
        price: 80,
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        badge: '傳統',
        available: true,
        nutrition: {
            calories: 180,
            protein: 4,
            carbs: 38,
            fat: 2
        },
        ingredients: ['湯圓', '紅豆', '糖', '水'],
        allergens: ['麩質'],
        spicyLevel: 0,
        preparationTime: 15
    },
    {
        id: 8,
        name: '芒果布丁',
        description: '香濃芒果配滑嫩布丁，熱帶風味',
        price: 100,
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1488477181946-6af4a93c8ba5?w=400&h=300&fit=crop',
        badge: '季節',
        available: true,
        nutrition: {
            calories: 120,
            protein: 3,
            carbs: 28,
            fat: 1
        },
        ingredients: ['芒果', '牛奶', '吉利丁', '糖'],
        allergens: ['乳製品'],
        spicyLevel: 0,
        preparationTime: 10
    },
    {
        id: 9,
        name: '珍珠奶茶',
        description: '經典台式珍珠奶茶，Q彈珍珠配香濃奶茶',
        price: 60,
        category: 'drink',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        badge: '經典',
        available: true,
        nutrition: {
            calories: 280,
            protein: 2,
            carbs: 58,
            fat: 6
        },
        ingredients: ['珍珠', '奶茶', '糖', '奶精'],
        allergens: ['乳製品'],
        spicyLevel: 0,
        preparationTime: 5,
        customizations: {
            sweetness: ['無糖', '微糖', '半糖', '少糖', '正常'],
            ice: ['去冰', '微冰', '少冰', '正常冰']
        }
    },
    {
        id: 10,
        name: '檸檬蜂蜜茶',
        description: '清香檸檬配天然蜂蜜，生津止渴',
        price: 70,
        category: 'drink',
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
        badge: '清香',
        available: true,
        nutrition: {
            calories: 90,
            protein: 0,
            carbs: 24,
            fat: 0
        },
        ingredients: ['檸檬', '蜂蜜', '水'],
        allergens: [],
        spicyLevel: 0,
        preparationTime: 3,
        customizations: {
            sweetness: ['無糖', '微甜', '正常'],
            ice: ['去冰', '微冰', '少冰', '正常冰']
        }
    },
    {
        id: 11,
        name: '鮮榨柳橙汁',
        description: '100%新鮮柳橙榨汁，維生素C豐富',
        price: 90,
        category: 'drink',
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
        badge: '新鮮',
        available: true,
        nutrition: {
            calories: 110,
            protein: 2,
            carbs: 26,
            fat: 0
        },
        ingredients: ['新鮮柳橙'],
        allergens: [],
        spicyLevel: 0,
        preparationTime: 5
    },
    {
        id: 12,
        name: '回鍋肉',
        description: '四川經典菜色，豬肉香嫩，配菜爽脆',
        price: 260,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
        badge: '下飯',
        available: true,
        nutrition: {
            calories: 380,
            protein: 20,
            carbs: 12,
            fat: 28
        },
        ingredients: ['豬肉', '高麗菜', '豆瓣醬', '青椒'],
        allergens: ['大豆'],
        spicyLevel: 2,
        preparationTime: 18
    }
];

/**
 * 分類數據
 */
const categoryData = [
    {
        id: 'all',
        name: '全部',
        icon: 'fas fa-utensils',
        description: '所有菜品'
    },
    {
        id: 'appetizer',
        name: '開胃菜',
        icon: 'fas fa-leaf',
        description: '精選開胃小菜'
    },
    {
        id: 'main',
        name: '主餐',
        icon: 'fas fa-drumstick-bite',
        description: '招牌主菜'
    },
    {
        id: 'dessert',
        name: '甜點',
        icon: 'fas fa-ice-cream',
        description: '美味甜品'
    },
    {
        id: 'drink',
        name: '飲品',
        icon: 'fas fa-coffee',
        description: '清爽飲料'
    }
];

/**
 * 餐廳配置
 */
const restaurantConfig = {
    name: '美食點餐',
    description: '現代化響應式點餐應用程式',
    contact: {
        phone: '02-1234-5678',
        email: 'info@restaurant.com',
        address: '台北市中山區美食街123號'
    },
    businessHours: {
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '22:00' }
    },
    orderSettings: {
        minOrderAmount: 200,
        deliveryFee: 50,
        freeDeliveryThreshold: 800,
        maxDeliveryDistance: 5,
        estimatedDeliveryTime: 30,
        allowPreOrder: true,
        maxPreOrderDays: 7
    },
    paymentMethods: [
        { id: 'cash', name: '現金付款', icon: 'fas fa-money-bill' },
        { id: 'card', name: '信用卡', icon: 'fas fa-credit-card' },
        { id: 'linepay', name: 'LINE Pay', icon: 'fab fa-line' },
        { id: 'applepay', name: 'Apple Pay', icon: 'fab fa-apple-pay' }
    ],
    features: {
        enableReservation: true,
        enableDelivery: true,
        enableTakeout: true,
        enableReviews: true,
        enableLoyaltyProgram: false,
        enableNotifications: true
    }
};

/**
 * API端點配置
 */
const apiEndpoints = {
    // 菜單相關
    menu: {
        items: '/api/menu/items',
        item: '/api/menu/items/:id',
        categories: '/api/menu/categories',
        search: '/api/menu/search'
    },
    
    // 訂單相關
    orders: {
        create: '/api/orders',
        get: '/api/orders/:id',
        list: '/api/orders',
        status: '/api/orders/:id/status',
        cancel: '/api/orders/:id/cancel'
    },
    
    // 用戶相關
    user: {
        profile: '/api/user/profile',
        preferences: '/api/user/preferences',
        orders: '/api/user/orders',
        favorites: '/api/user/favorites'
    },
    
    // 其他
    restaurants: '/api/restaurants',
    reviews: '/api/reviews',
    notifications: '/api/notifications'
};

/**
 * 應用程式配置
 */
const appConfig = {
    version: '1.0.0',
    environment: 'development', // development, staging, production
    debug: true,
    api: {
        baseURL: 'http://localhost:3000/api',
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000
    },
    storage: {
        prefix: 'restaurant_',
        version: '1.0',
        compression: false
    },
    ui: {
        theme: 'light',
        language: 'zh-TW',
        animations: true,
        notifications: true
    },
    features: {
        offlineMode: true,
        pushNotifications: false,
        analytics: false,
        crashReporting: false
    }
};

/**
 * 辣度等級配置
 */
const spicyLevels = [
    { level: 0, name: '不辣', icon: '🥒', color: '#4CAF50' },
    { level: 1, name: '微辣', icon: '🌶️', color: '#FF9800' },
    { level: 2, name: '小辣', icon: '🌶️🌶️', color: '#FF5722' },
    { level: 3, name: '中辣', icon: '🌶️🌶️🌶️', color: '#F44336' },
    { level: 4, name: '大辣', icon: '🌶️🌶️🌶️🌶️', color: '#D32F2F' },
    { level: 5, name: '超辣', icon: '🌶️🌶️🌶️🌶️🌶️', color: '#B71C1C' }
];

/**
 * 訂單狀態配置
 */
const orderStatuses = [
    { id: 'pending', name: '待確認', icon: 'fas fa-clock', color: '#FF9800' },
    { id: 'confirmed', name: '已確認', icon: 'fas fa-check', color: '#4CAF50' },
    { id: 'preparing', name: '製作中', icon: 'fas fa-utensils', color: '#2196F3' },
    { id: 'ready', name: '準備完成', icon: 'fas fa-bell', color: '#9C27B0' },
    { id: 'delivering', name: '配送中', icon: 'fas fa-truck', color: '#FF5722' },
    { id: 'delivered', name: '已送達', icon: 'fas fa-check-circle', color: '#4CAF50' },
    { id: 'cancelled', name: '已取消', icon: 'fas fa-times', color: '#F44336' }
];

// 導出數據
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        menuData,
        categoryData,
        restaurantConfig,
        apiEndpoints,
        appConfig,
        spicyLevels,
        orderStatuses
    };
} else {
    window.menuData = menuData;
    window.categoryData = categoryData;
    window.restaurantConfig = restaurantConfig;
    window.apiEndpoints = apiEndpoints;
    window.appConfig = appConfig;
    window.spicyLevels = spicyLevels;
    window.orderStatuses = orderStatuses;
}