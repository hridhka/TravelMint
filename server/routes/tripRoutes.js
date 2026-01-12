import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

// GET all trips
router.get("/", authMiddleware, (req, res) => {
  const query = "SELECT * FROM trips WHERE user_id = ?";

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch trips" });
    }
    res.json(results);
  });
});

// CREATE trip
router.post("/", authMiddleware, (req, res) => {
  const { title, budget, start_date, end_date } = req.body;

  const query =
    "INSERT INTO trips (user_id, title, budget, start_date, end_date) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [req.userId, title, budget, start_date, end_date],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to create trip" });
      }
      res.status(201).json({ message: "Trip created successfully" });
    }
  );
});

export default router;
