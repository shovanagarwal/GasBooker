import sqlite3
from datetime import datetime

print("=== TESTING BOOKING WITH MANUAL SESSION SIMULATION ===\n")

# Test the database operations directly (simulating what happens after successful login)
print("1. SIMULATING SUCCESSFUL BOOKING PROCESS:")

conn = sqlite3.connect('backend/gas_booking.db')
cursor = conn.cursor()

# Check before booking
cursor.execute('SELECT COUNT(*) FROM bookings')
before_count = cursor.fetchone()[0]
print(f"   Bookings before: {before_count}")

# Test cylinder query (the fixed version)
print(f"\n2. TESTING CYLINDER QUERY:")
cursor.execute('SELECT * FROM cylinders WHERE cylinder_type = ? AND stock > 0 LIMIT 1', ('domestic',))
cylinder = cursor.fetchone()

if cylinder:
    print(f"   Found cylinder: {cylinder[0]} - {cylinder[2]} ({cylinder[3]}kg)")
    print(f"   Price: ₹{cylinder[4]}, Stock: {cylinder[5]}")
    
    # Test agency query
    cursor.execute('SELECT * FROM agencies LIMIT 1')
    agency = cursor.fetchone()
    
    if agency:
        print(f"\n3. TESTING BOOKING INSERT:")
        print(f"   Using agency: {agency[0]} - {agency[1]}")
        
        # Simulate the booking insert
        booking_id = f'book-{datetime.now().strftime("%Y%m%d%H%M%S%f")}'
        quantity = 1
        total_amount = cylinder[4] * quantity  # price * quantity
        
        try:
            cursor.execute('''
                INSERT INTO bookings (id, customer_id, agency_id, cylinder_id, quantity, total_amount, 
                                    delivery_address, delivery_date, delivery_time, preferred_time_slot,
                                    special_instructions, booking_type, status, booking_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (booking_id, 'cust-001', agency[0], cylinder[0], quantity, total_amount, 
                  '123 Test Street, Test City', '2024-12-25', 'morning', 'morning', 
                  'Test booking via API', 'delivery', 'pending', datetime.now().isoformat()))
            
            # Test stock update
            cursor.execute('UPDATE cylinders SET stock = stock - ? WHERE id = ?', 
                          (quantity, cylinder[0]))
            
            conn.commit()
            print(f"   ✅ Successfully created booking: {booking_id}")
            print(f"   ✅ Updated cylinder stock")
            
            # Verify the booking was created
            cursor.execute('SELECT COUNT(*) FROM bookings')
            after_count = cursor.fetchone()[0]
            print(f"   ✅ Bookings after: {after_count} (increased by {after_count - before_count})")
            
            # Check the actual booking record
            cursor.execute('SELECT * FROM bookings WHERE id = ?', (booking_id,))
            booking = cursor.fetchone()
            if booking:
                print(f"   ✅ Booking details: ID={booking[0]}, Customer={booking[1]}, Amount=₹{booking[13]}")
            
            # Check updated stock
            cursor.execute('SELECT stock FROM cylinders WHERE id = ?', (cylinder[0],))
            new_stock = cursor.fetchone()[0]
            print(f"   ✅ Updated stock for {cylinder[0]}: {new_stock}")
            
        except Exception as e:
            print(f"   ❌ ERROR during booking: {e}")
    else:
        print(f"   ❌ No agencies found!")
else:
    print(f"   ❌ No cylinders found for type 'domestic'!")

conn.close()

print(f"\n4. SUMMARY:")
print(f"   The booking functionality should now work correctly when:")
print(f"   - User is properly logged in (session exists)")
print(f"   - Valid cylinder type is selected")
print(f"   - All required fields are provided")
print(f"   - Database operations complete successfully")