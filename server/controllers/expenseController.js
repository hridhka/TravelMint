import pool from "../db.js";

/* GET expenses by trip */
export const getExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    const result = await pool.query(
      "SELECT * FROM expenses WHERE trip_id = $1 ORDER BY created_at DESC",
      [tripId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET EXPENSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

/* ADD expense */
export const addExpense = async (req, res) => {
  try {
    const { trip_id, amount, category, description, expense_date } = req.body;

    const result = await pool.query(
      `INSERT INTO expenses (trip_id, amount, category, description, expense_date)
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

/* UPDATE expense */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, expense_date } = req.body;

    const result = await pool.query(
      `UPDATE expenses
       SET amount = $1, category = $2, description = $3, expense_date = $4
       WHERE id = $5
       RETURNING *`,
      [amount, category, description, expense_date, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* DELETE expense */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
