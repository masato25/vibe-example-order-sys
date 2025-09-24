/**
 * 驗證工具函數
 * 提供各種表單驗證功能
 */
class ValidationUtils {
    /**
     * 驗證是否為空
     * @param {*} value - 要驗證的值
     * @returns {boolean} - 是否為空
     */
    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    /**
     * 驗證字符串長度
     * @param {string} value - 字符串
     * @param {number} min - 最小長度
     * @param {number} max - 最大長度
     * @returns {boolean} - 是否有效
     */
    static validateLength(value, min = 0, max = Infinity) {
        if (typeof value !== 'string') return false;
        const length = value.trim().length;
        return length >= min && length <= max;
    }

    /**
     * 驗證電子郵件格式
     * @param {string} email - 電子郵件
     * @returns {boolean} - 是否有效
     */
    static validateEmail(email) {
        if (typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * 驗證手機號碼（台灣格式）
     * @param {string} phone - 手機號碼
     * @returns {boolean} - 是否有效
     */
    static validatePhone(phone) {
        if (typeof phone !== 'string') return false;
        const phoneRegex = /^09\d{8}$|^[0-9\-\+\(\)\s]{8,}$/;
        return phoneRegex.test(phone.trim().replace(/[\s\-\+\(\)]/g, ''));
    }

    /**
     * 驗證數字範圍
     * @param {number} value - 數值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {boolean} - 是否有效
     */
    static validateRange(value, min = -Infinity, max = Infinity) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * 驗證密碼強度
     * @param {string} password - 密碼
     * @returns {Object} - 驗證結果
     */
    static validatePassword(password) {
        if (typeof password !== 'string') {
            return { valid: false, strength: 0, issues: ['密碼必須是字符串'] };
        }

        const issues = [];
        let strength = 0;

        // 長度檢查
        if (password.length < 8) {
            issues.push('密碼長度至少需要8個字符');
        } else {
            strength += 1;
        }

        // 包含小寫字母
        if (/[a-z]/.test(password)) {
            strength += 1;
        } else {
            issues.push('密碼需要包含小寫字母');
        }

        // 包含大寫字母
        if (/[A-Z]/.test(password)) {
            strength += 1;
        } else {
            issues.push('密碼需要包含大寫字母');
        }

        // 包含數字
        if (/\d/.test(password)) {
            strength += 1;
        } else {
            issues.push('密碼需要包含數字');
        }

        // 包含特殊字符
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            strength += 1;
        } else {
            issues.push('密碼需要包含特殊字符');
        }

        return {
            valid: issues.length === 0,
            strength: Math.min(strength, 5),
            issues
        };
    }

    /**
     * 驗證URL格式
     * @param {string} url - URL
     * @returns {boolean} - 是否有效
     */
    static validateUrl(url) {
        if (typeof url !== 'string') return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 驗證身份證號碼（台灣格式）
     * @param {string} id - 身份證號碼
     * @returns {boolean} - 是否有效
     */
    static validateTaiwanId(id) {
        if (typeof id !== 'string' || id.length !== 10) return false;
        
        const idRegex = /^[A-Z][12]\d{8}$/;
        if (!idRegex.test(id)) return false;

        // 計算檢查碼
        const letterMap = {
            A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34,
            J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25,
            S: 26, T: 27, U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33
        };

        const firstLetter = id.charAt(0);
        const letterValue = letterMap[firstLetter];
        const digits = id.slice(1).split('').map(Number);

        const sum = Math.floor(letterValue / 10) + 
                   (letterValue % 10) * 9 + 
                   digits[0] * 8 + 
                   digits[1] * 7 + 
                   digits[2] * 6 + 
                   digits[3] * 5 + 
                   digits[4] * 4 + 
                   digits[5] * 3 + 
                   digits[6] * 2 + 
                   digits[7] * 1;

        return (10 - (sum % 10)) % 10 === digits[8];
    }
}

/**
 * 格式化工具函數
 * 提供各種數據格式化功能
 */
class FormatUtils {
    /**
     * 格式化貨幣
     * @param {number} amount - 金額
     * @param {string} currency - 貨幣符號
     * @param {number} decimals - 小數位數
     * @returns {string} - 格式化後的貨幣字符串
     */
    static formatCurrency(amount, currency = 'NT$', decimals = 0) {
        if (isNaN(amount)) return `${currency} 0`;
        
        const formatted = Number(amount).toLocaleString('zh-TW', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
        
        return `${currency} ${formatted}`;
    }

    /**
     * 格式化日期
     * @param {Date|string|number} date - 日期
     * @param {string} format - 格式字符串
     * @returns {string} - 格式化後的日期字符串
     */
    static formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * 格式化相對時間
     * @param {Date|string|number} date - 日期
     * @returns {string} - 相對時間字符串
     */
    static formatRelativeTime(date) {
        const now = new Date();
        const target = new Date(date);
        const diff = now.getTime() - target.getTime();

        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const week = 7 * day;
        const month = 30 * day;
        const year = 365 * day;

        if (diff < minute) return '剛剛';
        if (diff < hour) return `${Math.floor(diff / minute)}分鐘前`;
        if (diff < day) return `${Math.floor(diff / hour)}小時前`;
        if (diff < week) return `${Math.floor(diff / day)}天前`;
        if (diff < month) return `${Math.floor(diff / week)}週前`;
        if (diff < year) return `${Math.floor(diff / month)}個月前`;
        return `${Math.floor(diff / year)}年前`;
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字節數
     * @param {number} decimals - 小數位數
     * @returns {string} - 格式化後的文件大小
     */
    static formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
    }

    /**
     * 格式化手機號碼
     * @param {string} phone - 手機號碼
     * @returns {string} - 格式化後的手機號碼
     */
    static formatPhone(phone) {
        if (typeof phone !== 'string') return '';
        
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10 && cleaned.startsWith('09')) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        
        return phone;
    }

    /**
     * 格式化身份證號碼
     * @param {string} id - 身份證號碼
     * @returns {string} - 格式化後的身份證號碼
     */
    static formatId(id) {
        if (typeof id !== 'string' || id.length !== 10) return id;
        return `${id.slice(0, 1)}${id.slice(1, 3)}*****${id.slice(8)}`;
    }

    /**
     * 截斷文本
     * @param {string} text - 文本
     * @param {number} length - 最大長度
     * @param {string} suffix - 後綴
     * @returns {string} - 截斷後的文本
     */
    static truncateText(text, length = 100, suffix = '...') {
        if (typeof text !== 'string') return '';
        return text.length > length ? text.slice(0, length) + suffix : text;
    }

    /**
     * 格式化百分比
     * @param {number} value - 數值
     * @param {number} decimals - 小數位數
     * @returns {string} - 格式化後的百分比
     */
    static formatPercentage(value, decimals = 1) {
        if (isNaN(value)) return '0%';
        return `${(value * 100).toFixed(decimals)}%`;
    }
}

/**
 * DOM工具函數
 * 提供DOM操作的便利方法
 */
class DomUtils {
    /**
     * 查詢元素
     * @param {string} selector - 選擇器
     * @param {Element} context - 上下文元素
     * @returns {Element|null} - 找到的元素
     */
    static query(selector, context = document) {
        return context.querySelector(selector);
    }

    /**
     * 查詢所有元素
     * @param {string} selector - 選擇器
     * @param {Element} context - 上下文元素
     * @returns {NodeList} - 找到的元素列表
     */
    static queryAll(selector, context = document) {
        return context.querySelectorAll(selector);
    }

    /**
     * 創建元素
     * @param {string} tag - 標籤名
     * @param {Object} options - 選項
     * @returns {Element} - 創建的元素
     */
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }
        
        if (options.parent) {
            options.parent.appendChild(element);
        }
        
        return element;
    }

    /**
     * 添加事件監聽器
     * @param {Element} element - 元素
     * @param {string} event - 事件名稱
     * @param {Function} handler - 處理函數
     * @param {Object} options - 選項
     */
    static addEvent(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
    }

    /**
     * 移除事件監聽器
     * @param {Element} element - 元素
     * @param {string} event - 事件名稱
     * @param {Function} handler - 處理函數
     */
    static removeEvent(element, event, handler) {
        element.removeEventListener(event, handler);
    }

    /**
     * 添加CSS類
     * @param {Element} element - 元素
     * @param {...string} classes - CSS類名
     */
    static addClass(element, ...classes) {
        element.classList.add(...classes);
    }

    /**
     * 移除CSS類
     * @param {Element} element - 元素
     * @param {...string} classes - CSS類名
     */
    static removeClass(element, ...classes) {
        element.classList.remove(...classes);
    }

    /**
     * 切換CSS類
     * @param {Element} element - 元素
     * @param {string} className - CSS類名
     * @returns {boolean} - 切換後是否存在該類
     */
    static toggleClass(element, className) {
        return element.classList.toggle(className);
    }

    /**
     * 檢查是否包含CSS類
     * @param {Element} element - 元素
     * @param {string} className - CSS類名
     * @returns {boolean} - 是否包含該類
     */
    static hasClass(element, className) {
        return element.classList.contains(className);
    }

    /**
     * 設置樣式
     * @param {Element} element - 元素
     * @param {Object} styles - 樣式對象
     */
    static setStyles(element, styles) {
        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    }

    /**
     * 獲取元素位置
     * @param {Element} element - 元素
     * @returns {Object} - 位置信息
     */
    static getPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * 平滑滾動到元素
     * @param {Element} element - 目標元素
     * @param {Object} options - 滾動選項
     */
    static scrollToElement(element, options = {}) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
            ...options
        });
    }

    /**
     * 檢查元素是否在視窗內
     * @param {Element} element - 元素
     * @returns {boolean} - 是否在視窗內
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }
}

/**
 * 通用工具函數
 * 提供各種通用的輔助方法
 */
class Utils {
    /**
     * 防抖函數
     * @param {Function} func - 要防抖的函數
     * @param {number} wait - 等待時間
     * @returns {Function} - 防抖後的函數
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 節流函數
     * @param {Function} func - 要節流的函數
     * @param {number} limit - 時間限制
     * @returns {Function} - 節流後的函數
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 深拷貝對象
     * @param {*} obj - 要拷貝的對象
     * @returns {*} - 拷貝後的對象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    }

    /**
     * 生成隨機ID
     * @param {number} length - ID長度
     * @returns {string} - 隨機ID
     */
    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 生成UUID
     * @returns {string} - UUID
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 延遲執行
     * @param {number} ms - 延遲時間（毫秒）
     * @returns {Promise} - Promise對象
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 重試函數
     * @param {Function} func - 要重試的函數
     * @param {number} maxRetries - 最大重試次數
     * @param {number} delay - 重試間隔
     * @returns {Promise} - Promise對象
     */
    static async retry(func, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await func();
            } catch (error) {
                lastError = error;
                if (i < maxRetries) {
                    await this.delay(delay);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * 檢查是否為移動設備
     * @returns {boolean} - 是否為移動設備
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * 檢查是否為觸摸設備
     * @returns {boolean} - 是否為觸摸設備
     */
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ValidationUtils, 
        FormatUtils, 
        DomUtils, 
        Utils 
    };
} else {
    window.ValidationUtils = ValidationUtils;
    window.FormatUtils = FormatUtils;
    window.DomUtils = DomUtils;
    window.Utils = Utils;
}