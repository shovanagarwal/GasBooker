import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import {
  insertCustomerSchema,
  insertAgencySchema,
  insertBookingSchema,
  insertPaymentSchema,
  insertSupplySchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/cylinders", async (req, res) => {
    try {
      const cylinders = await storage.getAllCylinders();
      res.json(cylinders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cylinders" });
    }
  });

  app.get("/api/cylinders/:id", async (req, res) => {
    try {
      const cylinder = await storage.getCylinder(req.params.id);
      if (!cylinder) {
        return res.status(404).json({ message: "Cylinder not found" });
      }
      res.json(cylinder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cylinder" });
    }
  });

  app.get("/api/agencies", async (req, res) => {
    try {
      const agencies = await storage.getAllAgencies();
      res.json(agencies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agencies" });
    }
  });

  app.get("/api/agencies/:id", async (req, res) => {
    try {
      const agency = await storage.getAgency(req.params.id);
      if (!agency) {
        return res.status(404).json({ message: "Agency not found" });
      }
      res.json(agency);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agency" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/agencies", async (req, res) => {
    try {
      const validatedData = insertAgencySchema.parse(req.body);
      const agency = await storage.createAgency(validatedData);
      res.status(201).json(agency);
    } catch (error) {
      res.status(400).json({ message: "Invalid agency data" });
    }
  });

  app.get("/api/bookings/customer/:customerId", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByCustomer(req.params.customerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/agency/:agencyId", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByAgency(req.params.agencyId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  app.get("/api/supplies/agency/:agencyId", async (req, res) => {
    try {
      const supplies = await storage.getSuppliesByAgency(req.params.agencyId);
      res.json(supplies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplies" });
    }
  });

  app.post("/api/supplies", async (req, res) => {
    try {
      const validatedData = insertSupplySchema.parse(req.body);
      const supply = await storage.createSupply(validatedData);
      res.status(201).json(supply);
    } catch (error) {
      res.status(400).json({ message: "Invalid supply data" });
    }
  });

  app.patch("/api/supplies/:id/stock", async (req, res) => {
    try {
      const { stock } = req.body;
      const supply = await storage.updateSupplyStock(req.params.id, stock);
      if (!supply) {
        return res.status(404).json({ message: "Supply not found" });
      }
      res.json(supply);
    } catch (error) {
      res.status(500).json({ message: "Failed to update supply stock" });
    }
  });

  app.get("/api/payments/booking/:bookingId", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByBooking(req.params.bookingId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  return httpServer;
}
