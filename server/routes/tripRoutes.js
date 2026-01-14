import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTrips,
  createTrip,
  deleteTrip,
  getTripSummary, // ✅ ADD
} from "../controllers/tripController.js";

const router = express.Router();

router.get("/", authMiddleware, getTrips);
router.post("/", authMiddleware, createTrip);
router.get("/:id/summary", authMiddleware, getTripSummary); // ✅ ADD
router.delete("/:id", authMiddleware, deleteTrip);

export default router;
