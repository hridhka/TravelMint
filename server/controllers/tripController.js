import db from "../config/db.js";

export const createTrip = (req, res) => {
  const { title, budget, start_date, end_date } = req.body;

  const sql =
    "INSERT INTO trips (user_id, title, budget, start_date, end_date) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [req.userId, title, budget, start_date, end_date],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Trip creation failed" });
      }
      res.status(201).json({ message: "Trip created" });
    }
  );
};

export const getTrips = (req, res) => {
  const sql = "SELECT * FROM trips WHERE user_id = ?";

  db.query(sql, [req.userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch trips" });
    }
    res.json(result);
  });
};

// GET TRIP SUMMARY (budget vs spent)
export const getTripSummary = (req, res) => {
  const { tripId } = req.params;

  const budgetQuery = "SELECT budget FROM trips WHERE id = ?";
  const expenseQuery =
    "SELECT SUM(amount) AS totalSpent FROM expenses WHERE trip_id = ?";

  db.query(budgetQuery, [tripId], (err, budgetResult) => {
    if (err || budgetResult.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const budget = budgetResult[0].budget;

    db.query(expenseQuery, [tripId], (err, expenseResult) => {
      if (err) {
        return res.status(500).json({ message: "Failed to calculate expenses" });
      }

      const totalSpent = expenseResult[0].totalSpent || 0;
      const remaining = budget - totalSpent;
      const overBudget = totalSpent > budget;

      res.json({
        budget,
        totalSpent,
        remaining,
        overBudget,
      });
    });
  });
};
