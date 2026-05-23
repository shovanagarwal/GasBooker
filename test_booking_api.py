import requests
import json
import sqlite3
from datetime import datetime

print("=== TESTING BOOKING FUNCTIONALITY ===\n")

# Test data
booking_data = {
    "cylinder_type": "domestic",
    "quantity": 1,
    "booking_type": "delivery",
    "delivery_address": "123 Test Street, Test City",
    "delivery_date": "2024-12-25",
    "special_instructions": "Test booking"
}

# Check bookings before
print("1. CHECKING BOOKINGS BEFORE:")
conn = sqlite3.connect('backend/gas_booking.db')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM bookings')
before_count = cursor.fetchone()[0]
print(f"   Bookings before: {before_count}")

# Test the API endpoint (without session - should fail)
print("\n2. TESTING API WITHOUT SESSION:")
try:
    response = requests.post('http://127.0.0.1:5000/api/customer/book-cylinder', 
                           json=booking_data, 
                           headers={'Content-Type': 'application/json'})
    print(f"   Response Status: {response.status_code}")
    print(f"   Response Body: {response.json()}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test cylinder query directly
print("\n3. TESTING CYLINDER QUERY DIRECTLY:")
cursor.execute('SELECT * FROM cylinders WHERE cylinder_type = ? AND stock > 0 LIMIT 1', ('domestic',))
cylinder = cursor.fetchone()
if cylinder:
    print(f"   Found cylinder: {cylinder[0]} - {cylinder[2]} ({cylinder[3]}kg) - Stock: {cylinder[5]}")
    print(f"   Price: ₹{cylinder[4]}")
else:
    print("   No cylinders found!")

# Test agency query
print("\n4. TESTING AGENCY QUERY:")
cursor.execute('SELECT * FROM agencies LIMIT 1')
agency = cursor.fetchone()
if agency:
    print(f"   Found agency: {agency[0]} - {agency[1]}")
else:
    print("   No agencies found!")

conn.close()

print("\n5. MANUAL BOOKING INSERT TEST:")
try:
    conn = sqlite3.connect('backend/gas_booking.db')
    cursor = conn.cursor()
    
    # Manual booking insert
    booking_id = f'test-book-{datetime.now().strftime("%Y%m%d%H%M%S")}'
    cursor.execute('''
        INSERT INTO bookings (id, customer_id, agency_id, cylinder_id, quantity, total_amount, 
                            delivery_address, delivery_date, delivery_time, preferred_time_slot,
                            special_instructions, booking_type, status, booking_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (booking_id, 'cust-001', 'agency-001', 'cyl-001', 1, 450.0, 
          'Test Address', '2024-12-25', 'morning', 'morning', 'Test booking',
          'delivery', 'pending', datetime.now().isoformat()))
    
    conn.commit()
    print(f"   Successfully inserted booking: {booking_id}")
    
    # Check if it was inserted
    cursor.execute('SELECT COUNT(*) FROM bookings')
    after_count = cursor.fetchone()[0]
    print(f"   Bookings after manual insert: {after_count}")
    
    conn.close()
    
except Exception as e:
    print(f"   ERROR during manual insert: {e}")