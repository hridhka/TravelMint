import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

router.get("/:tripId", authMiddleware, getExpenses);
router.post("/", authMiddleware, addExpense);
router.put("/:id", authMiddleware, updateExpense);
router.delete("/:id", authMiddleware, deleteExpense);

export default router;
