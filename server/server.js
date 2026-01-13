import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize app FIRST
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
import "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

// Use routes (AFTER app exists)
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("TravelMint API is running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
// health check
app.get("/", (req, res) => {
  res.send("TravelMint API is running 🚀");
});

export default app;
