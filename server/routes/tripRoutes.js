import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTrips,
  createTrip,
  deleteTrip,
} from "../controllers/tripController.js";

const router = express.Router();

router.get("/", authMiddleware, getTrips);
router.post("/", authMiddleware, createTrip);
router.delete("/:id", authMiddleware, deleteTrip); // 🔥 REQUIRED

export default router;
