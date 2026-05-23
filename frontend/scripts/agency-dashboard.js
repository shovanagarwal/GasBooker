// Agency Dashboard JavaScript

// Global variables
let currentSection = 'dashboard';
let agencyData = null;
let selectedOrderId = null;

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');
const loadingOverlay = document.getElementById('loading-overlay');
const orderModal = document.getElementById('orderModal');
const inventoryModal = document.getElementById('inventoryModal');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadDashboardData();
});

// Initialize dashboard components
function initializeDashboard() {
    // Check authentication
    checkAuthentication();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionName = this.querySelector('a').getAttribute('data-section');
            showSection(sectionName);
        });
    });

    // Forms
    const profileForm = document.getElementById('profile-form');
    const inventoryForm = document.getElementById('inventory-form');
    const orderStatusFilter = document.getElementById('order-status-filter');
    const customerSearch = document.getElementById('customer-search');

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    if (inventoryForm) {
        inventoryForm.addEventListener('submit', handleInventoryAdd);
    }

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', function() {
            loadOrders(this.value);
        });
    }

    if (customerSearch) {
        customerSearch.addEventListener('input', function() {
            searchCustomers(this.value);
        });
    }

    // Real-time updates
    setInterval(refreshDashboardData, 60000); // Refresh every minute for agencies
}

// Check authentication
async function checkAuthentication() {
    try {
        const response = await fetch('/api/test/session', {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/';
            return;
        }

        const sessionData = await response.json();
        if (sessionData.user_type !== 'agency') {
            window.location.href = '/';
            return;
        }

        // Set agency name
        const agencyName = document.getElementById('agency-name');
        if (agencyName && sessionData.user_name) {
            agencyName.textContent = sessionData.user_name;
        }

    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/';
    }
}

// Show section
function showSection(sectionName) {
    // Update navigation
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('a').getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });

    // Update content sections
    contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${sectionName}-section`) {
            section.classList.add('active');
        }
    });

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'orders': 'Order Management',
        'inventory': 'Inventory Management',
        'customers': 'Customer Management',
        'profile': 'Agency Profile'
    };

    if (pageTitle) {
        pageTitle.textContent = titles[sectionName] || 'Dashboard';
    }

    currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
        case 'orders':
            loadOrders();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'profile':
            loadProfile();
            break;
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

// Load dashboard data
async function loadDashboardData() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/agency/dashboard', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
            updateRecentOrdersDisplay(data.recentOrders || []);
            // loadInventoryAlerts(); // Temporarily disabled
            agencyData = data;
        } else {
            showNotification('Failed to load dashboard data', 'error');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Error loading dashboard data', 'error');
    } finally {
        showLoading(false);
    }
}

// Update dashboard stats
function updateDashboardStats(data) {
    const totalOrdersCount = document.getElementById('total-orders-count');
    const pendingOrdersCount = document.getElementById('pending-orders-count');
    const monthlyRevenue = document.getElementById('monthly-revenue');
    const activeCustomersCount = document.getElementById('active-customers-count');

    // Check if data and stats exist
    if (!data || !data.stats) {
        console.error('Invalid data structure received:', data);
        return;
    }

    const stats = data.stats;
    
    if (totalOrdersCount) totalOrdersCount.textContent = stats.totalOrders || 0;
    if (pendingOrdersCount) pendingOrdersCount.textContent = stats.pendingOrders || 0;
    if (monthlyRevenue) monthlyRevenue.textContent = `₹${(stats.totalRevenue || 0).toLocaleString()}`;
    if (activeCustomersCount) activeCustomersCount.textContent = stats.totalCustomers || 0;
}

// Load recent orders for dashboard
async function loadRecentOrders() {
    const recentOrders = document.getElementById('recent-orders');
    if (!recentOrders) return;

    try {
        const response = await fetch('/api/agency/orders?limit=5', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateRecentOrdersDisplay(data.orders);
        } else {
            recentOrders.innerHTML = '<div class="loading-placeholder">Failed to load recent orders</div>';
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        recentOrders.innerHTML = '<div class="loading-placeholder">Error loading recent orders</div>';
    }
}

// Update recent orders display
function updateRecentOrdersDisplay(orders) {
    const recentOrders = document.getElementById('recent-orders');
    if (!recentOrders) return;

    if (!orders || orders.length === 0) {
        recentOrders.innerHTML = '<div class="loading-placeholder">No recent orders</div>';
        return;
    }

    recentOrders.innerHTML = orders.slice(0, 5).map(order => `
        <div class="order-preview-item" onclick="showOrderDetails('${order.id}')">
            <div class="order-preview-info">
                <div class="order-preview-customer">${order.customer_name}</div>
                <div class="order-preview-details">${order.cylinder_type} • ₹${order.total_amount.toFixed(2)}</div>
            </div>
            <div class="order-preview-status status-${order.status}">${order.status.replace('_', ' ')}</div>
        </div>
    `).join('');
}

// Load inventory alerts
async function loadInventoryAlerts() {
    const inventoryAlerts = document.getElementById('inventory-alerts');
    if (!inventoryAlerts) return;

    try {
        const response = await fetch('/api/agency/inventory', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateInventoryAlertsDisplay(data.inventory);
        } else {
            inventoryAlerts.innerHTML = '<div class="loading-placeholder">Failed to load inventory alerts</div>';
        }
    } catch (error) {
        console.error('Error loading inventory alerts:', error);
        inventoryAlerts.innerHTML = '<div class="loading-placeholder">Error loading inventory alerts</div>';
    }
}

// Update inventory alerts display
function updateInventoryAlertsDisplay(inventory) {
    const inventoryAlerts = document.getElementById('inventory-alerts');
    if (!inventoryAlerts) return;

    const alerts = inventory.filter(item => item.stock_status !== 'good');

    if (alerts.length === 0) {
        inventoryAlerts.innerHTML = '<div class="loading-placeholder">No inventory alerts</div>';
        return;
    }

    inventoryAlerts.innerHTML = alerts.slice(0, 5).map(alert => `
        <div class="inventory-alert-item">
            <div class="alert-info">
                <div class="alert-product">${alert.cylinder_type} - ${alert.cylinder_capacity}kg</div>
                <div class="alert-stock">Stock: ${alert.stock} / Reorder: ${alert.reorder_level}</div>
            </div>
            <div class="alert-level alert-${alert.stock_status}">${alert.stock_status.toUpperCase()}</div>
        </div>
    `).join('');
}

// Load orders
async function loadOrders(status = 'all') {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    ordersList.innerHTML = '<div class="loading-placeholder">Loading orders...</div>';

    try {
        const url = status === 'all' ? '/api/agency/orders' : `/api/agency/orders?status=${status}`;
        const response = await fetch(url, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateOrdersList(data.orders);
        } else {
            ordersList.innerHTML = '<div class="loading-placeholder">Failed to load orders</div>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersList.innerHTML = '<div class="loading-placeholder">Error loading orders</div>';
    }
}

// Update orders list
function updateOrdersList(orders) {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<div class="loading-placeholder">No orders found</div>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item" onclick="showOrderDetails('${order.id}')">
            <div class="order-customer">
                <div class="customer-name">${order.customer_name}</div>
                <div class="customer-phone">${order.customer_phone}</div>
            </div>
            <div class="order-product">
                <div class="product-name">${order.cylinder_type}</div>
                <div class="product-details">${order.cylinder_capacity}kg • Qty: ${order.quantity}</div>
            </div>
            <div class="order-dates">
                <div class="order-date">Ordered: ${order.order_date}</div>
                <div class="delivery-date">Delivery: ${order.delivery_date}</div>
            </div>
            <div class="order-status status-${order.status}">${order.status.replace('_', ' ')}</div>
            <div class="order-amount">₹${order.total_amount.toFixed(2)}</div>
        </div>
    `).join('');
}

// Load inventory
// Load inventory
async function loadInventory() {
    const inventoryList = document.getElementById('inventory-list');
    const totalStockCount = document.getElementById('total-stock-count');
    const totalStockValue = document.getElementById('total-stock-value');
    const lowStockCount = document.getElementById('low-stock-count');

    if (inventoryList) {
        inventoryList.innerHTML = '<div class="loading-placeholder">Loading inventory...</div>';
    }

    try {
        const response = await fetch('/api/agency/inventory', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            
            // Calculate summary stats
            const inventory = data.inventory;
            let totalStock = 0;
            let totalValue = 0;
            let lowStockItems = 0;
            
            inventory.forEach(item => {
                const stock = item.available_stock || 0;
                totalStock += stock;
                totalValue += stock * (item.price || 0);
                if (stock <= (item.reorder_level || 50)) {
                    lowStockItems++;
                }
            });
            
            // Update stats
            if (totalStockCount) totalStockCount.textContent = totalStock;
            if (totalStockValue) totalStockValue.textContent = `₹${totalValue.toFixed(2)}`;
            if (lowStockCount) lowStockCount.textContent = lowStockItems;
            
            // Update inventory list
            updateInventoryList(data.inventory);
        } else {
            if (inventoryList) {
                inventoryList.innerHTML = '<div class="loading-placeholder">Failed to load inventory</div>';
            }
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        if (inventoryList) {
            inventoryList.innerHTML = '<div class="loading-placeholder">Error loading inventory</div>';
        }
    }
}

// Update inventory list
function updateInventoryList(inventory) {
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryList) return;

    if (!inventory || inventory.length === 0) {
        inventoryList.innerHTML = '<div class="loading-placeholder">No inventory items found</div>';
        return;
    }

    inventoryList.innerHTML = inventory.map(item => {
        const stock = item.available_stock || 0;
        const reorderLevel = item.reorder_level || 50;
        const maxCapacity = item.max_capacity || 1000;
        const capacityPercentage = Math.round((stock / maxCapacity) * 100);
        
        let stockStatus = 'success';
        if (stock <= reorderLevel) {
            stockStatus = stock === 0 ? 'critical' : 'warning';
        }
        
        return `
        <div class="inventory-item">
            <div class="inventory-product">
                <div class="product-type">${item.cylinder_type || ''}</div>
                <div class="product-capacity">${item.capacity || 0}kg</div>
            </div>
            <div class="stock-info">
                <div class="stock-count">${stock}</div>
                <div class="stock-label">In Stock</div>
            </div>
            <div class="stock-info">
                <div class="stock-count">${item.reserved_stock || 0}</div>
                <div class="stock-label">Reserved</div>
            </div>
            <div class="stock-info">
                <div class="stock-count ${stockStatus === 'critical' ? 'text-danger' : stockStatus === 'warning' ? 'text-warning' : 'text-success'}">${capacityPercentage}%</div>
                <div class="stock-progress">
                    <div class="stock-progress-bar stock-${stockStatus}" style="width: ${capacityPercentage}%"></div>
                </div>
            </div>
            <div class="stock-info">
                <div class="stock-count">₹${(item.price || 0).toFixed(2)}</div>
                <div class="stock-label">Unit Price</div>
            </div>
        </div>
        `;
    }).join('');
}

// Load customers
async function loadCustomers() {
    const customersList = document.getElementById('customers-list');
    if (!customersList) return;

    customersList.innerHTML = '<div class="loading-placeholder">Loading customers...</div>';

    try {
        const response = await fetch('/api/agency/customers', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateCustomersList(data.customers);
        } else {
            customersList.innerHTML = '<div class="loading-placeholder">Failed to load customers</div>';
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        customersList.innerHTML = '<div class="loading-placeholder">Error loading customers</div>';
    }
}

// Update customers list
function updateCustomersList(customers) {
    const customersList = document.getElementById('customers-list');
    if (!customersList) return;

    if (!customers || customers.length === 0) {
        customersList.innerHTML = '<div class="loading-placeholder">No customers found</div>';
        return;
    }

    customersList.innerHTML = customers.map(customer => `
        <div class="customer-item">
            <div class="customer-basic">
                <div class="customer-name-full">${customer.name}</div>
                <div class="customer-contact">${customer.phone} • ${customer.email}</div>
            </div>
            <div class="customer-stats">
                <div class="stat-number">${customer.total_orders}</div>
                <div class="stat-label">Orders</div>
            </div>
            <div class="customer-stats">
                <div class="stat-number">₹${customer.total_spent.toFixed(2)}</div>
                <div class="stat-label">Spent</div>
            </div>
            <div class="customer-stats">
                <div class="stat-number">${customer.last_order_date}</div>
                <div class="stat-label">Last Order</div>
            </div>
            <div class="customer-segment segment-${customer.segment}">${customer.segment}</div>
        </div>
    `).join('');
}

// Search customers
function searchCustomers(query) {
    const customerItems = document.querySelectorAll('.customer-item');
    
    customerItems.forEach(item => {
        const customerName = item.querySelector('.customer-name-full').textContent.toLowerCase();
        const customerContact = item.querySelector('.customer-contact').textContent.toLowerCase();
        
        if (customerName.includes(query.toLowerCase()) || customerContact.includes(query.toLowerCase())) {
            item.style.display = 'grid';
        } else {
            item.style.display = 'none';
        }
    });
}

// Load profile
async function loadProfile() {
    try {
        const response = await fetch('/api/agency/profile', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateProfileForm(data.profile);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Update profile form
function updateProfileForm(profile) {
    const agencyNameInput = document.getElementById('agency-name-input');
    const agencyEmail = document.getElementById('agency-email');
    const agencyPhone = document.getElementById('agency-phone');
    const agencyLicense = document.getElementById('agency-license');
    const agencyAddress = document.getElementById('agency-address');

    if (agencyNameInput) agencyNameInput.value = profile.agency_name || '';
    if (agencyEmail) agencyEmail.value = profile.email || '';
    if (agencyPhone) agencyPhone.value = profile.contact_number || '';
    if (agencyLicense) agencyLicense.value = profile.license_number || '';
    if (agencyAddress) agencyAddress.value = profile.address || '';
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        agency_name: formData.get('name'),
        email: formData.get('email'),
        contact_number: formData.get('phone'),
        license_number: formData.get('license'),
        address: formData.get('address')
    };

    showLoading(true);

    try {
        const response = await fetch('/api/agency/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(profileData)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Error updating profile. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Show add inventory modal
function showAddInventoryModal() {
    inventoryModal.classList.add('show');
}

// Close inventory modal
function closeInventoryModal() {
    inventoryModal.classList.remove('show');
    document.getElementById('inventory-form').reset();
}

// Handle inventory add
async function handleInventoryAdd(e) {
    e.preventDefault();
    // Implementation for adding inventory
    showNotification('Feature coming soon!', 'info');
    closeInventoryModal();
}

// Add inventory stock
function addInventoryStock() {
    const form = document.getElementById('inventory-form');
    if (form.checkValidity()) {
        handleInventoryAdd({ target: form, preventDefault: () => {} });
    } else {
        showNotification('Please fill all required fields', 'error');
    }
}

// Show order details modal
function showOrderDetails(orderId) {
    selectedOrderId = orderId;
    // Implementation for showing order details
    orderModal.classList.add('show');
    
    // Load order details
    loadOrderDetails(orderId);
}

// Close order modal
function closeOrderModal() {
    orderModal.classList.remove('show');
    selectedOrderId = null;
}

// Load order details
async function loadOrderDetails(orderId) {
    const orderDetails = document.getElementById('order-details');
    if (!orderDetails) return;

    orderDetails.innerHTML = '<div class="loading-placeholder">Loading order details...</div>';

    try {
        // For now, show placeholder content
        orderDetails.innerHTML = `
            <div class="order-detail-info">
                <h4>Order #${orderId.substring(0, 8)}</h4>
                <p>Order details will be loaded here...</p>
                <div class="status-update-section">
                    <label for="status-select">Update Status:</label>
                    <select id="status-select">
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading order details:', error);
        orderDetails.innerHTML = '<div class="loading-placeholder">Error loading order details</div>';
    }
}

// Update order status
async function updateOrderStatus() {
    const statusSelect = document.getElementById('status-select');
    if (!statusSelect || !selectedOrderId) return;

    const newStatus = statusSelect.value;

    try {
        const response = await fetch(`/api/agency/order/${selectedOrderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('Order status updated successfully!', 'success');
            closeOrderModal();
            // Refresh orders list
            loadOrders();
        } else {
            showNotification(result.message || 'Failed to update order status', 'error');
        }
    } catch (error) {
        console.error('Order status update error:', error);
        showNotification('Error updating order status. Please try again.', 'error');
    }
}

// Refresh dashboard data
async function refreshDashboardData() {
    if (currentSection === 'dashboard') {
        loadDashboardData();
    }
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('open');
}

// Logout function
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }
}

// Show loading overlay
function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px'
    });

    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#2ecc71';
            break;
        case 'error':
            notification.style.backgroundColor = '#e74c3c';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f39c12';
            break;
        default:
            notification.style.backgroundColor = '#3498db';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Expose functions globally
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.showOrderDetails = showOrderDetails;
window.closeOrderModal = closeOrderModal;
window.updateOrderStatus = updateOrderStatus;
window.showAddInventoryModal = showAddInventoryModal;
window.closeInventoryModal = closeInventoryModal;
window.addInventoryStock = addInventoryStock;