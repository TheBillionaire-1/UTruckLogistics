# Role Implementation Guide

This document explains the implementation of the role-based access control system in the Cargo Transport Booking Platform.

## Overview

The application supports two distinct user roles:

1. **Customer**: Users who book transport services and track their shipments
2. **Driver**: Service operators who provide transport services and manage bookings

## Database Schema

The role is stored in the User table:

```typescript
// In shared/schema.ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["customer", "driver"] }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

The `role` field is defined as an enumerated text type with two possible values: "customer" or "driver".

## Role Selection Process

1. When a user registers, they initially don't have a role assigned.
2. After registration, users are directed to the role selection page if they don't have a role set.
3. On the role selection page, users can choose to be either a customer or a driver.
4. Once a role is selected, it's stored in the database and the user is redirected to the appropriate interface.

## Implementation Details

### API Endpoint for Role Selection

```typescript
// In server/routes.ts
app.post("/api/user/role", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  const { role } = req.body;
  if (role !== "customer" && role !== "driver") {
    return res.status(400).json({ message: "Invalid role" });
  }
  try {
    await storage.updateUserRole(req.user!.id, role);
    res.sendStatus(200);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

### Storage Method for Updating User Role

```typescript
// In server/storage.ts
async updateUserRole(userId: number, role: "customer" | "driver"): Promise<User | undefined> {
  const result = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning();
  
  return result[0];
}
```

### Role Selection Page

```typescript
// In client/src/pages/role-selection-page.tsx
export default function RoleSelectionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { mutate: selectRole, isPending, error } = useMutation({
    mutationFn: async (role: "customer" | "driver") => {
      await apiRequest("/api/user/role", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      return role;
    },
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      navigate(role === "customer" ? "/booking" : "/driver-dashboard");
    },
    onError: (error: Error) => {
      console.error("Role selection error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set role",
        variant: "destructive",
      });
    },
  });

  // Component rendering with role selection buttons
  // ...
}
```

### Protected Route Component with Role Check

```typescript
// In client/src/lib/protected-route.tsx
export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: "customer" | "driver";
}) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!user.role) {
        navigate("/role-selection");
      } else if (requiredRole && user.role !== requiredRole) {
        navigate(user.role === "customer" ? "/booking" : "/driver-dashboard");
      }
    }
  }, [user, isLoading, navigate, requiredRole]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (!user.role) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
```

## Usage in Application

### Role-Specific Routes

```typescript
// In client/src/App.tsx
function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/role-selection" component={RoleSelectionPage} />
      
      {/* Customer Routes */}
      <Route path="/booking">
        <ProtectedRoute requiredRole="customer">
          <BookingPage />
        </ProtectedRoute>
      </Route>
      
      {/* Driver Routes */}
      <Route path="/driver-dashboard">
        <ProtectedRoute requiredRole="driver">
          <DriverDashboardPage />
        </ProtectedRoute>
      </Route>
      
      {/* Common Routes */}
      <Route path="/tracking/:id">
        <ProtectedRoute>
          <TrackingPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

## Best Practices

1. **Always Validate Roles**: Ensure role values are validated both on the client and server.
2. **Enforce Authorization Checks**: Implement authorization checks on all protected routes and API endpoints.
3. **Use TypeScript Types**: Leverage TypeScript to ensure type safety when working with roles.
4. **Don't Hardcode Role Names**: Use constants or enums to avoid typos and ensure consistency.
5. **Handle Edge Cases**: Properly handle cases where users don't have roles assigned.

## Future Enhancements

1. **Admin Role**: Add an admin role for platform management.
2. **Role-Specific Permissions**: Implement more granular permissions within each role.
3. **Role History**: Track changes to user roles for audit purposes.
4. **Role Verification**: Implement verification processes for drivers before they can accept bookings.