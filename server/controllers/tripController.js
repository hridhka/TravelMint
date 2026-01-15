import pool from "../db.js";

export const getTrips = async (req, res) => {
  const { id: userId } = req.user;

  const result = await pool.query(
    `
    SELECT 
      t.*,
      COALESCE(SUM(e.amount), 0) AS total_spent,
      COUNT(e.id) AS expense_count
    FROM trips t
    LEFT JOIN expenses e ON t.id = e.trip_id
    WHERE t.user_id = $1
    GROUP BY t.id
    ORDER BY t.id DESC
    `,
    [userId]
  );

  res.json(result.rows);
};


export const createTrip = async (req, res) => {
  const { title, budget, start_date, end_date } = req.body;
  const { id: userId } = req.user;

  const result = await pool.query(
    `INSERT INTO trips (title, budget, start_date, end_date, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, budget, start_date, end_date, userId]
  );

  res.json(result.rows[0]);
};

export const deleteTrip = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM trips
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [tripId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ message: "Trip deleted" });
  } catch (err) {
    console.error("TRIP DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// ✅ ADD THIS — SUMMARY CONTROLLER
export const getTripSummary = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const trip = await pool.query(
    "SELECT budget FROM trips WHERE id=$1 AND user_id=$2",
    [tripId, userId]
  );

  if (trip.rows.length === 0) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const expenses = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE trip_id=$1",
    [tripId]
  );

  const budget = Number(trip.rows[0].budget);
  const totalSpent = Number(expenses.rows[0].total);
  const remaining = budget - totalSpent;

  res.json({
    budget,
    totalSpent,
    remaining,
    overBudget: remaining < 0,
  });
};
