from flask import Flask, jsonify, request, send_from_directory, session
import os
import uuid
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.secret_key = 'dev-secret-key-change-in-production'

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

agencies_data = [
    {
        'id': 1, 'name': 'Mumbai Gas Agency', 'location': 'Mumbai',
        'service_areas': ['Andheri', 'Bandra', 'Powai'], 'rating': 4.5,
        'contact': '+91 9876543210'
    },
    {
        'id': 2, 'name': 'Delhi Gas Central', 'location': 'Delhi',
        'service_areas': ['CP', 'Karol Bagh', 'Lajpat Nagar'], 'rating': 4.2,
        'contact': '+91 9876543211'
    }
]

orders_data = [
    {
        'id': 'ORD-001', 'customer_id': 'cust-001', 'cylinder_id': 1,
        'quantity': 1, 'status': 'delivered', 'order_date': '2024-12-10',
        'delivery_date': '2024-12-12', 'amount': 450
    },
    {
        'id': 'ORD-002', 'customer_id': 'cust-001', 'cylinder_id': 2,
        'quantity': 1, 'status': 'in_transit', 'order_date': '2024-12-15',
        'delivery_date': '2024-12-18', 'amount': 455
    }
]

customers_data = [
    {
        'id': 'cust-001', 'name': 'John Doe', 'email': 'john@example.com',
        'phone': '+91 9123456789', 'address': '123 Main St, Mumbai',
        'total_orders': 24, 'total_spent': 12450, 'loyalty_points': 850
    }
]

payments_data = [
    {
        'id': 'PAY-001', 'order_id': 'ORD-001', 'amount': 450,
        'payment_method': 'UPI', 'status': 'completed',
        'payment_date': '2024-12-10'
    }
]

# Authentication routes
@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user_type = data.get('user_type')
    email = data.get('email')
    password = data.get('password')
    
    if user_type == 'customer' and email == 'john@example.com' and password == 'password':
        session['user_id'] = 'cust-001'
        session['user_type'] = 'customer'
        return jsonify({'success': True, 'user_type': 'customer', 'redirect': '/customer-dashboard'})
    elif user_type == 'agency' and email == 'agency@example.com' and password == 'password':
        session['user_id'] = 'agency-001'
        session['user_type'] = 'agency'
        return jsonify({'success': True, 'user_type': 'agency', 'redirect': '/agency-dashboard'})
    
    return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

# Customer API routes
@app.route('/api/customer/dashboard')
def customer_dashboard():
    if session.get('user_type') != 'customer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    customer = customers_data[0]  # Assume first customer for demo
    recent_orders = orders_data[:3]  # Last 3 orders
    
    return jsonify({
        'customer': customer,
        'stats': {
            'active_orders': len([o for o in orders_data if o['status'] in ['pending', 'confirmed', 'in_transit']]),
            'total_orders': customer['total_orders'],
            'total_spent': customer['total_spent'],
            'loyalty_points': customer['loyalty_points']
        },
        'recent_orders': recent_orders
    })

@app.route('/api/customer/orders')
def customer_orders():
    if session.get('user_type') != 'customer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({'orders': orders_data})

@app.route('/api/customer/payments')
def customer_payments():
    if session.get('user_type') != 'customer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({'payments': payments_data})

@app.route('/api/cylinders')
def get_cylinders():
    return jsonify({'cylinders': cylinders_data})

@app.route('/api/agencies')
def get_agencies():
    return jsonify({'agencies': agencies_data})

@app.route('/api/book-cylinder', methods=['POST'])
def book_cylinder():
    if session.get('user_type') != 'customer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    
    # Create new order
    new_order = {
        'id': f"ORD-{len(orders_data) + 1:03d}",
        'customer_id': session['user_id'],
        'cylinder_id': data['cylinder_id'],
        'quantity': data['quantity'],
        'status': 'pending',
        'order_date': datetime.now().strftime('%Y-%m-%d'),
        'delivery_date': data['delivery_date'],
        'delivery_address': data['delivery_address'],
        'amount': data['amount']
    }
    
    orders_data.append(new_order)
    
    return jsonify({'success': True, 'order': new_order})

# Agency API routes
@app.route('/api/agency/dashboard')
def agency_dashboard():
    if session.get('user_type') != 'agency':
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({
        'stats': {
            'pending_orders': len([o for o in orders_data if o['status'] == 'pending']),
            'today_deliveries': len([o for o in orders_data if o['delivery_date'] == datetime.now().strftime('%Y-%m-%d')]),
            'total_customers': len(customers_data),
            'monthly_revenue': sum(o['amount'] for o in orders_data)
        },
        'recent_orders': orders_data[:5]
    })

@app.route('/api/agency/orders')
def agency_orders():
    if session.get('user_type') != 'agency':
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({'orders': orders_data})

@app.route('/api/agency/customers')
def agency_customers():
    if session.get('user_type') != 'agency':
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({'customers': customers_data})

@app.route('/api/agency/inventory')
def agency_inventory():
    if session.get('user_type') != 'agency':
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({'inventory': cylinders_data})

# Serve static files
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../frontend', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)