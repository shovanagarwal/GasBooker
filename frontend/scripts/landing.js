// Landing Page JavaScript

// Global variables
let currentUserType = 'customer';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const toggleBtns = document.querySelectorAll('.toggle-btn');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeUserTypeToggle();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // User type toggle buttons
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setUserType(this.getAttribute('data-type'));
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            closeLoginModal();
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize user type toggle
function initializeUserTypeToggle() {
    setUserType('customer'); // Default to customer
}

// Show login modal
function showLoginModal(userType = null) {
    if (userType) {
        setUserType(userType);
    }
    loginModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close login modal
function closeLoginModal() {
    loginModal.classList.remove('show');
    document.body.style.overflow = '';
    resetForm();
}

// Set user type
function setUserType(type) {
    currentUserType = type;
    
    // Update toggle button states
    toggleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-type') === type) {
            btn.classList.add('active');
        }
    });
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        userType: currentUserType
    };

    // Show loading state
    const submitBtn = loginForm.querySelector('.login-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Success - redirect based on user type
            showNotification('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                if (currentUserType === 'customer') {
                    window.location.href = '/customer';
                } else if (currentUserType === 'agency') {
                    window.location.href = '/agency';
                }
            }, 1500);
        } else {
            // Error - show message
            showNotification(result.message || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Reset form
function resetForm() {
    if (loginForm) {
        loginForm.reset();
    }
}

// Toggle mobile menu
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-open');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
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

    // Set background color based on type
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

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.feature-card, .step, .contact-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-in');
        }
    });
}

// Initialize scroll animations
window.addEventListener('scroll', handleScrollAnimations);

// Contact form handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name') || this.querySelector('input[type="text"]').value;
        const email = formData.get('email') || this.querySelector('input[type="email"]').value;
        const message = formData.get('message') || this.querySelector('textarea').value;
        
        // Simulate form submission
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        this.reset();
    });
}

// Keyboard navigation for modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && loginModal.classList.contains('show')) {
        closeLoginModal();
    }
});

// Add CSS animations for scroll effects
const style = document.createElement('style');
style.textContent = `
    .feature-card, .step, .contact-item {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .feature-card.animate-in, .step.animate-in, .contact-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .nav-links.mobile-open {
        display: flex !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    @media (max-width: 768px) {
        .nav-links {
            display: none;
        }
    }
`;
document.head.appendChild(style);

// Initialize animations on load
window.addEventListener('load', function() {
    handleScrollAnimations();
});

// Expose functions globally for onclick handlers
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.toggleMenu = toggleMenu;