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

CREATE TABLE `cylinders` (
  `id` varchar(36) PRIMARY KEY,
  `brand` varchar(100) DEFAULT 'Premium Gas',
  `cylinder_type` ENUM('lpg', 'commercial', 'industrial') NOT NULL,
  `capacity` decimal(10, 2) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `stock` integer DEFAULT 0,
  `description` text,
  `image_url` text,
  `features` JSON,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `bookings` (
  `id` varchar(36) PRIMARY KEY,
  `customer_id` varchar(36) NOT NULL,
  `agency_id` varchar(36) NOT NULL,
  `cylinder_id` varchar(36) NOT NULL,
  `booking_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `delivery_date` date,
  `delivery_time` varchar(50),
  `preferred_time_slot` varchar(50),
  `delivery_address` text,
  `special_instructions` text,
  `status` ENUM('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending' NOT NULL,
  `booking_type` ENUM('delivery', 'pickup', 'emergency', 'subscription') DEFAULT 'delivery' NOT NULL,
  `quantity` integer DEFAULT 1 NOT NULL,
  `total_amount` decimal(10, 2) NOT NULL,
  `delivery_charge` decimal(10, 2) DEFAULT 0.00,
  `discount_applied` decimal(10, 2) DEFAULT 0.00,
  `tracking_number` varchar(255),
  `cancelled_reason` text,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `payments` (
  `id` varchar(36) PRIMARY KEY,
  `booking_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `payment_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `amount` decimal(10, 2) NOT NULL,
  `payment_mode` ENUM('cash', 'card', 'upi', 'net_banking', 'wallet') NOT NULL,
  `payment_gateway_ref` varchar(255),
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed' NOT NULL,
  `transaction_id` varchar(255),
  `loyalty_points_earned` integer DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `supplies` (
  `id` varchar(36) PRIMARY KEY,
  `agency_id` varchar(36) NOT NULL,
  `cylinder_id` varchar(36) NOT NULL,
  `stock` integer DEFAULT 0 NOT NULL,
  `reserved_stock` integer DEFAULT 0 NOT NULL,
  `damaged_stock` integer DEFAULT 0 NOT NULL,
  `reorder_level` integer DEFAULT 50 NOT NULL,
  `max_capacity` integer DEFAULT 1000 NOT NULL,
  `last_restocked_date` timestamp NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `inventory_movements` (
  `id` varchar(36) PRIMARY KEY,
  `agency_id` varchar(36) NOT NULL,
  `cylinder_id` varchar(36) NOT NULL,
  `movement_type` ENUM('in', 'out', 'damaged', 'adjustment') NOT NULL,
  `quantity` integer NOT NULL,
  `reference_type` ENUM('booking', 'restock', 'damage', 'manual') NOT NULL,
  `reference_id` varchar(36),
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `payment_methods` (
  `id` varchar(36) PRIMARY KEY,
  `customer_id` varchar(36) NOT NULL,
  `method_type` ENUM('card', 'upi', 'net_banking', 'wallet') NOT NULL,
  `method_name` varchar(100) NOT NULL,
  `method_details` JSON,
  `is_default` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `customer_addresses` (
  `id` varchar(36) PRIMARY KEY,
  `customer_id` varchar(36) NOT NULL,
  `label` varchar(100) DEFAULT 'Home',
  `address` text NOT NULL,
  `address_type` ENUM('home', 'office', 'other') DEFAULT 'home',
  `address_line1` text,
  `address_line2` text,
  `city` varchar(100),
  `state` varchar(100),
  `postal_code` varchar(20),
  `is_default` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `reviews` (
  `id` varchar(36) PRIMARY KEY,
  `booking_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `agency_id` varchar(36) NOT NULL,
  `rating` integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `review_text` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `notifications` (
  `id` varchar(36) PRIMARY KEY,
  `user_id` varchar(36) NOT NULL,
  `user_type` ENUM('customer', 'agency') NOT NULL,
  `notification_type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `subscriptions` (
  `id` varchar(36) PRIMARY KEY,
  `customer_id` varchar(36) NOT NULL,
  `agency_id` varchar(36) NOT NULL,
  `cylinder_id` varchar(36) NOT NULL,
  `frequency_days` integer NOT NULL,
  `next_delivery_date` date NOT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `sessions` (
  `sid` varchar(255) PRIMARY KEY,
  `sess` json NOT NULL,
  `expire` timestamp NOT NULL
);

CREATE TABLE `users` (
  `id` varchar(36) PRIMARY KEY,
  `email` varchar(255),
  `first_name` varchar(255),
  `last_name` varchar(255),
  `profile_image_url` varchar(255),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  UNIQUE `users_email_unique` (`email`)
);

-- Foreign Key Constraints
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_agency_id_agencies_id_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_cylinder_id_cylinders_id_fk` FOREIGN KEY (`cylinder_id`) REFERENCES `cylinders` (`id`) ON DELETE RESTRICT;

ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;
ALTER TABLE `payments` ADD CONSTRAINT `payments_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

ALTER TABLE `supplies` ADD CONSTRAINT `supplies_agency_id_agencies_id_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;
ALTER TABLE `supplies` ADD CONSTRAINT `supplies_cylinder_id_cylinders_id_fk` FOREIGN KEY (`cylinder_id`) REFERENCES `cylinders` (`id`) ON DELETE CASCADE;

ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_agency_id_agencies_id_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_cylinder_id_cylinders_id_fk` FOREIGN KEY (`cylinder_id`) REFERENCES `cylinders` (`id`) ON DELETE CASCADE;

ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

ALTER TABLE `reviews` ADD CONSTRAINT `reviews_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_agency_id_agencies_id_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;

ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_agency_id_agencies_id_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_cylinder_id_cylinders_id_fk` FOREIGN KEY (`cylinder_id`) REFERENCES `cylinders` (`id`) ON DELETE CASCADE;

-- Indexes for better performance
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_agency_id ON bookings(agency_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_delivery_date ON bookings(delivery_date);

CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_supplies_agency_id ON supplies(agency_id);
CREATE INDEX idx_supplies_cylinder_id ON supplies(cylinder_id);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_segment ON customers(customer_segment);
CREATE INDEX idx_customers_last_order ON customers(last_order_date);

CREATE INDEX idx_agencies_email ON agencies(email);

-- Sample Data Insertion
INSERT INTO `cylinders` (`id`, `brand`, `cylinder_type`, `capacity`, `price`, `stock`, `description`, `features`) VALUES
('1', 'IndianOil', 'lpg', 14.2, 450.00, 25, 'Standard LPG cylinder', '["ISI Certified", "Same day delivery", "Safety valve included"]'),
('2', 'Bharat Gas', 'lpg', 19.0, 500.00, 18, 'Large LPG cylinder', '["Premium Quality", "Express delivery", "Bulk pricing available"]'),
('3', 'HP Gas', 'lpg', 14.2, 455.00, 22, 'Premium LPG cylinder', '["High Quality", "Reliable", "Safe delivery"]'),
('4', 'IndianOil', 'commercial', 35.0, 850.00, 8, 'Commercial LPG cylinder', '["Commercial Grade", "Installation support", "Extended warranty"]'),
('5', 'Bharat Gas', 'commercial', 19.0, 520.00, 0, 'Commercial small cylinder', '["Commercial Use", "Quick delivery", "Business rates"]');

INSERT INTO `agencies` (`id`, `agency_name`, `address`, `contact_number`, `email`, `password`, `license_number`, `service_areas`, `operating_hours`, `delivery_charges`) VALUES
('agency-001', 'Mumbai Gas Agency', '456 Industrial Estate, Andheri East, Mumbai, Maharashtra 400069', '+91 9876543210', 'agency@mumbaigas.com', 'password123', 'MH-GAS-2024-001234', 
'["Mumbai Central", "Andheri", "Bandra", "Powai"]', 
'{"monday_friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "15:00"}, "sunday": {"closed": true}}',
'{"standard": 50, "emergency": 150, "free_above": 1000}');

INSERT INTO `customers` (`id`, `name`, `phone_number`, `email`, `address`, `password`, `date_of_birth`, `loyalty_points`, `customer_segment`, `total_spent`, `total_orders`) VALUES
('cust-001', 'John Doe', '+91 9123456789', 'john.doe@example.com', '123 Main Street, Apartment 4B, New Delhi, Delhi 110001', 'password123', '1990-05-15', 850, 'regular', 12450.00, 24),
('cust-002', 'Rajesh Kumar', '+91 9876543210', 'rajesh.kumar@email.com', '789 Park Avenue, Mumbai, Maharashtra 400001', 'password123', '1985-03-20', 1250, 'premium', 42350.00, 47),
('cust-003', 'Priya Sharma', '+91 9123456789', 'priya.sharma@email.com', '456 Green Street, Bangalore, Karnataka 560001', 'password123', '1992-08-10', 450, 'regular', 21600.00, 24);

INSERT INTO `supplies` (`id`, `agency_id`, `cylinder_id`, `stock`, `reserved_stock`, `damaged_stock`, `reorder_level`, `max_capacity`) VALUES
('sup-001', 'agency-001', 'cyl-001', 847, 156, 45, 100, 1200),
('sup-002', 'agency-001', 'cyl-002', 234, 67, 12, 50, 500),
('sup-003', 'agency-001', 'cyl-003', 89, 23, 8, 30, 200);
