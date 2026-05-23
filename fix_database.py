import sqlite3

conn = sqlite3.connect('backend/gas_booking.db')
cursor = conn.cursor()

print('=== ADDING MISSING PAYMENT_MODE COLUMN ===')

try:
    # Add payment_mode column to bookings table
    cursor.execute('ALTER TABLE bookings ADD COLUMN payment_mode TEXT DEFAULT NULL')
    print('✅ Added payment_mode column to bookings table')
    
    conn.commit()
    print('✅ Changes committed to database')
    
except sqlite3.OperationalError as e:
    if 'duplicate column name' in str(e):
        print('⚠️  payment_mode column already exists')
    else:
        print(f'❌ Error: {e}')

# Verify the column was added
cursor.execute('PRAGMA table_info(bookings)')
columns = cursor.fetchall()
payment_mode_found = any(col[1] == 'payment_mode' for col in columns)
print(f'✅ payment_mode column exists: {payment_mode_found}')

# Now update existing bookings to have payment_mode based on payments table
print('\n=== UPDATING EXISTING BOOKINGS WITH PAYMENT MODE ===')

# Update bookings that have payments
cursor.execute('''
    UPDATE bookings 
    SET payment_mode = (
        SELECT payment_mode 
        FROM payments 
        WHERE payments.booking_id = bookings.id
    )
    WHERE id IN (
        SELECT booking_id FROM payments
    )
''')

updated = cursor.rowcount
print(f'✅ Updated {updated} bookings with payment_mode from payments table')

# Set remaining bookings to 'cash' if they don't have payment records
cursor.execute('''
    UPDATE bookings 
    SET payment_mode = 'cash'
    WHERE payment_mode IS NULL
''')

cash_updated = cursor.rowcount
print(f'✅ Set {cash_updated} bookings to cash payment mode')

conn.commit()

# Verify the updates
print('\n=== VERIFICATION ===')
cursor.execute('SELECT payment_mode, COUNT(*) FROM bookings GROUP BY payment_mode')
results = cursor.fetchall()
for result in results:
    mode = result[0] if result[0] else 'NULL'
    print(f'  {mode}: {result[1]} bookings')

# Show sample of updated bookings
print('\n=== SAMPLE UPDATED BOOKINGS ===')
cursor.execute('SELECT id, customer_id, payment_mode, status, total_amount FROM bookings ORDER BY booking_date DESC LIMIT 5')
samples = cursor.fetchall()
for sample in samples:
    print(f'ID: {sample[0][:20]}... Customer: {sample[1]} Payment: {sample[2]} Status: {sample[3]} Amount: ₹{sample[4]}')

conn.close()
print('\n🎉 Database migration completed successfully!')