/**
 * 購物車項目組件
 * 管理單個購物車項目的渲染和互動
 */
class CartItemComponent {
    constructor() {
        this.eventHandlers = new Map();
    }

    /**
     * 創建購物車項目元素
     * @param {Object} item - 購物車項目數據
     * @returns {HTMLElement} - 購物車項目DOM元素
     */
    create(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.dataset.itemId = item.id;
        
        itemElement.innerHTML = this.getTemplate(item);
        this.bindEvents(itemElement, item);
        
        return itemElement;
    }

    /**
     * 獲取購物車項目模板
     * @param {Object} item - 購物車項目數據
     * @returns {string} - HTML模板
     */
    getTemplate(item) {
        return `
            <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">NT$ ${item.price}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn decrease" data-action="decrease" data-item-id="${item.id}">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn increase" data-action="increase" data-item-id="${item.id}">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <button class="remove-item" data-item-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }

    /**
     * 綁定事件監聽器
     * @param {HTMLElement} element - 購物車項目DOM元素
     * @param {Object} item - 購物車項目數據
     */
    bindEvents(element, item) {
        const decreaseBtn = element.querySelector('.decrease');
        const increaseBtn = element.querySelector('.increase');
        const removeBtn = element.querySelector('.remove-item');

        const handlers = {
            decrease: (e) => this.handleQuantityChange(e, item, -1),
            increase: (e) => this.handleQuantityChange(e, item, 1),
            remove: (e) => this.handleRemove(e, item)
        };

        decreaseBtn.addEventListener('click', handlers.decrease);
        increaseBtn.addEventListener('click', handlers.increase);
        removeBtn.addEventListener('click', handlers.remove);

        this.eventHandlers.set(element, {
            decreaseBtn, increaseBtn, removeBtn, handlers
        });
    }

    /**
     * 處理數量變更
     * @param {Event} e - 事件對象
     * @param {Object} item - 購物車項目數據
     * @param {number} change - 變更量
     */
    handleQuantityChange(e, item, change) {
        e.preventDefault();
        
        const event = new CustomEvent('quantityChange', {
            detail: { item, change },
            bubbles: true
        });
        
        e.target.dispatchEvent(event);
    }

    /**
     * 處理移除項目
     * @param {Event} e - 事件對象
     * @param {Object} item - 購物車項目數據
     */
    handleRemove(e, item) {
        e.preventDefault();
        
        const event = new CustomEvent('removeItem', {
            detail: { item },
            bubbles: true
        });
        
        e.target.dispatchEvent(event);
    }

    /**
     * 更新數量顯示
     * @param {HTMLElement} element - 購物車項目DOM元素
     * @param {number} quantity - 新數量
     */
    updateQuantity(element, quantity) {
        const quantityDisplay = element.querySelector('.quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = quantity;
        }
    }

    /**
     * 清理事件監聽器
     * @param {HTMLElement} element - 購物車項目DOM元素
     */
    cleanup(element) {
        const handlerData = this.eventHandlers.get(element);
        if (handlerData) {
            const { decreaseBtn, increaseBtn, removeBtn, handlers } = handlerData;
            
            decreaseBtn.removeEventListener('click', handlers.decrease);
            increaseBtn.removeEventListener('click', handlers.increase);
            removeBtn.removeEventListener('click', handlers.remove);
            
            this.eventHandlers.delete(element);
        }
    }
}

/**
 * 購物車容器組件
 * 管理整個購物車的顯示和互動
 */
class CartComponent {
    constructor(options = {}) {
        this.sidebarId = options.sidebarId || 'cartSidebar';
        this.overlayId = options.overlayId || 'cartOverlay';
        this.itemsContainerId = options.itemsContainerId || 'cartItems';
        this.totalId = options.totalId || 'cartTotal';
        this.countId = options.countId || 'cartCount';
        this.checkoutBtnId = options.checkoutBtnId || 'checkoutBtn';

        this.sidebar = document.getElementById(this.sidebarId);
        this.overlay = document.getElementById(this.overlayId);
        this.itemsContainer = document.getElementById(this.itemsContainerId);
        this.totalElement = document.getElementById(this.totalId);
        this.countElement = document.querySelector('.cart-count');
        this.checkoutBtn = document.querySelector('.checkout-btn');

        this.cartItemComponent = new CartItemComponent();
        this.isOpen = false;
        this.items = [];

        this.bindEvents();
    }

    /**
     * 設置購物車數據
     * @param {Array} items - 購物車項目數組
     */
    setItems(items) {
        this.items = items;
        this.render();
        this.updateSummary();
    }

    /**
     * 添加項目到購物車
     * @param {Object} item - 要添加的項目
     */
    addItem(item) {
        const existingItemIndex = this.items.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex >= 0) {
            this.items[existingItemIndex].quantity += 1;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }
        
        this.render();
        this.updateSummary();
        this.triggerChange();
    }

    /**
     * 更新項目數量
     * @param {number} itemId - 項目ID
     * @param {number} change - 數量變更
     */
    updateQuantity(itemId, change) {
        const item = this.items.find(item => item.id === itemId);
        if (!item) return;

        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeItem(itemId);
        } else {
            this.render();
            this.updateSummary();
            this.triggerChange();
        }
    }

    /**
     * 移除項目
     * @param {number} itemId - 項目ID
     */
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.render();
        this.updateSummary();
        this.triggerChange();
    }

    /**
     * 清空購物車
     */
    clear() {
        this.items = [];
        this.render();
        this.updateSummary();
        this.triggerChange();
    }

    /**
     * 渲染購物車
     */
    render() {
        if (!this.itemsContainer) return;

        this.cleanup();

        if (this.items.length === 0) {
            this.renderEmpty();
            return;
        }

        this.renderItems();
    }

    /**
     * 渲染購物車項目
     */
    renderItems() {
        this.itemsContainer.innerHTML = '';
        
        this.items.forEach(item => {
            const itemElement = this.cartItemComponent.create(item);
            this.itemsContainer.appendChild(itemElement);
        });
    }

    /**
     * 渲染空購物車狀態
     */
    renderEmpty() {
        this.itemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>購物車是空的</p>
                <p>快去選擇美味的餐點吧！</p>
            </div>
        `;
    }

    /**
     * 更新購物車摘要信息
     */
    updateSummary() {
        const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        // 更新數量顯示
        if (this.countElement) {
            this.countElement.textContent = totalItems;
            this.countElement.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // 更新總價顯示
        if (this.totalElement) {
            this.totalElement.textContent = totalPrice;
        }

        // 更新結帳按鈕狀態
        if (this.checkoutBtn) {
            this.checkoutBtn.disabled = totalItems === 0;
        }
    }

    /**
     * 打開購物車
     */
    open() {
        if (this.sidebar && this.overlay) {
            this.sidebar.classList.add('open');
            this.overlay.classList.add('open');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * 關閉購物車
     */
    close() {
        if (this.sidebar && this.overlay) {
            this.sidebar.classList.remove('open');
            this.overlay.classList.remove('open');
            this.isOpen = false;
            document.body.style.overflow = '';
        }
    }

    /**
     * 切換購物車顯示狀態
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 獲取購物車數據
     * @returns {Array} - 購物車項目數組
     */
    getItems() {
        return [...this.items];
    }

    /**
     * 獲取購物車總價
     * @returns {number} - 總價
     */
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 購物車內部事件
        if (this.itemsContainer) {
            this.itemsContainer.addEventListener('quantityChange', (e) => {
                const { item, change } = e.detail;
                this.updateQuantity(item.id, change);
            });

            this.itemsContainer.addEventListener('removeItem', (e) => {
                const { item } = e.detail;
                this.removeItem(item.id);
            });
        }

        // 遮罩點擊關閉
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // 鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * 觸發購物車變更事件
     */
    triggerChange() {
        const event = new CustomEvent('cartChange', {
            detail: {
                items: this.getItems(),
                total: this.getTotal(),
                count: this.items.reduce((total, item) => total + item.quantity, 0)
            },
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 清理事件監聽器
     */
    cleanup() {
        const cartItems = this.itemsContainer?.querySelectorAll('.cart-item') || [];
        cartItems.forEach(item => {
            this.cartItemComponent.cleanup(item);
        });
    }

    /**
     * 銷毀組件
     */
    destroy() {
        this.cleanup();
        this.cartItemComponent.destroy?.();
    }
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CartItemComponent, CartComponent };
} else {
    window.CartItemComponent = CartItemComponent;
    window.CartComponent = CartComponent;
}