import express from "express";
import {
  addExpense,
  getExpensesByTrip,
} from "../controllers/expenseController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addExpense);
router.get("/:id", authMiddleware, getExpensesByTrip);

export default router;
