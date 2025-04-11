# Cargo Transport Booking Platform

A comprehensive cargo transport booking platform that enables users to book transport services, track shipments in real-time, and manage bookings. The application supports two user roles: customers and service operators (drivers).

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Maps & Geolocation**: Leaflet.js for interactive maps
- **Real-time Communication**: WebSockets for live tracking
- **Security**: Rate limiting, secure sessions, and password hashing

## Features

### For Customers
1. **User Registration & Authentication**: Create an account and securely log in
2. **Role Selection**: Choose between customer or driver role
3. **Booking Creation**: Create transport bookings with:
   - Pickup and dropoff locations (using interactive maps)
   - Vehicle type selection
   - Cargo details
   - Scheduling information
4. **Booking Management**: View, cancel, or track bookings
5. **Real-time Tracking**: Track vehicles in real-time during delivery

### For Drivers/Service Operators
1. **Booking Management**: View, accept, or reject booking requests
2. **Status Updates**: Update booking status (accepted, in transit, completed)
3. **Location Broadcasting**: Share real-time location during deliveries
4. **Performance Metrics**: View performance statistics and feedback

## Core Implementation Details

### Authentication System
- Secure user authentication with Passport.js
- Password hashing with bcrypt
- Session-based authentication with secure cookies
- Rate limiting to prevent brute force attacks

### Role-Based Access Control
- Users can select between "customer" and "driver" roles
- Role-specific interfaces and capabilities
- Protected routes based on authentication and role

### Booking Management System
- Comprehensive booking lifecycle management
- Status workflow: pending → accepted → in_transit → completed
- Notifications for status changes

### Map Integration
- Interactive maps for selecting pickup and dropoff locations
- Real-time vehicle location visualization
- Route display and distance calculation

### WebSocket Implementation
- Real-time tracking using WebSockets
- Automatic reconnection logic
- Secure WebSocket authentication

### Database Schema
- User management with role support
- Comprehensive booking records
- Status tracking and history

## Security Features

- **Rate Limiting**: Protection against brute force attacks
- **Secure Authentication**: Password hashing and secure sessions
- **Input Validation**: Comprehensive validation using Zod schemas
- **Protected Routes**: Server and client-side route protection
- **Error Handling**: Proper error handling without exposing sensitive information

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Access the application at `http://localhost:5000`

## Development Guidelines

- Follow the TypeScript type system for all components
- Use Zod schemas for validation
- Implement proper error handling
- Write comprehensive documentation for new features
- Follow security best practices outlined in SECURITY_RECOMMENDATIONS.md

## Deployment

The application can be deployed to any hosting platform that supports Node.js applications with PostgreSQL databases.

## Contributing

Please read the development guidelines and security recommendations before contributing to the project.