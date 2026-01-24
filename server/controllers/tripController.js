import pool from "../db.js";

/* =========================
   GET ALL TRIPS
========================= */
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

/* =========================
   CREATE TRIP (MANUAL / AI)
========================= */
export const createTrip = async (req, res) => {
  const { title, budget, start_date, end_date } = req.body;
  const { id: userId } = req.user;

  const result = await pool.query(
    `
    INSERT INTO trips (title, budget, start_date, end_date, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [title, budget, start_date, end_date, userId]
  );

  res.json(result.rows[0]);
};

/* =========================
   DELETE TRIP
========================= */
export const deleteTrip = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const result = await pool.query(
    `DELETE FROM trips WHERE id=$1 AND user_id=$2 RETURNING *`,
    [tripId, userId]
  );

  if (result.rowCount === 0) {
    return res.status(403).json({ message: "Not allowed" });
  }

  res.json({ message: "Trip deleted" });
};

/* =========================
   TRIP SUMMARY
========================= */
export const getTripSummary = async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const trip = await pool.query(
    `
    SELECT title, start_date, end_date, budget 
    FROM trips 
    WHERE id=$1 AND user_id=$2
    `,
    [tripId, userId]
  );

  if (trip.rows.length === 0) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const expenses = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE trip_id=$1`,
    [tripId]
  );

  const budget = Number(trip.rows[0].budget);
  const totalSpent = Number(expenses.rows[0].total);

  res.json({
    ...trip.rows[0],
    totalSpent,
    remaining: budget - totalSpent,
    overBudget: totalSpent > budget,
  });
};

/* =========================
   🤖 AI TRIP PLANNER
========================= */
export const planTripWithAI = async (req, res) => {
  try {
    const { days, preferences, travelStyle } = req.body;

    // 🎯 Smart destination selection
    const destinations = {
      adventure: ["Bali", "Manali", "Iceland"],
      culture: ["Rome", "Kyoto", "Paris"],
      food: ["Bangkok", "Italy", "Delhi"],
      shopping: ["Dubai", "Seoul", "Singapore"],
    };

    const key = Object.keys(destinations).find((k) =>
      preferences?.toLowerCase().includes(k)
    );

    const title =
      destinations[key]?.[0] || "Barcelona";

    const baseBudget =
      travelStyle === "Luxury" ? 120000 :
      travelStyle === "Backpacking" ? 40000 :
      70000;

    const dailyBudget = Math.round(baseBudget / days);

    res.json({
      aiGenerated: true,
      plan: {
        title,
        days,
        budget: baseBudget,
        breakdown: {
          stay: Math.round(baseBudget * 0.4),
          food: Math.round(baseBudget * 0.2),
          transport: Math.round(baseBudget * 0.25),
          activities: Math.round(baseBudget * 0.15),
        },
        dailyBudget,
        tips: [
          "Book stays early",
          "Keep 10% buffer",
          "Use public transport",
        ],
      },
    });
  } catch (err) {
    console.error("AI PLAN ERROR:", err);
    res.status(500).json({ message: "AI planning failed" });
  }
};
