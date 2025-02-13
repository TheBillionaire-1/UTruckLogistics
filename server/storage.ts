import { users, bookings, type User, type InsertUser, type Booking, type InsertBooking, type UpdateBookingStatus } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBooking(booking: InsertBooking & { userId: number }): Promise<Booking>;
  getUserBookings(userId: number): Promise<Booking[]>;
  updateBookingStatus(bookingId: number, userId: number, status: UpdateBookingStatus): Promise<Booking | undefined>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  public sessionStore: session.Store;
  private currentUserId: number;
  private currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    console.log(`Created user: ${user.username} with ID: ${user.id}`);
    return user;
  }

  async createBooking(booking: InsertBooking & { userId: number }): Promise<Booking> {
    const id = this.currentBookingId++;
    const newBooking = { 
      ...booking, 
      id, 
      status: "pending",
      updatedAt: new Date().toISOString(),
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter((booking) => booking.userId === userId)
      .sort((a, b) => b.id - a.id); // Sort by newest first
  }

  async updateBookingStatus(
    bookingId: number,
    userId: number,
    { status }: UpdateBookingStatus
  ): Promise<Booking | undefined> {
    const booking = this.bookings.get(bookingId);

    if (!booking || booking.userId !== userId) {
      return undefined;
    }

    const updatedBooking = {
      ...booking,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }
}

export const storage = new MemStorage();