import express from "express";
import { planTripWithAI } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/plan", authMiddleware, planTripWithAI);

export default router;