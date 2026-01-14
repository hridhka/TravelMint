import pool from "../db.js";

export const getTrips = async (req, res) => {
  const { id: userId } = req.user;

  const result = await pool.query(
    "SELECT * FROM trips WHERE user_id = $1 ORDER BY id DESC",
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
