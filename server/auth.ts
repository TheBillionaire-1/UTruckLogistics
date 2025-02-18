import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";

// Use Express User type
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}

export function setupAuth(app: Express) {
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

  // Set up Local Strategy with hardcoded test credentials
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check for hardcoded test credentials
        if (username === 'G' && password === 'G') {
          return done(null, { id: 1, username: 'G' });
        }
        return done(null, false);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      // For test user, return hardcoded user object
      if (id === 1) {
        done(null, { id: 1, username: 'G' });
        return;
      }
      done(null, false);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    // For test purposes, always return success with test user
    res.status(201).json({ id: 1, username: 'G' });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).send("Invalid username or password");
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}