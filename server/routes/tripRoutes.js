import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTrips,
  createTrip,
  deleteTrip,
  getTripSummary,
  planTripWithAI, // 🤖
} from "../controllers/tripController.js";

const router = express.Router();

router.get("/", authMiddleware, getTrips);
router.post("/", authMiddleware, createTrip);
router.post("/ai/plan", authMiddleware, planTripWithAI);

router.get("/:id/summary", authMiddleware, getTripSummary);
router.delete("/:id", authMiddleware, deleteTrip);

export default router;
