/**
 * 結帳組件
 * 管理結帳流程的顯示和互動
 */
class CheckoutComponent {
    constructor(options = {}) {
        this.modalId = options.modalId || 'checkoutModal';
        this.formId = options.formId || 'checkoutForm';
        this.summaryId = options.summaryId || 'orderSummary';
        this.totalId = options.totalId || 'finalTotal';
        this.confirmBtnId = options.confirmBtnId || 'confirmOrderBtn';

        this.modal = document.getElementById(this.modalId);
        this.form = document.getElementById(this.formId);
        this.summaryContainer = document.getElementById(this.summaryId);
        this.totalElement = document.getElementById(this.totalId);
        this.confirmBtn = document.querySelector('.confirm-order-btn');

        this.isOpen = false;
        this.orderData = {
            items: [],
            total: 0,
            customer: {}
        };

        this.validators = {
            name: (value) => value.trim().length > 0,
            phone: (value) => /^[0-9\-\+\(\)\s]{8,}$/.test(value.trim()),
            email: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        };

        this.bindEvents();
    }

    /**
     * 打開結帳彈窗
     * @param {Array} items - 購物車項目
     * @param {number} total - 總金額
     */
    open(items = [], total = 0) {
        this.orderData.items = items;
        this.orderData.total = total;
        
        this.renderOrderSummary();
        this.updateTotal();
        this.showModal();
        this.focusFirstInput();
    }

    /**
     * 關閉結帳彈窗
     */
    close() {
        this.hideModal();
        this.resetForm();
    }

    /**
     * 顯示彈窗
     */
    showModal() {
        if (this.modal) {
            this.modal.classList.add('open');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * 隱藏彈窗
     */
    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('open');
            this.isOpen = false;
            document.body.style.overflow = '';
        }
    }

    /**
     * 渲染訂單摘要
     */
    renderOrderSummary() {
        if (!this.summaryContainer) return;

        const summaryHTML = `
            <h4>訂單摘要</h4>
            <div class="order-items">
                ${this.orderData.items.map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.name} x ${item.quantity}</span>
                        <span class="item-total">NT$ ${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <div class="order-item total-row">
                    <span class="total-label">總計</span>
                    <span class="total-amount">NT$ ${this.orderData.total}</span>
                </div>
            </div>
        `;

        this.summaryContainer.innerHTML = summaryHTML;
    }

    /**
     * 更新總價顯示
     */
    updateTotal() {
        if (this.totalElement) {
            this.totalElement.textContent = this.orderData.total;
        }
    }

    /**
     * 聚焦到第一個輸入框
     */
    focusFirstInput() {
        const firstInput = this.form?.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * 重置表單
     */
    resetForm() {
        if (this.form) {
            this.form.reset();
            this.clearValidationErrors();
        }
    }

    /**
     * 驗證表單
     * @returns {Object} - 驗證結果
     */
    validateForm() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        const errors = {};

        // 姓名驗證
        if (!this.validators.name(data.customerName || '')) {
            errors.customerName = '請輸入姓名';
        }

        // 電話驗證
        if (!this.validators.phone(data.customerPhone || '')) {
            errors.customerPhone = '請輸入有效的電話號碼';
        }

        // 電子郵件驗證（選填）
        if (data.customerEmail && !this.validators.email(data.customerEmail)) {
            errors.customerEmail = '請輸入有效的電子郵件';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            data
        };
    }

    /**
     * 顯示驗證錯誤
     * @param {Object} errors - 錯誤對象
     */
    showValidationErrors(errors) {
        this.clearValidationErrors();

        Object.entries(errors).forEach(([field, message]) => {
            const input = this.form.querySelector(`[name="${field}"], #${field}`);
            if (input) {
                input.classList.add('error');
                
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = message;
                
                input.parentNode.appendChild(errorElement);
            }
        });
    }

    /**
     * 清除驗證錯誤
     */
    clearValidationErrors() {
        const errorInputs = this.form?.querySelectorAll('.error') || [];
        const errorMessages = this.form?.querySelectorAll('.error-message') || [];

        errorInputs.forEach(input => input.classList.remove('error'));
        errorMessages.forEach(message => message.remove());
    }

    /**
     * 處理表單提交
     * @param {Event} e - 表單提交事件
     */
    async handleSubmit(e) {
        e.preventDefault();

        const validation = this.validateForm();
        
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }

        // 準備訂單數據
        const orderData = {
            items: this.orderData.items,
            total: this.orderData.total,
            customer: validation.data,
            timestamp: new Date().toISOString(),
            id: this.generateOrderId()
        };

        try {
            await this.processOrder(orderData);
        } catch (error) {
            this.handleOrderError(error);
        }
    }

    /**
     * 處理訂單
     * @param {Object} orderData - 訂單數據
     */
    async processOrder(orderData) {
        this.setLoading(true);

        try {
            // 觸發訂單處理事件
            const event = new CustomEvent('processOrder', {
                detail: { orderData },
                bubbles: true
            });
            
            document.dispatchEvent(event);

            // 模擬API調用
            await this.simulateApiCall(2000);

            // 成功處理
            this.handleOrderSuccess(orderData);

        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 設置載入狀態
     * @param {boolean} loading - 是否載入中
     */
    setLoading(loading) {
        if (this.confirmBtn) {
            if (loading) {
                this.confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 處理中...';
                this.confirmBtn.disabled = true;
            } else {
                this.confirmBtn.innerHTML = '<i class="fas fa-check"></i> 確認訂單';
                this.confirmBtn.disabled = false;
            }
        }
    }

    /**
     * 處理訂單成功
     * @param {Object} orderData - 訂單數據
     */
    handleOrderSuccess(orderData) {
        // 觸發訂單成功事件
        const event = new CustomEvent('orderSuccess', {
            detail: { orderData },
            bubbles: true
        });
        
        document.dispatchEvent(event);

        this.close();
    }

    /**
     * 處理訂單錯誤
     * @param {Error} error - 錯誤對象
     */
    handleOrderError(error) {
        console.error('訂單處理失敗:', error);
        
        // 顯示錯誤訊息
        alert('訂單處理失敗，請稍後再試');

        // 觸發錯誤事件
        const event = new CustomEvent('orderError', {
            detail: { error },
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 生成訂單ID
     * @returns {string} - 訂單ID
     */
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORDER${timestamp}${random}`;
    }

    /**
     * 模擬API調用
     * @param {number} delay - 延遲時間
     * @returns {Promise}
     */
    simulateApiCall(delay = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 表單提交
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                this.handleSubmit(e);
            });
        }

        // 關閉按鈕
        const closeBtn = this.modal?.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // 確認按鈕
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', (e) => {
                if (this.form) {
                    this.handleSubmit(e);
                }
            });
        }

        // 模態框外點擊關閉
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // ESC鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // 表單輸入驗證
        const inputs = this.form?.querySelectorAll('input, textarea') || [];
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    /**
     * 驗證單個字段
     * @param {HTMLElement} input - 輸入元素
     */
    validateField(input) {
        const fieldName = input.name || input.id;
        const value = input.value;
        
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'customerName':
                isValid = this.validators.name(value);
                errorMessage = '請輸入姓名';
                break;
            case 'customerPhone':
                isValid = this.validators.phone(value);
                errorMessage = '請輸入有效的電話號碼';
                break;
            case 'customerEmail':
                isValid = this.validators.email(value);
                errorMessage = '請輸入有效的電子郵件';
                break;
        }

        if (!isValid) {
            this.showFieldError(input, errorMessage);
        } else {
            this.clearFieldError(input);
        }

        return isValid;
    }

    /**
     * 顯示字段錯誤
     * @param {HTMLElement} input - 輸入元素
     * @param {string} message - 錯誤訊息
     */
    showFieldError(input, message) {
        this.clearFieldError(input);
        
        input.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        input.parentNode.appendChild(errorElement);
    }

    /**
     * 清除字段錯誤
     * @param {HTMLElement} input - 輸入元素
     */
    clearFieldError(input) {
        input.classList.remove('error');
        
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * 銷毀組件
     */
    destroy() {
        // 清理事件監聽器等
        this.close();
    }
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CheckoutComponent };
} else {
    window.CheckoutComponent = CheckoutComponent;
}