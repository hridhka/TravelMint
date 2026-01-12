import express from "express";
import protect from "../middleware/authMiddleware.js";
import { addExpense, getExpenses } from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", protect, addExpense);
router.get("/:tripId", protect, getExpenses);

export default router;
