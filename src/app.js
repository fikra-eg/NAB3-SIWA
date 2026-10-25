// app.js: Configures the Express application, middleware, and feature routes.

import express from "express";

import authRoutes from "./modules/auth/auth.route.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import cookieParser from "cookie-parser";
import userRoutes from "./modules/users/user.route.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/users", userRoutes);
// Authentication routes.
app.use("/auth", authRoutes);

// Health check.
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Naba Siwa API is running",
  });
});

// Global error handler.
app.use(errorHandler);

export default app;
