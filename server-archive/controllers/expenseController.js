import pool from "../config/db.js";

/**
 * GET all expenses for a trip
 * ✔ returns REAL expense.id
 */
export const getExpenses = async (req, res) => {
  const tripId = req.params.tripId;
  const userId = req.user.id;

  try {
    // Ensure the trip belongs to the user
    const tripCheck = await pool.query(
      "SELECT id FROM trips WHERE id = $1 AND user_id = $2",
      [tripId, userId]
    );

    if (tripCheck.rowCount === 0) {
      return res.status(403).json({ message: "Unauthorized trip access" });
    }

    const result = await pool.query(
      `
      SELECT 
        id,
        amount,
        category,
        description,
        expense_date
      FROM expenses
      WHERE trip_id = $1
      ORDER BY expense_date DESC
      `,
      [tripId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET EXPENSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

/**
 * ADD expense
 */
export const addExpense = async (req, res) => {
  const { trip_id, amount, category, description, expense_date } = req.body;
  const userId = req.user.id;

  try {
    // Ensure trip belongs to user
    const tripCheck = await pool.query(
      "SELECT id FROM trips WHERE id = $1 AND user_id = $2",
      [trip_id, userId]
    );

    if (tripCheck.rowCount === 0) {
      return res.status(403).json({ message: "Unauthorized trip access" });
    }

    const result = await pool.query(
      `
      INSERT INTO expenses (trip_id, amount, category, description, expense_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [trip_id, amount, category, description, expense_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

/**
 * DELETE expense
 * ✔ deletes ONLY user's own expense
 */
export const deleteExpense = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  try {
    console.log("🔥 DELETE HIT:", expenseId, "USER:", userId);

    const result = await pool.query(
      `
      DELETE FROM expenses
      WHERE id = $1
      AND trip_id IN (
        SELECT id FROM trips WHERE user_id = $2
      )
      RETURNING *
      `,
      [expenseId, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Expense not found or not authorized" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
