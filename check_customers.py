import sqlite3
import hashlib

conn = sqlite3.connect('backend/gas_booking.db')
cursor = conn.cursor()

print("=== CHECKING CUSTOMER ACCOUNTS ===")

cursor.execute('SELECT id, name, email, password FROM customers')
customers = cursor.fetchall()

print(f"Total customers: {len(customers)}")
for customer in customers:
    print(f"ID: {customer[0]}, Name: {customer[1]}, Email: {customer[2]}")
    print(f"Password hash: {customer[3]}")

# Test password hashing
test_password = "password"
hashed = hashlib.md5(test_password.encode()).hexdigest()
print(f"\nTest password '{test_password}' hashes to: {hashed}")

conn.close()