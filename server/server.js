import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔴 FORCE dotenv to load .env from server folder
dotenv.config({ path: path.join(__dirname, ".env") });


import express from "express";
import cors from "cors";

import "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("TEST OK");
});

app.use("/api/auth", authRoutes);

app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

