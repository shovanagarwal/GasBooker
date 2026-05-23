from flask import Flask, jsonify, request, send_from_directory, session, redirect, url_for
import os

# Simple in-memory data for testing
cylinders_data = [
    {
        'id': 1, 'brand': 'Generic', 'type': 'domestic', 'capacity': 14.2,
        'price': 450, 'stock': 25, 'description': 'Standard domestic cylinder',
        'features': ['ISI Certified', 'Safety Tested']
    },
    {
        'id': 2, 'brand': 'Generic', 'type': 'domestic', 'capacity': 14.2,
        'price': 455, 'stock': 20, 'description': 'Premium domestic cylinder',
        'features': ['ISI Certified', 'Safety Tested', 'Quick Connect']
    },
    {
        'id': 3, 'brand': 'Generic', 'type': 'domestic', 'capacity': 14.2,
        'price': 448, 'stock': 18, 'description': 'Reliable domestic cylinder',
        'features': ['ISI Certified', 'Safety Tested']
    },
    {
        'id': 4, 'brand': 'Generic', 'type': 'commercial', 'capacity': 19,
        'price': 1200, 'stock': 15, 'description': 'Commercial gas cylinder',
        'features': ['ISI Certified', 'Heavy Duty', 'Industrial Grade']
    },
    {
        'id': 5, 'brand': 'Generic', 'type': 'commercial', 'capacity': 47.5,
        'price': 3200, 'stock': 8, 'description': 'Industrial gas cylinder',
        'features': ['ISI Certified', 'Heavy Duty', 'Industrial Grade']
    }
]

app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.config['SECRET_KEY'] = 'dev-secret-key'

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return send_from_directory(app.static_folder, 'index.html')
    
    # Handle login
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type', 'customer')
    
    # Simple authentication - accept any email/password for testing
    if email and password:
        # Set session
        session['user_id'] = 'cust-001' if user_type == 'customer' else 'agency-001'
        session['user_type'] = user_type
        session['user_email'] = email
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'redirect': f'/pages/{user_type}-dashboard.html'
        })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 400

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/api/customer/dashboard')
def customer_dashboard():
    if 'user_id' not in session or session.get('user_type') != 'customer':
        return jsonify({'message': 'Authentication required'}), 401
    
    return jsonify({
        'stats': {
            'active_orders': 2,
            'total_orders': 15,
            'total_spent': 6750.00,
            'loyalty_points': 675
        },
        'recent_activity': [
            {
                'id': 1,
                'type': 'delivery',
                'description': 'Domestic Cylinder delivered successfully',
                'timestamp': '2024-12-18T10:30:00Z',
                'status': 'completed'
            },
            {
                'id': 2,
                'type': 'booking',
                'description': 'New cylinder booking confirmed',
                'timestamp': '2024-12-17T14:20:00Z',
                'status': 'pending'
            }
        ]
    })

@app.route('/api/customer/cylinders')
def get_cylinders():
    if 'user_id' not in session or session.get('user_type') != 'customer':
        return jsonify({'message': 'Authentication required'}), 401
    
    return jsonify({
        'success': True,
        'cylinders': cylinders_data
    })

@app.route('/api/customer/orders')
def customer_orders():
    if 'user_id' not in session or session.get('user_type') != 'customer':
        return jsonify({'message': 'Authentication required'}), 401
    
    orders = [
        {
            'id': 'book-001',
            'booking_date': '2024-12-18T09:00:00Z',
            'status': 'delivered',
            'cylinder_brand': 'Generic',
            'cylinder_capacity': 14.2,
            'quantity': 1,
            'total_amount': 949.00,
            'delivery_address': '123 Main Street, New Delhi',
            'tracking_number': 'GB001235'
        },
        {
            'id': 'book-002',
            'booking_date': '2024-12-17T14:20:00Z',
            'status': 'in_transit',
            'cylinder_brand': 'Generic',
            'cylinder_capacity': 14.2,
            'quantity': 1,
            'total_amount': 455.00,
            'delivery_address': '456 Oak Avenue, Mumbai',
            'tracking_number': 'GB001236'
        }
    ]
    
    return jsonify({'orders': orders})

@app.route('/api/customer/payments')
def customer_payments():
    if 'user_id' not in session or session.get('user_type') != 'customer':
        return jsonify({'message': 'Authentication required'}), 401
    
    return jsonify({
        'stats': {
            'yearly_spent': 6750.00,
            'loyalty_points': 675,
            'total_savings': 675.00
        },
        'transactions': [
            {
                'id': 'pay-001',
                'amount': 949.00,
                'payment_mode': 'UPI',
                'status': 'completed',
                'transaction_id': 'TXN123456',
                'payment_date': '2024-12-18T10:30:00Z',
                'cylinder_info': 'Generic 14.2kg Domestic',
                'loyalty_points_earned': 95
            },
            {
                'id': 'pay-002',
                'amount': 455.00,
                'payment_mode': 'Card',
                'status': 'completed',
                'transaction_id': 'TXN123457',
                'payment_date': '2024-12-17T15:00:00Z',
                'cylinder_info': 'Generic 14.2kg Domestic',
                'loyalty_points_earned': 45
            }
        ]
    })

# Agency routes for completeness
@app.route('/api/agency/dashboard')
def agency_dashboard():
    if 'user_id' not in session or session.get('user_type') != 'agency':
        return jsonify({'message': 'Authentication required'}), 401
    
    return jsonify({
        'stats': {
            'pending_orders': 12,
            'confirmed_orders': 8,
            'in_transit_orders': 5,
            'delivered_orders': 145,
            'total_customers': 89,
            'monthly_revenue': 125000.00
        }
    })

@app.route('/pages/<path:filename>')
def serve_pages(filename):
    return send_from_directory(os.path.join(app.static_folder, 'pages'), filename)

@app.route('/scripts/<path:filename>')
def serve_scripts(filename):
    return send_from_directory(os.path.join(app.static_folder, 'scripts'), filename)

@app.route('/styles/<path:filename>')
def serve_styles(filename):
    return send_from_directory(os.path.join(app.static_folder, 'styles'), filename)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)