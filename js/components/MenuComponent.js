/**
 * 菜單項目組件
 * 負責渲染單個菜單項目和相關互動
 */
class MenuItemComponent {
    constructor() {
        this.eventHandlers = new Map();
    }

    /**
     * 創建菜單項目元素
     * @param {Object} item - 菜單項目數據
     * @param {number} index - 索引用於動畫延遲
     * @returns {HTMLElement} - 菜單項目DOM元素
     */
    create(item, index = 0) {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item fade-in';
        itemElement.style.animationDelay = `${index * 0.1}s`;
        itemElement.dataset.itemId = item.id;
        
        itemElement.innerHTML = this.getTemplate(item);
        this.bindEvents(itemElement, item);
        
        return itemElement;
    }

    /**
     * 獲取菜單項目模板
     * @param {Object} item - 菜單項目數據
     * @returns {string} - HTML模板
     */
    getTemplate(item) {
        return `
            <div class="item-image" style="background-image: url('${item.image}')">
                <div class="item-badge">${item.badge}</div>
            </div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-footer">
                    <div class="item-price">NT$ ${item.price}</div>
                    <button class="add-to-cart-btn" data-item-id="${item.id}">
                        <i class="fas fa-plus"></i>
                        加入購物車
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 綁定事件監聽器
     * @param {HTMLElement} element - 菜單項目DOM元素
     * @param {Object} item - 菜單項目數據
     */
    bindEvents(element, item) {
        const addButton = element.querySelector('.add-to-cart-btn');
        
        const clickHandler = (e) => {
            e.preventDefault();
            this.handleAddToCart(item, addButton);
        };
        
        addButton.addEventListener('click', clickHandler);
        
        // 存儲事件處理器以便後續清理
        this.eventHandlers.set(element, { addButton, clickHandler });
    }

    /**
     * 處理加入購物車
     * @param {Object} item - 菜單項目數據
     * @param {HTMLElement} button - 按鈕元素
     */
    handleAddToCart(item, button) {
        // 觸發自定義事件
        const event = new CustomEvent('addToCart', {
            detail: { item },
            bubbles: true
        });
        
        button.dispatchEvent(event);
        this.showAddAnimation(button);
    }

    /**
     * 顯示加入購物車動畫
     * @param {HTMLElement} button - 按鈕元素
     */
    showAddAnimation(button) {
        const originalContent = button.innerHTML;
        const originalStyle = button.style.background;
        
        button.innerHTML = '<i class="fas fa-check"></i> 已加入';
        button.style.background = '#28a745';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.style.background = originalStyle;
            button.disabled = false;
        }, 1000);
    }

    /**
     * 清理事件監聽器
     * @param {HTMLElement} element - 菜單項目DOM元素
     */
    cleanup(element) {
        const handlers = this.eventHandlers.get(element);
        if (handlers) {
            handlers.addButton.removeEventListener('click', handlers.clickHandler);
            this.eventHandlers.delete(element);
        }
    }

    /**
     * 銷毀組件
     */
    destroy() {
        this.eventHandlers.forEach((handlers, element) => {
            this.cleanup(element);
        });
        this.eventHandlers.clear();
    }
}

/**
 * 菜單容器組件
 * 管理整個菜單的渲染和分類篩選
 */
class MenuContainerComponent {
    constructor(options) {
        // 支持傳入字符串或對象
        if (typeof options === 'string') {
            this.container = document.getElementById(options);
        } else {
            this.container = document.getElementById(options.containerId);
            this.apiService = options.apiService;
            this.stateManager = options.stateManager;
        }
        
        this.menuItemComponent = new MenuItemComponent();
        this.currentCategory = 'all';
        this.items = [];
        
        this.bindEvents();
    }

    /**
     * 設置菜單數據
     * @param {Array} items - 菜單項目數組
     */
    setItems(items) {
        this.items = items;
        this.render();
    }

    /**
     * 設置當前分類
     * @param {string} category - 分類名稱
     */
    setCategory(category) {
        this.currentCategory = category;
        this.render();
    }

    /**
     * 渲染菜單
     */
    render() {
        if (!this.container) return;

        // 清理舊的事件監聽器
        this.cleanup();

        const filteredItems = this.getFilteredItems();
        
        if (filteredItems.length === 0) {
            this.renderEmpty();
            return;
        }

        this.renderItems(filteredItems);
    }

    /**
     * 獲取過濾後的菜單項目
     * @returns {Array} - 過濾後的項目數組
     */
    getFilteredItems() {
        return this.currentCategory === 'all' 
            ? this.items 
            : this.items.filter(item => item.category === this.currentCategory);
    }

    /**
     * 渲染菜單項目
     * @param {Array} items - 要渲染的項目數組
     */
    renderItems(items) {
        this.container.innerHTML = '';
        
        items.forEach((item, index) => {
            const itemElement = this.menuItemComponent.create(item, index);
            this.container.appendChild(itemElement);
        });
    }

    /**
     * 渲染空狀態
     */
    renderEmpty() {
        this.container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <p>此分類暫無商品</p>
            </div>
        `;
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        if (this.container) {
            this.container.addEventListener('addToCart', (e) => {
                // 轉發事件到全域
                const globalEvent = new CustomEvent('menuAddToCart', {
                    detail: e.detail,
                    bubbles: true
                });
                document.dispatchEvent(globalEvent);
            });
        }
    }

    /**
     * 清理事件監聽器
     */
    cleanup() {
        const menuItems = this.container.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            this.menuItemComponent.cleanup(item);
        });
    }

    /**
     * 銷毀組件
     */
    destroy() {
        this.cleanup();
        this.menuItemComponent.destroy();
    }
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MenuItemComponent, MenuContainerComponent };
} else {
    window.MenuItemComponent = MenuItemComponent;
    window.MenuContainerComponent = MenuContainerComponent;
}