import db from "../config/db.js";

export const getExpenses = async (req, res) => {
  const { id } = req.params;

  const expenses = await db.all(
    "SELECT * FROM expenses WHERE trip_id = ?",
    [id]
  );

  res.json(expenses);
};

export const addExpense = async (req, res) => {
  const { trip_id, amount, category, description, expense_date } = req.body;

  await db.run(
    "INSERT INTO expenses (trip_id, amount, category, description, expense_date) VALUES (?, ?, ?, ?, ?)",
    [trip_id, amount, category, description, expense_date]
  );

  res.json({ message: "Expense added" });
};
