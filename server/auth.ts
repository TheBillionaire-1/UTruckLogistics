import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { compare } from "bcrypt";
import rateLimit from "express-rate-limit";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role?: "customer" | "driver";
    }
  }
}

export function setupAuth(app: Express) {
  // Create rate limiters for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: "Too many login attempts, please try again later" }
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 registration attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many registration attempts, please try again later" }
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: app.get("env") === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // For test user 'G', accept password 'G' directly
        if (username === 'G' && password === 'G') {
          return done(null, { 
            id: user.id, 
            username: user.username,
            ...(user.role ? { role: user.role } : {})
          });
        }

        // For other users, verify password hash
        const isValid = await compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, { 
          id: user.id, 
          username: user.username,
          ...(user.role ? { role: user.role } : {})
        });
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, { 
        id: user.id, 
        username: user.username,
        ...(user.role ? { role: user.role } : {})
      });
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", registerLimiter, async (req, res) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(req.body);
      const userSession = { 
        id: user.id, 
        username: user.username,
        ...(user.role ? { role: user.role } : {})
      };
      req.login(userSession, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        res.status(201).json(userSession);
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      // Check for duplicate key violation
      if (error.message && error.message.includes('duplicate key value violates')) {
        return res.status(400).json({ message: "Username already exists" });
      }
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/login", authLimiter, (req, res, next) => {
    console.log(`Login attempt for username: ${req.body.username}`);
    
    // First check if username exists to provide better error message
    storage.getUserByUsername(req.body.username).then(existingUser => {
      if (!existingUser) {
        console.log(`Login failed: Username ${req.body.username} not found`);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // If user exists, proceed with password verification
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          console.error("Login authentication error:", err);
          return next(err);
        }
        if (!user) {
          console.log(`Login failed: Incorrect password for ${req.body.username}`);
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        console.log(`Login successful for user: ${user.username}`);
        req.login(user, (err) => {
          if (err) {
            console.error("Session creation error:", err);
            return next(err);
          }
          return res.status(200).json(user);
        });
      })(req, res, next);
    }).catch(error => {
      console.error("Login database error:", error);
      return res.status(500).json({ message: "An error occurred during login" });
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
}