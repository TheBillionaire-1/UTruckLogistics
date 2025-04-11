import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth.js";
import { insertBookingSchema, updateBookingStatusSchema } from "@shared/schema";
import { WebSocket } from 'ws';

// Initialize WebSocket server at module level
let wss: WebSocketServer;

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
    } catch (error: any) {
      console.error('Booking creation error:', error);
      res.status(400).json({ message: error.message || "Invalid booking data" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const bookings = await storage.getUserBookings(req.user.id);
    console.log('Retrieved bookings:', bookings);
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
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const updatedBooking = await storage.updateBookingStatus(
        bookingId,
        req.user.id,
        statusData
      );

      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Notify all connected clients about the status change
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'BOOKING_STATUS_UPDATED',
            booking: updatedBooking
          }));
        }
      });

      res.json(updatedBooking);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid status update data" });
    }
  });

  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      // Fetch the complete user data from the database
      const fullUser = await storage.getUser(req.user.id);
      if (!fullUser) {
        return res.sendStatus(404);
      }
      
      // Return a safe version of the user data (without password)
      const safeUser = {
        id: fullUser.id,
        username: fullUser.username,
        ...(fullUser.role ? { role: fullUser.role } : {}),
        fullName: fullUser.fullName,
        email: fullUser.email,
        phoneNumber: fullUser.phoneNumber
      };
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Failed to retrieve user data" });
    }
  });

  app.post("/api/user/role", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { role } = req.body;
    if (role !== "customer" && role !== "driver") {
      return res.status(400).json({ message: "Invalid role" });
    }
    try {
      const updatedUser = await storage.updateUserRole(req.user!.id, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session with the new role
      req.user.role = role;
      
      // Return the updated user data (without password)
      const safeUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber
      };
      
      res.status(200).json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PATCH endpoint for updating user role - used for role switching
  app.patch("/api/user/role", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { role } = req.body;
    if (role !== "customer" && role !== "driver") {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    console.log(`Switching user ${req.user!.id} role to ${role}`);
    
    try {
      const updatedUser = await storage.updateUserRole(req.user!.id, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session with the new role
      req.user.role = role;
      console.log(`User role updated successfully to ${role}`);
      
      // Return the updated user data (without password)
      const safeUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber
      };
      
      res.status(200).json(safeUser);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server with the HTTP server on a different path than Vite's HMR
  wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    perMessageDeflate: false // Disable compression to avoid conflicts
  });

  wss.on('connection', async (ws, req: any) => {
    console.log('Client attempting to connect to WebSocket');

    if (!req.session?.passport?.user) {
      console.log('Authentication failed for WebSocket connection');
      ws.close(1000, 'Authentication failed');
      return;
    }

    const userId = req.session.passport.user;
    const user = await storage.getUser(userId);

    if (!user) {
      console.log('User not found for WebSocket connection');
      ws.close(1000, 'User not found');
      return;
    }

    console.log(`User ${user.id} connected to WebSocket`);
    (ws as any).userId = user.id;

    // Send initial connection confirmation
    ws.send(JSON.stringify({ 
      type: 'CONNECTED', 
      message: 'Connected to tracking server',
      user: { id: user.id, username: user.username }
    }));

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const location = {
          type: 'LOCATION_UPDATE',
          data: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.01,
            lng: -74.0060 + (Math.random() - 0.5) * 0.01
          }
        };
        ws.send(JSON.stringify(location));
      }
    }, 2000);

    ws.on('close', () => {
      clearInterval(interval);
      console.log(`User ${user.id} disconnected from tracking`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${user.id}:`, error);
      clearInterval(interval);
    });
  });

  return httpServer;
}