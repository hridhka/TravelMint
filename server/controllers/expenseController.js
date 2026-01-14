import db from "../config/db.js";

/**
 * GET expenses for a trip
 */
export const getExpenses = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM expenses WHERE trip_id = $1 AND user_id = $2 ORDER BY expense_date DESC",
      [tripId, userId]
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
    await db.query(
      `INSERT INTO expenses (trip_id, user_id, amount, category, description, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [trip_id, userId, amount, category, description, expense_date]
    );

    res.json({ message: "Expense added" });
  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

/**
 * DELETE expense (WITH OWNERSHIP CHECK)
 */
export const deleteExpense = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  try {
    const check = await db.query(
      "SELECT * FROM expenses WHERE id = $1 AND user_id = $2",
      [expenseId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.query("DELETE FROM expenses WHERE id = $1", [expenseId]);

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/**
 * ✏️ UPDATE expense
 */
export const updateExpense = async (req, res) => {
  const expenseId = req.params.id;
  const { amount, category, description, expense_date } = req.body;
  const userId = req.user.id;

  try {
    const check = await db.query(
      "SELECT * FROM expenses WHERE id = $1 AND user_id = $2",
      [expenseId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.query(
      `UPDATE expenses
       SET amount = $1, category = $2, description = $3, expense_date = $4
       WHERE id = $5`,
      [amount, category, description, expense_date, expenseId]
    );

    res.json({ message: "Expense updated" });
  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};
