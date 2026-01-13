import pool from "../config/db.js";

// ADD EXPENSE
export const addExpense = async (req, res) => {
  const { trip_id, amount, category, description, expense_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO expenses (trip_id, amount, category, description, expense_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [trip_id, amount, category, description, expense_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

// GET EXPENSES BY TRIP
export const getExpensesByTrip = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM expenses WHERE trip_id = $1 ORDER BY expense_date DESC",
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};
