import db from "../config/db.js";

export const getTrips = async (req, res) => {
  const trips = await db.all(
    "SELECT * FROM trips WHERE user_id = ?",
    [req.user.id]
  );
  res.json(trips);
};

export const createTrip = async (req, res) => {
  const { title, budget, start_date, end_date } = req.body;

  await db.run(
    "INSERT INTO trips (user_id, title, budget, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, title, budget, start_date, end_date]
  );

  res.json({ message: "Trip created" });
};

export const getSummary = async (req, res) => {
  const { id } = req.params;

  const trip = await db.get(
    "SELECT budget FROM trips WHERE id = ?",
    [id]
  );

  const total = await db.get(
    "SELECT SUM(amount) as total FROM expenses WHERE trip_id = ?",
    [id]
  );

  const totalSpent = total.total || 0;

  res.json({
    budget: trip.budget,
    totalSpent,
    remaining: trip.budget - totalSpent,
    overBudget: totalSpent > trip.budget,
  });
};
