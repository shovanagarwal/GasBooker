-- SQLite Database Schema for GasBooker

CREATE TABLE IF NOT EXISTS agencies (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  agency_name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  license_number TEXT,
  service_areas TEXT,
  operating_hours TEXT,
  delivery_charges TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  password TEXT NOT NULL,
  date_of_birth TEXT,
  loyalty_points INTEGER DEFAULT 0,
  customer_segment TEXT DEFAULT 'regular',
  total_spent REAL DEFAULT 0.00,
  total_orders INTEGER DEFAULT 0,
  last_order_date TIMESTAMP NULL,
  notification_preferences TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS cylinders (
  id TEXT PRIMARY KEY,
  brand TEXT DEFAULT 'Premium Gas',
  cylinder_type TEXT NOT NULL,
  capacity REAL NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  description TEXT,
  image_url TEXT,
  features TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  agency_id TEXT NOT NULL,
  cylinder_id TEXT NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_date TEXT,
  delivery_time TEXT,
  preferred_time_slot TEXT,
  delivery_address TEXT,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  booking_type TEXT DEFAULT 'delivery' NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  total_amount REAL NOT NULL,
  delivery_charge REAL DEFAULT 0.00,
  discount_applied REAL DEFAULT 0.00,
  tracking_number TEXT,
  cancelled_reason TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount REAL NOT NULL,
  payment_mode TEXT NOT NULL,
  payment_gateway_ref TEXT,
  status TEXT DEFAULT 'completed' NOT NULL,
  transaction_id TEXT,
  loyalty_points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplies (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  cylinder_id TEXT NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  reserved_stock INTEGER DEFAULT 0 NOT NULL,
  damaged_stock INTEGER DEFAULT 0 NOT NULL,
  reorder_level INTEGER DEFAULT 50 NOT NULL,
  max_capacity INTEGER DEFAULT 1000 NOT NULL,
  last_restocked_date TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  cylinder_id TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  method_type TEXT NOT NULL,
  method_name TEXT NOT NULL,
  method_details TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  label TEXT DEFAULT 'Home',
  address TEXT NOT NULL,
  address_type TEXT DEFAULT 'home',
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  agency_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  agency_id TEXT NOT NULL,
  cylinder_id TEXT NOT NULL,
  frequency_days INTEGER NOT NULL,
  next_delivery_date TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agency_id ON bookings(agency_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_delivery_date ON bookings(delivery_date);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_supplies_agency_id ON supplies(agency_id);
CREATE INDEX IF NOT EXISTS idx_supplies_cylinder_id ON supplies(cylinder_id);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(customer_segment);
CREATE INDEX IF NOT EXISTS idx_customers_last_order ON customers(last_order_date);

CREATE INDEX IF NOT EXISTS idx_agencies_email ON agencies(email);

-- Sample Data Insertion
INSERT OR IGNORE INTO cylinders (id, brand, cylinder_type, capacity, price, stock, description, features) VALUES
('cyl-001', 'Generic', 'domestic', 14.2, 450.00, 25, 'Standard domestic cylinder', '["ISI Certified", "Same day delivery", "Safety valve included"]'),
('cyl-002', 'Generic', 'domestic', 19.0, 500.00, 18, 'Large domestic cylinder', '["Premium Quality", "Express delivery", "Bulk pricing available"]'),
('cyl-003', 'Generic', 'domestic', 14.2, 455.00, 22, 'Premium domestic cylinder', '["High Quality", "Reliable", "Safe delivery"]'),
('cyl-004', 'Generic', 'commercial', 35.0, 850.00, 8, 'Commercial gas cylinder', '["Commercial Grade", "Installation support", "Extended warranty"]'),
('cyl-005', 'Bharat Gas', 'commercial', 19.0, 520.00, 0, 'Commercial small cylinder', '["Commercial Use", "Quick delivery", "Business rates"]');

INSERT OR IGNORE INTO agencies (id, agency_name, address, contact_number, email, password, license_number, service_areas, operating_hours, delivery_charges) VALUES
('agency-001', 'Mumbai Gas Agency', '456 Industrial Estate, Andheri East, Mumbai, Maharashtra 400069', '+91 9876543210', 'agency@mumbaigas.com', '482c811da5d5b4bc6d497ffa98491e38', 'MH-GAS-2024-001234',
'["Mumbai Central", "Andheri", "Bandra", "Powai"]', 
'{"monday_friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "15:00"}, "sunday": {"closed": true}}',
'{"standard": 50, "emergency": 150, "free_above": 1000}');

INSERT OR IGNORE INTO customers (id, name, phone_number, email, address, password, date_of_birth, loyalty_points, customer_segment, total_spent, total_orders) VALUES
('cust-001', 'John Doe', '+91 9123456789', 'john.doe@example.com', '123 Main Street, Apartment 4B, New Delhi, Delhi 110001', '482c811da5d5b4bc6d497ffa98491e38', '1990-05-15', 850, 'regular', 12450.00, 24),
('cust-002', 'Rajesh Kumar', '+91 9876543210', 'rajesh.kumar@email.com', '789 Park Avenue, Mumbai, Maharashtra 400001', '482c811da5d5b4bc6d497ffa98491e38', '1985-03-20', 1250, 'premium', 42350.00, 47),
('cust-003', 'Priya Sharma', '+91 9123456789', 'priya.sharma@email.com', '456 Green Street, Bangalore, Karnataka 560001', '482c811da5d5b4bc6d497ffa98491e38', '1992-08-10', 450, 'regular', 21600.00, 24);

INSERT OR IGNORE INTO supplies (id, agency_id, cylinder_id, stock, reserved_stock, damaged_stock, reorder_level, max_capacity) VALUES
('sup-001', 'agency-001', 'cyl-001', 847, 156, 45, 100, 1200),
('sup-002', 'agency-001', 'cyl-002', 234, 67, 12, 50, 500),
('sup-003', 'agency-001', 'cyl-003', 89, 23, 8, 30, 200);

-- Sample bookings
INSERT OR IGNORE INTO bookings (id, customer_id, agency_id, cylinder_id, booking_date, delivery_date, delivery_time, status, quantity, total_amount, delivery_charge) VALUES
('book-001', 'cust-001', 'agency-001', 'cyl-001', '2024-12-15 10:30:00', '2024-12-16', '14:00-16:00', 'confirmed', 1, 500.00, 50.00),
('book-002', 'cust-002', 'agency-001', 'cyl-002', '2024-12-14 15:20:00', '2024-12-15', '10:00-12:00', 'delivered', 2, 1050.00, 50.00),
('book-003', 'cust-001', 'agency-001', 'cyl-001', '2024-12-10 09:15:00', '2024-12-11', '16:00-18:00', 'delivered', 1, 500.00, 50.00);

-- Sample payments
INSERT OR IGNORE INTO payments (id, booking_id, customer_id, amount, payment_mode, status, transaction_id, loyalty_points_earned) VALUES
('pay-001', 'book-001', 'cust-001', 500.00, 'upi', 'completed', 'TXN123456789', 50),
('pay-002', 'book-002', 'cust-002', 1050.00, 'card', 'completed', 'TXN987654321', 105),
('pay-003', 'book-003', 'cust-001', 500.00, 'cash', 'completed', 'CASH001', 50);