document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    const sunIcon = themeSwitch.querySelector('[data-lucide="sun"]');
    const moonIcon = themeSwitch.querySelector('[data-lucide="moon"]');

    // Function to set the theme
    const setTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline-block';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark');
            sunIcon.style.display = 'inline-block';
            moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'light');
        }
    };

    // Check for saved theme in local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Default to dark theme if no theme is saved
        setTheme('dark');
    }

    // Event listener for the theme switch button
    if(themeSwitch) {
      themeSwitch.addEventListener('click', () => {
          if (body.classList.contains('dark')) {
              setTheme('light');
          } else {
              setTheme('dark');
          }
      });
    }

    // Enhanced Modal System
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal');

    const customerLoginForm = document.getElementById('customer-login-form');
    const customerRegisterForm = document.getElementById('customer-register-form');
    const agencyLoginForm = document.getElementById('agency-login-form');
    const agencyRegisterForm = document.getElementById('agency-register-form');

    const showCustomerRegisterBtn = document.getElementById('show-customer-register');
    const showCustomerLoginBtn = document.getElementById('show-customer-login');
    const showAgencyRegisterBtn = document.getElementById('show-agency-register');
    const showAgencyLoginBtn = document.getElementById('show-agency-login');

    const showForm = (formElement) => {
        if(!formElement) return;
        
        // Hide all forms
        const allForms = [customerLoginForm, customerRegisterForm, agencyLoginForm, agencyRegisterForm];
        allForms.forEach(form => {
            if(form) form.style.display = 'none';
        });

        // Show selected form with animation
        formElement.style.display = 'block';
        formElement.style.opacity = '0';
        formElement.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            formElement.style.transition = 'all 0.3s ease';
            formElement.style.opacity = '1';
            formElement.style.transform = 'translateY(0)';
        });
    };

    const openModal = (formType) => {
        if (formType === 'customer') {
            showForm(customerLoginForm);
        } else if (formType === 'agency') {
            showForm(agencyLoginForm);
        }
        
        // Add modal opening animation
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    const closeModalFunc = () => {
        authModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
        
        // Reset all forms after modal closes
        setTimeout(() => {
            const allForms = [customerLoginForm, customerRegisterForm, agencyLoginForm, agencyRegisterForm];
            allForms.forEach(form => {
                if(form) {
                    form.style.display = 'none';
                    form.style.transition = '';
                }
            });
        }, 300);
    };

    // Button event listeners
    const bookCustomerBtn = document.getElementById('book-customer-btn');
    if(bookCustomerBtn) bookCustomerBtn.addEventListener('click', () => openModal('customer'));
    
    const agencyPortalBtn = document.getElementById('agency-portal-btn');
    if(agencyPortalBtn) agencyPortalBtn.addEventListener('click', () => openModal('agency'));

    const registerAgencyBtn = document.getElementById('register-agency-btn');
    if(registerAgencyBtn) registerAgencyBtn.addEventListener('click', () => openModal('agency'));

    const bookNowBtn = document.getElementById('book-now-btn');
    if(bookNowBtn) bookNowBtn.addEventListener('click', () => openModal('customer'));

    // Form switching
    if(showCustomerRegisterBtn) showCustomerRegisterBtn.addEventListener('click', () => showForm(customerRegisterForm));
    if(showCustomerLoginBtn) showCustomerLoginBtn.addEventListener('click', () => showForm(customerLoginForm));
    if(showAgencyRegisterBtn) showAgencyRegisterBtn.addEventListener('click', () => showForm(agencyRegisterForm));
    if(showAgencyLoginBtn) showAgencyLoginBtn.addEventListener('click', () => showForm(agencyLoginForm));

    // Modal close events
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModalFunc);

    // Close on backdrop click
    window.addEventListener('click', (event) => {
        if (event.target === authModal) {
            closeModalFunc();
        }
    });

    // Close on Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && authModal.classList.contains('active')) {
            closeModalFunc();
        }
    });

    // Login logic
    const handleLogin = async (event, userType) => {
        event.preventDefault();
        const email = document.getElementById(`${userType}-email`).value;
        const password = document.getElementById(`${userType}-password`).value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, userType }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store user session data
                sessionStorage.setItem('user_id', data.user_id);
                sessionStorage.setItem('user_type', data.user_type);
                sessionStorage.setItem('user_name', data.user_name);
                
                alert('Login successful!');
                // Redirect based on user type
                if (userType === 'customer') {
                    window.location.href = 'dashboard.html';
                } else if (userType === 'agency') {
                    window.location.href = 'agency-portal.html';
                }
            } else {
                alert(data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    };
    
    // Registration logic
    const handleRegister = async (event, userType) => {
        event.preventDefault();
        const nameField = document.getElementById(`${userType}-register-name`);
        const emailField = document.getElementById(`${userType}-register-email`);
        const passwordField = document.getElementById(`${userType}-register-password`);
        
        if (!nameField || !emailField || !passwordField) {
            alert('Registration form not found. Please refresh the page.');
            return;
        }
        
        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const password = passwordField.value.trim();
        
        // Validation
        if (!name || !email || !password) {
            alert('Please fill in all required fields.');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        
        const payload = { 
            name: name,
            email: email, 
            password: password, 
            userType: userType,
            phone: '',  // Default empty values for optional fields
            address: ''
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('Registration response:', data); // Debug log

            if (response.ok && data.success) {
                alert('Registration successful! Please log in.');
                // Clear the registration form
                nameField.value = '';
                emailField.value = '';
                passwordField.value = '';
                
                // Switch to login form
                if (userType === 'customer') {
                    showForm(customerLoginForm);
                } else if (userType === 'agency') {
                    showForm(agencyLoginForm);
                }
            } else {
                alert(data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration.');
        }
    };

    if(customerLoginForm) customerLoginForm.querySelector('form').addEventListener('submit', (e) => handleLogin(e, 'customer'));
    if(agencyLoginForm) agencyLoginForm.querySelector('form').addEventListener('submit', (e) => handleLogin(e, 'agency'));
    if(customerRegisterForm) customerRegisterForm.querySelector('form').addEventListener('submit', (e) => handleRegister(e, 'customer'));
    if(agencyRegisterForm) agencyRegisterForm.querySelector('form').addEventListener('submit', (e) => handleRegister(e, 'agency'));

    const contactSupportBtn = document.getElementById('contact-support-btn');
    if(contactSupportBtn) contactSupportBtn.addEventListener('click', () => {
        window.location.href = 'mailto:support@gasbook.com';
    });

    // Emergency support button
    const emergencySupportBtn = document.getElementById('emergency-support-btn');
    if(emergencySupportBtn) emergencySupportBtn.addEventListener('click', () => {
        window.location.href = 'tel:1800-123-4567';
    });

    // Live chat button
    const liveChatBtn = document.getElementById('live-chat-btn');
    if(liveChatBtn) liveChatBtn.addEventListener('click', () => {
        alert('Live chat feature coming soon!');
    });

    // Smooth scrolling for anchor links
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

    // Add loading animation to buttons on form submit
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Re-enable after 3 seconds (for demo purposes)
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
});