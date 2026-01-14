import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

router.get("/:tripId", authMiddleware, getExpenses);
router.post("/", authMiddleware, addExpense);
router.delete("/:id", authMiddleware, deleteExpense);
router.put("/:id", authMiddleware, updateExpense);

export default router;
