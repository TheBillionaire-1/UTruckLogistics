import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define valid booking statuses
export const BookingStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  IN_TRANSIT: "in_transit",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupCoords: text("pickup_coords").notNull(),
  dropoffCoords: text("dropoff_coords").notNull(),
  status: text("status", { enum: Object.values(BookingStatus) })
    .notNull()
    .default(BookingStatus.PENDING),
  updatedAt: text("updated_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, userId: true, updatedAt: true })
  .extend({
    pickupCoords: z.string(),
    dropoffCoords: z.string(),
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    BookingStatus.PENDING,
    BookingStatus.ACCEPTED,
    BookingStatus.IN_TRANSIT,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
  ]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type UpdateBookingStatus = z.infer<typeof updateBookingStatusSchema>;