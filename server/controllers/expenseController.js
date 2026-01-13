import db from "../config/db.js";

// ➕ Add expense
export const addExpense = async (req, res) => {
  const { trip_id, amount, category, description, expense_date } = req.body;

  try {
    await db.query(
      `INSERT INTO expenses (trip_id, amount, category, description, expense_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [trip_id, amount, category, description, expense_date]
    );

    res.json({ message: "Expense added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

// 📥 Get expenses by trip
export const getExpensesByTrip = async (req, res) => {
  const { tripId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM expenses WHERE trip_id = $1 ORDER BY expense_date DESC",
      [tripId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// 🗑️ Delete expense
export const deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM expenses WHERE id = $1",
      [id]
    );

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
