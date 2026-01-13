import express from "express";
import cors from "cors";

// ✅ import routes
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

// ✅ middleware
app.use(cors());
app.use(express.json());

// ✅ USE ROUTES (THIS IS WHERE YOUR CODE GOES)
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);

// ✅ health check (important for Vercel)
app.get("/api", (req, res) => {
  res.send("TravelMint API is running 🚀");
});

// ❌ DO NOT use app.listen on Vercel

export default app;
