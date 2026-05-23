from database import db
from sqlalchemy.dialects.mysql import JSON
import enum

class BookingStatus(enum.Enum):
    pending = 'pending'
    confirmed = 'confirmed'
    in_transit = 'in_transit'
    delivered = 'delivered'
    cancelled = 'cancelled'

class BookingType(enum.Enum):
    regular = 'regular'
    emergency = 'emergency'
    subscription = 'subscription'

class CylinderType(enum.Enum):
    domestic = 'domestic'
    commercial = 'commercial'
    industrial = 'industrial'

class PaymentMode(enum.Enum):
    cash = 'cash'
    card = 'card'
    upi = 'upi'
    net_banking = 'net_banking'
    wallet = 'wallet'

class PaymentStatus(enum.Enum):
    pending = 'pending'
    completed = 'completed'
    failed = 'failed'
    refunded = 'refunded'

class CustomerSegment(enum.Enum):
    premium = 'premium'
    regular = 'regular'
    occasional = 'occasional'


class Agency(db.Model):
    __tablename__ = 'agencies'
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(255))
    agency_name = db.Column(db.Text, nullable=False)
    address = db.Column(db.Text, nullable=False)
    contact_number = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)
    license_number = db.Column(db.String(255))
    service_areas = db.Column(JSON)
    operating_hours = db.Column(JSON)
    delivery_charges = db.Column(JSON)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now())
    supplies = db.relationship('Supply', backref='agency', lazy=True)
    bookings = db.relationship('Booking', backref='agency', lazy=True)

class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.String(36), primary_key=True)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    agency_id = db.Column(db.String(36), db.ForeignKey('agencies.id'), nullable=False)
    cylinder_id = db.Column(db.String(36), db.ForeignKey('cylinders.id'), nullable=False)
    booking_date = db.Column(db.TIMESTAMP, server_default=db.func.now())
    delivery_date = db.Column(db.TIMESTAMP)
    preferred_time_slot = db.Column(db.String(50))
    delivery_address = db.Column(db.Text)
    special_instructions = db.Column(db.Text)
    status = db.Column(db.Enum(BookingStatus), nullable=False, default=BookingStatus.pending)
    booking_type = db.Column(db.Enum(BookingType), nullable=False, default=BookingType.regular)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    total_amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    delivery_charge = db.Column(db.DECIMAL(10, 2), default=0.00)
    discount_applied = db.Column(db.DECIMAL(10, 2), default=0.00)
    tracking_number = db.Column(db.String(255))
    cancelled_reason = db.Column(db.Text)
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.now(), onupdate=db.func.now())
    payments = db.relationship('Payment', backref='booking', lazy=True)

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(255))
    name = db.Column(db.Text, nullable=False)
    phone_number = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    address = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    date_of_birth = db.Column(db.Date)
    loyalty_points = db.Column(db.Integer, default=0)
    customer_segment = db.Column(db.Enum(CustomerSegment), default=CustomerSegment.regular)
    total_spent = db.Column(db.DECIMAL(10, 2), default=0.00)
    total_orders = db.Column(db.Integer, default=0)
    last_order_date = db.Column(db.TIMESTAMP)
    notification_preferences = db.Column(JSON)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now())
    bookings = db.relationship('Booking', backref='customer', lazy=True)
    payments = db.relationship('Payment', backref='customer', lazy=True)

class Cylinder(db.Model):
    __tablename__ = 'cylinders'
    id = db.Column(db.String(36), primary_key=True)
    cylinder_type = db.Column(db.Enum(CylinderType), nullable=False)
    capacity = db.Column(db.DECIMAL(10, 2), nullable=False)
    price = db.Column(db.DECIMAL(10, 2), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.Text)
    features = db.Column(JSON)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now())
    supplies = db.relationship('Supply', backref='cylinder', lazy=True)
    bookings = db.relationship('Booking', backref='cylinder', lazy=True)

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.String(36), primary_key=True)
    booking_id = db.Column(db.String(36), db.ForeignKey('bookings.id'), nullable=False)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    payment_date = db.Column(db.TIMESTAMP, server_default=db.func.now())
    amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    payment_mode = db.Column(db.Enum(PaymentMode), nullable=False)
    payment_gateway_ref = db.Column(db.String(255))
    status = db.Column(db.Enum(PaymentStatus), nullable=False, default=PaymentStatus.completed)
    transaction_id = db.Column(db.String(255))
    loyalty_points_earned = db.Column(db.Integer, default=0)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now())

class Session(db.Model):
    __tablename__ = 'sessions'
    sid = db.Column(db.String(255), primary_key=True)
    sess = db.Column(db.JSON, nullable=False)
    expire = db.Column(db.TIMESTAMP, nullable=False)

class Supply(db.Model):
    __tablename__ = 'supplies'
    id = db.Column(db.String(36), primary_key=True)
    agency_id = db.Column(db.String(36), db.ForeignKey('agencies.id'), nullable=False)
    cylinder_id = db.Column(db.String(36), db.ForeignKey('cylinders.id'), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    reserved_stock = db.Column(db.Integer, nullable=False, default=0)
    damaged_stock = db.Column(db.Integer, nullable=False, default=0)
    reorder_level = db.Column(db.Integer, nullable=False, default=50)
    max_capacity = db.Column(db.Integer, nullable=False, default=1000)
    last_restocked_date = db.Column(db.TIMESTAMP)
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.now(), onupdate=db.func.now())

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(255), unique=True)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    profile_image_url = db.Column(db.String(255))
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now())
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.now())
