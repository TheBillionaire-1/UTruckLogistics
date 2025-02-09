import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBookingSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking({
        ...bookingData,
        userId: req.user.id,
      });
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const bookings = await storage.getUserBookings(req.user.id);
    res.json(bookings);
  });

  const httpServer = createServer(app);
  return httpServer;
}
