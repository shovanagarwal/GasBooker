import {
  customers,
  agencies,
  cylinders,
  supplies,
  bookings,
  payments,
  type Customer,
  type InsertCustomer,
  type Agency,
  type InsertAgency,
  type Cylinder,
  type InsertCylinder,
  type Supply,
  type InsertSupply,
  type Booking,
  type InsertBooking,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  getAgency(id: string): Promise<Agency | undefined>;
  getAgencyByEmail(email: string): Promise<Agency | undefined>;
  createAgency(agency: InsertAgency): Promise<Agency>;
  getAllAgencies(): Promise<Agency[]>;
  
  getCylinder(id: string): Promise<Cylinder | undefined>;
  getAllCylinders(): Promise<Cylinder[]>;
  createCylinder(cylinder: InsertCylinder): Promise<Cylinder>;
  
  getSupply(id: string): Promise<Supply | undefined>;
  getSuppliesByAgency(agencyId: string): Promise<Supply[]>;
  createSupply(supply: InsertSupply): Promise<Supply>;
  updateSupplyStock(id: string, stock: number): Promise<Supply | undefined>;
  
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByCustomer(customerId: string): Promise<Booking[]>;
  getBookingsByAgency(agencyId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
}

export class DatabaseStorage implements IStorage {
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async getAgency(id: string): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.id, id));
    return agency;
  }

  async getAgencyByEmail(email: string): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.email, email));
    return agency;
  }

  async createAgency(agency: InsertAgency): Promise<Agency> {
    const [newAgency] = await db.insert(agencies).values(agency).returning();
    return newAgency;
  }

  async getAllAgencies(): Promise<Agency[]> {
    return await db.select().from(agencies);
  }

  async getCylinder(id: string): Promise<Cylinder | undefined> {
    const [cylinder] = await db.select().from(cylinders).where(eq(cylinders.id, id));
    return cylinder;
  }

  async getAllCylinders(): Promise<Cylinder[]> {
    return await db.select().from(cylinders);
  }

  async createCylinder(cylinder: InsertCylinder): Promise<Cylinder> {
    const [newCylinder] = await db.insert(cylinders).values(cylinder).returning();
    return newCylinder;
  }

  async getSupply(id: string): Promise<Supply | undefined> {
    const [supply] = await db.select().from(supplies).where(eq(supplies.id, id));
    return supply;
  }

  async getSuppliesByAgency(agencyId: string): Promise<Supply[]> {
    return await db.select().from(supplies).where(eq(supplies.agencyId, agencyId));
  }

  async createSupply(supply: InsertSupply): Promise<Supply> {
    const [newSupply] = await db.insert(supplies).values(supply).returning();
    return newSupply;
  }

  async updateSupplyStock(id: string, stock: number): Promise<Supply | undefined> {
    const [updated] = await db
      .update(supplies)
      .set({ stock, updatedAt: new Date() })
      .where(eq(supplies.id, id))
      .returning();
    return updated;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.customerId, customerId));
  }

  async getBookingsByAgency(agencyId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.agencyId, agencyId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ status: status as any })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }
}

export const storage = new DatabaseStorage();
