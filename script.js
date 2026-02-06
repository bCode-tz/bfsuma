// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Only handle anchor links
        if (href.startsWith('#')) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to section
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Cart functionality
const cartIcon = document.querySelector('.cart-icon');
const cartCount = document.querySelector('.cart-count');
let cartItems = [];
let totalAmount = 0;      // TZS total
let totalAmountUSD = 0;  // USD total

// Format price for display
function formatPrice(amount, currency) {
    return currency === 'USD' ? `$${Number(amount).toLocaleString()}` : `TZS ${Number(amount).toLocaleString()}`;
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('bfsumaCart');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
        // Ensure legacy items have currency
        cartItems.forEach(item => { if (!item.currency) item.currency = 'TZS'; });
        updateCartDisplay();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('bfsumaCart', JSON.stringify(cartItems));
}

// Update cart display
function updateCartDisplay() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    totalAmount = cartItems.filter(item => (item.currency || 'TZS') === 'TZS').reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmountUSD = cartItems.filter(item => item.currency === 'USD').reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Show/hide floating cart button
    updateFloatingCartButton(totalItems);
}

// Floating cart button
function updateFloatingCartButton(totalItems) {
    let floatingBtn = document.getElementById('floatingCartBtn');
    
    if (totalItems > 0) {
        if (!floatingBtn) {
            floatingBtn = document.createElement('button');
            floatingBtn.id = 'floatingCartBtn';
            floatingBtn.className = 'floating-cart-btn';
            floatingBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span class="floating-cart-text">View Cart</span>
                <span class="floating-cart-count">${totalItems}</span>
            `;
            floatingBtn.addEventListener('click', showCartModal);
            document.body.appendChild(floatingBtn);
        } else {
            floatingBtn.querySelector('.floating-cart-count').textContent = totalItems;
        }
        floatingBtn.classList.add('show');
    } else {
        if (floatingBtn) {
            floatingBtn.classList.remove('show');
        }
    }
}

// Add to cart functionality
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.getAttribute('data-product');
        const productPrice = parseInt(this.getAttribute('data-price'), 10);
        const currency = this.getAttribute('data-currency') || 'TZS';
        
        // Check if product already in cart
        const existingItem = cartItems.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({
                name: productName,
                price: productPrice,
                quantity: 1,
                currency: currency
            });
        }
        
        // Update display
        updateCartDisplay();
        saveCart();
        
        // Visual feedback
        this.textContent = 'Added!';
        this.classList.add('added');
        
        setTimeout(() => {
            this.textContent = 'Add to Cart';
            this.classList.remove('added');
        }, 1500);
        
        // Show notification
        showNotification(`${productName} added to cart!`);
    });
});

// Cart icon click - show cart modal
if (cartIcon) {
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        showCartModal();
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Show cart modal
function showCartModal() {
    // Close existing modal if open
    const existingModal = document.querySelector('.cart-modal');
    if (existingModal) {
        closeCartModal(existingModal);
        return;
    }
    
    updateCartDisplay(); // Refresh cart data
    
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-modal-header">
                <h2>Your Shopping Cart</h2>
                <button class="close-cart-btn" aria-label="Close cart">&times;</button>
            </div>
            <div class="cart-modal-body">
                ${cartItems.length === 0 ? 
                    '<div class="empty-cart"><p>Your cart is empty</p><p class="empty-cart-message">Add products to your cart to get started!</p></div>' : 
                    generateCartHTML()
                }
            </div>
            ${cartItems.length > 0 ? `
                <div class="cart-modal-footer">
                    <div class="cart-summary">
                        ${totalAmountUSD > 0 ? `<div class="cart-total"><span>Subtotal (USD):</span><strong>$${totalAmountUSD.toLocaleString()}</strong></div>` : ''}
                        ${totalAmount > 0 ? `<div class="cart-total"><span>Subtotal (TZS):</span><strong>TZS ${totalAmount.toLocaleString()}</strong></div>` : ''}
                        <p class="cart-note">Click "Place Order" to send your order via WhatsApp</p>
                    </div>
                    <button class="checkout-btn" onclick="proceedToOrder()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Place Order via WhatsApp
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close button
    modal.querySelector('.close-cart-btn').addEventListener('click', () => {
        closeCartModal(modal);
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCartModal(modal);
        }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeCartModal(modal);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function generateCartHTML() {
    let html = '<div class="cart-items">';
    cartItems.forEach((item, index) => {
        const curr = item.currency || 'TZS';
        const lineTotal = item.price * item.quantity;
        const priceStr = curr === 'USD' ? `$${item.price.toLocaleString()}` : `TZS ${item.price.toLocaleString()}`;
        const totalStr = curr === 'USD' ? `$${lineTotal.toLocaleString()}` : `TZS ${lineTotal.toLocaleString()}`;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${priceStr} × ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${index})">&times;</button>
                </div>
                <div class="cart-item-total">${totalStr}</div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function closeCartModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
    setTimeout(() => {
        if (modal.parentNode) {
            document.body.removeChild(modal);
        }
    }, 300);
}

// Update quantity
window.updateQuantity = function(index, change) {
    cartItems[index].quantity += change;
    if (cartItems[index].quantity <= 0) {
        cartItems.splice(index, 1);
    }
    updateCartDisplay();
    saveCart();
    
    // Refresh modal if open
    const existingModal = document.querySelector('.cart-modal');
    if (existingModal) {
        closeCartModal(existingModal);
        setTimeout(() => showCartModal(), 300);
    }
};

// Remove from cart
window.removeFromCart = function(index) {
    cartItems.splice(index, 1);
    updateCartDisplay();
    saveCart();
    
    // Refresh modal if open
    const existingModal = document.querySelector('.cart-modal');
    if (existingModal) {
        closeCartModal(existingModal);
        setTimeout(() => showCartModal(), 300);
    }
};

// Proceed to order
window.proceedToOrder = function() {
    if (cartItems.length === 0) return;
    
    // Prompt for customer information
    const customerName = prompt("Please enter your name:");
    if (!customerName) return;
    
    let customerPhone = prompt("Please enter your phone number (e.g. +255 777 228 873 or 0777 228 873):");
    if (!customerPhone) return;
    customerPhone = customerPhone.trim();
    // Normalize: replace leading 0 with +255 so all numbers use +255
    if (/^0\d/.test(customerPhone)) {
        customerPhone = '+255' + customerPhone.slice(1).replace(/\s/g, '');
    } else if (/^255\d/.test(customerPhone)) {
        customerPhone = '+' + customerPhone.replace(/\s/g, '');
    } else {
        customerPhone = customerPhone.replace(/\s/g, '');
    }
    
    const customerEmail = prompt("Please enter your email (optional):") || '';
    
    // Create order
    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        items: cartItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            currency: item.currency || 'TZS'
        })),
        total: totalAmount,
        totalUSD: totalAmountUSD,
        status: 'pending'
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('bfsumaOrders') || '[]');
    orders.push(order);
    localStorage.setItem('bfsumaOrders', JSON.stringify(orders));
    
    // Create order message
    let orderMessage = "Order Details:\n\n";
    cartItems.forEach(item => {
        const curr = item.currency || 'TZS';
        const lineTotal = item.price * item.quantity;
        if (curr === 'USD') {
            orderMessage += `${item.name} - ${item.quantity}x $${item.price.toLocaleString()} = $${lineTotal.toLocaleString()}\n`;
        } else {
            orderMessage += `${item.name} - ${item.quantity}x TZS ${item.price.toLocaleString()} = TZS ${lineTotal.toLocaleString()}\n`;
        }
    });
    if (totalAmountUSD > 0) orderMessage += `\nTotal (USD): $${totalAmountUSD.toLocaleString()}\n`;
    if (totalAmount > 0) orderMessage += `Total (TZS): TZS ${totalAmount.toLocaleString()}\n`;
    orderMessage += '\n';
    orderMessage += `Customer: ${customerName}\n`;
    orderMessage += `Phone: ${customerPhone}\n`;
    if (customerEmail) {
        orderMessage += `Email: ${customerEmail}\n`;
    }
    orderMessage += `\nOrder ID: #${order.id}\n\n`;
    orderMessage += "Thank you for your order!";
    
    // Create WhatsApp link
    const whatsappNumber = "255743347824";
    const whatsappMessage = encodeURIComponent(orderMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clear cart
    cartItems = [];
    updateCartDisplay();
    saveCart();
    
    // Close modal
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        closeCartModal(modal);
    }
    
    // Show success message
    showNotification('Order placed successfully! Order ID: #' + order.id);
};

// Initialize cart on page load
loadCart();

