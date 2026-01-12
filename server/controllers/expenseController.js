import db from "../config/db.js";

// ADD EXPENSE
export const addExpense = (req, res) => {
  const { trip_id, amount, category, description, expense_date } = req.body;

  const query = `
    INSERT INTO expenses (trip_id, amount, category, description, expense_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [trip_id, amount, category, description, expense_date],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to add expense" });
      }
      res.status(201).json({ message: "Expense added" });
    }
  );
};

// GET EXPENSES FOR A TRIP
export const getExpenses = (req, res) => {
  const { tripId } = req.params;

  const query = "SELECT * FROM expenses WHERE trip_id = ?";

  db.query(query, [tripId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch expenses" });
    }
    res.json(results);
  });
};
