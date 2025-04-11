# Cargo Transport Booking Platform

A comprehensive web application for booking and managing cargo transport services with real-time tracking capabilities.

## Features

### For Customers
- Create cargo transport bookings with detailed information
- Select pickup and dropoff locations using interactive maps
- Track shipments in real-time
- View booking history and status updates

### For Service Operators (Drivers)
- View and manage assigned transport requests
- Accept or decline booking requests
- Update booking status (accepted, in transit, completed)
- Share real-time location data during transit

## Technology Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching and cache management
- Wouter for client-side routing
- Leaflet.js for interactive maps
- WebSockets for real-time tracking and updates
- Tailwind CSS with shadcn/ui for styling

### Backend
- Express.js with TypeScript
- PostgreSQL database with Drizzle ORM
- RESTful API architecture
- WebSocket server for real-time communications
- Passport.js for authentication

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/cargo_db
   SESSION_SECRET=your_session_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `client/` - Frontend React application
  - `src/pages/` - Page components
  - `src/hooks/` - Custom React hooks
  - `src/lib/` - Utility functions and API client
  - `src/components/` - Reusable UI components
- `server/` - Backend Express application
  - `routes.ts` - API route definitions
  - `storage.ts` - Database interaction layer
  - `auth.ts` - Authentication setup
- `shared/` - Shared code between client and server
  - `schema.ts` - Database schema definitions

## Authentication Flow

1. User registers with username, password, and profile information
2. After successful registration, user selects their role (customer or driver)
3. Based on role selection, user is directed to the appropriate interface
4. Protected routes ensure users can only access authorized sections

## Documentation

For more detailed documentation, see:
- [Role Selection Implementation](./docs/ROLE_IMPLEMENTATION.md)
- [Security Recommendations](./docs/SECURITY_RECOMMENDATIONS.md)

## Roadmap

- Advanced booking management (cancellations, modifications)
- Payment integration for transport services
- Driver rating and review system
- Enhanced analytics and reporting
- Mobile application for better on-the-go access

## License

This project is licensed under the MIT License - see the LICENSE file for details.