
import pool from "../config/db.js";

// GET all conversations belonging to the logged-in user
export const getConversations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, created_at, updated_at
       FROM conversations
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [req.user.id]
    );

    res.json({ conversations: result.rows });
  } catch (err) {
    console.error("GET CONVERSATIONS ERROR:", err.message);
    res.status(500).json({
      message: "Unable to load conversations.",
    });
  }
};

// CREATE a new conversation
export const createConversation = async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING id, title, created_at, updated_at`,
      [req.user.id, "New chat"]
    );

    res.status(201).json({
      conversation: result.rows[0],
    });
  } catch (err) {
    console.error("CREATE CONVERSATION ERROR:", err.message);
    res.status(500).json({
      message: "Unable to create conversation.",
    });
  }
};

// GET messages from a specific conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "Invalid conversation ID.",
      });
    }

    const conversation = await pool.query(
      `SELECT id
       FROM conversations
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (conversation.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    const result = await pool.query(
      `SELECT id, role, content, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC, id ASC`,
      [id]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error("GET CONVERSATION MESSAGES ERROR:", err.message);
    res.status(500).json({
      message: "Unable to load conversation messages.",
    });
  }
};

// DELETE a conversation belonging to the logged-in user
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "Invalid conversation ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM conversations
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    res.json({
      message: "Conversation deleted successfully.",
    });
  } catch (err) {
    console.error("DELETE CONVERSATION ERROR:", err.message);
    res.status(500).json({
      message: "Unable to delete conversation.",
    });
  }
};
