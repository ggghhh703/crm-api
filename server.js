require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const customerRoutes = require("./src/routes/customerRoutes");
const authRoutes = require("./src/routes/authRoutes");
const dealRoutes = require("./src/routes/dealRoutes");
const interactionRoutes = require("./src/routes/interactionRoutes");
const leadRoutes = require("./src/routes/leadRoutes");

const app = express();

// ===============================
// Configuration
// ===============================

const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crm_db";

// ===============================
// Middleware
// ===============================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ===============================
// Health Check
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CRM API is running",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// ===============================
// API Routes
// ===============================

app.use("/customers", customerRoutes);

app.use("/auth", authRoutes);

app.use("/deals", dealRoutes);

app.use("/interactions", interactionRoutes);

app.use("/leads", leadRoutes);

// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(
      (item) => item.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ===============================
// MongoDB Connection
// ===============================

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // ===============================
    // Graceful Shutdown
    // ===============================

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        try {
          await mongoose.connection.close();

          console.log("MongoDB connection closed");

          process.exit(0);
        } catch (error) {
          console.error("Shutdown error:", error);

          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();