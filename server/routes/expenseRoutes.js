import express from "express";
import {
  addExpense,
  getExpensesByTrip,
  deleteExpense,
} from "../controllers/expenseController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// add expense
router.post("/", authMiddleware, addExpense);

// get expenses by trip
router.get("/:tripId", authMiddleware, getExpensesByTrip);

// 🗑️ DELETE EXPENSE (THIS WAS MISSING)
router.delete("/:id", authMiddleware, deleteExpense);

export default router;
