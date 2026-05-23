from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_from_directory, make_response
from flask_cors import CORS
import sqlite3
from datetime import datetime, timedelta
import os
import hashlib

app = Flask(__name__, static_folder='../frontend', static_url_path='/static')
CORS(app)
app.secret_key = 'your-secret-key-here'

DATABASE = 'gas_booking.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with tables if they don't exist"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Read and execute the SQL file
    with open('../init_db_sqlite.sql', 'r') as f:
        sql_script = f.read()
        cursor.executescript(sql_script)
    
    # Insert sample data
    insert_sample_data(cursor)
    
    conn.commit()
    conn.close()

def insert_sample_data(cursor):
    """Insert sample data for testing"""
    try:
        # Check if data already exists
        existing_agencies = cursor.execute('SELECT COUNT(*) FROM agencies').fetchone()[0]
        if existing_agencies > 0:
            return  # Data already exists
        
        # Sample agencies
        agencies = [
            ('agency-001', 'Gas Wala Central', 'central@gaswala.com', hashlib.md5('password'.encode()).hexdigest(), '9876543210', 'Central District, City'),
            ('agency-002', 'Quick Gas Service', 'quick@gasservice.com', hashlib.md5('password'.encode()).hexdigest(), '9876543211', 'North Zone, City')
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO agencies (id, agency_name, email, password, contact_number, address)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', agencies)
        
        # Sample customers
        customers = [
            ('cust-001', 'John Doe', '9123456789', 'john@example.com', 'Sector 1, City', hashlib.md5('password'.encode()).hexdigest()),
            ('cust-002', 'Jane Smith', '9123456788', 'jane@example.com', 'Sector 2, City', hashlib.md5('password'.encode()).hexdigest())
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO customers (id, name, phone_number, email, address, password)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', customers)
        
        # Sample cylinders
        cylinders = [
            ('cyl-001', 'Generic', 'domestic', 14.2, 850.00, 'Standard domestic cylinder for home use'),
            ('cyl-002', 'Generic', 'domestic', 14.2, 845.00, 'Premium domestic cylinder with safety valve'),
            ('cyl-003', 'Generic', 'domestic', 14.2, 855.00, 'High quality domestic cylinder'),
            ('cyl-004', 'Generic', 'commercial', 19.0, 1200.00, 'Commercial grade gas cylinder'),
            ('cyl-005', 'Generic', 'domestic', 5.0, 450.00, 'Small domestic cylinder for portable use')
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO cylinders (id, brand, cylinder_type, capacity, price, description)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', cylinders)
        
        # Sample supplies (stock for agencies)
        supplies = [
            ('supply-001', 'agency-001', 'cyl-001', 25, 0, 0, 10, 100),
            ('supply-002', 'agency-001', 'cyl-002', 20, 0, 0, 10, 100),
            ('supply-003', 'agency-001', 'cyl-003', 15, 0, 0, 10, 100),
            ('supply-004', 'agency-001', 'cyl-004', 12, 0, 0, 5, 50),
            ('supply-005', 'agency-001', 'cyl-005', 30, 0, 0, 15, 100),
            ('supply-006', 'agency-002', 'cyl-001', 18, 0, 0, 10, 100),
            ('supply-007', 'agency-002', 'cyl-002', 22, 0, 0, 10, 100)
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO supplies (id, agency_id, cylinder_id, stock, reserved_stock, damaged_stock, reorder_level, max_capacity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', supplies)
        
        # Sample bookings
        bookings = [
            ('book-001', 'cust-001', 'agency-001', 'cyl-001', '2024-01-15 10:30:00', '2024-01-16', 'morning', 'Home', '', 'delivered', 'delivery', 1, 850.00),
            ('book-002', 'cust-001', 'agency-001', 'cyl-002', '2024-01-20 14:15:00', '2024-01-21', 'afternoon', 'Home', '', 'delivered', 'delivery', 1, 845.00),
            ('book-003', 'cust-002', 'agency-002', 'cyl-001', '2024-01-25 09:45:00', '2024-01-26', 'evening', 'Office', '', 'in_transit', 'delivery', 1, 850.00),
            ('book-004', 'cust-001', 'agency-001', 'cyl-003', '2024-01-28 16:20:00', '2024-01-29', 'morning', 'Home', 'Handle with care', 'pending', 'delivery', 1, 855.00)
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO bookings (id, customer_id, agency_id, cylinder_id, booking_date, delivery_date, delivery_time, delivery_address, special_instructions, status, booking_type, quantity, total_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', bookings)
        
        # Sample payments
        payments = [
            ('pay-001', 'book-001', 'cust-001', '2024-01-16 11:00:00', 850.00, 'cash', 'completed'),
            ('pay-002', 'book-002', 'cust-001', '2024-01-21 15:30:00', 845.00, 'upi', 'completed'),
            ('pay-003', 'book-003', 'cust-002', '2024-01-26 10:15:00', 850.00, 'card', 'completed')
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO payments (id, booking_id, customer_id, payment_date, amount, payment_mode, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', payments)
        
    except Exception as e:
        print(f"Error inserting sample data: {e}")

# Initialize database on startup
init_db()

# Routes for pages
@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/register')
def register_page():
    return send_from_directory('../frontend', 'register.html')

@app.route('/debug-registration')
def debug_registration():
    return send_from_directory('../frontend', 'debug-registration.html')

@app.route('/simple-register')
def simple_register():
    return send_from_directory('../frontend', 'simple-register.html')

@app.route('/customer')
def customer_dashboard():
    return send_from_directory('../frontend/pages', 'customer-dashboard.html')

@app.route('/agency')
def agency_dashboard():
    return app.send_static_file('pages/agency-dashboard.html')

@app.route('/dashboard')
def dashboard():
    return render_template('customer.html')

# Authentication APIs
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType')
    
    if not email or not password or not user_type:
        return jsonify({'success': False, 'message': 'All fields are required'})
    
    conn = get_db_connection()
    
    # Hash the password
    password_hash = hashlib.md5(password.encode()).hexdigest()
    
    try:
        if user_type == 'customer':
            user = conn.execute('SELECT * FROM customers WHERE email = ? AND password = ?', 
                              (email, password_hash)).fetchone()
        else:  # agency
            user = conn.execute('SELECT * FROM agencies WHERE email = ? AND password = ?', 
                              (email, password_hash)).fetchone()
        
        if user:
            session['user_id'] = user['id']
            session['user_type'] = user_type
            session['user_email'] = email
            return jsonify({'success': True, 'userType': user_type})
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/test/session', methods=['GET'])
def test_session():
    """Test endpoint to check if user session is valid"""
    if 'user_id' in session:
        # Get user name from database
        conn = get_db_connection()
        user_name = "User"
        try:
            if session.get('user_type') == 'customer':
                user = conn.execute('SELECT name FROM customers WHERE id = ?', (session['user_id'],)).fetchone()
                if user:
                    user_name = user['name']
            else:
                user = conn.execute('SELECT agency_name FROM agencies WHERE id = ?', (session['user_id'],)).fetchone()
                if user:
                    user_name = user['agency_name']
        finally:
            conn.close()
            
        return jsonify({
            'success': True,
            'user_id': session['user_id'],
            'user_type': session.get('user_type'),
            'user_email': session.get('user_email'),
            'user_name': user_name
        })
    else:
        return jsonify({'success': False, 'message': 'No active session'})

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Enhanced registration endpoint for customers and agencies"""
    data = request.get_json()
    
    # Extract common fields
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    user_type = data.get('userType', '').strip()
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()
    
    # Basic validation
    if not name or not email or not password or not user_type:
        return jsonify({'success': False, 'message': 'Name, email, password, and user type are required'})
    
    if user_type not in ['customer', 'agency']:
        return jsonify({'success': False, 'message': 'Invalid user type'})
    
    # Email validation
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return jsonify({'success': False, 'message': 'Invalid email format'})
    
    # Password validation
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long'})
    
    conn = get_db_connection()
    
    try:
        # Check if email already exists (in both tables)
        customer_exists = conn.execute('SELECT id FROM customers WHERE email = ?', (email,)).fetchone()
        agency_exists = conn.execute('SELECT id FROM agencies WHERE email = ?', (email,)).fetchone()
        
        if customer_exists or agency_exists:
            return jsonify({'success': False, 'message': 'Email already registered'})
        
        # Hash the password
        password_hash = hashlib.md5(password.encode()).hexdigest()
        
        # Generate unique ID
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
        
        if user_type == 'customer':
            # Customer-specific fields
            date_of_birth = data.get('dateOfBirth', None)
            
            customer_id = f'cust-{timestamp}'
            conn.execute('''
                INSERT INTO customers (id, name, phone_number, email, address, password, date_of_birth, 
                                     loyalty_points, customer_segment, total_spent, total_orders, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (customer_id, name, phone, email, address, password_hash, date_of_birth,
                  0, 'regular', 0.0, 0, datetime.now().isoformat()))
            
            print(f"✅ Customer registered: {customer_id} - {name} ({email})")
            
        else:  # agency
            # Agency-specific fields
            license_number = data.get('licenseNumber', '')
            agency_type = data.get('agencyType', 'retail')  # retail, wholesale, distributor
            
            agency_id = f'agency-{timestamp}'
            conn.execute('''
                INSERT INTO agencies (id, user_id, agency_name, address, contact_number, email, 
                                    password, license_number, service_areas, operating_hours, 
                                    delivery_charges, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (agency_id, None, name, address, phone, email, password_hash, license_number,
                  '["Local Area"]',  # Default service area as JSON
                  '{"monday_friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "15:00"}, "sunday": {"closed": true}}',
                  '{"standard": 50, "emergency": 150, "free_above": 1000}',  # Default delivery charges
                  datetime.now().isoformat()))
            
            print(f"✅ Agency registered: {agency_id} - {name} ({email})")
        
        conn.commit()
        
        return jsonify({
            'success': True, 
            'message': f'{user_type.title()} registration successful! You can now log in.',
            'userType': user_type
        })
    
    except Exception as e:
        conn.rollback()
        print(f"❌ Registration error: {str(e)}")
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'})
    
    finally:
        conn.close()

@app.route('/logout', methods=['POST'])
def logout():
    """Logout user by clearing session"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

# Customer Dashboard APIs
@app.route('/api/customer/dashboard')
def customer_dashboard_data():
    # Check if user is logged in and is a customer
    if 'user_id' not in session or session.get('user_type') != 'customer':
        return jsonify({'success': False, 'message': 'Please log in to access dashboard'})
    
    customer_id = session.get('user_id')
    print(f"Dashboard request for customer: {customer_id}")  # Debug log
    
    try:
        conn = get_db_connection()
        
        # Get customer information
        customer = conn.execute('SELECT * FROM customers WHERE id = ?', (customer_id,)).fetchone()
        if not customer:
            return jsonify({'success': False, 'message': 'Customer not found'})
        
        # Get recent activity/orders for THIS customer only
        recent_activity = conn.execute('''
            SELECT b.id, b.status as type, b.booking_date as date,
                   'Order #' || b.id || ' - ' || c.cylinder_type || ' ' || c.capacity || 'kg' as description
            FROM bookings b
            JOIN cylinders c ON b.cylinder_id = c.id
            WHERE b.customer_id = ?
            ORDER BY b.booking_date DESC
            LIMIT 5
        ''', (customer_id,)).fetchall()
        
        # Get total orders count for THIS customer
        total_orders = conn.execute('SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?', (customer_id,)).fetchone()['count']
        
        # Get active orders count for THIS customer (pending, confirmed, in_transit)
        active_orders = conn.execute('''
            SELECT COUNT(*) as count FROM bookings 
            WHERE customer_id = ? AND status IN ("pending", "confirmed", "in_transit")
        ''', (customer_id,)).fetchone()['count']
        
        # Calculate total spent for THIS customer
        total_spent = conn.execute('''
            SELECT COALESCE(SUM(total_amount), 0) as total 
            FROM bookings 
            WHERE customer_id = ? AND status = "delivered"
        ''', (customer_id,)).fetchone()['total']
        
        # Get loyalty points for THIS customer
        loyalty_points = customer['loyalty_points'] if customer['loyalty_points'] else 0
        
        return jsonify({
            'success': True,
            'customer': {
                'id': customer['id'],
                'name': customer['name'],
                'email': customer['email'],
                'phone': customer['phone_number'],
                'loyalty_points': loyalty_points
            },
            'stats': {
                'active_orders': active_orders,
                'total_orders': total_orders,
                'total_spent': float(total_spent),
                'loyalty_points': loyalty_points
            },
            'recent_activity': [
                {
                    'type': 'Order ' + row['type'].title(),
                    'description': row['description'],
                    'date': row['date']
                } for row in recent_activity
            ]
        })
    
    except Exception as e:
        print(f"Dashboard error for customer {customer_id}: {str(e)}")
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/customer/orders')
def customer_orders():
    try:
        if 'user_id' not in session or session.get('user_type') != 'customer':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        conn = get_db_connection()
        
        # Get orders for the logged-in customer with payment information
        orders = conn.execute('''
            SELECT b.id, b.quantity, b.total_amount, b.status, b.booking_date as order_date, 
                   b.delivery_date, b.booking_type, b.delivery_address, b.payment_mode,
                   c.cylinder_type, c.capacity as cylinder_capacity, c.brand,
                   p.status as payment_status, p.transaction_id
            FROM bookings b
            JOIN cylinders c ON b.cylinder_id = c.id
            LEFT JOIN payments p ON b.id = p.booking_id AND p.payment_mode != 'refund'
            WHERE b.customer_id = ?
            ORDER BY b.booking_date DESC
        ''', (session['user_id'],)).fetchall()
        
        # Process orders to determine display status
        processed_orders = []
        for order in orders:
            order_dict = dict(order)
            
            # Determine the display status based on payment and booking status
            if order['payment_mode'] and order['payment_mode'] != 'cash':
                # Online payment - show order status, not payment status
                if order['status'] == 'confirmed':
                    order_dict['display_status'] = 'confirmed'
                elif order['status'] == 'in_transit':
                    order_dict['display_status'] = 'in_transit'
                elif order['status'] == 'delivered':
                    order_dict['display_status'] = 'delivered'
                else:
                    order_dict['display_status'] = order['status']
            else:
                # Cash on delivery - show payment pending until delivered
                if order['status'] == 'delivered':
                    order_dict['display_status'] = 'delivered'
                elif order['status'] in ['pending_payment', 'confirmed', 'in_transit']:
                    order_dict['display_status'] = 'pending_payment'
                else:
                    order_dict['display_status'] = order['status']
            
            # Add payment information
            order_dict['is_paid'] = bool(order['payment_mode'] and order['payment_mode'] != 'cash')
            order_dict['payment_method'] = order['payment_mode'] or 'cash'
            
            processed_orders.append(order_dict)
        
        return jsonify({
            'success': True,
            'orders': processed_orders
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/customer/payments')
def customer_payments():
    # Check if user is logged in and is a customer
    if 'user_id' not in session or session.get('user_type') != 'customer':
        return jsonify({'success': False, 'message': 'Please log in to access payments'})
    
    customer_id = session.get('user_id')
    print(f"Payments request for customer: {customer_id}")  # Debug log
    
    try:
        conn = get_db_connection()
        
        # Get payment stats for THIS customer only
        current_year = datetime.now().year
        yearly_spent = conn.execute('''
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM payments 
            WHERE customer_id = ? AND strftime('%Y', payment_date) = ?
        ''', (customer_id, str(current_year))).fetchone()['total']
        
        # Calculate total savings for THIS customer (mock calculation)
        total_orders = conn.execute('SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?', (customer_id,)).fetchone()['count']
        total_savings = total_orders * 25.50  # Mock savings per order
        
        # Get payment transactions for THIS customer only
        payments = conn.execute('''
            SELECT p.id, p.amount, p.payment_mode, p.status, p.payment_date as date,
                   'Payment for Order #' || p.booking_id as description
            FROM payments p
            WHERE p.customer_id = ?
            ORDER BY p.payment_date DESC
            LIMIT 20
        ''', (customer_id,)).fetchall()
        
        return jsonify({
            'success': True,
            'stats': {
                'yearly_spent': float(yearly_spent),
                'total_savings': float(total_savings)
            },
            'transactions': [dict(payment) for payment in payments]
        })
    
    except Exception as e:
        print(f"Payments error for customer {customer_id}: {str(e)}")
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

# Agency Dashboard APIs
@app.route('/api/agency/dashboard')
def agency_dashboard_data():
    try:
        print(f"Session data: {dict(session)}")  # Debug: Print session data
        
        # Check authentication - allow both agency and admin access for now
        if 'user_id' not in session:
            print("❌ No user_id in session")  # Debug
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        print(f"✅ User authenticated: {session.get('user_id')}, Type: {session.get('user_type')}")  # Debug
        
        conn = get_db_connection()
        
        # Get stats
        total_orders = conn.execute('SELECT COUNT(*) as count FROM bookings').fetchone()['count']
        pending_orders = conn.execute('SELECT COUNT(*) as count FROM bookings WHERE status = "pending"').fetchone()['count']
        total_customers = conn.execute('SELECT COUNT(*) as count FROM customers').fetchone()['count']
        total_revenue = conn.execute('SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE status = "delivered"').fetchone()['total']
        
        # Get recent orders
        recent_orders = conn.execute('''
            SELECT b.id, b.quantity, b.total_amount, b.status, b.booking_date,
                   c.cylinder_type, cust.name as customer_name, cust.phone_number as customer_phone
            FROM bookings b
            JOIN cylinders c ON b.cylinder_id = c.id
            JOIN customers cust ON b.customer_id = cust.id
            ORDER BY b.booking_date DESC
            LIMIT 5
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'stats': {
                'totalOrders': total_orders,
                'pendingOrders': pending_orders,
                'totalCustomers': total_customers,
                'totalRevenue': total_revenue
            },
            'recentOrders': [dict(order) for order in recent_orders]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/agency/orders')
def agency_orders():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'})
            
        conn = get_db_connection()
        
        orders = conn.execute('''
            SELECT b.id, b.quantity, b.total_amount, b.status, b.booking_date, b.delivery_date,
                   c.cylinder_type, c.price, cust.name as customer_name, cust.phone_number as customer_phone,
                   cust.address as customer_address
            FROM bookings b
            JOIN cylinders c ON b.cylinder_id = c.id
            JOIN customers cust ON b.customer_id = cust.id
            ORDER BY b.booking_date DESC
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'orders': [dict(order) for order in orders]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/agency/inventory')
def agency_inventory():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'})
            
        conn = get_db_connection()
        
        inventory = conn.execute('''
            SELECT 
                c.id,
                c.brand,
                c.cylinder_type,
                c.capacity,
                c.price,
                c.stock as total_stock,
                c.description,
                COALESCE(s.stock, 0) as available_stock,
                COALESCE(s.reserved_stock, 0) as reserved_stock,
                COALESCE(s.damaged_stock, 0) as damaged_stock,
                COALESCE(s.reorder_level, 50) as reorder_level,
                COALESCE(s.max_capacity, 1000) as max_capacity
            FROM cylinders c
            LEFT JOIN supplies s ON c.id = s.cylinder_id AND s.agency_id = 'agency-001'
            ORDER BY c.cylinder_type
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'inventory': [dict(item) for item in inventory]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/agency/customers')
def agency_customers():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'})
            
        conn = get_db_connection()
        
        # Get customers with their order stats
        customers = conn.execute('''
            SELECT c.id, c.name, c.email, c.phone_number, c.address, c.created_at,
                   COUNT(b.id) as total_orders,
                   COALESCE(SUM(b.total_amount), 0) as total_spent,
                   MAX(b.booking_date) as last_order_date
            FROM customers c
            LEFT JOIN bookings b ON c.id = b.customer_id
            GROUP BY c.id, c.name, c.email, c.phone_number, c.address, c.created_at
            ORDER BY c.created_at DESC
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'customers': [dict(customer) for customer in customers]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

# Order management APIs
@app.route('/api/agency/order/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'success': False, 'message': 'Status is required'})
        
        conn = get_db_connection()
        conn.execute('UPDATE bookings SET status = ? WHERE id = ?', (new_status, order_id))
        conn.commit()
        
        return jsonify({'success': True, 'message': 'Order status updated successfully'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

# Additional Customer API endpoints
@app.route('/api/customer/cylinders')
def get_customer_cylinders():
    """Get available cylinders for booking"""
    try:
        conn = get_db_connection()
        cylinders = conn.execute('''
            SELECT c.id, c.brand, c.cylinder_type, c.capacity, c.price, 
                   COALESCE(s.stock, 10) as stock
            FROM cylinders c
            LEFT JOIN supplies s ON c.id = s.cylinder_id
            WHERE c.is_active = 1
            ORDER BY c.cylinder_type, c.capacity
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'cylinders': [dict(row) for row in cylinders]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/customer/addresses')
def get_customer_addresses():
    """Get customer delivery addresses"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'customer':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        conn = get_db_connection()
        addresses = conn.execute('''
            SELECT * FROM customer_addresses 
            WHERE customer_id = ?
            ORDER BY is_default DESC, id
        ''', (session['user_id'],)).fetchall()
        
        return jsonify({
            'success': True,
            'addresses': [dict(row) for row in addresses]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/customer/book-cylinder', methods=['POST'])
def book_cylinder():
    """Book a gas cylinder with payment processing"""
    conn = None
    try:
        if 'user_id' not in session or session.get('user_type') != 'customer':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        data = request.get_json()
        cylinder_type = data.get('cylinder_type')
        quantity = data.get('quantity', 1)
        booking_type = data.get('booking_type', 'delivery')
        delivery_address = data.get('delivery_address', '')
        delivery_date = data.get('delivery_date')
        special_instructions = data.get('special_instructions', '')
        payment_mode = data.get('payment_mode', 'cash')  # New payment mode field
        
        if not cylinder_type:
            return jsonify({'success': False, 'message': 'Cylinder type is required'})
        
        if booking_type == 'delivery' and not delivery_address:
            return jsonify({'success': False, 'message': 'Delivery address is required for home delivery'})
        
        conn = get_db_connection()
        
        # Get available cylinder of the specified type
        cylinder = conn.execute('SELECT * FROM cylinders WHERE cylinder_type = ? AND stock > 0 LIMIT 1', 
                               (cylinder_type,)).fetchone()
        if not cylinder:
            return jsonify({'success': False, 'message': 'Selected cylinder type not available'})
        
        # Get or create a default agency for demo purposes
        agency = conn.execute('SELECT * FROM agencies LIMIT 1').fetchone()
        if not agency:
            # Create a default agency if none exists
            agency_id = f'agency-{datetime.now().strftime("%Y%m%d%H%M%S")}'
            conn.execute('''
                INSERT INTO agencies (id, agency_name, email, password, contact_number, address)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (agency_id, 'Default Gas Agency', 'agency@example.com', 
                  'default_hash', '9876543210', 'Default Address'))
            agency_id = agency_id
        else:
            agency_id = agency['id']
        
        # Calculate pricing
        cylinder_cost = cylinder['price'] * quantity
        delivery_charge = 50.0 if booking_type == 'delivery' else 0.0
        total_amount = cylinder_cost + delivery_charge
        
        # Create booking
        booking_id = f'book-{datetime.now().strftime("%Y%m%d%H%M%S%f")}'
        booking_status = 'confirmed' if payment_mode != 'cash' else 'pending_payment'
        
        conn.execute('''
            INSERT INTO bookings (id, customer_id, agency_id, cylinder_id, quantity, total_amount, 
                                delivery_address, delivery_date, delivery_time, preferred_time_slot,
                                special_instructions, booking_type, status, booking_date, delivery_charge,
                                payment_mode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (booking_id, session['user_id'], agency_id, cylinder['id'], quantity, total_amount, 
              delivery_address, delivery_date, 'morning', 'morning', special_instructions,
              booking_type, booking_status, datetime.now().isoformat(), delivery_charge, payment_mode))
        
        # Process payment if not cash on delivery
        payment_id = None
        if payment_mode != 'cash':
            payment_id = process_payment(conn, booking_id, session['user_id'], total_amount, payment_mode)
            if not payment_id:
                conn.rollback()
                return jsonify({'success': False, 'message': 'Payment processing failed'})
        
        # Update cylinder stock
        conn.execute('UPDATE cylinders SET stock = stock - ? WHERE id = ?', 
                    (quantity, cylinder['id']))
        
        conn.commit()
        
        # Generate response
        response_data = {
            'success': True, 
            'message': 'Cylinder booked successfully!',
            'booking': {
                'id': booking_id,
                'total_amount': total_amount,
                'cylinder_cost': cylinder_cost,
                'delivery_charge': delivery_charge,
                'status': booking_status,
                'cylinder_type': cylinder_type,
                'quantity': quantity,
                'payment_mode': payment_mode
            }
        }
        
        # Add payment info if paid online
        if payment_id:
            response_data['payment'] = {
                'id': payment_id,
                'status': 'completed',
                'invoice_url': f'/api/customer/invoice/{booking_id}'
            }
        
        return jsonify(response_data)
    
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()

def process_payment(conn, booking_id, customer_id, amount, payment_mode):
    """Process payment and return payment ID"""
    try:
        payment_id = f'pay-{datetime.now().strftime("%Y%m%d%H%M%S%f")}'
        transaction_id = f'txn-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        
        # Calculate loyalty points (1 point per ₹10 spent)
        loyalty_points = int(amount / 10)
        
        # Insert payment record
        conn.execute('''
            INSERT INTO payments (id, booking_id, customer_id, amount, payment_mode, 
                                status, transaction_id, loyalty_points_earned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (payment_id, booking_id, customer_id, amount, payment_mode, 
              'completed', transaction_id, loyalty_points))
        
        # Update customer loyalty points
        conn.execute('''
            UPDATE customers SET loyalty_points = loyalty_points + ?, 
                               total_spent = total_spent + ?,
                               total_orders = total_orders + 1
            WHERE id = ?
        ''', (loyalty_points, amount, customer_id))
        
        return payment_id
    except Exception as e:
        print(f"Payment processing error: {e}")
        return None

@app.route('/api/customer/invoice/<booking_id>')
def get_invoice(booking_id):
    """Generate invoice data for a booking"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'customer':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        conn = get_db_connection()
        
        # Get booking details with related data
        booking_data = conn.execute('''
            SELECT b.*, c.brand, c.cylinder_type, c.capacity, c.price,
                   cust.name as customer_name, cust.email as customer_email, cust.phone_number as customer_phone,
                   p.payment_date, p.payment_mode, p.transaction_id, p.amount as payment_amount,
                   a.agency_name
            FROM bookings b
            JOIN cylinders c ON b.cylinder_id = c.id
            JOIN customers cust ON b.customer_id = cust.id
            LEFT JOIN payments p ON b.id = p.booking_id
            LEFT JOIN agencies a ON b.agency_id = a.id
            WHERE b.id = ? AND b.customer_id = ?
        ''', (booking_id, session['user_id'])).fetchone()
        
        if not booking_data:
            return jsonify({'success': False, 'message': 'Invoice not found'})
        
        # Generate invoice number
        invoice_number = f"INV-{booking_id.split('-')[1]}"
        
        # Prepare invoice data
        invoice_data = {
            'invoice_number': invoice_number,
            'booking': {
                'id': booking_data['id'],
                'quantity': booking_data['quantity'],
                'total_amount': booking_data['total_amount'],
                'delivery_charge': booking_data['delivery_charge'] if booking_data['delivery_charge'] else 0,
                'delivery_address': booking_data['delivery_address'],
                'booking_date': booking_data['booking_date'],
                'status': booking_data['status']
            },
            'customer': {
                'name': booking_data['customer_name'],
                'email': booking_data['customer_email'],
                'phone': booking_data['customer_phone']
            },
            'cylinder': {
                'brand': 'Generic',
                'cylinder_type': booking_data['cylinder_type'],
                'capacity': booking_data['capacity'],
                'price': booking_data['price']
            },
            'payment': {
                'payment_date': booking_data['payment_date'],
                'payment_mode': booking_data['payment_mode'],
                'transaction_id': booking_data['transaction_id'],
                'amount': booking_data['payment_amount']
            } if booking_data['payment_date'] else None,
            'agency': {
                'name': booking_data['agency_name']
            }
        }
        
        return jsonify(invoice_data)
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()

@app.route('/api/customer/invoice/<booking_id>/pdf')
def download_invoice_pdf(booking_id):
    """Generate and download invoice as PDF"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'customer':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        # Get invoice data
        conn = get_db_connection()
        booking_data = conn.execute('''
            SELECT b.*, c.brand, c.cylinder_type, c.capacity, c.price,
                   cust.name as customer_name, cust.email as customer_email, cust.phone_number as customer_phone,
                   p.payment_date, p.payment_mode, p.transaction_id, p.amount as payment_amount,
                   a.agency_name
            FROM bookings b
            JOIN cylinders c ON b.cylinder_id = c.id
            JOIN customers cust ON b.customer_id = cust.id
            LEFT JOIN payments p ON b.id = p.booking_id
            LEFT JOIN agencies a ON b.agency_id = a.id
            WHERE b.id = ? AND b.customer_id = ?
        ''', (booking_id, session['user_id'])).fetchone()
        
        if not booking_data:
            return jsonify({'success': False, 'message': 'Invoice not found'})
        
        # Generate PDF content
        pdf_content = generate_pdf_invoice(dict(booking_data))
        
        # Return PDF as response
        response = make_response(pdf_content)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=invoice-{booking_id}.pdf'
        
        return response
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()

def generate_pdf_invoice(booking_data):
    """Generate professional PDF invoice using ReportLab"""
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from io import BytesIO
    from datetime import datetime
    
    # Create a bytes buffer to store PDF
    buffer = BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor('#e67e22'),
        alignment=1  # Center alignment
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=20,
        textColor=colors.grey,
        alignment=1  # Center alignment
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=10,
        textColor=colors.HexColor('#2c3e50')
    )
    
    # Add company header
    elements.append(Paragraph("⛽ Gas Wala", title_style))
    elements.append(Paragraph("Your Trusted Gas Cylinder Delivery Partner", subtitle_style))
    elements.append(Spacer(1, 20))
    
    # Invoice header
    invoice_number = f"INV-{booking_data['id'].split('-')[1] if '-' in booking_data['id'] else booking_data['id'][:8]}"
    elements.append(Paragraph(f"INVOICE #{invoice_number}", header_style))
    elements.append(Spacer(1, 20))
    
    # Invoice details table
    invoice_details = [
        ['Invoice Date:', datetime.now().strftime('%B %d, %Y')],
        ['Order ID:', booking_data['id']],
        ['Payment Method:', booking_data['payment_mode'].upper() if booking_data['payment_mode'] else 'Cash'],
        ['Transaction ID:', booking_data.get('transaction_id') or 'N/A'],
        ['Status:', 'Paid' if booking_data['payment_mode'] and booking_data['payment_mode'] != 'cash' else 'Cash on Delivery']
    ]
    
    details_table = Table(invoice_details, colWidths=[2*inch, 3*inch])
    details_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),  # Bold first column
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(details_table)
    elements.append(Spacer(1, 20))
    
    # Bill to section
    elements.append(Paragraph("BILL TO:", header_style))
    bill_to_data = [
        [booking_data['customer_name']],
        [booking_data['customer_email']],
        [booking_data.get('customer_phone') or ''],
        [booking_data['delivery_address']]
    ]
    
    bill_to_table = Table(bill_to_data, colWidths=[5*inch])
    bill_to_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    
    elements.append(bill_to_table)
    elements.append(Spacer(1, 30))
    
    # Order details section
    elements.append(Paragraph("ORDER DETAILS:", header_style))
    
    # Calculate item price (total - delivery charge)
    delivery_charge = booking_data.get('delivery_charge', 0) or 0
    item_price = booking_data['total_amount'] - delivery_charge
    
    # Items table
    items_data = [
        ['Description', 'Quantity', 'Unit Price', 'Total'],
        [
            f"{booking_data['cylinder_type'].upper()} Gas Cylinder ({booking_data['capacity']}kg)",
            str(booking_data['quantity']),
            f"₹{item_price / booking_data['quantity']:.2f}",
            f"₹{item_price:.2f}"
        ]
    ]
    
    # Add delivery charge if applicable
    if delivery_charge > 0:
        items_data.append([
            'Delivery Charge',
            '1',
            f"₹{delivery_charge:.2f}",
            f"₹{delivery_charge:.2f}"
        ])
    
    items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        
        # Alternate row colors
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#ecf0f1')),
        ('BACKGROUND', (0, 2), (-1, 2), colors.white),
    ]))
    
    elements.append(items_table)
    elements.append(Spacer(1, 20))
    
    # Total section
    total_data = [
        ['TOTAL AMOUNT:', f"₹{booking_data['total_amount']:.2f}"]
    ]
    
    total_table = Table(total_data, colWidths=[4*inch, 2*inch])
    total_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 14),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#e74c3c')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    elements.append(total_table)
    elements.append(Spacer(1, 40))
    
    # Footer
    footer_text = """
    <para alignment="center">
        <b>Thank you for choosing Gas Wala!</b><br/>
        For support, contact us at support@gaswala.com or call +91-XXXXXXXXXX<br/>
        <i>This is a computer-generated invoice.</i>
    </para>
    """
    
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.grey,
        alignment=1,
        spaceAfter=10
    )
    
    elements.append(Paragraph(footer_text, footer_style))
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF data
    pdf_data = buffer.getvalue()
    buffer.close()
    
    return pdf_data

@app.route('/api/agency/orders/<order_id>/update-status', methods=['PUT'])
def agency_update_order_status(order_id):
    """Update order status (for agency use)"""
    try:
        # For demo purposes, allow both customer and agency to update status
        # In production, this should be restricted to agencies only
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled']:
            return jsonify({'success': False, 'message': 'Invalid status'})
        
        conn = get_db_connection()
        
        # Update the order status
        conn.execute('UPDATE bookings SET status = ? WHERE id = ?', (new_status, order_id))
        
        # If status is delivered and payment mode is cash, create payment record if not exists
        if new_status == 'delivered':
            booking = conn.execute('SELECT * FROM bookings WHERE id = ?', (order_id,)).fetchone()
            if booking:
                # Check if payment record already exists
                existing_payment = conn.execute('SELECT id FROM payments WHERE booking_id = ?', (order_id,)).fetchone()
                
                # For cash payments or if no payment record exists, create payment record
                if not existing_payment and (not booking['payment_mode'] or booking['payment_mode'] == 'cash'):
                    payment_id = f'pay-{datetime.now().strftime("%Y%m%d%H%M%S%f")}'
                    transaction_id = f'cash-{datetime.now().strftime("%Y%m%d%H%M%S")}'
                    
                    conn.execute('''
                        INSERT INTO payments (id, booking_id, customer_id, amount, payment_mode, 
                                            status, transaction_id, loyalty_points_earned)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (payment_id, order_id, booking['customer_id'], booking['total_amount'], 
                          'cash', 'completed', transaction_id, int(booking['total_amount'] / 10)))
                    
                    # Update customer loyalty points
                    conn.execute('''
                        UPDATE customers SET loyalty_points = loyalty_points + ?, 
                                           total_spent = total_spent + ?,
                                           total_orders = total_orders + 1
                        WHERE id = ?
                    ''', (int(booking['total_amount'] / 10), booking['total_amount'], booking['customer_id']))
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': f'Order status updated to {new_status}',
            'status': new_status
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()

@app.route('/api/customer/profile')
def get_customer_profile():
    """Get customer profile information"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'customer':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        conn = get_db_connection()
        customer = conn.execute('SELECT * FROM customers WHERE id = ?', 
                               (session['user_id'],)).fetchone()
        
        if customer:
            profile = dict(customer)
            # Remove sensitive information
            profile.pop('password', None)
            return jsonify({'success': True, 'profile': profile})
        else:
            return jsonify({'success': False, 'message': 'Profile not found'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/customer/profile', methods=['PUT'])
def update_customer_profile():
    """Update customer profile"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'customer':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        data = request.get_json()
        name = data.get('name')
        phone = data.get('phone')
        address = data.get('address')
        
        conn = get_db_connection()
        conn.execute('''
            UPDATE customers 
            SET name = ?, phone = ?, address = ?
            WHERE id = ?
        ''', (name, phone, address, session['user_id']))
        conn.commit()
        
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

# Cylinders API endpoint
@app.route('/api/cylinders')
def get_cylinders():
    """Get all available cylinders"""
    try:
        conn = get_db_connection()
        cylinders = conn.execute('''
            SELECT id, cylinder_type as type, capacity, price, stock, description
            FROM cylinders 
            WHERE stock > 0
            ORDER BY cylinder_type, capacity
        ''').fetchall()
        
        cylinders_list = [dict(cylinder) for cylinder in cylinders]
        return jsonify(cylinders_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Additional Agency API endpoints
@app.route('/api/agency/profile')
def get_agency_profile():
    """Get agency profile information"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'agency':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        conn = get_db_connection()
        agency = conn.execute('SELECT * FROM agencies WHERE id = ?', 
                             (session['user_id'],)).fetchone()
        
        if agency:
            profile = dict(agency)
            # Remove sensitive information
            profile.pop('password', None)
            return jsonify({'success': True, 'profile': profile})
        else:
            return jsonify({'success': False, 'message': 'Profile not found'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

@app.route('/api/agency/profile', methods=['PUT'])
def update_agency_profile():
    """Update agency profile"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'agency':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        data = request.get_json()
        name = data.get('name')
        phone = data.get('phone')
        address = data.get('address')
        
        conn = get_db_connection()
        conn.execute('''
            UPDATE agencies 
            SET name = ?, phone = ?, address = ?
            WHERE id = ?
        ''', (name, phone, address, session['user_id']))
        conn.commit()
        
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()

# Order cancellation API
@app.route('/api/customer/orders/<order_id>/cancel', methods=['PUT'])
def cancel_order(order_id):
    """Cancel a customer order"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'customer':
            return jsonify({'success': False, 'message': 'Unauthorized'})
        
        data = request.get_json()
        reason = data.get('reason', 'Customer requested cancellation')
        
        conn = get_db_connection()
        
        # First, check if the order exists and belongs to the customer
        order = conn.execute('''
            SELECT id, status, customer_id, total_amount, payment_mode 
            FROM bookings 
            WHERE id = ? AND customer_id = ?
        ''', (order_id, session['user_id'])).fetchone()
        
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'})
        
        # Check if order can be cancelled 
        # Allow cancellation based on payment status and order status
        if order['status'] == 'delivered':
            return jsonify({
                'success': False, 
                'message': 'Order has been delivered and cannot be cancelled'
            })
        elif order['status'] == 'cancelled':
            return jsonify({
                'success': False, 
                'message': 'Order is already cancelled'
            })
        elif order['status'] == 'in_transit':
            # Check if payment is made - only allow cancellation of unpaid in-transit orders
            payment_check = conn.execute('''
                SELECT id FROM payments 
                WHERE booking_id = ? AND status = 'completed'
            ''', (order_id,)).fetchone()
            
            # If payment is completed, don't allow cancellation of in-transit orders
            if payment_check:
                return jsonify({
                    'success': False, 
                    'message': 'Order is already in transit and payment has been completed. Please contact customer support for assistance.'
                })
            # If no payment completed, allow cancellation (unpaid in-transit order)
        
        # All other statuses (pending, confirmed, pending_payment) are cancellable
        
        # Update the order status to cancelled
        conn.execute('''
            UPDATE bookings 
            SET status = 'cancelled', cancelled_reason = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (reason, order_id))
        
        # Handle refund for online payments
        refund_processed = False
        if order['payment_mode'] in ['card', 'upi', 'netbanking']:
            # Check if payment was completed
            payment = conn.execute('''
                SELECT id, amount, status FROM payments 
                WHERE booking_id = ? AND status = 'completed'
            ''', (order_id,)).fetchone()
            
            if payment:
                # Create refund record (in real implementation, integrate with payment gateway)
                refund_id = f'refund-{datetime.now().strftime("%Y%m%d%H%M%S%f")}'
                conn.execute('''
                    INSERT INTO payments (id, booking_id, customer_id, amount, payment_mode, 
                                        status, transaction_id, payment_date)
                    VALUES (?, ?, ?, ?, 'refund', 'completed', ?, CURRENT_TIMESTAMP)
                ''', (refund_id, order_id, order['customer_id'], -payment['amount'], 
                      f'refund-{payment["id"]}'))
                refund_processed = True
        
        conn.commit()
        
        # Determine appropriate response message
        if refund_processed:
            response_message = 'Order cancelled successfully. Refund will be processed within 3-5 business days.'
        elif order['payment_mode'] == 'cash' or not order['payment_mode']:
            response_message = 'Order cancelled successfully. No payment was made, so no refund is needed.'
        else:
            # Unpaid online order
            response_message = 'Order cancelled successfully. Since no payment was completed, no refund is necessary.'
        
        return jsonify({
            'success': True,
            'message': response_message,
            'refund_processed': refund_processed,
            'was_paid': refund_processed
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()

# Static file serving routes
@app.route('/styles/<path:filename>')
def serve_styles(filename):
    return send_from_directory('../frontend/styles', filename)

@app.route('/scripts/<path:filename>')
def serve_scripts(filename):
    return send_from_directory('../frontend/scripts', filename)

@app.route('/pages/<path:filename>')
def serve_pages(filename):
    return send_from_directory('../frontend/pages', filename)

@app.route('/<path:filename>')
def serve_frontend_files(filename):
    """Serve any other HTML or static files directly from the frontend directory"""
    return send_from_directory('../frontend', filename)


if __name__ == '__main__':
    app.run(debug=True)