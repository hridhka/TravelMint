import pool from "../config/db.js";

// CREATE TRIP
export const createTrip = async (req, res) => {
  const { title, budget, start_date, end_date } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO trips (user_id, title, budget, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, budget, start_date, end_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create trip" });
  }
};

// GET USER TRIPS
export const getTrips = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
};

// GET TRIP SUMMARY
export const getTripSummary = async (req, res) => {
  const { id } = req.params;

  try {
    const budgetResult = await pool.query(
      "SELECT budget FROM trips WHERE id = $1",
      [id]
    );

    const expenseResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE trip_id = $1",
      [id]
    );

    const budget = budgetResult.rows[0].budget;
    const totalSpent = expenseResult.rows[0].total;
    const remaining = budget - totalSpent;

    res.json({
      budget,
      totalSpent,
      remaining,
      overBudget: remaining < 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};
