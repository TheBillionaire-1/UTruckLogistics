import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth.js";
import { insertBookingSchema, updateBookingStatusSchema } from "@shared/schema";

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

  app.patch("/api/bookings/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const statusData = updateBookingStatusSchema.parse(req.body);
      const bookingId = parseInt(req.params.id);

      if (isNaN(bookingId)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }

      const updatedBooking = await storage.updateBookingStatus(
        bookingId,
        req.user.id,
        statusData
      );

      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(updatedBooking);
    } catch (error) {
      res.status(400).json({ error: "Invalid status update data" });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Simulate vehicle movement for demo purposes
  wss.on('connection', (ws) => {
    console.log('Client connected to tracking');

    // Send simulated location updates every 2 seconds
    const interval = setInterval(() => {
      // Generate random movement within a small area
      const location = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01
      };

      ws.send(JSON.stringify(location));
    }, 2000);

    ws.on('close', () => {
      clearInterval(interval);
      console.log('Client disconnected from tracking');
    });
  });

  return httpServer;
}