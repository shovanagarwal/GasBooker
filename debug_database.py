import sqlite3

conn = sqlite3.connect('backend/gas_booking.db')
cursor = conn.cursor()

print('=== CHECKING BOOKINGS TABLE ===')

# Check if table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings'")
table_exists = cursor.fetchone()
print(f'Bookings table exists: {table_exists is not None}')

if table_exists:
    # Get table structure
    cursor.execute('PRAGMA table_info(bookings)')
    columns = cursor.fetchall()
    print(f'\nBookings table columns ({len(columns)} total):')
    for i, col in enumerate(columns, 1):
        print(f'{i:2d}. {col[1]} ({col[2]}) - Default: {col[4] or "NULL"}')
    
    # Count all records
    cursor.execute('SELECT COUNT(*) FROM bookings')
    total_count = cursor.fetchone()[0]
    print(f'\nTotal bookings in database: {total_count}')
    
    if total_count > 0:
        # Show latest 10 bookings with more details
        cursor.execute('''SELECT id, customer_id, cylinder_id, status, total_amount, 
                                 booking_date, delivery_address, payment_mode 
                          FROM bookings 
                          ORDER BY booking_date DESC 
                          LIMIT 10''')
        recent = cursor.fetchall()
        print('\nLatest 10 bookings:')
        for booking in recent:
            print(f'  ID: {booking[0][:25]:<25} | Customer: {booking[1]:<10} | Status: {booking[3]:<15} | Amount: ₹{booking[4]:<6} | Date: {booking[5][:16]}')
        
        # Check for specific customers
        cursor.execute('SELECT DISTINCT customer_id FROM bookings')
        customers = cursor.fetchall()
        print(f'\nCustomers with bookings ({len(customers)} total):')
        for customer in customers:
            cursor.execute('SELECT COUNT(*) FROM bookings WHERE customer_id = ?', (customer[0],))
            count = cursor.fetchone()[0]
            print(f'  {customer[0]}: {count} bookings')
            
        # Check recent bookings from today
        cursor.execute("SELECT COUNT(*) FROM bookings WHERE date(booking_date) = date('now')")
        today_count = cursor.fetchone()[0]
        print(f'\nBookings created today: {today_count}')
        
    else:
        print('\nNo bookings found in database!')
else:
    print('\nBookings table does not exist!')

# Also check what tables exist
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print(f'\nAll tables in database ({len(tables)} total):')
for table in tables:
    cursor.execute(f'SELECT COUNT(*) FROM {table[0]}')
    count = cursor.fetchone()[0]
    print(f'  {table[0]}: {count} records')

conn.close()