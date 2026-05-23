import sqlite3
import sys

# Check booking table and related issues
conn = sqlite3.connect('backend/gas_booking.db')
cursor = conn.cursor()

print("=== BOOKING SYSTEM DIAGNOSIS ===\n")

# 1. Check bookings table structure
print("1. BOOKINGS TABLE STRUCTURE:")
cursor.execute('PRAGMA table_info(bookings)')
columns = cursor.fetchall()
for col in columns:
    print(f"   {col[1]} ({col[2]}) - Nullable: {'Yes' if not col[3] else 'No'}")

# 2. Check if there are any bookings
print(f"\n2. EXISTING BOOKINGS COUNT:")
cursor.execute('SELECT COUNT(*) FROM bookings')
count = cursor.fetchone()[0]
print(f"   Total bookings: {count}")

if count > 0:
    cursor.execute('SELECT * FROM bookings LIMIT 3')
    bookings = cursor.fetchall()
    print("\n   Sample bookings:")
    for booking in bookings:
        print(f"   {booking}")

# 3. Check cylinder query issue
print(f"\n3. CYLINDER QUERY TEST:")
cursor.execute("PRAGMA table_info(cylinders)")
cyl_columns = cursor.fetchall()
print("   Cylinders table columns:")
for col in cyl_columns:
    print(f"     {col[1]} ({col[2]})")

# Test the problematic query from the booking code
print(f"\n   Testing cylinder query with 'type' column:")
try:
    cursor.execute('SELECT * FROM cylinders WHERE type = ? AND stock > 0 LIMIT 1', ('domestic',))
    result = cursor.fetchone()
    print(f"     Result: {result}")
except Exception as e:
    print(f"     ERROR: {e}")

print(f"\n   Testing cylinder query with 'cylinder_type' column:")
try:
    cursor.execute('SELECT * FROM cylinders WHERE cylinder_type = ? AND stock > 0 LIMIT 1', ('domestic',))
    result = cursor.fetchone()
    print(f"     Result: {result}")
except Exception as e:
    print(f"     ERROR: {e}")

# 4. Check agencies table
print(f"\n4. AGENCIES TABLE CHECK:")
cursor.execute('SELECT COUNT(*) FROM agencies')
agency_count = cursor.fetchone()[0]
print(f"   Total agencies: {agency_count}")

if agency_count > 0:
    cursor.execute('SELECT id, agency_name FROM agencies LIMIT 2')
    agencies = cursor.fetchall()
    print("   Sample agencies:")
    for agency in agencies:
        print(f"     ID: {agency[0]}, Name: {agency[1]}")

conn.close()