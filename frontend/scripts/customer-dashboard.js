// Customer Dashboard JavaScript

// Global variables
let currentSection = 'dashboard';
let customerData = null;
let availableCylinders = [];
let selectedCylinder = null;
let savedAddresses = [];
let bookingStep = 1;

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');
const loadingOverlay = document.getElementById('loading-overlay');

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
    
    // Set minimum date for booking form
    const deliveryDateInput = document.getElementById('delivery-date');
    if (deliveryDateInput) {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Tomorrow as minimum date
        deliveryDateInput.min = today.toISOString().split('T')[0];
    }
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
    const bookingForm = document.getElementById('booking-form');
    const profileForm = document.getElementById('profile-form');
    const orderStatusFilter = document.getElementById('order-status-filter');

    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
        
        // Add event listeners for price updates
        const cylinderSelect = document.getElementById('cylinder-type');
        const quantityInput = document.getElementById('quantity');
        const bookingTypeRadios = document.querySelectorAll('input[name="booking_type"]');
        
        if (cylinderSelect) {
            cylinderSelect.addEventListener('change', updatePriceSummary);
        }
        if (quantityInput) {
            quantityInput.addEventListener('input', updatePriceSummary);
        }
        bookingTypeRadios.forEach(radio => {
            radio.addEventListener('change', updatePriceSummary);
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', function() {
            loadOrders(this.value);
        });
    }

    // Booking type change
    const bookingTypeRadios = document.querySelectorAll('input[name="booking_type"]');
    bookingTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleDeliveryFields(this.value);
        });
    });

    // Quantity change
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', updatePriceSummary);
    }

    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterCylinders(this.dataset.type);
        });
    });

    // Real-time updates
    setInterval(refreshDashboardData, 30000); // Refresh every 30 seconds
}

// Check authentication
async function checkAuthentication() {
    try {
        const response = await fetch('/api/test/session', {
            credentials: 'include'
        });

        if (!response.ok) {
            // Not authenticated, redirect to home
            window.location.href = '/';
            return;
        }

        const sessionData = await response.json();
        if (sessionData.user_type !== 'customer') {
            // Wrong user type
            window.location.href = '/';
            return;
        }

        // Set user name
        const userName = document.getElementById('user-name');
        if (userName && sessionData.user_name) {
            userName.textContent = sessionData.user_name;
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
        'orders': 'My Orders',
        'book-cylinder': 'Book New Cylinder',
        'payments': 'Payment History',
        'profile': 'My Profile'
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
        case 'payments':
            loadPayments();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'book-cylinder':
            loadBookingSection();
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
        const response = await fetch('/api/customer/dashboard', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                updateDashboardStats(data.stats);
                updateRecentActivity(data.recent_activity);
                updateCustomerInfo(data.customer);
                customerData = data;
            } else {
                // Handle authentication errors
                if (data.message.includes('log in')) {
                    showNotification('Please log in to access your dashboard', 'error');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    showNotification(data.message, 'error');
                }
            }
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
function updateDashboardStats(stats) {
    const activeOrdersCount = document.getElementById('active-orders-count');
    const totalOrdersCount = document.getElementById('total-orders-count');
    const totalSpentAmount = document.getElementById('total-spent-amount');
    const loyaltyPoints = document.getElementById('loyalty-points');

    if (activeOrdersCount) activeOrdersCount.textContent = stats.active_orders || 0;
    if (totalOrdersCount) totalOrdersCount.textContent = stats.total_orders || 0;
    if (totalSpentAmount) totalSpentAmount.textContent = `₹${(stats.total_spent || 0).toFixed(2)}`;
    if (loyaltyPoints) loyaltyPoints.textContent = stats.loyalty_points || 0;
}

// Update customer information in the UI
function updateCustomerInfo(customer) {
    const userNameElement = document.getElementById('user-name');
    
    if (userNameElement && customer) {
        userNameElement.textContent = customer.name || 'Customer';
    }
    
    // Store customer data globally for use in other functions
    if (customer) {
        window.currentCustomer = customer;
    }
}

// Update recent activity
function updateRecentActivity(activities) {
    const activityList = document.getElementById('recent-activity');
    if (!activityList) return;

    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<div class="loading-placeholder">No recent activity</div>';
        return;
    }

    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${getActivityIcon(activity.type)}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.type}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${formatDateTime(activity.date)}</div>
            </div>
        </div>
    `).join('');
}

// Get activity icon
function getActivityIcon(type) {
    const icons = {
        'Order Pending': '⏳',
        'Order Confirmed': '✅',
        'Order In Transit': '🚚',
        'Order Delivered': '📦',
        'Payment Complete': '💳',
        'Order Cancelled': '❌'
    };
    return icons[type] || '📋';
}

// Load orders
async function loadOrders(status = 'all') {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    ordersList.innerHTML = '<div class="loading-placeholder">Loading orders...</div>';

    try {
        const url = status === 'all' ? '/api/customer/orders' : `/api/customer/orders?status=${status}`;
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                updateOrdersList(data.orders);
            } else {
                ordersList.innerHTML = '<div class="loading-placeholder">Failed to load orders</div>';
            }
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

    ordersList.innerHTML = orders.map(order => {
        const statusClass = getStatusClass(order.display_status);
        const statusText = getStatusText(order.display_status);
        const paymentBadge = getPaymentBadge(order);
        
        return `
            <div class="order-item" data-status="${order.display_status}">
                <div class="order-header">
                    <div class="order-id">Order #${order.id.toString().substring(0, 8)}</div>
                    <div class="order-badges">
                        ${paymentBadge}
                        <div class="order-status ${statusClass}">${statusText}</div>
                    </div>
                </div>
                <div class="order-content">
                    <div class="order-details">
                        <h4>${order.cylinder_type.toUpperCase()} Cylinder</h4>
                        <p>${order.cylinder_capacity}kg • Quantity: ${order.quantity}</p>
                        <p class="order-type">${order.booking_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
                        ${order.delivery_address ? `<p class="order-address">📍 ${order.delivery_address}</p>` : ''}
                    </div>
                    <div class="order-meta">
                        <div class="order-date">Ordered: ${formatDate(order.order_date)}</div>
                        ${order.delivery_date ? `<div class="order-date">Delivery: ${formatDate(order.delivery_date)}</div>` : ''}
                        <div class="order-amount">₹${order.total_amount.toFixed(2)}</div>
                    </div>
                </div>
                <div class="order-actions">
                    ${getOrderActions(order)}
                </div>
            </div>
        `;
    }).join('');
}

// Get status CSS class
function getStatusClass(status) {
    const statusClasses = {
        'pending_payment': 'status-pending',
        'confirmed': 'status-confirmed',
        'in_transit': 'status-transit',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
}

// Get human-readable status text
function getStatusText(status) {
    const statusTexts = {
        'pending_payment': 'Payment Pending',
        'confirmed': 'Confirmed',
        'in_transit': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusTexts[status] || status.replace('_', ' ');
}

// Get payment badge HTML
function getPaymentBadge(order) {
    if (order.is_paid) {
        return '<div class="payment-badge paid">💳 Paid Online</div>';
    } else if (order.payment_method === 'cash') {
        return '<div class="payment-badge cash">💵 Cash on Delivery</div>';
    }
    return '';
}

// Get order actions based on status and payment
function getOrderActions(order) {
    let actions = [];
    
    if (order.display_status === 'delivered') {
        // Delivered orders: Always show invoice, show reorder option
        actions.push('<button class="btn-action" onclick="downloadInvoice(\'' + order.id + '\')">📄 Invoice</button>');
        actions.push('<button class="btn-action" onclick="reorderItem(\'' + order.id + '\')">🔄 Reorder</button>');
        
        // For cash payments, show mark as paid option
        if (!order.is_paid) {
            actions.push('<button class="btn-action secondary" onclick="markPaid(\'' + order.id + '\')">✅ Mark as Paid</button>');
        }
    } else if (order.display_status === 'in_transit') {
        // In transit orders: Show tracking, allow cancellation if not paid yet
        actions.push('<button class="btn-action" onclick="trackOrder(\'' + order.id + '\')">📍 Track Order</button>');
        actions.push('<button class="btn-action" onclick="contactDelivery(\'' + order.id + '\')">📞 Contact Delivery</button>');
        
        // Show invoice for paid orders
        if (order.is_paid) {
            actions.push('<button class="btn-action" onclick="downloadInvoice(\'' + order.id + '\')">📄 Invoice</button>');
        }
        
        // Allow cancellation only for unpaid orders
        if (!order.is_paid) {
            actions.push('<button class="btn-action cancel" onclick="cancelOrder(\'' + order.id + '\')">❌ Cancel</button>');
        }
    } else if (order.display_status === 'confirmed') {
        // Confirmed orders: Show invoice for paid orders, allow cancellation for all
        if (order.is_paid) {
            actions.push('<button class="btn-action" onclick="downloadInvoice(\'' + order.id + '\')">📄 Invoice</button>');
        }
        
        // Allow cancellation for all confirmed orders (paid and unpaid)
        actions.push('<button class="btn-action cancel" onclick="cancelOrder(\'' + order.id + '\')">❌ Cancel</button>');
        
    } else if (order.display_status === 'pending_payment') {
        // Pending payment (cash orders): Show pay now and cancel options
        actions.push('<button class="btn-action primary" onclick="payNow(\'' + order.id + '\')">💳 Pay Now</button>');
        actions.push('<button class="btn-action cancel" onclick="cancelOrder(\'' + order.id + '\')">❌ Cancel</button>');
    } else if (order.display_status === 'cancelled') {
        // Cancelled orders: Show reorder option only
        actions.push('<button class="btn-action" onclick="reorderItem(\'' + order.id + '\')">🔄 Reorder</button>');
    }
    
    return actions.join(' ');
}

// Load payments
async function loadPayments() {
    const paymentsList = document.getElementById('payments-list');
    const yearlySpent = document.getElementById('yearly-spent');
    const totalSavings = document.getElementById('total-savings');

    if (paymentsList) {
        paymentsList.innerHTML = '<div class="loading-placeholder">Loading payments...</div>';
    }

    try {
        const response = await fetch('/api/customer/payments', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                // Update stats
                if (yearlySpent) yearlySpent.textContent = `₹${data.stats.yearly_spent.toFixed(2)}`;
                if (totalSavings) totalSavings.textContent = `₹${data.stats.total_savings.toFixed(2)}`;
                
                // Update payments list
                updatePaymentsList(data.transactions);
            } else {
                // Handle authentication errors
                if (data.message.includes('log in')) {
                    if (paymentsList) {
                        paymentsList.innerHTML = '<div class="loading-placeholder">Please log in to view payment history</div>';
                    }
                } else {
                    if (paymentsList) {
                        paymentsList.innerHTML = `<div class="loading-placeholder">${data.message}</div>`;
                    }
                }
            }
        } else {
            if (paymentsList) {
                paymentsList.innerHTML = '<div class="loading-placeholder">Failed to load payments</div>';
            }
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        if (paymentsList) {
            paymentsList.innerHTML = '<div class="loading-placeholder">Error loading payments</div>';
        }
    }
}

// Update payments list
function updatePaymentsList(payments) {
    const paymentsList = document.getElementById('payments-list');
    if (!paymentsList) return;

    if (!payments || payments.length === 0) {
        paymentsList.innerHTML = '<div class="loading-placeholder">No payment history found</div>';
        return;
    }

    paymentsList.innerHTML = payments.map(payment => `
        <div class="payment-item">
            <div class="payment-info">
                <div class="payment-description">${payment.description}</div>
                <div class="payment-date">${payment.date}</div>
                <div class="payment-method">${payment.payment_mode} • ${payment.status}</div>
            </div>
            <div class="payment-amount">₹${payment.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

// Load profile
async function loadProfile() {
    try {
        const response = await fetch('/api/customer/profile', {
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
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileSegment = document.getElementById('profile-segment');
    const profileAddress = document.getElementById('profile-address');

    if (profileName) profileName.value = profile.name || '';
    if (profileEmail) profileEmail.value = profile.email || '';
    if (profilePhone) profilePhone.value = profile.phone || '';
    if (profileSegment) profileSegment.value = profile.segment || 'residential';
    if (profileAddress) profileAddress.value = profile.address || '';
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        cylinder_type: formData.get('cylinder_type'),
        cylinder_size: formData.get('cylinder_size'),
        quantity: parseInt(formData.get('quantity')),
        booking_type: formData.get('booking_type'),
        delivery_address: formData.get('delivery_address'),
        delivery_date: formData.get('delivery_date')
    };

    showLoading(true);

    try {
        const response = await fetch('/api/customer/book-cylinder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('Cylinder booked successfully!', 'success');
            e.target.reset();
            // Refresh dashboard data
            loadDashboardData();
            // Switch to orders section
            showSection('orders');
        } else {
            showNotification(result.message || 'Failed to book cylinder', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showNotification('Error booking cylinder. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        segment: formData.get('segment'),
        address: formData.get('address')
    };

    showLoading(true);

    try {
        const response = await fetch('/api/customer/profile', {
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
            
            // Redirect to home regardless of response
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            // Redirect anyway
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

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Load booking section with cylinder types
async function loadBookingSection() {
    await loadCylinderTypes();
}

// Load available cylinder types from database
async function loadCylinderTypes() {
    const cylinderSelect = document.getElementById('cylinder-type');
    
    if (!cylinderSelect) {
        console.error('Cylinder select element not found');
        return;
    }
    
    // Show loading state
    cylinderSelect.innerHTML = '<option value="">Loading cylinder types...</option>';
    
    try {
        const response = await fetch('/api/cylinders', {
            credentials: 'include'
        });

        console.log('Cylinder API response:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Cylinders data:', data);
            
            // Handle both direct array and wrapped object response formats
            const cylinders = Array.isArray(data) ? data : (data.cylinders || []);
            
            // Store cylinder data globally for price calculations
            window.cylindersData = cylinders;
            
            // Clear loading and add default option
            cylinderSelect.innerHTML = '<option value="">Select Cylinder Type</option>';
            
            if (cylinders && cylinders.length > 0) {
                // Get unique cylinder types from database - handle both 'type' and 'cylinder_type' fields
                const uniqueTypes = [...new Set(cylinders.map(cylinder => cylinder.type || cylinder.cylinder_type))];
                console.log('Unique types:', uniqueTypes);
                
                uniqueTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                    cylinderSelect.appendChild(option);
                });
                
                console.log('Cylinder dropdown populated with', uniqueTypes.length, 'types');
            } else {
                cylinderSelect.innerHTML = '<option value="">No cylinder types available</option>';
            }
        } else {
            console.error('Failed to load cylinders, status:', response.status);
            cylinderSelect.innerHTML = '<option value="">Failed to load cylinder types</option>';
            showNotification('Failed to load cylinder types', 'error');
        }
    } catch (error) {
        console.error('Error loading cylinder types:', error);
        cylinderSelect.innerHTML = '<option value="">Failed to load cylinder types</option>';
        showNotification('Error loading cylinder types', 'error');
    }
}

// Enhanced booking form submission with payment processing
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        cylinder_type: formData.get('cylinder_type'),
        quantity: parseInt(formData.get('quantity')),
        booking_type: formData.get('booking_type'),
        delivery_address: formData.get('delivery_address'),
        delivery_date: formData.get('delivery_date'),
        special_instructions: formData.get('special_instructions') || '',
        payment_mode: formData.get('payment_mode')
    };

    // Validate required fields
    if (!bookingData.cylinder_type) {
        showNotification('Please select a cylinder type', 'error');
        return;
    }

    if (bookingData.booking_type === 'delivery' && !bookingData.delivery_address) {
        showNotification('Please enter delivery address', 'error');
        return;
    }

    // Show payment modal for online payments
    if (bookingData.payment_mode !== 'cash') {
        showPaymentModal(bookingData);
        return;
    }

    // Process cash on delivery booking directly
    await processBooking(bookingData);
}

// Show payment modal
function showPaymentModal(bookingData) {
    const modal = document.getElementById('payment-modal');
    const amountElement = document.getElementById('modal-payment-amount');
    const methodText = document.getElementById('payment-method-text');
    const formContainer = document.getElementById('payment-form-container');
    
    // Calculate total amount
    const cylinderCost = getCylinderPrice(bookingData.cylinder_type) * bookingData.quantity;
    const deliveryCharge = bookingData.booking_type === 'delivery' ? 50 : 0;
    const totalAmount = cylinderCost + deliveryCharge;
    
    amountElement.textContent = `₹${totalAmount}`;
    methodText.textContent = `Payment Method: ${getPaymentMethodName(bookingData.payment_mode)}`;
    
    // Generate payment form based on method
    formContainer.innerHTML = generatePaymentForm(bookingData.payment_mode);
    
    // Store booking data for later use
    window.currentBookingData = bookingData;
    
    modal.classList.add('show');
}

// Generate payment form based on payment method
function generatePaymentForm(paymentMode) {
    switch(paymentMode) {
        case 'card':
            return `
                <div class="payment-form">
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" 
                               onkeyup="formatCardNumber(this)" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input type="text" placeholder="MM/YY" maxlength="5" 
                                   onkeyup="formatExpiry(this)" required>
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="text" placeholder="123" maxlength="3" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" placeholder="Enter name on card" required>
                    </div>
                </div>
            `;
        case 'upi':
            return `
                <div class="payment-form">
                    <div class="form-group">
                        <label>UPI ID</label>
                        <input type="text" placeholder="yourname@paytm" required>
                    </div>
                    <div class="upi-options">
                        <button type="button" class="upi-btn" onclick="selectUPI('phonepe')">
                            📱 PhonePe
                        </button>
                        <button type="button" class="upi-btn" onclick="selectUPI('gpay')">
                            🟢 Google Pay
                        </button>
                        <button type="button" class="upi-btn" onclick="selectUPI('paytm')">
                            💙 Paytm
                        </button>
                    </div>
                </div>
            `;
        case 'netbanking':
            return `
                <div class="payment-form">
                    <div class="form-group">
                        <label>Select Your Bank</label>
                        <select required>
                            <option value="">Choose your bank</option>
                            <option value="sbi">State Bank of India</option>
                            <option value="hdfc">HDFC Bank</option>
                            <option value="icici">ICICI Bank</option>
                            <option value="axis">Axis Bank</option>
                            <option value="kotak">Kotak Mahindra Bank</option>
                            <option value="pnb">Punjab National Bank</option>
                        </select>
                    </div>
                </div>
            `;
        default:
            return '<p>Cash on Delivery - No additional details required</p>';
    }
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('show');
    window.currentBookingData = null;
}

// Confirm payment and process booking
async function confirmPayment() {
    if (!window.currentBookingData) return;
    
    const paymentForm = document.querySelector('#payment-form-container .payment-form');
    if (paymentForm && !validatePaymentForm(paymentForm)) {
        showNotification('Please fill all payment details', 'error');
        return;
    }
    
    closePaymentModal();
    await processBooking(window.currentBookingData);
}

// Validate payment form
function validatePaymentForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    for (let input of inputs) {
        if (!input.value.trim()) {
            return false;
        }
    }
    return true;
}

// Process booking with payment
async function processBooking(bookingData) {
    showLoading(true);

    try {
        const response = await fetch('/api/customer/book-cylinder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('Booking successful!', 'success');
            
            // Reset form
            document.getElementById('booking-form').reset();
            
            // Show invoice if payment was made online
            if (result.payment && result.payment.invoice_url) {
                setTimeout(() => {
                    showInvoice(result.booking.id);
                }, 1000);
            }
            
            // Refresh dashboard data
            loadDashboardData();
            
            // Switch to orders section after a delay
            setTimeout(() => {
                showSection('orders');
            }, result.payment ? 3000 : 1500);
            
        } else {
            showNotification(result.message || 'Failed to process booking', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showNotification('Error processing booking. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Show invoice modal
async function showInvoice(bookingId) {
    try {
        const response = await fetch(`/api/customer/invoice/${bookingId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const invoiceData = await response.json();
            displayInvoice(invoiceData);
        } else {
            showNotification('Failed to load invoice', 'error');
        }
    } catch (error) {
        console.error('Invoice error:', error);
        showNotification('Error loading invoice', 'error');
    }
}

// Display invoice in modal
function displayInvoice(invoiceData) {
    const modal = document.getElementById('invoice-modal');
    const content = document.getElementById('invoice-content');
    
    content.innerHTML = `
        <div class="invoice-header">
            <div class="invoice-logo">
                <h2>⛽ Gas Wala</h2>
            </div>
            <div class="invoice-title">
                <h3>INVOICE</h3>
                <div class="invoice-number">#${invoiceData.invoice_number}</div>
            </div>
        </div>
        
        <div class="invoice-details">
            <div class="invoice-section">
                <h4>Bill To:</h4>
                <p><strong>${invoiceData.customer.name}</strong></p>
                <p>${invoiceData.customer.email}</p>
                <p>${invoiceData.customer.phone || ''}</p>
                <p>${invoiceData.booking.delivery_address}</p>
            </div>
            <div class="invoice-section">
                <h4>Invoice Details:</h4>
                <p><strong>Date:</strong> ${formatDate(invoiceData.payment.payment_date)}</p>
                <p><strong>Payment Method:</strong> ${getPaymentMethodName(invoiceData.payment.payment_mode)}</p>
                <p><strong>Transaction ID:</strong> ${invoiceData.payment.transaction_id}</p>
                <p><strong>Status:</strong> Paid</p>
            </div>
        </div>
        
        <div class="invoice-items">
            <h4>Order Details:</h4>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${invoiceData.cylinder.cylinder_type.toUpperCase()} Cylinder (${invoiceData.cylinder.capacity}kg)</td>
                        <td class="text-right">${invoiceData.booking.quantity}</td>
                        <td class="text-right">₹${invoiceData.cylinder.price}</td>
                        <td class="text-right">₹${(invoiceData.cylinder.price * invoiceData.booking.quantity).toFixed(2)}</td>
                    </tr>
                    ${invoiceData.booking.delivery_charge > 0 ? `
                    <tr>
                        <td>Delivery Charge</td>
                        <td class="text-right">1</td>
                        <td class="text-right">₹${invoiceData.booking.delivery_charge}</td>
                        <td class="text-right">₹${invoiceData.booking.delivery_charge}</td>
                    </tr>` : ''}
                </tbody>
            </table>
        </div>
        
        <div class="invoice-total">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${(invoiceData.booking.total_amount - (invoiceData.booking.delivery_charge || 0)).toFixed(2)}</span>
            </div>
            ${invoiceData.booking.delivery_charge > 0 ? `
            <div class="total-row">
                <span>Delivery Charge:</span>
                <span>₹${invoiceData.booking.delivery_charge}</span>
            </div>` : ''}
            <div class="total-row">
                <span><strong>Total Amount:</strong></span>
                <span><strong>₹${invoiceData.booking.total_amount}</strong></span>
            </div>
        </div>
        
        <div class="invoice-footer">
            <p>Thank you for choosing Gas Wala!</p>
            <p>For support, contact us at +91-88096-02437 or email kishoreutsav@gaswala.com</p>
        </div>
        
        <div class="invoice-actions">
            <button class="btn secondary" onclick="downloadInvoice('${invoiceData.booking.id}')">📄 Download PDF</button>
            <button class="btn primary" onclick="closeInvoiceModal()">Close</button>
        </div>
    `;
    
    modal.classList.add('show');
}

// Close invoice modal
function closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    modal.classList.remove('show');
}

// Download invoice PDF
function downloadInvoice(bookingId) {
    // Show loading notification
    showNotification('Generating invoice PDF...', 'info');
    
    // Open PDF in new tab
    const pdfWindow = window.open(`/api/customer/invoice/${bookingId}/pdf`, '_blank');
    
    // Check if popup was blocked
    if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed == 'undefined') {
        showNotification('Pop-up blocked. Please allow pop-ups and try again.', 'error');
        return;
    }
    
    // Show success notification after a delay
    setTimeout(() => {
        showNotification('Invoice PDF generated successfully!', 'success');
    }, 1000);
}

// Helper functions
function getCylinderPrice(cylinderType) {
    // Get price from loaded cylinder data or use fallback
    if (window.cylindersData) {
        const cylinder = window.cylindersData.find(c => 
            (c.type || c.cylinder_type) === cylinderType
        );
        if (cylinder) return cylinder.price;
    }
    
    // Fallback prices
    const prices = {
        'domestic': 450,
        'commercial': 850,
        'industrial': 1200
    };
    return prices[cylinderType] || 450;
}

function getPaymentMethodName(mode) {
    const names = {
        'cash': 'Cash on Delivery',
        'card': 'Credit/Debit Card',
        'upi': 'UPI Payment',
        'netbanking': 'Net Banking'
    };
    return names[mode] || mode;
}

// Format card number input
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ');
    input.value = formattedValue.trim();
}

// Format expiry date input
function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

// Select UPI method
function selectUPI(method) {
    const upiButtons = document.querySelectorAll('.upi-btn');
    upiButtons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

// Update price summary when form changes
function updatePriceSummary() {
    const cylinderType = document.getElementById('cylinder-type').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const bookingType = document.querySelector('input[name="booking_type"]:checked')?.value;
    
    if (!cylinderType) return;
    
    const cylinderCost = getCylinderPrice(cylinderType) * quantity;
    const deliveryCharge = bookingType === 'delivery' ? 50 : 0;
    const totalAmount = cylinderCost + deliveryCharge;
    
    document.getElementById('cylinder-cost').textContent = `₹${cylinderCost}`;
    document.getElementById('delivery-charge').textContent = `₹${deliveryCharge}`;
    document.getElementById('total-amount').textContent = `₹${totalAmount}`;
}

// Order action handlers
function trackOrder(orderId) {
    showNotification('Order tracking feature coming soon!', 'info');
}

function contactDelivery(orderId) {
    showNotification('Contacting delivery partner...', 'info');
}

function modifyOrder(orderId) {
    showNotification('Order modification feature coming soon!', 'info');
}

function cancelOrder(orderId) {
    // Show custom cancellation modal
    showCancellationModal(orderId);
}

function showCancellationModal(orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content cancel-modal">
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order?</p>
            <div class="cancel-reason-container">
                <label for="cancelReason">Reason for cancellation:</label>
                <select id="cancelReason" class="form-control">
                    <option value="Changed mind">Changed my mind</option>
                    <option value="Found better deal">Found a better deal</option>
                    <option value="Delivery too late">Delivery is too late</option>
                    <option value="Payment issues">Payment issues</option>
                    <option value="Wrong item ordered">Ordered wrong item</option>
                    <option value="Emergency">Emergency situation</option>
                    <option value="Other">Other reason</option>
                </select>
                <textarea id="customReason" class="form-control" placeholder="Please specify other reason..." style="display: none; margin-top: 10px;"></textarea>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeCancellationModal()">Keep Order</button>
                <button class="btn-danger" onclick="confirmCancellation('${orderId}')">Cancel Order</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show custom reason textarea when "Other" is selected
    const reasonSelect = document.getElementById('cancelReason');
    const customReasonTextarea = document.getElementById('customReason');
    
    reasonSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            customReasonTextarea.style.display = 'block';
            customReasonTextarea.required = true;
        } else {
            customReasonTextarea.style.display = 'none';
            customReasonTextarea.required = false;
            customReasonTextarea.value = '';
        }
    });
}

function closeCancellationModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

async function confirmCancellation(orderId) {
    const reasonSelect = document.getElementById('cancelReason');
    const customReasonTextarea = document.getElementById('customReason');
    
    let reason = reasonSelect.value;
    if (reason === 'Other') {
        const customReason = customReasonTextarea.value.trim();
        if (!customReason) {
            showNotification('Please specify the reason for cancellation', 'error');
            return;
        }
        reason = customReason;
    }
    
    try {
        // Show loading state
        const confirmBtn = document.querySelector('.btn-danger');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Cancelling...';
        confirmBtn.disabled = true;
        
        const response = await fetch(`/api/customer/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: reason })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            closeCancellationModal();
            // Refresh orders list
            await loadOrders();
        } else {
            showNotification(data.message || 'Failed to cancel order', 'error');
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
        }
    } catch (error) {
        console.error('Cancel order error:', error);
        showNotification('Network error. Please try again.', 'error');
        const confirmBtn = document.querySelector('.btn-danger');
        confirmBtn.textContent = 'Cancel Order';
        confirmBtn.disabled = false;
    }
}

function reorderItem(orderId) {
    showNotification('Reorder feature coming soon!', 'info');
}

function markPaid(orderId) {
    if (confirm('Mark this cash payment as completed?')) {
        showNotification('Payment marking feature coming soon!', 'info');
    }
}

function payOnline(orderId) {
    showNotification('Online payment for existing orders coming soon!', 'info');
}

// Quantity change function
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value) || 1;
    const newValue = Math.max(1, Math.min(5, currentValue + delta));
    quantityInput.value = newValue;
    
    // Update price summary when quantity changes
    updatePriceSummary();
}

// Enhanced date formatting
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return dateString;
    }
}

// Toggle delivery fields based on booking type
function toggleDeliveryFields(bookingType) {
    const deliveryGroup = document.getElementById('delivery-address-group');
    if (deliveryGroup) {
        if (bookingType === 'pickup') {
            deliveryGroup.style.display = 'none';
            document.getElementById('delivery-address').required = false;
        } else {
            deliveryGroup.style.display = 'block';
            document.getElementById('delivery-address').required = true;
        }
    }
}

// Expose functions globally
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.changeQuantity = changeQuantity;