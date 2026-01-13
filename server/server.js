import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// route imports
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

// load env variables
dotenv.config();

const app = express();

// ======================
// MIDDLEWARE
// ======================

// parse JSON
app.use(express.json());

// CORS — allow frontend to talk to backend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://travel-mint-two.vercel.app", 
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ======================
// ROUTES
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);

// ======================
// HEALTH CHECK (OPTIONAL)
// ======================

app.get("/", (req, res) => {
  res.send("TravelMint backend is running");
});

// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
