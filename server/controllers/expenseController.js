import pool from "../db.js";

/* ================================
   GET EXPENSES FOR A TRIP
   ================================ */
export const getExpenses = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM expenses
      WHERE trip_id = $1 AND user_id = $2
      ORDER BY expense_date DESC
      `,
      [tripId, userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET EXPENSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

/* ================================
   ADD EXPENSE
   ================================ */
export const addExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trip_id, amount, category, description, expense_date } = req.body;

    if (!trip_id || !amount || !category || !expense_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔐 Ensure trip belongs to user
    const tripCheck = await pool.query(
      "SELECT id FROM trips WHERE id = $1 AND user_id = $2",
      [trip_id, userId]
    );

    if (tripCheck.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized trip access" });
    }

    const result = await pool.query(
      `INSERT INTO expenses 
       (trip_id, amount, category, description, expense_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [trip_id, amount, category, description, expense_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Add expense failed" });
  }
};


/* ================================
   DELETE EXPENSE
   ================================ */
export const deleteExpense = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      DELETE FROM expenses
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [expenseId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "Not allowed to delete this expense",
      });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================================
   UPDATE (EDIT) EXPENSE
   ================================ */
export const updateExpense = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;
  const { amount, category, description, expense_date } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE expenses
      SET amount = $1,
          category = $2,
          description = $3,
          expense_date = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *
      `,
      [amount, category, description, expense_date, expenseId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "Not allowed to edit this expense",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Edit failed" });
  }
};
