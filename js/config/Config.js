/**
 * 環境配置管理系統
 * 支援開發、測試、生產環境的配置切換
 */

/**
 * 基礎配置類
 */
class BaseConfig {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.loadConfig();
    }

    /**
     * 檢測當前環境
     */
    detectEnvironment() {
        // 檢查 URL
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        
        if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        }
        
        if (protocol === 'https:') {
            return 'production';
        }
        
        return 'development';
    }

    /**
     * 載入配置
     */
    loadConfig() {
        const configs = {
            development: this.getDevelopmentConfig(),
            staging: this.getStagingConfig(),
            production: this.getProductionConfig()
        };
        
        return configs[this.environment] || configs.development;
    }

    /**
     * 開發環境配置
     */
    getDevelopmentConfig() {
        return {
            api: {
                baseURL: 'http://localhost:3000/api',
                timeout: 30000,
                retryAttempts: 3,
                retryDelay: 1000,
                mockMode: true,
                enableCORS: true
            },
            debug: {
                enabled: true,
                level: 'debug',
                showNetworkLogs: true,
                showStateChanges: true,
                enableConsoleLogging: true
            },
            storage: {
                prefix: 'dev_restaurant_',
                enableCompression: false,
                enableEncryption: false,
                clearOnStartup: false
            },
            features: {
                offlineMode: true,
                pushNotifications: false,
                analytics: false,
                crashReporting: false,
                mockPayments: true,
                hotReload: true
            },
            ui: {
                showDebugInfo: true,
                enableAnimations: true,
                theme: 'light',
                language: 'zh-TW'
            }
        };
    }

    /**
     * 測試環境配置
     */
    getStagingConfig() {
        return {
            api: {
                baseURL: 'https://staging-api.restaurant.com/api',
                timeout: 20000,
                retryAttempts: 2,
                retryDelay: 1500,
                mockMode: false,
                enableCORS: false
            },
            debug: {
                enabled: true,
                level: 'info',
                showNetworkLogs: true,
                showStateChanges: false,
                enableConsoleLogging: true
            },
            storage: {
                prefix: 'staging_restaurant_',
                enableCompression: true,
                enableEncryption: false,
                clearOnStartup: false
            },
            features: {
                offlineMode: true,
                pushNotifications: true,
                analytics: false,
                crashReporting: true,
                mockPayments: true,
                hotReload: false
            },
            ui: {
                showDebugInfo: true,
                enableAnimations: true,
                theme: 'light',
                language: 'zh-TW'
            }
        };
    }

    /**
     * 生產環境配置
     */
    getProductionConfig() {
        return {
            api: {
                baseURL: 'https://api.restaurant.com/api',
                timeout: 15000,
                retryAttempts: 1,
                retryDelay: 2000,
                mockMode: false,
                enableCORS: false
            },
            debug: {
                enabled: false,
                level: 'error',
                showNetworkLogs: false,
                showStateChanges: false,
                enableConsoleLogging: false
            },
            storage: {
                prefix: 'restaurant_',
                enableCompression: true,
                enableEncryption: true,
                clearOnStartup: false
            },
            features: {
                offlineMode: true,
                pushNotifications: true,
                analytics: true,
                crashReporting: true,
                mockPayments: false,
                hotReload: false
            },
            ui: {
                showDebugInfo: false,
                enableAnimations: true,
                theme: 'light',
                language: 'zh-TW'
            }
        };
    }

    /**
     * 獲取配置值
     */
    get(key, defaultValue = null) {
        return this.getNestedValue(this.config, key, defaultValue);
    }

    /**
     * 設置配置值（僅限開發環境）
     */
    set(key, value) {
        if (this.environment !== 'development') {
            console.warn('Config.set() is only available in development environment');
            return false;
        }
        
        this.setNestedValue(this.config, key, value);
        return true;
    }

    /**
     * 獲取嵌套對象值
     */
    getNestedValue(obj, path, defaultValue) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined || !(key in current)) {
                return defaultValue;
            }
            current = current[key];
        }
        
        return current;
    }

    /**
     * 設置嵌套對象值
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = obj;
        
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
    }

    /**
     * 獲取當前環境
     */
    getEnvironment() {
        return this.environment;
    }

    /**
     * 是否為開發環境
     */
    isDevelopment() {
        return this.environment === 'development';
    }

    /**
     * 是否為生產環境
     */
    isProduction() {
        return this.environment === 'production';
    }

    /**
     * 是否為測試環境
     */
    isStaging() {
        return this.environment === 'staging';
    }

    /**
     * 獲取完整配置
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * 重新載入配置
     */
    reload() {
        this.environment = this.detectEnvironment();
        this.config = this.loadConfig();
        return this.config;
    }
}

/**
 * 功能標記配置
 */
class FeatureFlags {
    constructor(config) {
        this.config = config;
        this.flags = this.initializeFlags();
    }

    /**
     * 初始化功能標記
     */
    initializeFlags() {
        const baseFlags = {
            // 核心功能
            enableCart: true,
            enableCheckout: true,
            enableUserAuth: false,
            enableGuestOrder: true,
            
            // 支付功能
            enableCreditCard: true,
            enableLinePay: true,
            enableApplePay: false,
            enableCashPayment: true,
            
            // 訂單功能
            enableDelivery: true,
            enableTakeout: true,
            enablePreOrder: true,
            enableOrderTracking: false,
            
            // UI 功能
            enableDarkMode: false,
            enableAnimations: true,
            enableSoundEffects: false,
            enableHapticFeedback: false,
            
            // 進階功能
            enableRecommendations: false,
            enableReviews: false,
            enableLoyaltyProgram: false,
            enableCoupons: false,
            
            // 開發工具
            enableDebugPanel: this.config.isDevelopment(),
            enablePerformanceMonitor: this.config.isDevelopment(),
            enableMockData: this.config.get('api.mockMode', false)
        };

        // 環境特定覆蓋
        const envOverrides = this.getEnvironmentOverrides();
        return { ...baseFlags, ...envOverrides };
    }

    /**
     * 環境特定覆蓋
     */
    getEnvironmentOverrides() {
        if (this.config.isProduction()) {
            return {
                enableOrderTracking: true,
                enableRecommendations: true,
                enableReviews: true,
                enableApplePay: true
            };
        }
        
        if (this.config.isStaging()) {
            return {
                enableOrderTracking: true,
                enableRecommendations: false
            };
        }
        
        return {};
    }

    /**
     * 檢查功能是否啟用
     */
    isEnabled(flag) {
        return this.flags[flag] === true;
    }

    /**
     * 啟用功能（僅開發環境）
     */
    enable(flag) {
        if (!this.config.isDevelopment()) {
            console.warn('FeatureFlags.enable() is only available in development environment');
            return false;
        }
        
        this.flags[flag] = true;
        return true;
    }

    /**
     * 停用功能（僅開發環境）
     */
    disable(flag) {
        if (!this.config.isDevelopment()) {
            console.warn('FeatureFlags.disable() is only available in development environment');
            return false;
        }
        
        this.flags[flag] = false;
        return true;
    }

    /**
     * 獲取所有功能標記
     */
    getAll() {
        return { ...this.flags };
    }
}

/**
 * 主配置管理器
 */
class ConfigManager {
    constructor() {
        this.baseConfig = new BaseConfig();
        this.featureFlags = new FeatureFlags(this.baseConfig);
        this.initialized = false;
    }

    /**
     * 初始化配置
     */
    async initialize() {
        if (this.initialized) {
            return this;
        }

        try {
            // 載入遠端配置（如果需要）
            await this.loadRemoteConfig();
            
            // 載入本地存儲的配置覆蓋
            this.loadLocalOverrides();
            
            this.initialized = true;
            this.logInitialization();
            
            return this;
        } catch (error) {
            console.error('Config initialization failed:', error);
            this.initialized = true; // 繼續使用預設配置
            return this;
        }
    }

    /**
     * 載入遠端配置
     */
    async loadRemoteConfig() {
        if (this.baseConfig.isProduction()) {
            // 在生產環境中，可以從遠端載入配置
            try {
                const response = await fetch('/api/config');
                if (response.ok) {
                    const remoteConfig = await response.json();
                    this.mergeConfig(remoteConfig);
                }
            } catch (error) {
                console.warn('Failed to load remote config:', error);
            }
        }
    }

    /**
     * 載入本地覆蓋配置
     */
    loadLocalOverrides() {
        try {
            const stored = localStorage.getItem('restaurant_config_overrides');
            if (stored) {
                const overrides = JSON.parse(stored);
                this.mergeConfig(overrides);
            }
        } catch (error) {
            console.warn('Failed to load local config overrides:', error);
        }
    }

    /**
     * 合併配置
     */
    mergeConfig(overrides) {
        for (const key in overrides) {
            if (overrides.hasOwnProperty(key)) {
                this.baseConfig.set(key, overrides[key]);
            }
        }
    }

    /**
     * 記錄初始化資訊
     */
    logInitialization() {
        if (this.baseConfig.get('debug.enabled')) {
            console.group('🔧 Restaurant App Configuration');
            console.log('Environment:', this.baseConfig.getEnvironment());
            console.log('API Base URL:', this.baseConfig.get('api.baseURL'));
            console.log('Debug Mode:', this.baseConfig.get('debug.enabled'));
            console.log('Mock Mode:', this.baseConfig.get('api.mockMode'));
            console.log('Feature Flags:', this.featureFlags.getAll());
            console.groupEnd();
        }
    }

    /**
     * 獲取配置
     */
    get(key, defaultValue) {
        return this.baseConfig.get(key, defaultValue);
    }

    /**
     * 檢查功能標記
     */
    isFeatureEnabled(flag) {
        return this.featureFlags.isEnabled(flag);
    }

    /**
     * 獲取環境配置
     */
    getEnvironment() {
        return this.baseConfig.getEnvironment();
    }

    /**
     * 檢查是否為開發環境
     */
    isDevelopment() {
        return this.baseConfig.isDevelopment();
    }

    /**
     * 檢查是否為生產環境
     */
    isProduction() {
        return this.baseConfig.isProduction();
    }

    /**
     * 檢查是否為測試環境
     */
    isStaging() {
        return this.baseConfig.isStaging();
    }

    /**
     * 獲取完整配置
     */
    getAll() {
        return {
            config: this.baseConfig.getAll(),
            featureFlags: this.featureFlags.getAll(),
            environment: this.baseConfig.getEnvironment()
        };
    }

    /**
     * 重新載入配置
     */
    async reload() {
        this.initialized = false;
        return await this.initialize();
    }
}

// 創建全域配置實例
const config = new ConfigManager();

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigManager, config };
} else {
    window.ConfigManager = ConfigManager;
    window.config = config;
}