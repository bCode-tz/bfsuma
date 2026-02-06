// Admin Dashboard JavaScript

// Default admin credentials
const ADMIN_CREDENTIALS = {
    username: 'bfsuma',
    password: 'bfsuma@123'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeEventListeners();
    loadDashboardData();
});

// Check Authentication
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (isAuthenticated) {
        showDashboard();
    } else {
        showLogin();
    }
}

// Show Login Screen
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

// Show Dashboard
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        showDashboard();
        loadDashboardData();
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('adminAuthenticated');
    showLogin();
    document.getElementById('loginForm').reset();
});

// Navigation
function initializeEventListeners() {
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Product Management
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('closeProductModal').addEventListener('click', () => closeProductModal());
    document.getElementById('cancelProductBtn').addEventListener('click', () => closeProductModal());
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Discount Management
    document.getElementById('addDiscountBtn').addEventListener('click', () => openDiscountModal());
    document.getElementById('closeDiscountModal').addEventListener('click', () => closeDiscountModal());
    document.getElementById('cancelDiscountBtn').addEventListener('click', () => closeDiscountModal());
    document.getElementById('discountForm').addEventListener('submit', handleDiscountSubmit);
    
    // News Management
    document.getElementById('addNewsBtn').addEventListener('click', () => openNewsModal());
    document.getElementById('closeNewsModal').addEventListener('click', () => closeNewsModal());
    document.getElementById('cancelNewsBtn').addEventListener('click', () => closeNewsModal());
    document.getElementById('newsForm').addEventListener('submit', handleNewsSubmit);
    
    // Orders
    document.getElementById('refreshOrders').addEventListener('click', () => loadOrders());
    document.getElementById('exportOrders').addEventListener('click', () => exportOrdersToCSV());
    
    // Order Details Modal
    document.getElementById('closeOrderDetailsModal').addEventListener('click', () => closeOrderDetailsModal());
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Switch Section
function switchSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName + 'Section').classList.add('active');
}

// Load Dashboard Data
function loadDashboardData() {
    loadOrders();
    loadProducts();
    loadDiscounts();
    loadNews();
}

// ==================== ORDERS MANAGEMENT ====================

function loadOrders() {
    const orders = getOrders();
    updateOrdersStats(orders);
    displayOrders(orders);
}

function getOrders() {
    const orders = localStorage.getItem('bfsumaOrders');
    return orders ? JSON.parse(orders) : [];
}

function saveOrders(orders) {
    localStorage.setItem('bfsumaOrders', JSON.stringify(orders));
}

function updateOrdersStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const revenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);
    
    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('completedOrders').textContent = completed;
    document.getElementById('totalRevenue').textContent = 'TZS ' + revenue.toLocaleString();
    document.getElementById('ordersBadge').textContent = pending;
}

function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No orders yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map((order, index) => `
        <tr>
            <td>#${order.id || index + 1}</td>
            <td>${order.customerName || 'N/A'}<br><small>${order.customerPhone || ''}</small></td>
            <td>${order.items.length} item(s)</td>
            <td>${order.totalUSD ? `$${order.totalUSD.toLocaleString()}` : ''}${order.totalUSD && order.total ? ' / ' : ''}${order.total ? `TZS ${order.total.toLocaleString()}` : ''}</td>
            <td>${formatDate(order.date)}</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${(order.status || 'pending').toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="viewOrderDetails(${index})">View</button>
                    ${order.status === 'pending' ? `
                        <button class="action-btn btn-complete" onclick="updateOrderStatus(${index}, 'completed')">Complete</button>
                        <button class="action-btn btn-cancel" onclick="updateOrderStatus(${index}, 'cancelled')">Cancel</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function viewOrderDetails(index) {
    const orders = getOrders();
    const order = orders[index];
    
    if (!order) return;
    
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    
    content.innerHTML = `
        <div class="order-detail-item">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> #${order.id || index + 1}</p>
            <p><strong>Date:</strong> ${formatDate(order.date)}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${order.status || 'pending'}">${(order.status || 'pending').toUpperCase()}</span></p>
        </div>
        
        <div class="order-detail-item">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
            <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
            <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
        </div>
        
        <div class="order-detail-item">
            <h3>Order Items</h3>
            <ul class="order-items-list">
                ${order.items.map(item => {
                    const curr = item.currency || 'TZS';
                    const lineTotal = (item.price || 0) * (item.quantity || 0);
                    const str = curr === 'USD' ? `$${lineTotal.toLocaleString()}` : `TZS ${lineTotal.toLocaleString()}`;
                    return `<li><span>${item.name} × ${item.quantity}</span><strong>${str}</strong></li>`;
                }).join('')}
            </ul>
        </div>
        
        <div class="order-detail-item">
            <h3>Total Amount</h3>
            ${order.totalUSD ? `<p style="font-size: 1.5em; font-weight: 700; color: var(--primary-color);">USD: $${order.totalUSD.toLocaleString()}</p>` : ''}
            ${order.total ? `<p style="font-size: 1.5em; font-weight: 700; color: var(--primary-color);">TZS: ${order.total.toLocaleString()}</p>` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').classList.remove('active');
}

function updateOrderStatus(index, status) {
    const orders = getOrders();
    orders[index].status = status;
    saveOrders(orders);
    loadOrders();
}

function exportOrdersToCSV() {
    const orders = getOrders();
    if (orders.length === 0) {
        alert('No orders to export');
        return;
    }
    
    let csv = 'Order ID,Customer Name,Phone,Items,Total,Date,Status\n';
    orders.forEach((order, index) => {
        csv += `#${order.id || index + 1},"${order.customerName || 'N/A'}","${order.customerPhone || 'N/A'}",${order.items.length},${order.total},"${formatDate(order.date)}",${order.status || 'pending'}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bfsuma-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ==================== PRODUCTS MANAGEMENT ====================

function loadProducts() {
    const products = getProducts();
    displayProducts(products);
}

function getProducts() {
    const products = localStorage.getItem('bfsumaProducts');
    return products ? JSON.parse(products) : [];
}

function saveProducts(products) {
    localStorage.setItem('bfsumaProducts', JSON.stringify(products));
}

function displayProducts(products) {
    const container = document.getElementById('productsList');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="empty-state">No products added yet. Click "Add New Product" to get started.</p>';
        return;
    }
    
    container.innerHTML = products.map((product, index) => `
        <div class="product-card-admin">
            <img src="${product.image || 'logo.jpeg'}" alt="${product.name}" onerror="this.src='logo.jpeg'">
            <h3>${product.name}</h3>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> TZS ${product.price.toLocaleString()}</p>
            ${product.description ? `<p>${product.description}</p>` : ''}
            <div class="product-card-actions">
                <button class="btn-secondary" onclick="editProduct(${index})">Edit</button>
                <button class="btn-secondary" onclick="deleteProduct(${index})" style="background: var(--danger-color); color: white;">Delete</button>
            </div>
        </div>
    `).join('');
}

function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    
    if (product) {
        title.textContent = 'Edit Product';
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productImage').value = product.image || '';
        form.dataset.editIndex = product.index;
    } else {
        title.textContent = 'Add New Product';
        form.reset();
        delete form.dataset.editIndex;
    }
    
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    delete document.getElementById('productForm').dataset.editIndex;
}

function handleProductSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const products = getProducts();
    
    const product = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value
    };
    
    if (form.dataset.editIndex !== undefined) {
        // Edit existing
        const index = parseInt(form.dataset.editIndex);
        products[index] = product;
    } else {
        // Add new
        products.push(product);
    }
    
    saveProducts(products);
    loadProducts();
    closeProductModal();
    alert('Product saved successfully!');
}

function editProduct(index) {
    const products = getProducts();
    const product = { ...products[index], index };
    openProductModal(product);
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = getProducts();
        products.splice(index, 1);
        saveProducts(products);
        loadProducts();
    }
}

// ==================== DISCOUNTS MANAGEMENT ====================

function loadDiscounts() {
    const discounts = getDiscounts();
    displayDiscounts(discounts);
}

function getDiscounts() {
    const discounts = localStorage.getItem('bfsumaDiscounts');
    return discounts ? JSON.parse(discounts) : [];
}

function saveDiscounts(discounts) {
    localStorage.setItem('bfsumaDiscounts', JSON.stringify(discounts));
    // Also update news section on main site
    updateMainSiteNews();
}

function displayDiscounts(discounts) {
    const container = document.getElementById('discountsList');
    
    if (discounts.length === 0) {
        container.innerHTML = '<p class="empty-state">No discounts added yet. Click "Add New Discount" to get started.</p>';
        return;
    }
    
    container.innerHTML = discounts.map((discount, index) => `
        <div class="discount-card">
            <div class="discount-header">
                <div>
                    <span class="discount-badge badge-${discount.type}">${discount.type.toUpperCase()}</span>
                    <h3 style="margin-top: 10px;">${discount.title}</h3>
                    <p style="color: var(--text-medium); margin-top: 5px;">${formatDate(discount.date)}</p>
                </div>
                <div class="discount-actions">
                    <button class="btn-secondary" onclick="editDiscount(${index})">Edit</button>
                    <button class="btn-secondary" onclick="deleteDiscount(${index})" style="background: var(--danger-color); color: white;">Delete</button>
                </div>
            </div>
            <p>${discount.description}</p>
        </div>
    `).join('');
}

function openDiscountModal(discount = null) {
    const modal = document.getElementById('discountModal');
    const form = document.getElementById('discountForm');
    const title = document.getElementById('discountModalTitle');
    
    if (discount) {
        title.textContent = 'Edit Discount';
        document.getElementById('discountTitle').value = discount.title;
        document.getElementById('discountType').value = discount.type;
        document.getElementById('discountDescription').value = discount.description;
        document.getElementById('discountDate').value = discount.date;
        form.dataset.editIndex = discount.index;
    } else {
        title.textContent = 'Add New Discount';
        form.reset();
        document.getElementById('discountDate').value = new Date().toISOString().split('T')[0];
        delete form.dataset.editIndex;
    }
    
    modal.classList.add('active');
}

function closeDiscountModal() {
    document.getElementById('discountModal').classList.remove('active');
    document.getElementById('discountForm').reset();
    delete document.getElementById('discountForm').dataset.editIndex;
}

function handleDiscountSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const discounts = getDiscounts();
    
    const discount = {
        title: document.getElementById('discountTitle').value,
        type: document.getElementById('discountType').value,
        description: document.getElementById('discountDescription').value,
        date: document.getElementById('discountDate').value
    };
    
    if (form.dataset.editIndex !== undefined) {
        const index = parseInt(form.dataset.editIndex);
        discounts[index] = discount;
    } else {
        discounts.push(discount);
    }
    
    saveDiscounts(discounts);
    loadDiscounts();
    closeDiscountModal();
    alert('Discount saved successfully!');
}

function editDiscount(index) {
    const discounts = getDiscounts();
    const discount = { ...discounts[index], index };
    openDiscountModal(discount);
}

function deleteDiscount(index) {
    if (confirm('Are you sure you want to delete this discount?')) {
        const discounts = getDiscounts();
        discounts.splice(index, 1);
        saveDiscounts(discounts);
        loadDiscounts();
    }
}

// ==================== NEWS MANAGEMENT ====================

function loadNews() {
    const news = getNews();
    displayNews(news);
}

function getNews() {
    const news = localStorage.getItem('bfsumaNews');
    return news ? JSON.parse(news) : [];
}

function saveNews(news) {
    localStorage.setItem('bfsumaNews', JSON.stringify(news));
    updateMainSiteNews();
}

function displayNews(news) {
    const container = document.getElementById('newsList');
    
    if (news.length === 0) {
        container.innerHTML = '<p class="empty-state">No news items added yet. Click "Add New Update" to get started.</p>';
        return;
    }
    
    container.innerHTML = news.map((item, index) => `
        <div class="news-card-admin">
            <div class="news-header">
                <div>
                    <span class="news-badge badge-${item.type}">${item.type.toUpperCase()}</span>
                    <h3 style="margin-top: 10px;">${item.title}</h3>
                    <p style="color: var(--text-medium); margin-top: 5px;">${formatDate(item.date)}</p>
                </div>
                <div class="news-actions">
                    <button class="btn-secondary" onclick="editNews(${index})">Edit</button>
                    <button class="btn-secondary" onclick="deleteNews(${index})" style="background: var(--danger-color); color: white;">Delete</button>
                </div>
            </div>
            <p>${item.description}</p>
        </div>
    `).join('');
}

function openNewsModal(news = null) {
    const modal = document.getElementById('newsModal');
    const form = document.getElementById('newsForm');
    const title = document.getElementById('newsModalTitle');
    
    if (news) {
        title.textContent = 'Edit News & Update';
        document.getElementById('newsTitle').value = news.title;
        document.getElementById('newsType').value = news.type;
        document.getElementById('newsDescription').value = news.description;
        document.getElementById('newsDate').value = news.date;
        form.dataset.editIndex = news.index;
    } else {
        title.textContent = 'Add News & Update';
        form.reset();
        document.getElementById('newsDate').value = new Date().toISOString().split('T')[0];
        delete form.dataset.editIndex;
    }
    
    modal.classList.add('active');
}

function closeNewsModal() {
    document.getElementById('newsModal').classList.remove('active');
    document.getElementById('newsForm').reset();
    delete document.getElementById('newsForm').dataset.editIndex;
}

function handleNewsSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const news = getNews();
    
    const newsItem = {
        title: document.getElementById('newsTitle').value,
        type: document.getElementById('newsType').value,
        description: document.getElementById('newsDescription').value,
        date: document.getElementById('newsDate').value
    };
    
    if (form.dataset.editIndex !== undefined) {
        const index = parseInt(form.dataset.editIndex);
        news[index] = newsItem;
    } else {
        news.push(newsItem);
    }
    
    saveNews(news);
    loadNews();
    closeNewsModal();
    alert('News & Update saved successfully!');
}

function editNews(index) {
    const news = getNews();
    const newsItem = { ...news[index], index };
    openNewsModal(newsItem);
}

function deleteNews(index) {
    if (confirm('Are you sure you want to delete this news item?')) {
        const news = getNews();
        news.splice(index, 1);
        saveNews(news);
        loadNews();
    }
}

// Update main site news section
function updateMainSiteNews() {
    // This will be called when discounts/news are updated
    // The main site will read from localStorage
}

// ==================== UTILITY FUNCTIONS ====================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Make functions globally available
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editDiscount = editDiscount;
window.deleteDiscount = deleteDiscount;
window.editNews = editNews;
window.deleteNews = deleteNews;

