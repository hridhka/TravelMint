import express from "express";
import {
  planTripWithAI,
  askTravelMintAI,
} from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getConversations,
  createConversation,
  getConversationMessages,
  deleteConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

// AI conversation history
router.get("/conversations", authMiddleware, getConversations);
router.post("/conversations", authMiddleware, createConversation);
router.get(
  "/conversations/:id/messages",
  authMiddleware,
  getConversationMessages
);
router.delete("/conversations/:id", authMiddleware, deleteConversation);

router.post("/plan", authMiddleware, planTripWithAI);
router.post("/ask", authMiddleware, askTravelMintAI);

export default router;