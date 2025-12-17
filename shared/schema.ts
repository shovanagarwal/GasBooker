import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "in_transit", "delivered", "cancelled"]);
export const bookingTypeEnum = pgEnum("booking_type", ["regular", "emergency", "subscription"]);
export const paymentModeEnum = pgEnum("payment_mode", ["cash", "card", "upi", "net_banking"]);
export const cylinderTypeEnum = pgEnum("cylinder_type", ["domestic", "commercial", "industrial"]);

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull().unique(),
  address: text("address").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agencies = pgTable("agencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  agencyName: text("agency_name").notNull(),
  address: text("address").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cylinders = pgTable("cylinders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cylinderType: cylinderTypeEnum("cylinder_type").notNull(),
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const supplies = pgTable("supplies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agencyId: varchar("agency_id").references(() => agencies.id).notNull(),
  cylinderId: varchar("cylinder_id").references(() => cylinders.id).notNull(),
  stock: integer("stock").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  agencyId: varchar("agency_id").references(() => agencies.id).notNull(),
  cylinderId: varchar("cylinder_id").references(() => cylinders.id).notNull(),
  bookingDate: timestamp("booking_date").defaultNow(),
  deliveryDate: timestamp("delivery_date"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  bookingType: bookingTypeEnum("booking_type").notNull().default("regular"),
  quantity: integer("quantity").notNull().default(1),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMode: paymentModeEnum("payment_mode").notNull(),
  status: text("status").notNull().default("completed"),
});

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
}));

export const agenciesRelations = relations(agencies, ({ many }) => ({
  bookings: many(bookings),
  supplies: many(supplies),
}));

export const cylindersRelations = relations(cylinders, ({ many }) => ({
  bookings: many(bookings),
  supplies: many(supplies),
}));

export const suppliesRelations = relations(supplies, ({ one }) => ({
  agency: one(agencies, { fields: [supplies.agencyId], references: [agencies.id] }),
  cylinder: one(cylinders, { fields: [supplies.cylinderId], references: [cylinders.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(customers, { fields: [bookings.customerId], references: [customers.id] }),
  agency: one(agencies, { fields: [bookings.agencyId], references: [agencies.id] }),
  cylinder: one(cylinders, { fields: [bookings.cylinderId], references: [cylinders.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertAgencySchema = createInsertSchema(agencies).omit({ id: true, createdAt: true });
export const insertCylinderSchema = createInsertSchema(cylinders).omit({ id: true });
export const insertSupplySchema = createInsertSchema(supplies).omit({ id: true, updatedAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, bookingDate: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, paymentDate: true });

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = z.infer<typeof insertAgencySchema>;
export type Cylinder = typeof cylinders.$inferSelect;
export type InsertCylinder = z.infer<typeof insertCylinderSchema>;
export type Supply = typeof supplies.$inferSelect;
export type InsertSupply = z.infer<typeof insertSupplySchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
